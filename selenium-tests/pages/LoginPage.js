/**
 * Page Object Model: LoginPage
 * Encapsulates all element selectors and interactions for the Nearby Login Web Interface
 */

const { By, until } = require('selenium-webdriver');

class LoginPage {
  /**
   * @param {import('selenium-webdriver').WebDriver} driver
   * @param {string} baseUrl
   */
  constructor(driver, baseUrl = 'http://localhost:5173') {
    this.driver = driver;
    this.baseUrl = baseUrl;
    this.url = `${baseUrl}/login`;

    // Element Locators matching Nearby Frontend DOM exactly
    this.locators = {
      emailInput: By.id('login-email'),
      passwordInput: By.id('login-password'),
      rememberMeCheckbox: By.id('remember-me'),
      rememberMeLabel: By.css('label[for="remember-me"]'),
      submitButton: By.css('button[type="submit"]'),
      passwordToggleBtn: By.css('button[aria-label*="password" i], button[aria-label*="Password"]'),
      forgotPasswordLink: By.css('a[href*="forgot-password"]'),
      registerLink: By.css('a[href*="register"]'),
      emailError: By.xpath("//input[@id='login-email']/following-sibling::p[contains(@class,'text-destructive')] | //p[contains(@class,'text-destructive')]"),
      passwordError: By.xpath("//input[@id='login-password']/ancestor::div[contains(@class,'space-y-1.5')]//p[contains(@class,'text-destructive')]"),
      pageHeading: By.xpath("//h1 | //div[contains(text(),'Welcome Back to Nearby')]"),
      pageSubtitle: By.xpath("//p[contains(text(),'Sign in to access your saved destination spots')]"),
      loginForm: By.css('form'),
      offlineBanner: By.css('[role="alert"], .offline-banner, div[class*="amber"]'),
      sonnerToast: By.css('[data-sonner-toast]'),
      loadingSpinner: By.css('svg[class*="animate-spin"]')
    };
  }

  /**
   * Navigate to the login page
   */
  async navigate() {
    await this.driver.get(this.url);
    await this.waitForElement(this.locators.emailInput);
  }

  /**
   * Wait for element to be located and visible
   */
  async waitForElement(locator, timeout = 10000) {
    return await this.driver.wait(until.elementLocated(locator), timeout);
  }

  /**
   * Enter email address into the email input field
   */
  async enterEmail(email) {
    const element = await this.waitForElement(this.locators.emailInput);
    await element.clear();
    if (email) {
      await element.sendKeys(email);
    }
  }

  /**
   * Enter password into the password input field
   */
  async enterPassword(password) {
    const element = await this.waitForElement(this.locators.passwordInput);
    await element.clear();
    if (password) {
      await element.sendKeys(password);
    }
  }

  /**
   * Perform standard login action
   */
  async login(email, password, rememberMe = true) {
    await this.enterEmail(email);
    await this.enterPassword(password);
    if (!rememberMe) {
      await this.setRememberMe(false);
    }
    await this.clickSubmit();
  }

  /**
   * Click the submit / sign-in button
   */
  async clickSubmit() {
    const button = await this.waitForElement(this.locators.submitButton);
    await button.click();
  }

  /**
   * Toggle the password visibility (eye icon)
   */
  async togglePasswordVisibility() {
    const toggleBtn = await this.waitForElement(this.locators.passwordToggleBtn);
    await toggleBtn.click();
  }

  /**
   * Check if the password field is masked (type="password")
   */
  async isPasswordMasked() {
    const passwordInput = await this.waitForElement(this.locators.passwordInput);
    const type = await passwordInput.getAttribute('type');
    return type === 'password';
  }

  /**
   * Toggle the 'Remember Me' checkbox state
   */
  async setRememberMe(desiredState) {
    const checkbox = await this.waitForElement(this.locators.rememberMeCheckbox);
    const isChecked = await checkbox.isSelected();
    if (isChecked !== desiredState) {
      try {
        await checkbox.click();
      } catch {
        const label = await this.waitForElement(this.locators.rememberMeLabel);
        await label.click();
      }
    }
  }

  /**
   * Get value of email field
   */
  async getEmailValue() {
    const element = await this.waitForElement(this.locators.emailInput);
    return await element.getAttribute('value');
  }

  /**
   * Get value of password field
   */
  async getPasswordValue() {
    const element = await this.waitForElement(this.locators.passwordInput);
    return await element.getAttribute('value');
  }

  /**
   * Check if Remember Me is checked
   */
  async isRememberMeChecked() {
    const checkbox = await this.waitForElement(this.locators.rememberMeCheckbox);
    return await checkbox.isSelected();
  }

  /**
   * Check if Submit button is disabled
   */
  async isSubmitButtonDisabled() {
    const button = await this.waitForElement(this.locators.submitButton);
    const disabledAttr = await button.getAttribute('disabled');
    return disabledAttr !== null;
  }

  /**
   * Click Forgot Password link
   */
  async clickForgotPassword() {
    const link = await this.waitForElement(this.locators.forgotPasswordLink);
    await link.click();
  }

  /**
   * Click Register link
   */
  async clickRegister() {
    const link = await this.waitForElement(this.locators.registerLink);
    await link.click();
  }
}

module.exports = LoginPage;
