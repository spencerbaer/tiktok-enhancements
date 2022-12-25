import { initializeStorageWithDefaults } from './storage';

chrome.runtime.onInstalled.addListener(async () => {
  // Here goes everything you want to execute after extension initialization

  await initializeStorageWithDefaults({});

  console.log('Extension successfully installed!');
});

// Log storage changes, might be safely removed
chrome.storage.onChanged.addListener((changes) => {
  for (const [key, value] of Object.entries(changes)) {
    console.log(
      `"${key}" changed from "${value.oldValue}" to "${value.newValue}"`,
    );
  }
});

/**
 * Adds a badge to the icon based on the type of page detected from the tab URL.
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  console.log("A tab has been updated.")

  console.log(changeInfo.url)
  if (changeInfo.url) {
    const url = new URL(changeInfo.url)
    const isTikTok = url.host === "www.tiktok.com"
    const pathComponents = url.pathname.split('/');
    const firstComponent = pathComponents.length > 1 ? pathComponents[1] : pathComponents[0]
    const isSound = isTikTok && firstComponent === "music"
    const isUser = isTikTok && firstComponent[0] === '@'
    const isVideo = isUser && pathComponents.length > 2 && pathComponents[2] == "video"
    const badgeText = isSound ? "S" : isVideo ? "V" : isUser ? "U" : isTikTok ? "?" : "";

    if (isTikTok) {
      chrome.action.enable(tabId)
    }
    else {
      chrome.action.disable(tabId)
    }

    chrome.action.setBadgeText({
      text: badgeText,
      tabId: tabId
    })
  }
  else {
    chrome.action.disable()
    chrome.action.setBadgeText({text: ""})
  }
})
