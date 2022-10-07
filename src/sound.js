function insertConnectSound(soundSrc) {
    let eleSound = document.createElement('audio');
    eleSound.id = 'connectSound';
    eleSound.src = soundSrc;
    eleSound.style.display = 'none';
    document.body.appendChild(eleSound);
}

function insertSuccessSound(soundSrc) {
    let eleSound = document.createElement('audio');
    eleSound.id = 'successSound';
    eleSound.src = soundSrc;
    eleSound.style.display = 'none';
    document.body.appendChild(eleSound);
}

export {insertConnectSound, insertSuccessSound}
    
