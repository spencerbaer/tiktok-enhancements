import { addStorageItemChangedListener } from "./storage";

const videoSelector = 'div[data-e2e="user-liked-item"],div[data-e2e="music-item"],div[data-e2e="user-post-item"]'

let keepScrolling = false

chrome.runtime.onMessage.addListener((message, _sender, response) => {
    if (message.type == "toggleScrolling")
    {
        if (!keepScrolling) {
            keepScrolling = true
            scrollToEnd()
        }
        else {
            keepScrolling = false
        }
    }

    if (message.type == "fetchVideos") {
        const video_divs = Array.from(document.querySelectorAll(videoSelector))
        const urls = video_divs.map(extractUrl)
        const users = video_divs.map(extractUser)
        const allUsersEqual = users.every(v => v === users[0])

        const message = {
            user: allUsersEqual ? users[0].slice(1) : "collection",
            urls: urls
        }

        response(message)
    }
});

function scrollSlack() {
    return document.body.scrollHeight - (window.scrollY + window.innerHeight)
}

async function scrollToEnd() {

    function sleep(ms: number) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    const MAX_IDLE_WAIT = 2000;
    const MAX_LOAD_WAIT = 10000;

    while (keepScrolling) {

        let vfis = document.querySelectorAll(videoSelector)
        const lastVfi = vfis[vfis.length - 1]
        lastVfi.scrollIntoView({ behavior: 'smooth' })

        const startTime = Date.now()

        let elapsed = 0;
        let curVfi = lastVfi;

        let maxWaitTime = MAX_IDLE_WAIT

        while (elapsed < maxWaitTime && curVfi === lastVfi)
        {
            maxWaitTime = scrollSlack() > 0 ? MAX_LOAD_WAIT : MAX_IDLE_WAIT

            await sleep(250)

            elapsed = Date.now() - startTime
            vfis = document.querySelectorAll(videoSelector)
            curVfi = vfis[vfis.length - 1]
        }

        if ((maxWaitTime === MAX_IDLE_WAIT && elapsed >= MAX_IDLE_WAIT) || elapsed >= MAX_LOAD_WAIT)
        {
            keepScrolling = false
            break
        }
    }
}

function extractUrl(div: Element, idx: number) {

    const anchor = div.querySelector('a[href]')
    const urlString = anchor.getAttribute("href")

    // Check if the urlString does not contain '@'
    if (!urlString.includes('@')) {
        const raw = document.getElementById("SIGI_STATE")
        const cooked = JSON.parse(raw.innerHTML)
        const id = cooked.ItemList["user-post"].list[idx]
        const author = cooked.ItemModule[id].author

        const urlString = `https://www.tiktok.com/@${author}/video/${id}`

        return urlString
    }

    
    return urlString
}

function extractVideoId(div: Element, idx: number) {
    const urlString = extractUrl(div, idx)
    const pathComponents = urlString.split('/')
    const id = pathComponents[pathComponents.length - 1]
    return id
}

function extractUser(div: Element, idx: number) {
    const urlString = extractUrl(div, idx)
    const pathComponents = urlString.split('/')
    const id = pathComponents[3]
    return id
}

async function markLikedVideos(video_divs: Element[]) {

    const ids = video_divs.map(extractVideoId)
    const users = video_divs.map(extractUser)
    const isFavs = await chrome.runtime.sendMessage({ type: "isFavorite", ids: ids })

    const combined = video_divs.map((elem, i) => [elem, users[i], ids[i], isFavs[i]])

    for (const [div,,, isFav] of combined) {
        const html = div as HTMLElement
        // html.style.cssText = "border: 5px solid blue;"
        html.style.cssText = isFav ? "opacity: 50%;" : ""
    }
}

function addAll(set: Set<Element>, list: NodeListOf<Element>) {
    for (const entry of list) {
        set.add(entry);
    }
}

function applySelector(selector: string, records: MutationRecord[]) {
    // We can't create a NodeList; let's use a Set
    const result = new Set<Element>();
    // Loop through the records...
    for (const {addedNodes} of records) {
        for (const node of addedNodes as NodeListOf<Element>) {
            // If it's an element...
            if (node.nodeType === 1) {
                // Add it if it's a match
                if (node.matches(selector)) {
                    result.add(node);
                }
                // Add any children
                addAll(result, node.querySelectorAll(selector));
            }
        }
    }
    return [...result]; // Result is an array, or just return the set
}

// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true, subtree: true };

// Create an observer instance linked to the callback function
const observer = new MutationObserver((mutationList) => {
    const videos = applySelector(videoSelector, mutationList)

    if (videos.length > 0) {
        markLikedVideos
    (videos)
    }
});

// Start observing the target node for configured mutations
observer.observe(document, config);

async function markCurrentVideos() {
    const initial_videos = document.querySelectorAll(videoSelector)
    await markLikedVideos(Array.from(initial_videos))
}

addStorageItemChangedListener("liked", () => markCurrentVideos())

markCurrentVideos()

