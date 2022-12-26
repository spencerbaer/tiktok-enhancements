import { isFavorite } from "./favorites";

const videoSelector = 'div[data-e2e="user-liked-item"],div[data-e2e="music-item"],div[data-e2e="user-post-item"]'

function markFavorites(video_divs: Element[] | NodeListOf<Element>) {
    video_divs.forEach(div => {
        const anchor = div.querySelector('a[href]')
        const urlString = anchor.getAttribute("href")
        const pathComponents = urlString.split('/')
        const id = pathComponents[pathComponents.length - 1]
        
        if (isFavorite(id)) {
            const html = div as HTMLElement
            // html.style.cssText = "border: 5px solid blue;"
            html.style.cssText = "opacity: 50%;"
        }
    });
}

function addAll(set: { add: (arg0: any) => void; }, list: any) {
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
    markFavorites(videos)
});

// Start observing the target node for configured mutations
observer.observe(document, config);

const initial_videos = document.querySelectorAll(videoSelector)

console.time("initial_favs")
markFavorites(initial_videos)
console.timeEnd("initial_favs")