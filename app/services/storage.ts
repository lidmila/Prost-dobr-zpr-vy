import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  AUTH_TOKEN: 'auth_token',
  PREFERRED_REGION: 'preferred_region',
  SHOW_ADULT: 'show_adult',
  NOTIFICATION_PREF: 'notification_pref',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
} as const;

export const storage = {
  async getAuthToken(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.AUTH_TOKEN);
  },
  async setAuthToken(token: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.AUTH_TOKEN, token);
  },
  async removeAuthToken(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.AUTH_TOKEN);
  },

  async getPreferredRegion(): Promise<string> {
    // Migrate from old keys if present
    const region = await AsyncStorage.getItem(KEYS.PREFERRED_REGION);
    if (region) return region;

    // Check old language/location keys for migration
    const oldLang = await AsyncStorage.getItem('preferred_language');
    const oldLoc = await AsyncStorage.getItem('preferred_location');
    if (oldLang === 'en' || oldLoc === 'world') {
      await AsyncStorage.setItem(KEYS.PREFERRED_REGION, 'world');
      return 'world';
    }
    if (oldLang === 'cz-sk' || oldLang === 'cs' || oldLang === 'sk' || oldLoc === 'cz-sk' || oldLoc === 'czech' || oldLoc === 'slovak') {
      await AsyncStorage.setItem(KEYS.PREFERRED_REGION, 'cz-sk');
      return 'cz-sk';
    }
    return 'all';
  },
  async setPreferredRegion(region: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.PREFERRED_REGION, region);
  },

  async getShowAdult(): Promise<boolean> {
    return (await AsyncStorage.getItem(KEYS.SHOW_ADULT)) === '1';
  },
  async setShowAdult(show: boolean): Promise<void> {
    await AsyncStorage.setItem(KEYS.SHOW_ADULT, show ? '1' : '0');
  },

  async getNotificationPref(): Promise<string> {
    return (await AsyncStorage.getItem(KEYS.NOTIFICATION_PREF)) ?? 'daily';
  },
  async setNotificationPref(pref: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.NOTIFICATION_PREF, pref);
  },

  async getNotificationsEnabled(): Promise<boolean> {
    return (await AsyncStorage.getItem(KEYS.NOTIFICATIONS_ENABLED)) === '1';
  },
  async setNotificationsEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(KEYS.NOTIFICATIONS_ENABLED, enabled ? '1' : '0');
  },
};
