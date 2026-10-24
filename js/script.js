/* =========================================================
   FINAL BIRTHDAY WEBSITE
   COMPLETE SCRIPT.JS
========================================================= */

"use strict";


/* =========================================================
   SHORTCUT
========================================================= */

function get(id) {
    return document.getElementById(id);
}


/* =========================================================
   WEBSITE STATE
========================================================= */

let giftTwoUnlocked = false;
let cakeAlreadyCut = false;

let giftOneOpening = false;
let giftTwoOpening = false;
let leavingCake = false;

let storyHasStarted = false;
let soundMuted = false;

let currentStoryAudio = null;
let currentStoryTrack = null;

let desiredStoryTrack =
    "assets/audio/01-dreamy.mp3";

let trackRequestNumber = 0;

let storyObserverPaused = false;
let storyTrackTimer = null;


/* =========================================================
   MAIN SCREENS
========================================================= */

const welcomeScreen = get("welcomeScreen");
const penguinScreen = get("penguinScreen");
const cakeScreen = get("cakeScreen");
const storyScreen = get("storyScreen");


/* =========================================================
   MAIN BUTTONS
========================================================= */

const startButton = get("startButton");

const giftOneButton = get("giftOneButton");
const giftTwoButton = get("giftTwoButton");

const giftTwoLock = get("giftTwoLock");
const penguinTwoText = get("penguinTwoText");


/* =========================================================
   CAKE ELEMENTS
========================================================= */

const cakeImage = get("cakeImage");

const cakeSlider = get("cakeSlider");
const cakeCutArea = get("cakeCutArea");

const cakeAfterCut = get("cakeAfterCut");
const cakeFinish = get("cakeFinish");

const nomNomButton = get("nomNomButton");

const backToPenguinsButton =
    get("backToPenguinsButton");


/* =========================================================
   STORY ELEMENTS
========================================================= */

const soundToggle = get("soundToggle");
const soundText = get("soundText");
const soundIcon = get("soundIcon");

const celebrateButton =
    get("celebrateButton");

const restartStoryButton =
    get("restartStoryButton");


/* =========================================================
   CAKE HAPPY BIRTHDAY MUSIC
========================================================= */

const cakeMusic =
    new Audio(
        "assets/audio/cake-birthday-bg.mp3"
    );

cakeMusic.loop = true;
cakeMusic.preload = "auto";
cakeMusic.volume = 0;


/* =========================================================
   AUDIO FADE CONTROL
========================================================= */

const audioFadeTokens =
    new WeakMap();


function fadeAudio(
    audio,
    targetVolume,
    duration,
    finished
) {

    if (!audio) {

        if (finished) {
            finished();
        }

        return;
    }


    const startVolume =
        audio.volume;


    const token =
        Symbol();


    audioFadeTokens.set(
        audio,
        token
    );


    const startTime =
        performance.now();


    function frame(time) {

        if (
            audioFadeTokens.get(audio)
            !==
            token
        ) {

            return;
        }


        const progress =
            Math.min(
                1,
                (time - startTime)
                /
                duration
            );


        /*
        SMOOTH STEP
        */

        const eased =
            progress
            *
            progress
            *
            (
                3
                -
                2
                *
                progress
            );


        let volume =
            startVolume
            +
            (
                targetVolume
                -
                startVolume
            )
            *
            eased;


        volume =
            Math.max(
                0,
                Math.min(
                    1,
                    volume
                )
            );


        audio.volume =
            volume;


        if (
            progress < 1
        ) {

            requestAnimationFrame(
                frame
            );

            return;
        }


        audio.volume =
            targetVolume;


        if (finished) {

            finished();

        }

    }


    requestAnimationFrame(
        frame
    );
}


/* =========================================================
   SCREEN CHECKS
========================================================= */

function isCakeOpen() {

    return (
        cakeScreen
        &&
        !cakeScreen.classList.contains(
            "hidden"
        )
    );
}


function isStoryOpen() {

    return (
        storyScreen
        &&
        !storyScreen.classList.contains(
            "hidden"
        )
    );
}


/* =========================================================
   HIDE MAIN SCREENS
========================================================= */

