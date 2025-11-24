const urlParams = new URLSearchParams(window.location.search);
const songParam = urlParams.get('id');
const playlistParam = urlParams.get('playlist');
const themeColorParam = urlParams.get('themeColor');
const audio = document.getElementById('audio');
const title = document.getElementById('song-title');
const artist = document.getElementById('song-artist');
const elapsed = document.getElementById('elapsed');
const timeNow = document.getElementById('time_now');
const timeFull = document.getElementById('time_full');
const playPauseButton = document.getElementById('playpause');
const playPauseIcon = document.getElementById('playpause-icon');
const volumeButton = document.getElementById('volume_button');
const volume = document.getElementById('volume');
const volumeCircle = document.getElementById('volume-circle');
const volumeFill = document.getElementById('volume-fill');
const volumeSlider = volume.querySelector('.slider');
const timeBar = document.getElementById('time-bar');
const card = document.querySelector('.card');
const songInfo = document.querySelector('.song-info');
const controls = document.querySelector('.controls');
const progressBar = document.querySelector('.progress-bar');
const prevSvg = document.getElementById('prev');
const nextSvg = document.getElementById('next');
const loopToggle = document.getElementById('loop_toggle');
const loopSequential = document.getElementById('loop_sequential');
const loopSingle = document.getElementById('loop_single');
const loopShuffle = document.getElementById('loop_shuffle');
let playIndex = 0;
let playMode = 'none';
let songs = [];
let isVolumeOpen = false;
let isDragging = false;
let isVolumeDragging = false;
let lastProgress = 0;
let desiredPlaybackState = false;
const themeColor = themeColorParam || '#4a9eff';

function applyThemeColor(color) {
    // 创建或更新CSS变量
    document.documentElement.style.setProperty('--theme-color', color);
    
    // 应用主题色到进度条
    elapsed.style.backgroundColor = color;
    
    // 应用主题色到音量条
    volumeFill.style.backgroundColor = color;
    
    // 创建或更新悬停效果的样式
    let styleId = 'theme-hover-style';
    let styleElement = document.getElementById(styleId);
    
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = `
        .controls svg:hover,
        #loop_toggle:hover .loop-icon {
            color: ${color};
        }
    `;
}

// 应用主题色
applyThemeColor(themeColor);

function setCardSize() {
    const cardWidthParam = urlParams.get('cardWidth');
    const cardHeightParam = urlParams.get('cardHeight');
    
    let cardWidth = 260;
    let cardHeight = 110;
    
    const minWidth = 200;
    const maxWidth = 400;
    const minHeight = 80;
    const maxHeight = 200;
    
    if (cardWidthParam) {
        const width = parseInt(cardWidthParam);
        if (!isNaN(width)) {
            cardWidth = Math.max(minWidth, Math.min(maxWidth, width));
        }
    }
    
    if (cardHeightParam) {
        const height = parseInt(cardHeightParam);
        if (!isNaN(height)) {
            cardHeight = Math.max(minHeight, Math.min(maxHeight, height));
        }
    }
    
    card.style.width = `${cardWidth}px`;
    card.style.height = `${cardHeight}px`;
    
    adjustLayout(cardWidth, cardHeight);
}

