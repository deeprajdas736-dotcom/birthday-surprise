/* =========================================
   FINAL BIRTHDAY WEBSITE SCRIPT
   STABILITY / SMOOTHNESS VERSION
========================================= */


/* =========================================
   WEBSITE STATE
========================================= */

let giftTwoUnlocked = false;
let cakeAlreadyCut = false;

let soundMuted = false;
let storyHasStarted = false;

let giftOneOpening = false;
let giftTwoOpening = false;
let leavingCake = false;

let currentAudio = null;
let currentAudioPath = null;

let desiredStoryTrack =
    "assets/audio/01-dreamy.mp3";

let storySwitchVersion = 0;

let storyTrackTimer = null;

let suppressMusicObserver = false;


/* =========================================
   AUDIO FADE TOKENS

   Prevents two different fades from
   fighting over the same audio element.
========================================= */

const fadeTokens =
    new WeakMap();


/* =========================================
   CAKE BACKGROUND MUSIC

   THIS IS THE ONLY AUDIO ALLOWED
   WHILE THE CAKE SCREEN IS OPEN.
========================================= */

const cakeBackgroundAudio =
    new Audio(
        "assets/audio/cake-birthday-bg.mp3"
    );

cakeBackgroundAudio.loop = true;
cakeBackgroundAudio.preload = "auto";
cakeBackgroundAudio.volume = 0;


/* =========================================
   SCREENS
========================================= */

const welcomeScreen =
    document.getElementById(
        "welcomeScreen"
    );

const penguinScreen =
    document.getElementById(
        "penguinScreen"
    );

const cakeScreen =
    document.getElementById(
        "cakeScreen"
    );

const storyScreen =
    document.getElementById(
        "storyScreen"
    );


/* =========================================
   MAIN ELEMENTS
========================================= */

const startButton =
    document.getElementById(
        "startButton"
    );

const giftOneButton =
    document.getElementById(
        "giftOneButton"
    );

const giftTwoButton =
    document.getElementById(
        "giftTwoButton"
    );

const giftTwoLock =
    document.getElementById(
        "giftTwoLock"
    );

const penguinTwoText =
    document.getElementById(
        "penguinTwoText"
    );


/* =========================================
   CAKE ELEMENTS
========================================= */

const cakeImage =
    document.getElementById(
        "cakeImage"
    );

const cakeSlider =
    document.getElementById(
        "cakeSlider"
    );

const cakeCutArea =
    document.getElementById(
        "cakeCutArea"
    );

const cakeAfterCut =
    document.getElementById(
        "cakeAfterCut"
    );

const cakeFinish =
    document.getElementById(
        "cakeFinish"
    );

const nomNomButton =
    document.getElementById(
        "nomNomButton"
    );

const backToPenguinsButton =
    document.getElementById(
        "backToPenguinsButton"
    );


/* =========================================
   STORY ELEMENTS
========================================= */

const soundToggle =
    document.getElementById(
        "soundToggle"
    );

const soundText =
    document.getElementById(
        "soundText"
    );

const soundIcon =
    document.getElementById(
        "soundIcon"
    );

const celebrateButton =
    document.getElementById(
        "celebrateButton"
    );

const restartStoryButton =
    document.getElementById(
        "restartStoryButton"
    );

const confettiContainer =
    document.getElementById(
        "confettiContainer"
    );


/* =========================================
   ACTIVE SOUND EFFECTS

   We keep track of them so we can
   guarantee they stop before cake music.
========================================= */

const activeSoundEffects =
    new Set();


/* =========================================
   IS CAKE PAGE OPEN?
========================================= */

function isCakePageOpen() {

    return !cakeScreen.classList.contains(
        "hidden"
    );

}


/* =========================================
   IS STORY OPEN?
========================================= */

function isStoryOpen() {

    return !storyScreen.classList.contains(
        "hidden"
    );

}


/* =========================================
   HIDE ALL MAIN SCREENS
========================================= */

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


/* =========================================
   SMOOTH SCREEN ENTRANCE
========================================= */

