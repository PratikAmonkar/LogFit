import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Repository for handling app-level persistent storage (AsyncStorage).
 * Use this for simple settings and app-state flags.
 */
const STORAGE_KEYS = {
  IS_SETUP_COMPLETED: 'is_setup_completed',
  APP_THEME: 'app_theme', // Future use
};

export const StorageRepository = {
  /**
   * Mark the initial app setup as completed.
   */
  async setSetupCompleted(isCompleted: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.IS_SETUP_COMPLETED, JSON.stringify(isCompleted));
    } catch (error) {
      console.error('Error saving setup status:', error);
    }
  },

  /**
   * Check if the initial app setup has been completed.
   */
  async isSetupCompleted(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.IS_SETUP_COMPLETED);
      return value === 'true';
    } catch (error) {
      console.error('Error reading setup status:', error);
      return false;
    }
  },

  /**
   * Generic save method
   */
  async saveItem(key: string, value: any): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, stringValue);
    } catch (error) {
      console.error(`Error saving item ${key}:`, error);
    }
  },

  /**
   * Generic get method
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (!value) return null;
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch (error) {
      console.error(`Error reading item ${key}:`, error);
      return null;
    }
  },

  /**
   * Clear all app storage (use with caution)
   */
  async clearAll(): Promise<void> {
    await AsyncStorage.clear();
  }
};
