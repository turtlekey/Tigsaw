function banScrollRefresh() {
    document.body.addEventListener('touchmove', (e) => {
        e.preventDefault();
        }, {passive: false},
    )
}


function arrayRemove(arr, item) {
    return arr.filter((i) => {
        return i!== item;
    })
}

export {banScrollRefresh, arrayRemove};