function hideMainScreens() {

    welcomeScreen.classList.add(
        "hidden"
    );

    penguinScreen.classList.add(
        "hidden"
    );

    cakeScreen.classList.add(
        "hidden"
    );

    storyScreen.classList.add(
        "hidden"
    );
}


/* =========================================================
   SCREEN FADE-IN
========================================================= */

function animateScreenIn(element) {

    if (!element) {
        return;
    }


    element.animate(

        [
            {
                opacity: 0,
                transform:
                    "translateY(8px)"
            },

            {
                opacity: 1,
                transform:
                    "translateY(0)"
            }
        ],

        {
            duration: 450,

            easing:
                "cubic-bezier(.2,.8,.2,1)"
        }

    );
}


/* =========================================================
   SOUND EFFECTS
========================================================= */

const activeSoundEffects =
    new Set();


function playSfx(
    path,
    volume = 0.35
) {

    /*
    CAKE PAGE MUST HAVE
    ONLY HAPPY BIRTHDAY MUSIC.
    */

    if (
        soundMuted
        ||
        isCakeOpen()
    ) {

        return null;
    }


    const audio =
        new Audio(path);


    audio.volume =
        volume;


    audio.preload =
        "auto";


    activeSoundEffects.add(
        audio
    );


    audio.addEventListener(

        "ended",

        function () {

            activeSoundEffects.delete(
                audio
            );

        },

        {
            once: true
        }

    );


    audio.play()
        .catch(
            function () {

                activeSoundEffects.delete(
                    audio
                );

            }
        );


    return audio;
}


/* =========================================================
   STOP SOUND EFFECTS
========================================================= */

function stopAllSoundEffects(
    duration = 200
) {

    activeSoundEffects.forEach(

        function (audio) {

            fadeAudio(

                audio,

                0,

                duration,

                function () {

                    audio.pause();

                    audio.currentTime = 0;

                    activeSoundEffects.delete(
                        audio
                    );

                }

            );

        }

    );
}


/* =========================================================
   GENERAL CLICK SOUND
========================================================= */

document.addEventListener(

    "click",

    function (event) {

        /*
        NO CLICK SOUNDS ON CAKE PAGE
        */

        if (isCakeOpen()) {

            return;

        }


        const button =
            event.target.closest(
                "button, .story-start-button"
            );


        if (!button) {

            return;

        }


        /*
        THESE HAVE THEIR OWN
        SPECIAL SOUND / BEHAVIOUR
        */

        const specialButtons =
            [
                "giftOneButton",
                "giftTwoButton",
                "backToPenguinsButton",
                "soundToggle"
            ];


        if (
            specialButtons.includes(
                button.id
            )
        ) {

            return;

        }


        playSfx(
            "assets/audio/ui-click.mp3",
            0.20
        );

    }

);


/* =========================================================
   START
========================================================= */

startButton.addEventListener(

    "click",

    function () {

        hideMainScreens();


        penguinScreen.classList.remove(
            "hidden"
        );


        animateScreenIn(
            penguinScreen
        );


        window.scrollTo(
            0,
            0
        );

    }

);


/* =========================================================
   START CAKE MUSIC
========================================================= */

function startCakeMusic() {

    /*
    STORY MUSIC MUST STOP.
    */

    trackRequestNumber++;


    if (currentStoryAudio) {

        currentStoryAudio.pause();

        currentStoryAudio.currentTime =
            0;

        currentStoryAudio =
            null;

        currentStoryTrack =
            null;

    }


    /*
    OTHER SFX MUST STOP.
    */

    activeSoundEffects.forEach(

        function (audio) {

            audio.pause();

            audio.currentTime = 0;

        }

    );


    activeSoundEffects.clear();


    if (soundMuted) {

        return;
    }


    cakeMusic.pause();

    cakeMusic.currentTime = 0;

    cakeMusic.volume = 0;


    cakeMusic.play()
        .then(
            function () {

                fadeAudio(

                    cakeMusic,

                    0.36,

                    1400

                );

            }
        )
        .catch(
            function () {}
        );
}


/* =========================================================
   STOP CAKE MUSIC
========================================================= */

