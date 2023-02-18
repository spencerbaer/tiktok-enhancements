import '../styles/popup.scss';
import { getStorageItem } from './storage';
import { Buffer } from 'buffer';

document.getElementById('auto-scroll').addEventListener('click', async () => {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })

    chrome.tabs.sendMessage(activeTab.id, { type: 'toggleScrolling' })
})

document.getElementById('download').addEventListener('click', async () => {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })

    chrome.tabs.sendMessage(activeTab.id, { type: 'fetchVideos' }, (res) => downloadVideos(activeTab.id, res))
})

async function downloadVideos(tabId: number, response: { user: string; urls: string[]; }) {

    const { user, urls } = response

    console.log(`Received ${urls.length} urls for ${user}`)

    const safeStem = user.startsWith(".") ? `_${user}` : user

    const filename = `${safeStem}.txt`
    const payload = urls.join("\n")

    const blob = new Blob([payload], { type: "text/plain" });
    const blobUrl = URL.createObjectURL(blob)

    if (await getStorageItem("shouldDownload") || user === "collection") {
        chrome.downloads.download({
            url: blobUrl,
            filename: filename,
            saveAs: user === "collection",
            conflictAction: "prompt"
        });
    }

    if (await getStorageItem("shouldUpload") && user !== "collection") {

        const remoteurl = new URL(await getStorageItem("remoteDest") + `/${safeStem}`)

        const authString = `${remoteurl.username}:${remoteurl.password}`

        const headers: HeadersInit = authString !== ":" ? { 'Authorization': 'Basic ' + Buffer.from(authString).toString('base64') } : {}
        headers['Content-Type'] = 'application/json'

        remoteurl.username = ""
        remoteurl.password = ""

        fetch(remoteurl, {
                method: 'POST',
                headers: headers,
                    body: JSON.stringify(urls)
                }
        ).then(res => {
            if (!res.ok) {
                throw Error(`${res.status}: ${res.statusText}`)
            }

            return res
        }).then(async res => {
            const content = await res.json()
            console.log(content)
            chrome.action.setBadgeText({ text: content.total_queued.toString(), tabId: tabId})
        }).catch(reason => {
            console.error(`Failed to upload to '${remoteurl}: ${reason.toString()}`)
            chrome.action.setBadgeText({ text: "Err", tabId: tabId})
        })
    }
}


