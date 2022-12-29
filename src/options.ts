import { getStorageItem, setStorageItem } from './storage';

import '../styles/options.scss';

const favorites_count = document.getElementById("favorites-count")

const clear_button = document.getElementById("clear-liked")

const like_server_input = document.getElementById("liked-video-server")
const fetch_videos_button = document.getElementById("fetch-videos-button")

const liked_file_input = document.getElementById("liked-videos-file")
const upload_file_button = document.getElementById("upload-liked-videos")

clear_button.addEventListener('click', () => {
    setStorageItem("favorites", [])
});

fetch_videos_button.addEventListener('click', () => {
    const remote_url = (like_server_input as HTMLInputElement).value
    updateFromRemoteUrl(remote_url)
})

upload_file_button.addEventListener('click', () => {
    const file_input = liked_file_input as HTMLInputElement
    const [file] = file_input.files
    updateFromFile(file)
})

function extractIfUrl(input: string | number): string {
    if (!isNaN(input as number)) return input as string

    const url = new URL(input as string)
    return url.pathname.split("/")[3]
}

async function updateFromFile(file: File) {
    const content = await file.text()
    const lines = content.split("\n")
    const nonEmptyLines = lines.map(l => l.trim()).filter(x => x.length > 0)
    const ids = nonEmptyLines.map(extractIfUrl)

    console.log(ids)

    await setStorageItem("favorites", ids.sort())
}

async function updateFromRemoteUrl(url: string) {
    try {
        const response = await fetch(url)

        if (!response.ok) {
            console.error(`Failed to fetch liked videos: ${response.status}`)
        }
        const response_array: string[] = await response.json()
        const ids = response_array.map(extractIfUrl)
    
        await setStorageItem("favorites", ids.sort())
    } catch(e) {
        console.error(`Failed to fetch liked videos: ${e}`)
    }
}

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