function stopCakeMusic(done) {

    if (cakeMusic.paused) {

        cakeMusic.currentTime =
            0;


        if (done) {
            done();
        }


        return;
    }


    fadeAudio(

        cakeMusic,

        0,

        1000,

        function () {

            cakeMusic.pause();

            cakeMusic.currentTime =
                0;


            if (done) {

                done();

            }

        }

    );
}


/* =========================================================
   GIFT 1
========================================================= */

giftOneButton.addEventListener(

    "click",

    function () {

        if (giftOneOpening) {

            return;
        }


        giftOneOpening = true;


        playSfx(
            "assets/audio/gift-sparkle.mp3",
            0.36
        );


        giftOneButton.animate(

            [
                {
                    transform:
                        "scale(1)"
                },

                {
                    transform:
                        "scale(1.08) rotate(-2deg)"
                },

                {
                    transform:
                        "scale(1.08) rotate(2deg)"
                },

                {
                    transform:
                        "scale(1)"
                }
            ],

            {
                duration: 560,

                easing:
                    "ease-out"
            }

        );


        /*
        FADE GIFT SOUND BEFORE
        ENTERING CAKE PAGE.
        */

        setTimeout(

            function () {

                stopAllSoundEffects(
                    180
                );

            },

            380

        );


        setTimeout(

            function () {

                hideMainScreens();


                cakeScreen.classList.remove(
                    "hidden"
                );


                animateScreenIn(
                    cakeScreen
                );


                window.scrollTo(
                    0,
                    0
                );


                /*
                FROM HERE UNTIL THE
                CAKE PAGE ENDS,
                ONLY THIS MUSIC PLAYS.
                */

                startCakeMusic();


                giftOneOpening = false;

            },

            620

        );

    }

);


/* =========================================================
   FIXED-SCREEN CAKE CONFETTI

   VISUAL ONLY
========================================================= */

function createCakeConfetti() {

    const old =
        document.querySelector(
            ".cake-fixed-confetti"
        );


    if (old) {

        old.remove();

    }


    const layer =
        document.createElement(
            "div"
        );


    layer.className =
        "cake-fixed-confetti";


    layer.style.position =
        "fixed";

    layer.style.inset =
        "0";

    layer.style.width =
        "100vw";

    layer.style.height =
        "100vh";

    layer.style.pointerEvents =
        "none";

    layer.style.overflow =
        "hidden";

    layer.style.zIndex =
        "99990";


    document.body.appendChild(
        layer
    );


    const colors =
        [
            "#f4c5d0",
            "#ffffff",
            "#e1bc80",
            "#c47789",
            "#ffd8e0",
            "#f6dd9b"
        ];


    for (
        let i = 0;
        i < 85;
        i++
    ) {

        const piece =
            document.createElement(
                "span"
            );


        const size =
            5
            +
            Math.random()
            *
            7;


        piece.style.position =
            "absolute";


        piece.style.top =
            "-25px";


        piece.style.left =
            Math.random()
            *
            100
            +
            "%";


        piece.style.width =
            size
            +
            "px";


        piece.style.height =
            size
            *
            1.5
            +
            "px";


        piece.style.background =
            colors[
                Math.floor(
                    Math.random()
                    *
                    colors.length
                )
            ];


        piece.style.borderRadius =
            Math.random() > 0.5
                ?
                "2px"
                :
                "50%";


        piece.style.opacity =
            0.7
            +
            Math.random()
            *
            0.3;


        layer.appendChild(
            piece
        );


        const drift =
            -80
            +
            Math.random()
            *
            160;


        const rotation =
            500
            +
            Math.random()
            *
            800;


        piece.animate(

            [
                {
                    transform:
                        "translate3d(0,-30px,0) rotate(0deg)"
                },

                {
                    transform:
                        `translate3d(${drift}px,110vh,0) rotate(${rotation}deg)`
                }
            ],

            {
                duration:
                    2600
                    +
                    Math.random()
                    *
                    2400,

                delay:
                    Math.random()
                    *
                    500,

                easing:
                    "linear",

                fill:
                    "forwards"
            }

        );

    }


    setTimeout(

        function () {

            if (layer.isConnected) {

                layer.remove();

            }

        },

        5600

    );
}


/* =========================================================
   CUT CAKE
========================================================= */

