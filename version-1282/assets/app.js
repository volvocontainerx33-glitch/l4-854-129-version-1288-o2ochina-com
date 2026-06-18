function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function setupMobileMenu() {
  var button = document.querySelector("[data-mobile-menu-button]");
  var menu = document.querySelector("[data-mobile-menu]");
  if (!button || !menu) {
    return;
  }
  button.addEventListener("click", function () {
    menu.classList.toggle("open");
  });
}

function setupSearchForms() {
  document.querySelectorAll("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector("input[name='q']");
      var query = input ? input.value.trim() : "";
      if (!query) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      window.location.href = "./search.html?q=" + encodeURIComponent(query);
    });
  });
}

function setupHero() {
  var root = document.querySelector("[data-hero]");
  if (!root) {
    return;
  }
  var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
  var prev = root.querySelector("[data-hero-prev]");
  var next = root.querySelector("[data-hero-next]");
  var index = 0;
  var timer = null;

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === index);
      dot.setAttribute("aria-pressed", dotIndex === index ? "true" : "false");
    });
  }

  function restart() {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5600);
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      show(dotIndex);
      restart();
    });
  });

  if (prev) {
    prev.addEventListener("click", function () {
      show(index - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      show(index + 1);
      restart();
    });
  }

  show(0);
  restart();
}

function setupCardFilters() {
  var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
  panels.forEach(function (panel) {
    var scope = document.querySelector(panel.getAttribute("data-filter-panel"));
    if (!scope) {
      return;
    }
    var input = panel.querySelector("[data-card-search]");
    var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-category]"));
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
    var activeCategory = "all";

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var text = card.getAttribute("data-search") || "";
        var category = card.getAttribute("data-category") || "";
        var byText = !query || text.indexOf(query) !== -1;
        var byCategory = activeCategory === "all" || category === activeCategory;
        card.style.display = byText && byCategory ? "" : "none";
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeCategory = button.getAttribute("data-filter-category") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        apply();
      });
    });

    apply();
  });
}

function movieCardTemplate(item) {
  var tags = (item.tags || []).slice(0, 4).map(function (tag) {
    return "<span>" + escapeHtml(tag) + "</span>";
  }).join("");

  return [
    "<article class=\"movie-card\" data-movie-card>",
    "<a class=\"poster-link\" href=\"" + escapeHtml(item.url) + "\" aria-label=\"观看" + escapeHtml(item.title) + "\">",
    "<span class=\"poster-frame\"><img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\"></span>",
    "</a>",
    "<div class=\"movie-card-body\">",
    "<div class=\"movie-meta\"><span>" + escapeHtml(item.type || "影片") + "</span><span>" + escapeHtml(item.year || "精选") + "</span></div>",
    "<h2 class=\"movie-title\"><a href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h2>",
    "<p class=\"movie-desc\">" + escapeHtml(item.oneLine || "") + "</p>",
    "<div class=\"tag-row\">" + tags + "</div>",
    "</div>",
    "</article>"
  ].join("");
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"]/g, function (character) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;"
    }[character];
  });
}

function setupSearchPage() {
  var results = document.querySelector("[data-search-results]");
  var title = document.querySelector("[data-search-title]");
  if (!results || !window.MOVIES) {
    return;
  }
  var params = new URLSearchParams(window.location.search);
  var query = (params.get("q") || "").trim().toLowerCase();
  var matched = window.MOVIES.filter(function (item) {
    var text = [
      item.title,
      item.region,
      item.type,
      item.year,
      item.genre,
      (item.tags || []).join(" "),
      item.oneLine
    ].join(" ").toLowerCase();
    return query ? text.indexOf(query) !== -1 : true;
  });

  if (title) {
    title.textContent = query ? "搜索：" + query : "影片搜索";
  }

  if (!matched.length) {
    results.innerHTML = "<div class=\"empty-state\">没有找到相关影片</div>";
    return;
  }

  results.innerHTML = matched.slice(0, 240).map(movieCardTemplate).join("");
}

function initMoviePlayer(videoId, overlayId, source) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var hls = null;
  var prepared = false;

  if (!video || !overlay || !source) {
    return;
  }

  function hideOverlay() {
    overlay.classList.add("hidden");
    video.setAttribute("controls", "controls");
  }

  function restoreOverlay() {
    if (video.paused) {
      overlay.classList.remove("hidden");
    }
  }

  function playVideo() {
    hideOverlay();
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        restoreOverlay();
      });
    }
  }

  function prepare() {
    if (prepared) {
      playVideo();
      return;
    }
    prepared = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.addEventListener("loadedmetadata", playVideo, { once: true });
      video.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
        hls.loadSource(source);
      });
      hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
      hls.on(window.Hls.Events.ERROR, function () {
        restoreOverlay();
      });
      return;
    }

    video.src = source;
    video.addEventListener("loadedmetadata", playVideo, { once: true });
    video.load();
  }

  overlay.addEventListener("click", prepare);
  video.addEventListener("click", function () {
    if (video.paused) {
      prepare();
    }
  });
  video.addEventListener("pause", restoreOverlay);
  video.addEventListener("play", hideOverlay);
}

ready(function () {
  setupMobileMenu();
  setupSearchForms();
  setupHero();
  setupCardFilters();
  setupSearchPage();
});
