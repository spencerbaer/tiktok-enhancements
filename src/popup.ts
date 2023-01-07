import '../styles/popup.scss';

document.getElementById('auto-scroll').addEventListener('click', async () => {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })

    chrome.tabs.sendMessage(activeTab.id, { type: 'toggleScrolling' })
})

document.getElementById('download').addEventListener('click', async () => {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })

    chrome.tabs.sendMessage(activeTab.id, { type: 'fetchVideos' }, downloadVideos)
})

function downloadVideos(response: { user: string; urls: string[]; }) {

    const { user, urls } = response

    console.log(`Received ${urls.length} urls for ${user}`)

    const filename = user.startsWith(".") ? `_${user}.txt` : `${user}.txt`
    const payload = urls.join("\n")

    const blob = new Blob([payload], { type: "text/plain" });
    const blobUrl = URL.createObjectURL(blob)

    chrome.downloads.download({
        url: blobUrl,
        filename: filename,
        saveAs: user == "collection",
        conflictAction: "prompt"
    });
}