cakeSlider.addEventListener(

    "input",

    function () {

        const value =
            Number(
                cakeSlider.value
            );


        if (
            value < 90
            ||
            cakeAlreadyCut
        ) {

            return;
        }


        cakeAlreadyCut = true;


        /*
        ONLY VISUAL CONFETTI.
        NO EXTRA AUDIO.
        */

        createCakeConfetti();


        cakeImage.src =
            "assets/images/cake-cut.png";


        cakeImage.animate(

            [
                {
                    transform:
                        "scale(1)"
                },

                {
                    transform:
                        "scale(1.08)"
                },

                {
                    transform:
                        "scale(0.98)"
                },

                {
                    transform:
                        "scale(1)"
                }
            ],

            {
                duration: 800,

                easing:
                    "cubic-bezier(.2,.8,.2,1)"
            }

        );


        cakeCutArea.classList.add(
            "hidden"
        );


        /*
        SLICE APPEARS AFTER
        A SMALL PAUSE.
        */

        setTimeout(

            function () {

                cakeAfterCut.classList.remove(
                    "hidden"
                );


                const slice =
                    document.querySelector(
                        ".cake-slice"
                    );


                if (slice) {

                    slice.animate(

                        [
                            {
                                opacity: 0,

                                transform:
                                    "scale(0.15) translateY(35px)"
                            },

                            {
                                opacity: 1,

                                transform:
                                    "scale(1.15) translateY(-8px)"
                            },

                            {
                                opacity: 1,

                                transform:
                                    "scale(1) translateY(0)"
                            }
                        ],

                        {
                            duration: 780,

                            easing:
                                "cubic-bezier(.2,.8,.2,1)"
                        }

                    );

                }

            },

            950

        );

    }

);


/* =========================================================
   NOM NOM
========================================================= */

nomNomButton.addEventListener(

    "click",

    function () {

        cakeAfterCut.classList.add(
            "hidden"
        );


        cakeFinish.classList.remove(
            "hidden"
        );


        cakeFinish.animate(

            [
                {
                    opacity: 0,

                    transform:
                        "translateY(12px)"
                },

                {
                    opacity: 1,

                    transform:
                        "translateY(0)"
                }
            ],

            {
                duration: 500,

                easing:
                    "ease-out"
            }

        );

    }

);


/* =========================================================
   RETURN TO PENGUINS
========================================================= */

backToPenguinsButton.addEventListener(

    "click",

    function () {

        if (leavingCake) {

            return;
        }


        leavingCake = true;


        /*
        FADE MUSIC BEFORE
        LEAVING CAKE PAGE.
        */

        stopCakeMusic(

            function () {

                giftTwoUnlocked =
                    true;


                hideMainScreens();


                penguinScreen.classList.remove(
                    "hidden"
                );


                animateScreenIn(
                    penguinScreen
                );


                giftTwoButton.classList.remove(
                    "gift-two-locked"
                );


                giftTwoLock.classList.add(
                    "hidden"
                );


                penguinTwoText.innerHTML =
                    `
                    Finally! 😌

                    <br><br>

                    Cake protocol complete.

                    <br>

                    Ab meri baari. 🎁
                    `;


                window.scrollTo(
                    0,
                    0
                );


                setTimeout(

                    function () {

                        playSfx(
                            "assets/audio/gift-sparkle.mp3",
                            0.34
                        );

                    },

                    120

                );


                giftTwoButton.animate(

                    [
                        {
                            transform:
                                "scale(1)"
                        },

                        {
                            transform:
                                "scale(1.12)"
                        },

                        {
                            transform:
                                "scale(1)"
                        }
                    ],

                    {
                        duration: 700,

                        easing:
                            "ease-out"
                    }

                );


                leavingCake = false;

            }

        );

    }

);


/* =========================================================
   GIFT 2
========================================================= */