function adjustLayout(width, height) {
    const originalWidth = 260;
    const originalHeight = 110;
    
    const widthRatio = width / originalWidth;
    const heightRatio = height / originalHeight;
    const scaleRatio = Math.min(widthRatio, heightRatio);
    
    const padding = 10 * scaleRatio;
    card.style.padding = `${padding}px`;
    card.style.borderRadius = `${10 * scaleRatio}px`;
    
    const availableHeight = height - (padding * 2);
    
    const titleFontSize = 26 * scaleRatio;
    const artistFontSize = 15 * scaleRatio;
    const controlIconSize = 24 * scaleRatio;
    const volumeIconSize = 20 * scaleRatio;
    const progressHeight = 7 * scaleRatio;
    const timeTextSize = 10 * scaleRatio;
    
    title.style.fontSize = `${titleFontSize}px`;
    artist.style.fontSize = `${artistFontSize}px`;
    
    const scrollFontSize = 23 * scaleRatio;
    document.querySelectorAll('.song-title.scroll, .song-artist.scroll').forEach(el => {
        el.style.fontSize = `${scrollFontSize}px`;
    });
    
    const titleLineHeight = titleFontSize * 1.2;
    const artistLineHeight = artistFontSize * 1.2;
    const songInfoHeight = titleLineHeight + artistLineHeight;
    
    const row1Ratio = 0.37;
    const row2Ratio = 0.6;
    const row3Ratio = 0.02;
    const row4Ratio = 0.01;
    
    const row1Height = availableHeight * row1Ratio;
    const row2Height = availableHeight * row2Ratio;
    const row3Height = availableHeight * row3Ratio;
    const row4Height = availableHeight * row4Ratio;
    
    const row1Top = padding;
    const row1Bottom = row1Top + row1Height;
    const row2Top = row1Bottom;
    const row2Bottom = row2Top + row2Height;
    const row3Top = row2Bottom;
    const row3Bottom = row3Top + row3Height;
    const row4Top = row3Bottom;
    const row4Bottom = row4Top + row4Height;
    
    const row1Center = row1Top + (row1Height - songInfoHeight) / 2;
    songInfo.style.top = `${row1Center}px`;
    songInfo.style.bottom = 'auto';
    
    if (playPauseButton) {
        playPauseButton.style.width = `${controlIconSize}px`;
        playPauseButton.style.height = `${controlIconSize}px`;
    }
    if (prevSvg) {
        prevSvg.style.width = `${controlIconSize}px`;
        prevSvg.style.height = `${controlIconSize}px`;
    }
    if (nextSvg) {
        nextSvg.style.width = `${controlIconSize}px`;
        nextSvg.style.height = `${controlIconSize}px`;
    }
    if (loopSequential && loopSingle && loopShuffle) {
        loopSequential.style.width = `${volumeIconSize}px`;
        loopSequential.style.height = `${volumeIconSize}px`;
        loopSingle.style.width = `${volumeIconSize}px`;
        loopSingle.style.height = `${volumeIconSize}px`;
        loopShuffle.style.width = `${volumeIconSize}px`;
        loopShuffle.style.height = `${volumeIconSize}px`;
    }
    if (volumeButton) {
        volumeButton.style.width = `${volumeIconSize}px`;
        volumeButton.style.height = `${volumeIconSize}px`;
    }
    
    const volumeWidth = 50 * widthRatio;
    volume.style.width = `${volumeWidth}px`;
    volume.style.marginRight = `${2 * widthRatio}px`;
    volumeSlider.style.height = `${4 * scaleRatio}px`;
    volumeSlider.style.borderRadius = `${2 * scaleRatio}px`;
    volumeSlider.style.marginTop = `${2 * scaleRatio}px`;
    volumeCircle.style.height = `${8 * scaleRatio}px`;
    volumeCircle.style.width = `${8 * scaleRatio}px`;
    volumeCircle.style.borderRadius = `${3.5 * scaleRatio}px`;
    volumeCircle.style.bottom = `${-2 * scaleRatio}px`;
    const airWidth = 54 * widthRatio;
    document.querySelector('.air').style.width = `${airWidth}px`;
    
    const controlsHeight = controls.offsetHeight || controlIconSize;
    const row2Center = row2Top + (row2Height - controlsHeight) / 2;
    controls.style.top = `${row2Center}px`;
    controls.style.bottom = 'auto';
    
    progressBar.style.height = `${progressHeight}px`;
    progressBar.style.borderRadius = `${3 * scaleRatio}px`;
    progressBar.style.width = '90%';
    progressBar.style.left = '5%';
    
    const row3Center = row3Top + (row3Height - progressHeight) / 2;
    progressBar.style.top = `${row3Center}px`;
    progressBar.style.bottom = 'auto';
    
    timeNow.style.fontSize = `${timeTextSize}px`;
    timeFull.style.fontSize = `${timeTextSize}px`;
    timeNow.style.left = `${15 * widthRatio}px`;
    timeFull.style.right = `${14 * widthRatio}px`;
    
    const timeTextLineHeight = timeTextSize * 1.2;
    const row4Center = row4Top + (row4Height - timeTextLineHeight) / 2;
    timeNow.style.top = `${row4Center}px`;
    timeNow.style.bottom = 'auto';
    timeFull.style.top = `${row4Center}px`;
    timeFull.style.bottom = 'auto';
    
    checkTextOverflow();
    sendActualSize();
}

setCardSize();

