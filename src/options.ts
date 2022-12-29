import { addStorageItemChangedListener, getStorageItem, setStorageItem } from './storage';

import '../styles/options.scss';

const liked_count = document.getElementById("liked-count")

const clear_button = document.getElementById("clear-liked") as HTMLButtonElement

const like_server_input = document.getElementById("liked-video-server") as HTMLInputElement
const fetch_videos_button = document.getElementById("fetch-videos-button") as HTMLButtonElement

const liked_file_input = document.getElementById("liked-videos-file") as HTMLInputElement
const upload_file_button = document.getElementById("upload-liked-videos") as HTMLButtonElement

clear_button.addEventListener('click', () => {
    setStorageItem("liked", [])
});

function evaluateRemoteServerInput() {
    const value = like_server_input.value.trim()

    try {
        new URL(value)
        fetch_videos_button.disabled = false
    } catch (e) {
        console.log(e)
        fetch_videos_button.disabled = true
    }
}

like_server_input.addEventListener('input', evaluateRemoteServerInput)
like_server_input.addEventListener('paste', evaluateRemoteServerInput)

fetch_videos_button.addEventListener('click', () => {
    const remote_url = like_server_input.value.trim()

    setStorageItem("remoteLiked", remote_url)

    updateFromRemoteUrl(remote_url)
})

liked_file_input.addEventListener('change', () => {
    upload_file_button.disabled = liked_file_input.files.length == 0
})

upload_file_button.addEventListener('click', () => {
    const [file] = liked_file_input.files
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

    await setStorageItem("liked", ids.sort())
}

async function updateFromRemoteUrl(url: string) {
    try {
        const response = await fetch(url)

        if (!response.ok) {
            console.error(`Failed to fetch liked videos: ${response.status}`)
        }
        const response_array: string[] = await response.json()
        const ids = response_array.map(extractIfUrl)
    
        await setStorageItem("liked", ids.sort())
    } catch(e) {
        console.error(`Failed to fetch liked videos: ${e}`)
    }
}

async function updateFavoriteCount() {
    const liked = await getStorageItem("liked")
    liked_count.innerText = liked.length.toString()
}

updateFavoriteCount();

addStorageItemChangedListener("liked", () => {
    updateFavoriteCount()
});

(async () => {
    const remoteUrl = await getStorageItem("remoteLiked")
    like_server_input.value = remoteUrl
    evaluateRemoteServerInput()
})();