giftTwoButton.addEventListener(

    "click",

    function () {

        /*
        STILL LOCKED
        */

        if (
            giftTwoUnlocked
            ===
            false
        ) {

            penguinTwoText.innerHTML =
                `
                Areee 😌

                <br><br>

                Cheating allowed nahi hai.

                <br><br>

                Pehle Penguin No. 1 ka
                gift kholo.

                <br>

                Phir main apna secret
                unlock karunga. 🎁
                `;


            giftTwoButton.animate(

                [
                    {
                        transform:
                            "translateX(0)"
                    },

                    {
                        transform:
                            "translateX(-8px)"
                    },

                    {
                        transform:
                            "translateX(8px)"
                    },

                    {
                        transform:
                            "translateX(-6px)"
                    },

                    {
                        transform:
                            "translateX(6px)"
                    },

                    {
                        transform:
                            "translateX(0)"
                    }
                ],

                {
                    duration: 450
                }

            );


            playSfx(
                "assets/audio/ui-click.mp3",
                0.18
            );


            return;
        }


        /*
        PREVENT DOUBLE CLICK
        */

        if (giftTwoOpening) {

            return;
        }


        giftTwoOpening = true;


        playSfx(
            "assets/audio/gift-sparkle.mp3",
            0.42
        );


        giftTwoButton.animate(

            [
                {
                    transform:
                        "scale(1)"
                },

                {
                    transform:
                        "scale(1.10)"
                },

                {
                    transform:
                        "scale(1)"
                }
            ],

            {
                duration: 600,

                easing:
                    "ease-out"
            }

        );


        setTimeout(

            function () {

                stopAllSoundEffects(
                    500
                );

            },

            260

        );


        setTimeout(

            function () {

                openStory();

                giftTwoOpening =
                    false;

            },

            540

        );

    }

);


/* =========================================================
   OPEN STORY
========================================================= */

function openStory() {

    /*
    GUARANTEE CAKE MUSIC
    IS COMPLETELY OFF.
    */

    cakeMusic.pause();

    cakeMusic.currentTime = 0;

    cakeMusic.volume = 0;


    hideMainScreens();


    storyScreen.classList.remove(
        "hidden"
    );


    soundToggle.classList.remove(
        "hidden"
    );


    animateScreenIn(
        storyScreen
    );


    storyHasStarted = true;


    desiredStoryTrack =
        "assets/audio/01-dreamy.mp3";


    window.scrollTo(
        0,
        0
    );


    /*
    SMALL TRANSITION GAP
    BEFORE STORY MUSIC.
    */

    setTimeout(

        function () {

            switchStoryMusic(
                desiredStoryTrack
            );

        },

        350

    );


    setTimeout(

        revealVisibleItems,

        200

    );
}


/* =========================================================
   STORY MUSIC
========================================================= */

function switchStoryMusic(
    path
) {

    desiredStoryTrack =
        path;


    if (
        !storyHasStarted
        ||
        !isStoryOpen()
        ||
        soundMuted
    ) {

        return;
    }


    /*
    SAME TRACK
    */

    if (
        currentStoryAudio
        &&
        currentStoryTrack
        ===
        path
    ) {

        if (
            currentStoryAudio.paused
        ) {

            currentStoryAudio.volume =
                0;


            currentStoryAudio.play()
                .then(
                    function () {

                        fadeAudio(

                            currentStoryAudio,

                            0.42,

                            800

                        );

                    }
                )
                .catch(
                    function () {}
                );

        }


        return;
    }


    const previousAudio =
        currentStoryAudio;


    const nextAudio =
        new Audio(path);


    nextAudio.loop = true;

    nextAudio.preload =
        "auto";

    nextAudio.volume = 0;


    const request =
        ++trackRequestNumber;


    nextAudio.play()
        .then(
            function () {

                /*
                IGNORE STALE TRACK REQUEST
                */

                if (
                    request
                    !==
                    trackRequestNumber
                    ||
                    soundMuted
                    ||
                    !isStoryOpen()
                ) {

                    nextAudio.pause();

                    nextAudio.currentTime =
                        0;

                    return;
                }


                currentStoryAudio =
                    nextAudio;


                currentStoryTrack =
                    path;


                /*
                NEW TRACK FADE IN
                */

                fadeAudio(

                    nextAudio,

                    0.42,

                    1600

                );


                /*
                OLD TRACK FADE OUT
                */

                if (
                    previousAudio
                    &&
                    previousAudio
                    !==
                    nextAudio
                ) {

                    fadeAudio(

                        previousAudio,

                        0,

                        1350,

                        function () {

                            if (
                                previousAudio
                                !==
                                currentStoryAudio
                            ) {

                                previousAudio.pause();

                                previousAudio.currentTime =
                                    0;

                            }

                        }

                    );

                }

            }
        )
        .catch(
            function () {}
        );
}


