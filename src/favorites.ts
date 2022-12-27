import { addStorageItemChangedListener, getStorageItem } from "./storage";

let favorites : string[] = []

export function isFavorite(id: string) {
    return binarySearch(id, favorites)
}

function binarySearch(key: string, haystack: string[]): boolean {
    let start = 0;
    let end = haystack.length - 1;

    while (start <= end) {
        const middle = Math.floor((start + end) / 2);

        if (haystack[middle] === key) {
            // found the key
            return true;
        } else if (haystack[middle] < key) {
            // continue searching to the right
            start = middle + 1;
        } else {
            // search searching to the left
            end = middle - 1;
        }
    }
	// key wasn't found
    return false;
}

(async () => {
    favorites = await getStorageItem("favorites")
    console.log("Set favorites")
})();

addStorageItemChangedListener("favorites", newValue => {
    favorites = newValue
})