function animateScreenIn(
    element
) {

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


/* =========================================
   PROFESSIONAL AUDIO FADE

   New fade automatically cancels
   an old fade on the same audio.
========================================= */

function fadeAudio(
    audio,
    endVolume,
    duration,
    callback
) {

    if (
        !audio
    ) {

        if (callback) {
            callback();
        }

        return;

    }


    const startVolume =
        audio.volume;


    const token =
        Symbol();


    fadeTokens.set(
        audio,
        token
    );


    const startTime =
        performance.now();


    function update(
        time
    ) {

        if (
            fadeTokens.get(audio)
            !==
            token
        ) {

            return;

        }


        const progress =
            Math.min(
                1,
                (
                    time
                    -
                    startTime
                )
                /
                duration
            );


        /*
        SMOOTHSTEP EASING

        Less mechanical than a
        straight linear volume fade.
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
                endVolume
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
                update
            );

            return;

        }


        audio.volume =
            endVolume;


        if (
            callback
        ) {

            callback();

        }

    }


    requestAnimationFrame(
        update
    );

}


/* =========================================
   NORMAL SOUND EFFECTS
========================================= */

function playSfx(
    path,
    volume = 0.4
) {

    /*
    ABSOLUTELY NO SFX
    DURING CAKE SCREEN
    */

    if (
        soundMuted
        ||
        isCakePageOpen()
    ) {

        return null;

    }


    const audio =
        new Audio(
            path
        );


    audio.preload =
        "auto";


    audio.volume =
        volume;


    activeSoundEffects.add(
        audio
    );


    const removeAudio =
        function () {

            activeSoundEffects.delete(
                audio
            );

        };


    audio.addEventListener(
        "ended",
        removeAudio,
        {
            once: true
        }
    );


    audio.play()
        .catch(
            function () {

                removeAudio();

            }
        );


    return audio;

}


/* =========================================
   FADE OUT ALL SOUND EFFECTS

   Used before entering cake page.
========================================= */

function fadeOutAllSfx(
    duration = 200
) {

    activeSoundEffects.forEach(

        function (
            audio
        ) {

            fadeAudio(

                audio,

                0,

                duration,

                function () {

                    audio.pause();

                    audio.currentTime =
                        0;


                    activeSoundEffects.delete(
                        audio
                    );

                }

            );

        }

    );

}


/* =========================================
   STANDARD BUTTON CLICK SOUND

   Gift buttons have their own sparkle,
   so they are excluded to prevent
   two effects playing together.
========================================= */

document.addEventListener(
    "click",
    function (
        event
    ) {

        if (
            isCakePageOpen()
        ) {

            return;

        }


        const target =
            event.target.closest(
                "button, .story-start-button"
            );


        if (
            !target
        ) {

            return;

        }


        const excludedIds =
            [
                "giftOneButton",
                "giftTwoButton",
                "backToPenguinsButton",
                "soundToggle",
                "celebrateButton"
            ];


        if (
            excludedIds.includes(
                target.id
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


/* =========================================
   START CAKE MUSIC
========================================= */

function startCakeMusic() {

    /*
    GUARANTEE THAT NO STORY MUSIC
    OR SFX IS STILL PLAYING.
    */

    storySwitchVersion++;


    if (
        currentAudio
    ) {

        currentAudio.pause();

        currentAudio.currentTime =
            0;

        currentAudio =
            null;

        currentAudioPath =
            null;

    }


    activeSoundEffects.forEach(

        function (
            audio
        ) {

            audio.pause();

            audio.currentTime =
                0;

        }

    );


    activeSoundEffects.clear();


    if (
        soundMuted
    ) {

        return;

    }


    cakeBackgroundAudio.pause();

    cakeBackgroundAudio.currentTime =
        0;

    cakeBackgroundAudio.volume =
        0;


    cakeBackgroundAudio.play()
        .then(
            function () {

                fadeAudio(

                    cakeBackgroundAudio,

                    0.36,

                    1400

                );

            }
        )
        .catch(
            function () {}
        );

}


/* =========================================
   STOP CAKE MUSIC
========================================= */

function stopCakeMusic(
    callback
) {

    if (
        cakeBackgroundAudio.paused
    ) {

        cakeBackgroundAudio.currentTime =
            0;


        if (
            callback
        ) {

            callback();

        }


        return;

    }


    fadeAudio(

        cakeBackgroundAudio,

        0,

        1000,

        function () {

            cakeBackgroundAudio.pause();

            cakeBackgroundAudio.currentTime =
                0;


            if (
                callback
            ) {

                callback();

            }

        }

    );

}


/* =========================================
   TAP TO BEGIN
========================================= */

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


/* =========================================
   OPEN GIFT 1
========================================= */

giftOneButton.addEventListener(
    "click",
    function () {

        /*
        PREVENT DOUBLE CLICK GLITCH
        */

        if (
            giftOneOpening
        ) {

            return;

        }


        giftOneOpening =
            true;


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
        BEGIN FADING SPARKLE BEFORE
        CAKE SCREEN BECOMES VISIBLE.
        */

        setTimeout(

            function () {

                fadeOutAllSfx(
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
                NOW ONLY HAPPY BIRTHDAY
                MUSIC IS ALLOWED.
                */

                startCakeMusic();


                giftOneOpening =
                    false;

            },

            620

        );

    }
);


/* =========================================
   CAKE CONFETTI
   VISUAL ONLY
========================================= */

function createCakeConfetti() {

    cakeScreen.style.position =
        "relative";


    /*
    REMOVE OLD CAKE CONFETTI IF
    SOMETHING UNEXPECTED HAPPENED.
    */

    const oldLayer =
        cakeScreen.querySelector(
            ".cake-confetti-layer"
        );


    if (
        oldLayer
    ) {

        oldLayer.remove();

    }


    const layer =
        document.createElement(
            "div"
        );


    layer.className =
        "confetti-container cake-confetti-layer";


    cakeScreen.appendChild(
        layer
    );


    const colours =
        [
            "#f4c5d0",
            "#ffffff",
            "#e1bc80",
            "#c47789",
            "#ffd8e0",
            "#f2b8c6",
            "#f6dd9b"
        ];


    for (
        let i = 0;
        i < 90;
        i++
    ) {

        const piece =
            document.createElement(
                "span"
            );


        piece.className =
            "confetti-piece";


        piece.style.left =
            Math.random()
            *
            100
            +
            "%";


        piece.style.background =
            colours[
                Math.floor(
                    Math.random()
                    *
                    colours.length
                )
            ];


        piece.style.animationDuration =
            (
                2.8
                +
                Math.random()
                *
                2.3
            )
            +
            "s";


        piece.style.animationDelay =
            (
                Math.random()
                *
                0.6
            )
            +
            "s";


        layer.appendChild(
            piece
        );

    }


    setTimeout(

        function () {

            if (
                layer.isConnected
            ) {

                layer.remove();

            }

        },

        5500

    );

}


/* =========================================
   CUT CAKE

   ONLY HAPPY BIRTHDAY MUSIC
   CONTINUES.
========================================= */

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


        cakeAlreadyCut =
            true;


        /*
        VISUAL CONFETTI
        */

        createCakeConfetti();


        /*
        SWITCH TO CUT CAKE
        */

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
        SMALL CINEMATIC PAUSE
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


                if (
                    slice
                ) {

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


/* =========================================
   NOM NOM

   NO SFX HERE.
========================================= */

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


/* =========================================
   RETURN TO PENGUINS

   FIRST MUSIC FADES OUT.
   THEN SCREEN CHANGES.
========================================= */

backToPenguinsButton.addEventListener(
    "click",
    function () {

        if (
            leavingCake
        ) {

            return;

        }


        leavingCake =
            true;


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


                /*
                CAKE PAGE IS GONE NOW.

                NORMAL EFFECTS CAN
                SAFELY RETURN.
                */

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


                leavingCake =
                    false;

            }

        );

    }
);


/* =========================================
   CLICK GIFT 2
========================================= */

giftTwoButton.addEventListener(
    "click",
    function () {

        /*
        LOCKED
        */

        if (
            giftTwoUnlocked === false
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
        PREVENT MULTIPLE OPEN EVENTS
        */

        if (
            giftTwoOpening
        ) {

            return;

        }


        giftTwoOpening =
            true;


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


        /*
        START SOFTENING THE SPARKLE
        WHILE STORY OPENS.
        */

        setTimeout(

            function () {

                fadeOutAllSfx(
                    650
                );

            },

            250

        );


        setTimeout(

            function () {

                openStory();


                giftTwoOpening =
                    false;

            },

            520

        );

    }
);


/* =========================================
   OPEN STORY
========================================= */

function openStory() {

    /*
    GUARANTEE CAKE AUDIO IS DEAD.
    */

    cakeBackgroundAudio.pause();

    cakeBackgroundAudio.currentTime =
        0;

    cakeBackgroundAudio.volume =
        0;


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


    storyHasStarted =
        true;


    desiredStoryTrack =
        "assets/audio/01-dreamy.mp3";


    window.scrollTo(
        0,
        0
    );


    /*
    SMALL GAP LETS GIFT SPARKLE
    NATURALLY BLEND AWAY.
    */

    setTimeout(

        function () {

            switchMusic(
                desiredStoryTrack
            );

        },

        350

    );


    setTimeout(

        activateVisibleReveals,

        200

    );

}


/* =========================================
   STORY MUSIC CROSSFADE

   SAFER VERSION:
   - prevents stale tracks winning
   - handles rapid scrolling
   - handles mute/unmute properly
========================================= */

function switchMusic(
    newPath
) {

    desiredStoryTrack =
        newPath;


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
    SAME TRACK ALREADY ACTIVE
    */

    if (
        currentAudio
        &&
        currentAudioPath
        ===
        newPath
    ) {

        if (
            currentAudio.paused
        ) {

            currentAudio.volume =
                0;


            currentAudio.play()
                .then(
                    function () {

                        fadeAudio(

                            currentAudio,

                            0.42,

                            900

                        );

                    }
                )
                .catch(
                    function () {}
                );

        }


        return;

    }


    const oldAudio =
        currentAudio;


    const nextAudio =
        new Audio(
            newPath
        );


    nextAudio.loop =
        true;

    nextAudio.preload =
        "auto";

    nextAudio.volume =
        0;


    const version =
        ++storySwitchVersion;


    nextAudio.play()
        .then(
            function () {

                /*
                IF ANOTHER TRACK WAS REQUESTED
                BEFORE THIS ONE LOADED,
                ABANDON THIS OLD REQUEST.
                */

                if (
                    version
                    !==
                    storySwitchVersion
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


                currentAudio =
                    nextAudio;


                currentAudioPath =
                    newPath;


                /*
                FADE NEW TRACK IN
                */

                fadeAudio(

                    nextAudio,

                    0.42,

                    1550

                );


                /*
                FADE OLD TRACK OUT
                */

                if (
                    oldAudio
                    &&
                    oldAudio !== nextAudio
                ) {

                    fadeAudio(

                        oldAudio,

                        0,

                        1350,

                        function () {

                            /*
                            ONLY STOP OLD AUDIO.
                            NEVER TOUCH THE NEW ONE.
                            */

                            if (
                                oldAudio
                                !==
                                currentAudio
                            ) {

                                oldAudio.pause();

                                oldAudio.currentTime =
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


/* =========================================
   STORY MUSIC OBSERVER

   Tracks all visible sections instead
   of relying only on the latest callback.
========================================= */

const musicSections =
    document.querySelectorAll(
        ".story-music-section"
    );


const sectionVisibility =
    new Map();


musicSections.forEach(

    function (
        section
    ) {

        sectionVisibility.set(
            section,
            0
        );

    }

);


function chooseMostVisibleTrack() {

    if (
        suppressMusicObserver
        ||
        !storyHasStarted
        ||
        !isStoryOpen()
    ) {

        return;

    }


    let bestSection =
        null;


    let bestRatio =
        0;


    sectionVisibility.forEach(

        function (
            ratio,
            section
        ) {

            if (
                ratio > bestRatio
            ) {

                bestRatio =
                    ratio;


                bestSection =
                    section;

            }

        }

    );


    if (
        !bestSection
        ||
        bestRatio < 0.20
    ) {

        return;

    }


    const track =
        bestSection.dataset.track;


    if (
        !track
    ) {

        return;

    }


    desiredStoryTrack =
        track;


    /*
    TINY DEBOUNCE:
    avoids track switching back and forth
    when two sections are on screen.
    */

    clearTimeout(
        storyTrackTimer
    );


    storyTrackTimer =
        setTimeout(

            function () {

                switchMusic(
                    track
                );

            },

            180

        );

}


const musicObserver =
    new IntersectionObserver(

        function (
            entries
        ) {

            entries.forEach(

                function (
                    entry
                ) {

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


            chooseMostVisibleTrack();

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

    function (
        section
    ) {

        musicObserver.observe(
            section
        );

    }

);


/* =========================================
   SOUND TOGGLE
========================================= */

soundToggle.addEventListener(
    "click",
    function () {

        soundMuted =
            !soundMuted;


        if (
            soundMuted
        ) {

            soundText.textContent =
                "Sound Off";


            soundIcon.textContent =
                "×";


            /*
            CANCEL ANY TRACK THAT IS
            STILL TRYING TO LOAD.
            */

            storySwitchVersion++;


            if (
                currentAudio
                &&
                !currentAudio.paused
            ) {

                fadeAudio(

                    currentAudio,

                    0,

                    450,

                    function () {

                        currentAudio.pause();

                    }

                );

            }


            activeSoundEffects.forEach(

                function (
                    audio
                ) {

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


            /*
            IMPORTANT:

            Resume the track belonging to
            the section currently visible,
            NOT necessarily the track that
            was playing before mute.
            */

            switchMusic(
                desiredStoryTrack
            );

        }

    }
);


/* =========================================
   VIDEOS

   ALWAYS MUTED
   PLAY ONLY WHEN VISIBLE.
========================================= */

const storyVideos =
    document.querySelectorAll(
        ".story-video"
    );


storyVideos.forEach(

    function (
        video
    ) {

        video.muted =
            true;


        video.playsInline =
            true;

    }

);


const videoObserver =
    new IntersectionObserver(

        function (
            entries
        ) {

            entries.forEach(

                function (
                    entry
                ) {

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

    function (
        video
    ) {

        videoObserver.observe(
            video
        );

    }

);


/* =========================================
   STORY REVEALS
========================================= */

const revealItems =
    document.querySelectorAll(
        ".reveal"
    );


const revealObserver =
    new IntersectionObserver(

        function (
            entries
        ) {

            entries.forEach(

                function (
                    entry
                ) {

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

    function (
        item
    ) {

        revealObserver.observe(
            item
        );

    }

);


function activateVisibleReveals() {

    revealItems.forEach(

        function (
            item
        ) {

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


/* =========================================
   FINAL CONFETTI
========================================= */

celebrateButton.addEventListener(
    "click",
    function () {

        createFinalConfetti();


        celebrateButton.textContent =
            "Happy Birthday ✨";

    }
);


function createFinalConfetti() {

    confettiContainer.innerHTML =
        "";


    const colours =
        [
            "#f4c5d0",
            "#ffffff",
            "#e1bc80",
            "#c47789",
            "#f5e4cb"
        ];


    for (
        let i = 0;
        i < 95;
        i++
    ) {

        const piece =
            document.createElement(
                "span"
            );


        piece.classList.add(
            "confetti-piece"
        );


        piece.style.left =
            Math.random()
            *
            100
            +
            "%";


        piece.style.background =
            colours[
                Math.floor(
                    Math.random()
                    *
                    colours.length
                )
            ];


        piece.style.animationDuration =
            (
                3
                +
                Math.random()
                *
                4
            )
            +
            "s";


        piece.style.animationDelay =
            (
                Math.random()
                *
                0.8
            )
            +
            "s";


        confettiContainer.appendChild(
            piece
        );

    }


    setTimeout(

        function () {

            confettiContainer.innerHTML =
                "";

        },

        8000

    );

}


/* =========================================
   RESTART STORY

   MUSIC OBSERVER IS TEMPORARILY PAUSED
   SO SCROLLING PAST ALL THE CHAPTERS
   DOES NOT RAPIDLY CHANGE SONGS.
========================================= */

restartStoryButton.addEventListener(
    "click",
    function () {

        suppressMusicObserver =
            true;


        clearTimeout(
            storyTrackTimer
        );


        desiredStoryTrack =
            "assets/audio/01-dreamy.mp3";


        switchMusic(
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


        setTimeout(

            function () {

                suppressMusicObserver =
                    false;


                chooseMostVisibleTrack();

            },

            1800

        );

    }
);


/* =========================================
   PHONE / TAB BACKGROUND HANDLING

   Prevent music continuing oddly if
   browser is minimized.
========================================= */

let cakeWasPlaying =
    false;

let storyWasPlaying =
    false;


document.addEventListener(
    "visibilitychange",
    function () {

        if (
            document.hidden
        ) {

            cakeWasPlaying =
                !cakeBackgroundAudio.paused;


            storyWasPlaying =
                currentAudio
                &&
                !currentAudio.paused;


            if (
                cakeWasPlaying
            ) {

                cakeBackgroundAudio.pause();

            }


            if (
                storyWasPlaying
                &&
                currentAudio
            ) {

                currentAudio.pause();

            }


            storyVideos.forEach(

                function (
                    video
                ) {

                    video.pause();

                }

            );


            return;

        }


        /*
        RETURNING TO TAB
        */

        if (
            soundMuted
        ) {

            return;

        }


        if (
            isCakePageOpen()
            &&
            cakeWasPlaying
        ) {

            cakeBackgroundAudio.play()
                .catch(
                    function () {}
                );

        }


        if (
            isStoryOpen()
            &&
            storyWasPlaying
        ) {

            switchMusic(
                desiredStoryTrack
            );

        }


        cakeWasPlaying =
            false;


        storyWasPlaying =
            false;

    }
);