/* =========================================================
   STORY MUSIC OBSERVER
========================================================= */

const musicSections =
    document.querySelectorAll(
        ".story-music-section"
    );


const sectionVisibility =
    new Map();


musicSections.forEach(

    function (section) {

        sectionVisibility.set(
            section,
            0
        );

    }

);


function selectVisibleStoryTrack() {

    if (
        storyObserverPaused
        ||
        !storyHasStarted
        ||
        !isStoryOpen()
    ) {

        return;
    }


    let bestSection = null;
    let bestVisibility = 0;


    sectionVisibility.forEach(

        function (
            visibility,
            section
        ) {

            if (
                visibility
                >
                bestVisibility
            ) {

                bestVisibility =
                    visibility;


                bestSection =
                    section;

            }

        }

    );


    if (
        !bestSection
        ||
        bestVisibility < 0.20
    ) {

        return;
    }


    const track =
        bestSection.dataset.track;


    if (!track) {

        return;
    }


    desiredStoryTrack =
        track;


    clearTimeout(
        storyTrackTimer
    );


    storyTrackTimer =
        setTimeout(

            function () {

                switchStoryMusic(
                    track
                );

            },

            180

        );
}


const musicObserver =
    new IntersectionObserver(

        function (entries) {

            entries.forEach(

                function (entry) {

                    sectionVisibility.set(

                        entry.target,

                        entry.isIntersecting
                            ?
                            entry.intersectionRatio
                            :
                            0

                    );

                }

            );


            selectVisibleStoryTrack();

        },

        {
            threshold:
                [
                    0,
                    0.20,
                    0.35,
                    0.50,
                    0.65,
                    0.80
                ]
        }

    );


musicSections.forEach(

    function (section) {

        musicObserver.observe(
            section
        );

    }

);


/* =========================================================
   SOUND TOGGLE
========================================================= */

soundToggle.addEventListener(

    "click",

    function () {

        soundMuted =
            !soundMuted;


        if (soundMuted) {

            soundText.textContent =
                "Sound Off";


            soundIcon.textContent =
                "×";


            trackRequestNumber++;


            if (
                currentStoryAudio
                &&
                !currentStoryAudio.paused
            ) {

                fadeAudio(

                    currentStoryAudio,

                    0,

                    450,

                    function () {

                        currentStoryAudio.pause();

                    }

                );

            }


            activeSoundEffects.forEach(

                function (audio) {

                    audio.pause();

                }

            );


            activeSoundEffects.clear();

        }

        else {

            soundText.textContent =
                "Sound On";


            soundIcon.textContent =
                "♪";


            switchStoryMusic(
                desiredStoryTrack
            );

        }

    }

);


/* =========================================================
   VIDEOS

   ALWAYS MUTED.
========================================================= */

const storyVideos =
    document.querySelectorAll(
        ".story-video"
    );


storyVideos.forEach(

    function (video) {

        video.muted = true;

        video.playsInline = true;

    }

);


const videoObserver =
    new IntersectionObserver(

        function (entries) {

            entries.forEach(

                function (entry) {

                    const video =
                        entry.target;


                    video.muted =
                        true;


                    if (
                        entry.isIntersecting
                        &&
                        entry.intersectionRatio
                        >=
                        0.45
                    ) {

                        video.play()
                            .catch(
                                function () {}
                            );

                    }

                    else {

                        video.pause();

                    }

                }

            );

        },

        {
            threshold:
                [
                    0,
                    0.45,
                    0.75
                ]
        }

    );


storyVideos.forEach(

    function (video) {

        videoObserver.observe(
            video
        );

    }

);


/* =========================================================
   STORY REVEAL ANIMATIONS
========================================================= */

const revealItems =
    document.querySelectorAll(
        ".reveal"
    );


const revealObserver =
    new IntersectionObserver(

        function (entries) {

            entries.forEach(

                function (entry) {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target.classList.add(
                            "visible"
                        );

                    }

                }

            );

        },

        {
            threshold: 0.14
        }

    );