function sendActualSize() {
    if (window.parent !== window) {
        setTimeout(() => {
            const actualWidth = document.body.offsetWidth || document.documentElement.offsetWidth;
            const actualHeight = document.body.offsetHeight || document.documentElement.offsetHeight;
            window.parent.postMessage({
                type: 'player-actual-size',
                width: actualWidth,
                height: actualHeight
            }, '*');
        }, 100);
    }
}

if (document.readyState === 'complete') {
    sendActualSize();
} else {
    window.addEventListener('load', sendActualSize);
}

function animateChange() {
    title.classList.add('animate');
    artist.classList.add('animate');
    setTimeout(() => {
        title.classList.remove('animate');
        artist.classList.remove('animate');
    }, 600);
}

audio.volume = 1.0;
volumeFill.style.width = '100%';
volumeCircle.style.right = '0%';

const playPath = "M12 21.6a9.6 9.6 0 1 0 0-19.2 9.6 9.6 0 0 0 0 19.2Zm-2.4-12a1.2 1.2 0 0 1 2.4-.848l3.6 2.4a1.2 1.2 0 0 1 0 2.096l-3.6 2.4a1.2 1.2 0 0 1-2.4-.848V9.6Z";
const pausePath = "M21.6 12a9.6 9.6 0 1 1-19.2 0 9.6 9.6 0 0 1 19.2 0ZM8.4 9.6a1.2 1.2 0 1 1 2.4 0v4.8a1.2 1.2 0 1 1-2.4 0V9.6Zm6-1.2a1.2 1.2 0 0 0-1.2 1.2v4.8a1.2 1.2 0 0 0 2.4 0V9.6a1.2 1.2 0 0 0-1.2-1.2Z";

// 初始化播放按钮为播放图标（因为音频默认是暂停状态）
if (playPauseIcon) {
  playPauseIcon.setAttribute('d', playPath);
}

function checkTextOverflow() {
    const cardWidth = card.offsetWidth;
    
    title.innerText = title.innerText.trim();
    artist.innerText = artist.innerText.trim();
    
    const titleWidth = title.scrollWidth;
    const artistWidth = artist.scrollWidth;
    
    if (titleWidth > cardWidth) {
        if (!title.innerText.endsWith(' ')) {
            title.innerText = title.innerText + ' ';
        }
        title.classList.add('scroll');
        title.style.setProperty('--text-width', `${title.scrollWidth}px`);
        title.style.setProperty('--card-width', `${cardWidth}px`);
    } else {
        title.classList.remove('scroll');
        title.style.removeProperty('--text-width');
        title.style.removeProperty('--card-width');
    }
    
    if (artistWidth > cardWidth) {
        if (!artist.innerText.endsWith(' ')) {
            artist.innerText = artist.innerText + ' ';
        }
        artist.classList.add('scroll');
        artist.style.setProperty('--text-width', `${artist.scrollWidth}px`);
        artist.style.setProperty('--card-width', `${cardWidth}px`);
    } else {
        artist.classList.remove('scroll');
        artist.style.removeProperty('--text-width');
        artist.style.removeProperty('--card-width');
    }
}

audio.addEventListener('play', () => playPauseIcon.setAttribute('d', pausePath));
audio.addEventListener('pause', () => playPauseIcon.setAttribute('d', playPath));

playPauseButton.addEventListener('click', () => {
    if (audio.paused) {
        desiredPlaybackState = true;
        audio.play();
    } else {
        desiredPlaybackState = false;
        audio.pause();
    }
});

timeBar.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
    updateProgress(e);
});
document.addEventListener('mousemove', (e) => {
    if (isDragging) updateProgress(e);
});
document.addEventListener('mouseup', (e) => {
    if (isDragging) {
        updateProgress(e);
        isDragging = false;
    }
});

function updateProgress(e) {
    const rect = timeBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (!isNaN(audio.duration)) {
        audio.currentTime = percent * audio.duration;
    }
}

volumeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    isVolumeOpen = !isVolumeOpen;
    volume.classList.toggle('show', isVolumeOpen);
});

document.addEventListener('click', (e) => {
    if (!volume.contains(e.target) && e.target !== volumeButton) {
        isVolumeOpen = false;
        volume.classList.remove('show');
    }
});

