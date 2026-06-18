function initMoviePlayer(source) {
    var video = document.getElementById("movie-player");
    var cover = document.querySelector(".player-cover");
    var start = document.querySelector("[data-player-start]");
    var hlsInstance = null;
    var loaded = false;

    if (!video || !source) {
        return;
    }

    function load() {
        if (loaded) {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls();
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }
        video.setAttribute("controls", "controls");
        loaded = true;
    }

    function play() {
        load();
        if (cover) {
            cover.classList.add("is-hidden");
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {});
        }
    }

    if (start) {
        start.addEventListener("click", function (event) {
            event.stopPropagation();
            play();
        });
    }

    if (cover) {
        cover.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
        if (!loaded || video.paused) {
            play();
        } else {
            video.pause();
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
