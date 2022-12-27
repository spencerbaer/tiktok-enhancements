import { addStorageItemChangedListener } from "./storage";

const videoSelector = 'div[data-e2e="user-liked-item"],div[data-e2e="music-item"],div[data-e2e="user-post-item"]'

function extractUrl(div: Element) {
    const anchor = div.querySelector('a[href]')
    const urlString = anchor.getAttribute("href")
    return urlString
}

function extractVideoId(div: Element) {
    const urlString = extractUrl(div)
    const pathComponents = urlString.split('/')
    const id = pathComponents[pathComponents.length - 1]
    return id
}

function extractUser(div: Element) {
    const urlString = extractUrl(div)
    const pathComponents = urlString.split('/')
    const id = pathComponents[3]
    return id
}

async function markFavorites(video_divs: Element[]) {

    console.time(`Marking Favorites ${video_divs.length}`)

    const ids = video_divs.map(extractVideoId)
    const users = video_divs.map(extractUser)
    const isFavs = await chrome.runtime.sendMessage({ type: "isFavorite", ids: ids })

    const combined = video_divs.map((elem, i) => [elem, users[i], ids[i], isFavs[i]])

    for (const [div, user, id, isFav] of combined) {
        const html = div as HTMLElement
        // html.style.cssText = "border: 5px solid blue;"
        html.style.cssText = isFav ? "opacity: 50%;" : ""

        if (isFav) {
            console.log(`${id} [${user}] is a favorite.`)
        }
    }

    console.timeEnd(`Marking Favorites ${video_divs.length}`)
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
        markFavorites(videos)
    }
});

// Start observing the target node for configured mutations
observer.observe(document, config);

async function markCurrentVideos() {
    const initial_videos = document.querySelectorAll(videoSelector)
    await markFavorites(Array.from(initial_videos))
}

addStorageItemChangedListener("favorites", () => markCurrentVideos())

markCurrentVideos()