volumeSlider.addEventListener('click', (e) => {
    const rect = volumeSlider.getBoundingClientRect();
    let percent = (e.clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    volumeFill.style.width = `${percent * 100}%`;
    volumeCircle.style.right = `${(1 - percent) * 100}%`;
    audio.volume = percent;
});

volumeCircle.addEventListener('mousedown', () => isVolumeDragging = true);
document.addEventListener('mousemove', (e) => {
    if (isVolumeDragging) {
        const rect = volumeSlider.getBoundingClientRect();
        let percent = (e.clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));
        volumeFill.style.width = `${percent * 100}%`;
        volumeCircle.style.right = `${(1 - percent) * 100}%`;
        audio.volume = percent;
    }
});
document.addEventListener('mouseup', () => isVolumeDragging = false);

function updateLoopIcon() {
    if (!loopSequential || !loopSingle || !loopShuffle) return;
    
    loopSequential.style.display = playMode === 'none' ? 'block' : 'none';
    loopSingle.style.display = playMode === 'loop' ? 'block' : 'none';
    loopShuffle.style.display = playMode === 'recommend' ? 'block' : 'none';
}

loopToggle.addEventListener('click', () => {
    if (playMode === 'none') {
        playMode = 'loop';
    } else if (playMode === 'loop') {
        playMode = 'recommend';
    } else {
        playMode = 'none';
    }
    updateLoopIcon();
});

updateLoopIcon();

nextSvg.addEventListener('click', () => {
    const shouldPlay = desiredPlaybackState;
    if (playMode === 'recommend') {
        updateSongWeight(songs[playIndex], lastProgress * 100);
        playIndex = getRecommendedSongIndex(playIndex);
    } else if (playIndex < songs.length - 1) {
        playIndex++;
    } else {
        playIndex = 0;
    }
    loadSong(shouldPlay);
});

prevSvg.addEventListener('click', () => {
    const shouldPlay = desiredPlaybackState;
    if (playIndex > 0) {
        playIndex--;
    } else {
        playIndex = songs.length - 1;
    }
    loadSong(shouldPlay);
});

audio.addEventListener('ended', () => {
    const shouldPlay = desiredPlaybackState;
    if (playMode === 'recommend') {
        updateSongWeight(songs[playIndex], lastProgress * 100);
        playIndex = getRecommendedSongIndex(playIndex);
        loadSong(shouldPlay);
    } else if (playMode === 'loop') {
        audio.currentTime = 0;
        audio.play();
    } else if (playIndex < songs.length - 1) {
        playIndex++;
        loadSong(shouldPlay);
    } else {
        playIndex = 0;
        loadSong(shouldPlay);
    }
});

audio.addEventListener('timeupdate', () => {
    const percent = audio.currentTime / audio.duration;
    elapsed.style.width = `${percent * 100}%`;
    timeNow.innerText = formatTime(audio.currentTime);
    timeFull.innerText = formatTime(audio.duration);
    lastProgress = percent;
});

function resetPlaybackUI() {
    elapsed.style.width = '0%';
    timeNow.innerText = '0:00';
    timeFull.innerText = '0:00';
    lastProgress = 0;
}

function formatTime(t) {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

async function fetchSongs() {
    if (playlistParam) {
        const res = await fetch(`https://163api.qijieya.cn/playlist/track/all?id=${playlistParam}&limit=100&offset=0`);
        const json = await res.json();
        songs = json.songs.map(s => s.id);
    } else if (songParam) {
        songs = songParam.split(',');
    }
    initRecommender(songs);
    loadSong(false);
}

async function loadSong(shouldPlay = false) {
    const id = songs[playIndex];
    if (!id) return;
    audio.pause();
    audio.currentTime = 0;
    resetPlaybackUI();
    const detail = await fetch(`https://163api.qijieya.cn/song/detail?ids=${id}`);
    const detailJson = await detail.json();
    const song = detailJson.songs[0];
    animateChange();
    title.innerText = song.name;
    artist.innerText = song.ar[0].name;
    card.style.backgroundImage = `url(${song.al.picUrl})`;
    checkTextOverflow();
    const urlRes = await fetch(`https://163api.qijieya.cn/song/url/v1?id=${id}&level=jymaster`);
    const urlJson = await urlRes.json();
    const songUrl = urlJson.data[0]?.url;
    if (!songUrl) return;
    audio.src = songUrl;
    if (shouldPlay) {
        try {
            await audio.play();
        } catch (error) {
            console.warn('自动播放新歌曲失败', error);
        }
    } else {
        audio.pause();
    }
}

fetchSongs();
