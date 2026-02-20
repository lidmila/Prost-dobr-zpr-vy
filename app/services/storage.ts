import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  AUTH_TOKEN: 'auth_token',
  PREFERRED_LANGUAGE: 'preferred_language',
  PREFERRED_LOCATION: 'preferred_location',
  SHOW_ADULT: 'show_adult',
  NOTIFICATION_PREF: 'notification_pref',
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

  async getPreferredLanguage(): Promise<string> {
    return (await AsyncStorage.getItem(KEYS.PREFERRED_LANGUAGE)) ?? 'all';
  },
  async setPreferredLanguage(lang: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.PREFERRED_LANGUAGE, lang);
  },

  async getPreferredLocation(): Promise<string> {
    return (await AsyncStorage.getItem(KEYS.PREFERRED_LOCATION)) ?? 'all';
  },
  async setPreferredLocation(location: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.PREFERRED_LOCATION, location);
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
};
