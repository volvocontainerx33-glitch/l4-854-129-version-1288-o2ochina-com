(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var opened = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
      toggle.textContent = opened ? '×' : '☰';
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function getSearchText(card) {
    return (card.getAttribute('data-search') || '').toLowerCase();
  }

  function filterCards(input) {
    var container = document.querySelector('[data-card-grid]');
    if (!container) {
      return;
    }
    var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card'));
    var empty = document.querySelector('[data-empty-state]');
    var value = (input.value || '').trim().toLowerCase();
    var visible = 0;
    cards.forEach(function (card) {
      var matched = !value || getSearchText(card).indexOf(value) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }
  }

  function sortCards(select) {
    var container = document.querySelector('[data-sortable]');
    if (!container) {
      return;
    }
    var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card'));
    var key = select.value;
    cards.sort(function (a, b) {
      var av = Number(a.getAttribute('data-' + key)) || 0;
      var bv = Number(b.getAttribute('data-' + key)) || 0;
      return bv - av;
    });
    cards.forEach(function (card) {
      container.appendChild(card);
    });
  }

  function setupFilters() {
    var input = document.querySelector('[data-filter-input]');
    var select = document.querySelector('[data-sort-select]');
    if (input) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        input.value = query;
      }
      input.addEventListener('input', function () {
        filterCards(input);
      });
      filterCards(input);
    }
    if (select) {
      select.addEventListener('change', function () {
        sortCards(select);
      });
      sortCards(select);
    }
  }

  function prepareVideo(box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('.player-cover');
    var url = box.getAttribute('data-video');
    if (!video || !url) {
      return;
    }
    function attach() {
      if (video.getAttribute('data-ready') === '1') {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        video._hlsInstance = hls;
      } else {
        video.src = url;
      }
      video.setAttribute('data-ready', '1');
    }
    function play() {
      attach();
      if (cover) {
        cover.classList.add('hidden');
      }
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    }
    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.getAttribute('data-ready') !== '1') {
        play();
      }
    });
  }

  function setupPlayers() {
    Array.prototype.slice.call(document.querySelectorAll('.player-box[data-video]')).forEach(prepareVideo);
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
