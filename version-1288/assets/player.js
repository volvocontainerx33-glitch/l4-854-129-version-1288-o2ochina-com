function initMoviePlayer(source) {
  var video = document.getElementById('moviePlayer');
  var cover = document.getElementById('playerCover');
  var button = document.getElementById('playButton');
  var hlsInstance = null;
  var initialized = false;

  if (!video || !cover || !button || !source) {
    return;
  }

  function bindSource() {
    if (initialized) {
      return Promise.resolve();
    }
    initialized = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return new Promise(function (resolve) {
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
      });
    }
    video.src = source;
    return Promise.resolve();
  }

  function playVideo() {
    cover.classList.add('is-hidden');
    bindSource().then(function () {
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          cover.classList.remove('is-hidden');
        });
      }
    });
  }

  function toggleByVideoClick() {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  }

  button.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    playVideo();
  });

  cover.addEventListener('click', function () {
    playVideo();
  });

  video.addEventListener('click', toggleByVideoClick);

  video.addEventListener('play', function () {
    cover.classList.add('is-hidden');
  });

  video.addEventListener('pause', function () {
    if (!video.currentTime) {
      cover.classList.remove('is-hidden');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
