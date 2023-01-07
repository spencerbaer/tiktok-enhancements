// Define your storage data here
export interface Storage {
  liked: string[],
  remoteLiked: string,
  remoteDest: string
} // eslint-disable-line

export function addStorageItemChangedListener<Key extends keyof Storage>(
  key: Key,
  callback: (newValue: Storage[Key]) => void
) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName == "local") {
      if (key in changes) {
        callback(changes[key].newValue)
      }
    }
  });
}

export function getStorageData(): Promise<Storage> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(null, (result) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }

      return resolve(result as Storage);
    });
  });
}

export function setStorageData(data: Storage): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(data, () => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }

      return resolve();
    });
  });
}

export function getStorageItem<Key extends keyof Storage>(
  key: Key,
): Promise<Storage[Key]> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }

      return resolve((result as Storage)[key]);
    });
  });
}

export function setStorageItem<Key extends keyof Storage>(
  key: Key,
  value: Storage[Key],
): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }

      return resolve();
    });
  });
}

export async function initializeStorageWithDefaults(defaults: Storage) {
  const currentStorageData = await getStorageData();
  const newStorageData = Object.assign({}, defaults, currentStorageData);
  await setStorageData(newStorageData);
}
