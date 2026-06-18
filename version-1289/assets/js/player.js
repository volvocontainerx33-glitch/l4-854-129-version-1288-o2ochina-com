(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-video-src]'));

  players.forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.play-cover');
    var source = box.getAttribute('data-video-src');
    var loaded = false;
    var hls = null;

    function loadVideo() {
      if (loaded || !video || !source) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      loaded = true;
    }

    function playVideo() {
      loadVideo();
      box.classList.add('is-playing');
      var result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!loaded) {
          playVideo();
        }
      });

      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
