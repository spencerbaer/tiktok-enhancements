import { addStorageItemChangedListener, getStorageItem, setStorageItem } from './storage';
import { Buffer } from 'buffer';

import '../styles/options.scss';

const liked_count = document.getElementById("liked-count")

const clear_button = document.getElementById("clear-liked") as HTMLButtonElement

const like_server_input = document.getElementById("liked-video-server") as HTMLInputElement
const fetch_videos_button = document.getElementById("fetch-videos-button") as HTMLButtonElement

const liked_file_input = document.getElementById("liked-videos-file") as HTMLInputElement
const upload_file_button = document.getElementById("upload-liked-videos") as HTMLButtonElement

const download_switch = document.getElementById("download-url") as HTMLInputElement
const upload_switch = document.getElementById("push-urls") as HTMLInputElement

const upload_dest_input = document.getElementById("push-url-server") as HTMLInputElement

download_switch.addEventListener('change', () => {
    setStorageItem("shouldDownload", download_switch.checked)
})

upload_switch.addEventListener('change', () => {
    setStorageItem("shouldUpload", upload_switch.checked)
})

clear_button.addEventListener('click', () => {
    setStorageItem("liked", [])
});

function evaluateUploadInput() {
    const value = upload_dest_input.value.trim()
    const is_valid_url = isValidUrl(value)

    if (upload_dest_input.disabled) {
        upload_dest_input.removeAttribute("aria-invalid")
    }
    else {
        upload_dest_input.setAttribute("aria-invalid", is_valid_url ? "false" : "true")
    }

    setStorageItem("remoteDest", value)
}

function evaluateRemoteServerInput() {
    const value = like_server_input.value.trim()
    const is_valid_url = isValidUrl(value)

    if (value.length == 0) {
        like_server_input.removeAttribute("aria-invalid")
    }
    else {
        like_server_input.setAttribute("aria-invalid", is_valid_url ? "false" : "true")
    }


    fetch_videos_button.disabled = !is_valid_url
}

function isValidUrl(value: string) {
    try {
        new URL(value)
    } catch (e) {
        return false
    }

    return true
}

like_server_input.addEventListener('input', evaluateRemoteServerInput)
like_server_input.addEventListener('paste', evaluateRemoteServerInput)

upload_dest_input.addEventListener('input', evaluateUploadInput)
upload_dest_input.addEventListener('paste', evaluateUploadInput)

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
        const remoteurl = new URL(url)
        const authString = `${remoteurl.username}:${remoteurl.password}`

        const headers: HeadersInit = authString !== ":" ? { 'Authorization': 'Basic ' + Buffer.from(authString).toString('base64') } : {}

        remoteurl.username = ""
        remoteurl.password = ""
        const response = await fetch(remoteurl, { headers })

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

    clear_button.disabled = liked.length == 0;
}


addStorageItemChangedListener("liked", () => {
    updateFavoriteCount()
});

addStorageItemChangedListener("shouldUpload", (val) => {
    upload_dest_input.disabled = !val
    evaluateUploadInput()
});

(async () => {

    download_switch.checked = await getStorageItem("shouldDownload")
    upload_switch.checked = await getStorageItem("shouldUpload")
    upload_dest_input.disabled = !await getStorageItem("shouldUpload")

    const remoteUrl = await getStorageItem("remoteLiked")
    like_server_input.value = remoteUrl
    evaluateRemoteServerInput();

    const uploadUrl = await getStorageItem("remoteDest")
    upload_dest_input.value = uploadUrl
    evaluateUploadInput();
    
    updateFavoriteCount();
})();