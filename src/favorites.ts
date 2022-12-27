import { getStorageItem } from "./storage";

export async function areFavorites(ids: string[]) {
    const favorites = await getStorageItem("favorites")

    return ids.map(id => binarySearch(id, favorites))
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