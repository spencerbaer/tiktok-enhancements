import { getStorageItem, setStorageItem } from './storage';

import '../styles/options.scss';

const favorites_count = document.getElementById("favorites-count")
const refresh_favorites = document.getElementById("refresh-favorites")

refresh_favorites.addEventListener("click", async () => {

    try {
        const response = await fetch("http://10.0.0.154:3000/tiktok")

        if (!response.ok) {
            console.error(`Refresh failed ${response.status}`)
        }
        const favorites = await response.json()
    
        await setStorageItem("favorites", favorites)
    } catch(e) {
        console.error(`Refresh failed: ${e}`)
    }
    
})

async function updateFavoriteCount() {
    const favorites = await getStorageItem("favorites")
    favorites_count.innerText = favorites.length.toString()
}

updateFavoriteCount();

chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return

    for (const [key] of Object.entries(changes)) {
      if (key === "favorites") {
        updateFavoriteCount()
      }
    }
});