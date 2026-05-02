export const storageHelper = {
  setItem:(key: string, value: any) => {
    const encodedKey = btoa(key);
    const encodedValue = btoa(JSON.stringify(value));
    localStorage.setItem(encodedKey, encodedValue);
  },

  getItem: (key:string) => {
    const encodedKey = btoa(key);
    const storedValue = localStorage.getItem(encodedKey);
    if (!storedValue) return null;
    try {
      return JSON.parse(atob(storedValue));
    } catch (e) {
      console.error("Failed to decode localStorage value:", e);
      return null;
    }
  },
  removeItem: (key:string) => {
    const encodedKey = btoa(key);
    localStorage.removeItem(encodedKey);
  },
};
