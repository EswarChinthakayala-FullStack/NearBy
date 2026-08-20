/**
 * Mobile Page Object: LoginScreen
 * Encapsulates all mobile UI interactions on Android Login Fragment (UiAutomator2)
 */

class LoginScreen {
  /**
   * @param {import('webdriverio').Browser} client
   */
  constructor(client) {
    this.client = client;

    // Mobile Selectors using exact Android resource IDs
    this.selectors = {
      emailInput: 'id:com.tourismguide.app:id/et_login_email',
      passwordInput: 'id:com.tourismguide.app:id/et_login_password',
      togglePasswordBtn: 'id:com.tourismguide.app:id/btn_toggle_password',
      rememberMeCheckbox: 'id:com.tourismguide.app:id/cb_remember_me',
      forgotPasswordText: 'id:com.tourismguide.app:id/tv_forgot_password',
      loginSubmitBtn: 'id:com.tourismguide.app:id/btn_login_submit',
      registerLinkText: 'id:com.tourismguide.app:id/tv_link_register',
      errorText: 'id:com.tourismguide.app:id/tv_login_error',
      appLogo: 'xpath://android.widget.ImageView[@content-desc="App Logo"]',
      welcomeTitle: 'xpath://android.widget.TextView[@text="Welcome Back"]',
      subtitle: 'xpath://android.widget.TextView[contains(@text, "Sign in to access")]'
    };
  }

  /**
   * Wait for Login screen to be visible
   */
  async waitForScreenLoaded(timeout = 10000) {
    if (!this.client) return;
    const emailEl = await this.client.$(this.selectors.emailInput);
    await emailEl.waitForDisplayed({ timeout });
  }

  /**
   * Enter email address into mobile input
   */
  async enterEmail(email) {
    if (!this.client) return;
    const el = await this.client.$(this.selectors.emailInput);
    await el.setValue(email);
  }

  /**
   * Enter password into mobile input
   */
  async enterPassword(password) {
    if (!this.client) return;
    const el = await this.client.$(this.selectors.passwordInput);
    await el.setValue(password);
  }

  /**
   * Tap Password visibility toggle button
   */
  async tapTogglePassword() {
    if (!this.client) return;
    const btn = await this.client.$(this.selectors.togglePasswordBtn);
    await btn.click();
  }

  /**
   * Toggle Remember Me checkbox
   */
  async tapRememberMe() {
    if (!this.client) return;
    const cb = await this.client.$(this.selectors.rememberMeCheckbox);
    await cb.click();
  }

  /**
   * Tap Sign In submit button
   */
  async tapSubmit() {
    if (!this.client) return;
    const btn = await this.client.$(this.selectors.loginSubmitBtn);
    await btn.click();
  }

  /**
   * Perform standard login flow
   */
  async performLogin(email, password, rememberMe = true) {
    await this.enterEmail(email);
    await this.enterPassword(password);
    if (!rememberMe) {
      await this.tapRememberMe();
    }
    await this.tapSubmit();
  }

  /**
   * Tap Forgot Password link
   */
  async tapForgotPassword() {
    if (!this.client) return;
    const link = await this.client.$(this.selectors.forgotPasswordText);
    await link.click();
  }

  /**
   * Tap Sign Up link
   */
  async tapRegister() {
    if (!this.client) return;
    const link = await this.client.$(this.selectors.registerLinkText);
    await link.click();
  }

  /**
   * Get displayed error message text
   */
  async getErrorMessage() {
    if (!this.client) return '';
    const err = await this.client.$(this.selectors.errorText);
    if (await err.isDisplayed()) {
      return await err.getText();
    }
    return '';
  }
}

module.exports = LoginScreen;
