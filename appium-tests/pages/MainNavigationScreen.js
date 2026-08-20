/**
 * Mobile Page Object: MainNavigationScreen
 * Encapsulates Bottom Navigation Dock and Home Screen Header interactions
 */

class MainNavigationScreen {
  /**
   * @param {import('webdriverio').Browser} client
   */
  constructor(client) {
    this.client = client;

    // Bottom Navigation & Header Selectors
    this.selectors = {
      navHome: 'id:com.tourismguide.app:id/nav_tab_home',
      navExplore: 'id:com.tourismguide.app:id/nav_tab_explore',
      navAiNearby: 'id:com.tourismguide.app:id/nav_tab_ai_nearby',
      navSaved: 'id:com.tourismguide.app:id/nav_tab_saved',
      navProfile: 'id:com.tourismguide.app:id/nav_tab_profile',
      headerToolbar: 'id:com.tourismguide.app:id/layoutHomeHeader',
      userAvatar: 'id:com.tourismguide.app:id/cardHomeUserAvatar',
      userGreeting: 'id:com.tourismguide.app:id/tvHomeGreeting',
      userName: 'id:com.tourismguide.app:id/tvHomeUserName'
    };
  }

  async tapHomeTab() {
    if (!this.client) return;
    const tab = await this.client.$(this.selectors.navHome);
    await tab.click();
  }

  async tapExploreTab() {
    if (!this.client) return;
    const tab = await this.client.$(this.selectors.navExplore);
    await tab.click();
  }

  async tapAiNearbyTab() {
    if (!this.client) return;
    const tab = await this.client.$(this.selectors.navAiNearby);
    await tab.click();
  }

  async tapItineraryTab() {
    if (!this.client) return;
    const tab = await this.client.$(this.selectors.navSaved);
    await tab.click();
  }

  async tapProfileTab() {
    if (!this.client) return;
    const tab = await this.client.$(this.selectors.navProfile);
    await tab.click();
  }

  async getUserNameText() {
    if (!this.client) return '';
    const el = await this.client.$(this.selectors.userName);
    return await el.getText();
  }
}

module.exports = MainNavigationScreen;