revealItems.forEach(

    function (item) {

        revealObserver.observe(
            item
        );

    }

);


function revealVisibleItems() {

    revealItems.forEach(

        function (item) {

            const rect =
                item.getBoundingClientRect();


            if (
                rect.top
                <
                window.innerHeight
            ) {

                item.classList.add(
                    "visible"
                );

            }

        }

    );
}


/* =========================================================
   FINAL BUTTON
========================================================= */

celebrateButton.addEventListener(

    "click",

    function () {

        /*
        THIS IS THE FIXED
        FINAL CONFETTI.
        */

        createFinalConfetti();


        celebrateButton.textContent =
            "Happy Birthday ✨";


        /*
        LITTLE BUTTON POP
        */

        celebrateButton.animate(

            [
                {
                    transform:
                        "scale(1)"
                },

                {
                    transform:
                        "scale(1.08)"
                },

                {
                    transform:
                        "scale(1)"
                }
            ],

            {
                duration: 450,

                easing:
                    "ease-out"
            }

        );

    }

);


/* =========================================================
   FINAL FULL-SCREEN CONFETTI

   DOES NOT USE CSS.
   DOES NOT USE confettiContainer.
   FIXED TO CURRENT VIEWPORT.
========================================================= */

function createFinalConfetti() {

    /*
    REMOVE PREVIOUS CONFETTI
    IF BUTTON IS CLICKED AGAIN.
    */

    const oldLayer =
        document.getElementById(
            "finalConfettiOverlay"
        );


    if (oldLayer) {

        oldLayer.remove();

    }


    /*
    CREATE FULL-SCREEN OVERLAY
    */

    const layer =
        document.createElement(
            "div"
        );


    layer.id =
        "finalConfettiOverlay";


    layer.style.position =
        "fixed";


    layer.style.top =
        "0";


    layer.style.right =
        "0";


    layer.style.bottom =
        "0";


    layer.style.left =
        "0";


    layer.style.width =
        "100vw";


    layer.style.height =
        "100vh";


    layer.style.pointerEvents =
        "none";


    layer.style.overflow =
        "hidden";


    /*
    EXTREMELY HIGH Z-INDEX
    */

    layer.style.zIndex =
        "2147483647";


    document.body.appendChild(
        layer
    );


    const colors =
        [
            "#ffffff",
            "#ffd7e0",
            "#f3a7ba",
            "#d8879b",
            "#ffe59a",
            "#e7bf78",
            "#f7c7d3",
            "#fff0c7"
        ];


    /*
    CONFETTI RAIN
    */

    for (
        let i = 0;
        i < 180;
        i++
    ) {

        const piece =
            document.createElement(
                "div"
            );


        const width =
            5
            +
            Math.random()
            *
            8;


        const height =
            width
            *
            (
                1
                +
                Math.random()
            );


        piece.style.position =
            "absolute";


        piece.style.top =
            "-40px";


        piece.style.left =
            Math.random()
            *
            100
            +
            "%";


        piece.style.width =
            width
            +
            "px";


        piece.style.height =
            height
            +
            "px";


        piece.style.backgroundColor =
            colors[
                Math.floor(
                    Math.random()
                    *
                    colors.length
                )
            ];


        piece.style.borderRadius =
            Math.random() > 0.65
                ?
                "50%"
                :
                "2px";


        piece.style.opacity =
            (
                0.75
                +
                Math.random()
                *
                0.25
            )
            .toString();


        layer.appendChild(
            piece
        );


        const drift =
            -140
            +
            Math.random()
            *
            280;


        const spin =
            720
            +
            Math.random()
            *
            1200;


        piece.animate(

            [
                {
                    transform:
                        "translate3d(0,-60px,0) rotate(0deg)"
                },

                {
                    transform:
                        `translate3d(${drift}px,115vh,0) rotate(${spin}deg)`
                }
            ],

            {
                duration:
                    2800
                    +
                    Math.random()
                    *
                    2800,

                delay:
                    Math.random()
                    *
                    900,

                easing:
                    "linear",

                fill:
                    "forwards"
            }

        );

    }


    /*
    EXTRA CENTRAL BURST

    MAKES THE EFFECT IMMEDIATELY
    OBVIOUS WHEN BUTTON IS CLICKED.
    */

    for (
        let i = 0;
        i < 55;
        i++
    ) {

        const piece =
            document.createElement(
                "div"
            );


        const size =
            6
            +
            Math.random()
            *
            8;


        piece.style.position =
            "absolute";


        piece.style.left =
            "50%";


        piece.style.top =
            "58%";


        piece.style.width =
            size
            +
            "px";


        piece.style.height =
            size
            *
            1.4
            +
            "px";


        piece.style.backgroundColor =
            colors[
                Math.floor(
                    Math.random()
                    *
                    colors.length
                )
            ];


        piece.style.borderRadius =
            Math.random() > 0.5
                ?
                "50%"
                :
                "2px";


        layer.appendChild(
            piece
        );


        const angle =
            Math.random()
            *
            Math.PI
            *
            2;


        const distance =
            120
            +
            Math.random()
            *
            330;


        const x =
            Math.cos(angle)
            *
            distance;


        const y =
            Math.sin(angle)
            *
            distance;


        piece.animate(

            [
                {
                    opacity: 1,

                    transform:
                        "translate(-50%,-50%) scale(0.2) rotate(0deg)"
                },

                {
                    opacity: 1,

                    transform:
                        `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1) rotate(540deg)`
                },

                {
                    opacity: 0,

                    transform:
                        `translate(calc(-50% + ${x * 1.25}px), calc(-50% + ${y * 1.25 + 180}px)) scale(0.8) rotate(900deg)`
                }
            ],

            {
                duration:
                    1300
                    +
                    Math.random()
                    *
                    900,

                easing:
                    "cubic-bezier(.15,.7,.3,1)",

                fill:
                    "forwards"
            }

        );

    }


    /*
    REMOVE OVERLAY AFTER
    EVERYTHING FINISHES.
    */

    setTimeout(

        function () {

            if (
                layer.isConnected
            ) {

                layer.remove();

            }

        },

        7000

    );
}


