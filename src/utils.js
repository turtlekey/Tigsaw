function arrayRemove(arr, item) {
    return arr.filter((i) => {
        return i!== item;
    })
}

export {arrayRemove};
