function initPlayer(videoId, source, overlayId) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var hls = null;
  var loaded = false;

  if (!video) {
    return;
  }

  var bindSource = function () {
    if (loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  };

  var begin = function () {
    bindSource();

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  };

  if (overlay) {
    overlay.addEventListener('click', begin);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      begin();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (overlay && video.currentTime === 0) {
      overlay.classList.remove('is-hidden');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