/* =========================================================
   REPLAY STORY
========================================================= */

restartStoryButton.addEventListener(

    "click",

    function () {

        storyObserverPaused =
            true;


        clearTimeout(
            storyTrackTimer
        );


        desiredStoryTrack =
            "assets/audio/01-dreamy.mp3";


        switchStoryMusic(
            desiredStoryTrack
        );


        document
            .getElementById(
                "storyBeginning"
            )
            .scrollIntoView(
                {
                    behavior:
                        "smooth",

                    block:
                        "start"
                }
            );


        /*
        PREVENT EVERY CHAPTER
        FROM TRIGGERING MUSIC
        WHILE PAGE SCROLLS UP.
        */

        setTimeout(

            function () {

                storyObserverPaused =
                    false;


                selectVisibleStoryTrack();

            },

            1800

        );

    }

);


/* =========================================================
   WHEN TAB / PHONE BROWSER
   GOES INTO BACKGROUND
========================================================= */

let cakeMusicWasPlaying =
    false;

let storyMusicWasPlaying =
    false;


document.addEventListener(

    "visibilitychange",

    function () {

        /*
        USER LEAVES TAB
        */

        if (
            document.hidden
        ) {

            cakeMusicWasPlaying =
                !cakeMusic.paused;


            storyMusicWasPlaying =
                Boolean(
                    currentStoryAudio
                    &&
                    !currentStoryAudio.paused
                );


            if (
                cakeMusicWasPlaying
            ) {

                cakeMusic.pause();

            }


            if (
                storyMusicWasPlaying
                &&
                currentStoryAudio
            ) {

                currentStoryAudio.pause();

            }


            storyVideos.forEach(

                function (video) {

                    video.pause();

                }

            );


            return;
        }


        /*
        USER RETURNS
        */

        if (soundMuted) {

            return;
        }


        if (
            isCakeOpen()
            &&
            cakeMusicWasPlaying
        ) {

            cakeMusic.play()
                .catch(
                    function () {}
                );

        }


        if (
            isStoryOpen()
            &&
            storyMusicWasPlaying
        ) {

            switchStoryMusic(
                desiredStoryTrack
            );

        }


        cakeMusicWasPlaying =
            false;


        storyMusicWasPlaying =
            false;

    }

);
