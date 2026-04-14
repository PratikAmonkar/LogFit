import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  IS_SETUP_COMPLETED: 'is_setup_completed',
};

export const StorageRepository = {
  async setSetupCompleted(isCompleted: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.IS_SETUP_COMPLETED, JSON.stringify(isCompleted));
    } catch (error) {
      console.error('Error saving setup status:', error);
    }
  },

  async isSetupCompleted(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.IS_SETUP_COMPLETED);
      return value === 'true';
    } catch (error) {
      console.error('Error reading setup status:', error);
      return false;
    }
  },
};
