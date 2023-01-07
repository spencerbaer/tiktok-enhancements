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

    const safeStem = user.startsWith(".") ? `_${user}` : user

    const filename = `${safeStem}.txt`
    const payload = urls.join("\n")

    const blob = new Blob([payload], { type: "text/plain" });
    const blobUrl = URL.createObjectURL(blob)

    chrome.downloads.download({
        url: blobUrl,
        filename: filename,
        saveAs: user == "collection",
        conflictAction: "prompt"
    });

    
    fetch(`http://10.0.0.154:3000/tiktok/${safeStem}`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
        body: JSON.stringify(urls)
    })

}


