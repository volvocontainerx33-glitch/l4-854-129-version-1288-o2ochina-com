(function () {
  "use strict";

  function getRootPrefix() {
    return document.body.getAttribute("data-root") || "";
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
  }

  function createResultItem(item, rootPrefix) {
    var link = document.createElement("a");
    link.className = "search-result-item";
    link.href = rootPrefix + item.url;

    var title = document.createElement("strong");
    title.textContent = item.title;

    var meta = document.createElement("span");
    meta.textContent = [item.year, item.region, item.type, item.genre]
      .filter(Boolean)
      .join(" · ");

    link.appendChild(title);
    link.appendChild(meta);

    return link;
  }

  function setupSearchForm(form) {
    var input = form.querySelector(".search-input");
    var results = form.querySelector(".search-results");

    if (!input || !results || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var rootPrefix = getRootPrefix();
    var latestMatches = [];

    function renderResults() {
      var query = normalizeText(input.value);
      results.innerHTML = "";

      if (!query) {
        latestMatches = [];
        results.classList.remove("is-open");
        return;
      }

      latestMatches = window.MOVIE_SEARCH_INDEX
        .filter(function (item) {
          var target = normalizeText([
            item.title,
            item.year,
            item.region,
            item.type,
            item.genre,
            item.tags,
            item.oneLine
          ].join(" "));
          return target.indexOf(query) !== -1;
        })
        .slice(0, 8);

      if (latestMatches.length === 0) {
        var empty = document.createElement("div");
        empty.className = "search-result-item";
        empty.textContent = "没有找到匹配的影片";
        results.appendChild(empty);
      } else {
        latestMatches.forEach(function (item) {
          results.appendChild(createResultItem(item, rootPrefix));
        });
      }

      results.classList.add("is-open");
    }

    input.addEventListener("input", renderResults);

    input.addEventListener("focus", function () {
      if (input.value.trim()) {
        renderResults();
      }
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (latestMatches.length > 0) {
        window.location.href = rootPrefix + latestMatches[0].url;
      } else {
        renderResults();
      }
    });

    document.addEventListener("click", function (event) {
      if (!form.contains(event.target)) {
        results.classList.remove("is-open");
      }
    });
  }

  function setupMobileNav() {
    var button = document.querySelector(".mobile-menu-button");
    var nav = document.querySelector(".nav-links");

    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupBackTop() {
    var button = document.querySelector(".back-top");

    if (!button) {
      return;
    }

    window.addEventListener("scroll", function () {
      if (window.scrollY > 460) {
        button.classList.add("is-visible");
      } else {
        button.classList.remove("is-visible");
      }
    });

    button.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".site-search").forEach(setupSearchForm);
    setupMobileNav();
    setupBackTop();
  });
})();
