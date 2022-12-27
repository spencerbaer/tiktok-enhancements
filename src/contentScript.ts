import { addStorageItemChangedListener } from "./storage";

const videoSelector = 'div[data-e2e="user-liked-item"],div[data-e2e="music-item"],div[data-e2e="user-post-item"]'

async function markFavorites(video_divs: Element[] | NodeListOf<Element>) {

    video_divs.forEach(async div => {
        const anchor = div.querySelector('a[href]')
        const urlString = anchor.getAttribute("href")
        const pathComponents = urlString.split('/')
        const id = pathComponents[pathComponents.length - 1]

        const response = await chrome.runtime.sendMessage({ type: "isFavorite", id: id })

        const html = div as HTMLElement
        // html.style.cssText = "border: 5px solid blue;"
        html.style.cssText = response ? "opacity: 50%;" : ""
    });
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

    console.time('Marking Initial Videos')
    await markFavorites(initial_videos)
    console.timeEnd('Marking Initial Videos')
}

addStorageItemChangedListener("favorites", () => markCurrentVideos())

markCurrentVideos()

