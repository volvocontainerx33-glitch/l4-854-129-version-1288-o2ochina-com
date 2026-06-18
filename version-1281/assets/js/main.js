(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      button.setAttribute("aria-expanded", panel.classList.contains("is-open") ? "true" : "false");
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var activeIndex = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(activeIndex + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(activeIndex - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(activeIndex + 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));
    roots.forEach(function (root) {
      var search = root.querySelector("[data-filter-search]");
      var year = root.querySelector("[data-filter-year]");
      var region = root.querySelector("[data-filter-region]");
      var reset = root.querySelector("[data-filter-reset]");
      var count = root.querySelector("[data-filter-count]");
      var scopeSelector = root.getAttribute("data-filter-scope") || "body";
      var scope = document.querySelector(scopeSelector) || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function apply() {
        var keyword = normalize(search && search.value);
        var yearValue = normalize(year && year.value);
        var regionValue = normalize(region && region.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year")
          ].join(" "));
          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
          var matchesRegion = !regionValue || normalize(card.getAttribute("data-region")) === regionValue;
          var isVisible = matchesKeyword && matchesYear && matchesRegion;
          card.hidden = !isVisible;
          if (isVisible) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = "当前显示 " + visible + " 部影片";
        }
      }

      [search, year, region].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      if (reset) {
        reset.addEventListener("click", function () {
          if (search) {
            search.value = "";
          }
          if (year) {
            year.value = "";
          }
          if (region) {
            region.value = "";
          }
          apply();
        });
      }
      apply();
    });
  }

  var hlsLoading = false;
  var hlsCallbacks = [];

  function loadHlsLibrary(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    hlsCallbacks.push(callback);
    if (hlsLoading) {
      return;
    }
    hlsLoading = true;
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
    script.async = true;
    script.onload = function () {
      hlsCallbacks.splice(0).forEach(function (queuedCallback) {
        queuedCallback();
      });
    };
    script.onerror = function () {
      hlsCallbacks.splice(0).forEach(function (queuedCallback) {
        queuedCallback(new Error("HLS library failed to load"));
      });
    };
    document.head.appendChild(script);
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-hls-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".play-trigger");
      var state = player.querySelector(".player-state");
      var source = player.getAttribute("data-video-url");
      var initialized = false;

      function setState(message) {
        if (state) {
          state.textContent = message;
        }
      }

      function playVideo() {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            setState("浏览器阻止了自动播放，请再次点击播放器播放。源地址已绑定。 ");
          });
        }
      }

      function initWithNative() {
        video.src = source;
        video.controls = true;
        initialized = true;
        player.classList.add("is-playing");
        setState("正在使用浏览器原生 HLS 播放能力播放。 ");
        playVideo();
      }

      function initWithHls() {
        loadHlsLibrary(function (error) {
          if (error || !window.Hls || !window.Hls.isSupported()) {
            initWithNative();
            return;
          }
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            initialized = true;
            player.classList.add("is-playing");
            setState("HLS 初始化完成，正在播放高清在线播放源。 ");
            playVideo();
          });
          hls.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              setState("播放源连接异常，播放器已保留 m3u8 地址，可刷新后重试。 ");
            }
          });
        });
      }

      function start() {
        if (!video || !source) {
          setState("当前影片暂未绑定播放源。 ");
          return;
        }
        if (initialized) {
          player.classList.add("is-playing");
          playVideo();
          return;
        }
        setState("正在初始化 HLS 播放器并加载 m3u8 播放源。 ");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          initWithNative();
        } else {
          initWithHls();
        }
      }

      if (button) {
        button.addEventListener("click", start);
      }
      if (video) {
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
        });
      }
    });
  }

  function setupSearchPage() {
    var container = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-page-input]");
    if (!container || !input || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    input.value = params.get("q") || "";

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function card(movie) {
      return [
        '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-year="' + escapeHtml(movie.year) + '" data-region="' + escapeHtml(movie.region) + '" data-genre="' + escapeHtml(movie.genre) + '" data-tags="' + escapeHtml(movie.tags.join(',')) + '">',
        '  <a href="./' + escapeHtml(movie.filename) + '">',
        '    <figure class="movie-cover">',
        '      <img src="./' + escapeHtml(movie.coverNumber) + '.jpg" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy" onerror="this.classList.add(\'image-missing\');">',
        '      <span class="cover-badge">' + escapeHtml(movie.genre) + '</span>',
        '      <span class="cover-rating">' + escapeHtml(movie.rating) + '</span>',
        '      <span class="play-icon">▶</span>',
        '    </figure>',
        '    <div class="movie-card-body">',
        '      <h3>' + escapeHtml(movie.title) + '</h3>',
        '      <p>' + escapeHtml(movie.oneLine) + '</p>',
        '      <div class="card-meta">',
        '        <span>' + escapeHtml(movie.year) + '</span>',
        '        <span>' + escapeHtml(movie.region) + '</span>',
        '        <span>' + escapeHtml(movie.duration) + '</span>',
        '      </div>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join("\n");
    }

    function render() {
      var keyword = input.value.trim().toLowerCase();
      var results = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        var haystack = [movie.title, movie.year, movie.region, movie.genre, movie.oneLine, movie.tags.join(" ")].join(" ").toLowerCase();
        return !keyword || haystack.indexOf(keyword) !== -1;
      }).slice(0, 240);
      if (!results.length) {
        container.innerHTML = '<div class="search-empty">没有找到匹配影片，请尝试输入片名、年份、地区、类型或标签。</div>';
        return;
      }
      container.innerHTML = results.map(card).join("\n");
    }

    input.addEventListener("input", render);
    render();
  }

  ready(function () {
    setupMobileMenu();
    setupHeroSlider();
    setupFilters();
    setupPlayers();
    setupSearchPage();
  });
})();
