import { initializeStorageWithDefaults } from './storage';
import { areLikedVideos } from './liked';

chrome.runtime.onInstalled.addListener(async () => {
  // Here goes everything you want to execute after extension initialization

  // await chrome.storage.local.clear()

  // Only show popup on tiktok.com pages.
  chrome.action.disable();
  
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { hostSuffix: ".tiktok.com" }
        })
      ],
      actions: [ new chrome.declarativeContent.ShowAction() ]
    }])
  })

  await initializeStorageWithDefaults({
    liked: [],
    remoteLiked: ""
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
    areLikedVideos(message.ids).then(sendResponse)
    return true
  }
})
