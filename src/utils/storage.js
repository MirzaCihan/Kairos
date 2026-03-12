const STORAGE_PREFIX = 'kairos_';

export function save(key, data) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function load(key, defaultValue = null) {
  try {
    const data = localStorage.getItem(STORAGE_PREFIX + key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
    return defaultValue;
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (e) {
    console.error('Failed to remove from localStorage:', e);
  }
}

export function exportData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(STORAGE_PREFIX)) {
      data[key.replace(STORAGE_PREFIX, '')] = JSON.parse(localStorage.getItem(key));
    }
  }
  return data;
}

export function importData(data) {
  Object.entries(data).forEach(([key, value]) => {
    save(key, value);
  });
}
