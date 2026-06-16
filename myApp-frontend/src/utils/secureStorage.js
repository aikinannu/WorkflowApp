 
// Lightweight secure storage wrapper
// Uses expo-secure-store on native, falls back to localStorage on web.
import * as SecureStore from 'expo-secure-store';

const isWeb = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const secureStorage = {
  async getItem(key) {
    try {
      if (SecureStore && SecureStore.getItemAsync) {
        const v = await SecureStore.getItemAsync(key);
        if (v !== null) return v;
      }
    } catch {
      // ignore and fallback
    }

    if (isWeb) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    }

    return null;
  },

  async setItem(key, value) {
    try {
      if (SecureStore && SecureStore.setItemAsync) {
        await SecureStore.setItemAsync(key, value);
        return;
      }
    } catch {
      // ignore and fallback
    }

    if (isWeb) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // ignore
      }
    }
  },

  async removeItem(key) {
    try {
      if (SecureStore && SecureStore.deleteItemAsync) {
        await SecureStore.deleteItemAsync(key);
        return;
      }
    } catch {
      // ignore and fallback
    }

    if (isWeb) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore
      }
    }
  },
};

export default secureStorage;
