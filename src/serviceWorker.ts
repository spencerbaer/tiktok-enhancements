import { initializeStorageWithDefaults } from './storage';
import { isFavorite } from './favorites';

chrome.runtime.onInstalled.addListener(async () => {
  // Here goes everything you want to execute after extension initialization

  await chrome.storage.local.clear()

  await initializeStorageWithDefaults({
    favorites: ['7161970556839955754', '7162425838074531118']
  });

  console.log('Extension successfully installed!');
});

// Log storage changes, might be safely removed
chrome.storage.onChanged.addListener((changes) => {
  for (const [key] of Object.entries(changes)) {
    console.log(
      // `"${key}" changed from "${value.oldValue}" to "${value.newValue}"`,
      `"${key}" changed.`,
    );
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type == "isFavorite") {
    const res = isFavorite(message.id)
    sendResponse(res)
  }
})
