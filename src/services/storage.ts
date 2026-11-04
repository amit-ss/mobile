let SecureStore: any = null;
try {
  SecureStore = require('expo-secure-store');
} catch (e) {
  // In-memory fallback
}

const memoryStorage = new Map<string, string>();

export const storageService = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (SecureStore && typeof SecureStore.setItemAsync === 'function') {
        await SecureStore.setItemAsync(key, value);
        return;
      }
    } catch (e) {}
    memoryStorage.set(key, value);
  },

  async getItem(key: string): Promise<string | null> {
    try {
      if (SecureStore && typeof SecureStore.getItemAsync === 'function') {
        const val = await SecureStore.getItemAsync(key);
        if (val !== null && val !== undefined) return val;
      }
    } catch (e) {}
    return memoryStorage.get(key) || null;
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (SecureStore && typeof SecureStore.deleteItemAsync === 'function') {
        await SecureStore.deleteItemAsync(key);
        return;
      }
    } catch (e) {}
    memoryStorage.delete(key);
  }
};
