(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
      toggle.textContent = expanded ? '☰' : '×';
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }
  }

  function textForCard(card) {
    return card.textContent.toLowerCase();
  }

  function scoreForCard(card) {
    var badge = card.querySelector('.score-badge');
    return badge ? parseFloat(badge.textContent) || 0 : 0;
  }

  function yearForCard(card) {
    var text = card.textContent;
    var match = text.match(/(19|20)\d{2}/);
    return match ? parseInt(match[0], 10) : 0;
  }

  function viewsForCard(card) {
    return parseInt(card.getAttribute('data-views') || '0', 10);
  }

  function initClientFilters() {
    var filter = document.querySelector('.client-filter');
    var sort = document.querySelector('.client-sort');
    var grid = document.querySelector('.filter-grid');
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    cards.forEach(function (card, position) {
      card.setAttribute('data-index-order', String(position));
    });
    function applyFilter() {
      var query = filter ? filter.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        card.classList.toggle('is-filter-hidden', query && textForCard(card).indexOf(query) === -1);
      });
    }
    function applySort() {
      if (!sort) {
        return;
      }
      var value = sort.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (value === 'score') {
          return scoreForCard(b) - scoreForCard(a);
        }
        if (value === 'year') {
          return yearForCard(b) - yearForCard(a);
        }
        if (value === 'views') {
          return viewsForCard(b) - viewsForCard(a);
        }
        return parseInt(a.getAttribute('data-index-order'), 10) - parseInt(b.getAttribute('data-index-order'), 10);
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }
    if (filter) {
      filter.addEventListener('input', applyFilter);
    }
    if (sort) {
      sort.addEventListener('change', applySort);
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderSearchCard(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '' +
      '<a class="movie-card" href="' + escapeHtml(movie.url) + '">' +
        '<span class="poster poster-card" style="--poster-image: url(\'' + escapeHtml(movie.cover) + '\');">' +
          '<span class="score-badge">' + movie.score.toFixed(1) + '</span>' +
          '<span class="play-mark">▶</span>' +
        '</span>' +
        '<span class="movie-info">' +
          '<strong>' + escapeHtml(movie.title) + '</strong>' +
          '<em>' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + '</em>' +
          '<span class="line-clamp">' + escapeHtml(movie.oneLine) + '</span>' +
          '<span class="tag-row">' + tags + '</span>' +
        '</span>' +
      '</a>';
  }

  function initSearchPage() {
    var input = document.getElementById('searchInput');
    var results = document.getElementById('searchResults');
    var status = document.getElementById('searchStatus');
    var sort = document.getElementById('searchSort');
    if (!input || !results || !status || !window.SITE_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;
    function doSearch() {
      var query = input.value.trim().toLowerCase();
      if (!query) {
        results.innerHTML = '';
        status.textContent = '输入关键词后显示匹配结果。';
        return;
      }
      var terms = query.split(/\s+/).filter(Boolean);
      var matched = window.SITE_MOVIES.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.category, movie.year, movie.genre, movie.oneLine, movie.summary, movie.tags.join(' ')].join(' ').toLowerCase();
        return terms.every(function (term) {
          return text.indexOf(term) !== -1;
        });
      });
      var sortValue = sort ? sort.value : 'relevance';
      if (sortValue === 'score') {
        matched.sort(function (a, b) { return b.score - a.score; });
      } else if (sortValue === 'year') {
        matched.sort(function (a, b) { return b.year - a.year; });
      } else if (sortValue === 'views') {
        matched.sort(function (a, b) { return b.views - a.views; });
      }
      status.textContent = '找到 ' + matched.length + ' 部与“' + input.value.trim() + '”相关的影片。';
      results.innerHTML = matched.slice(0, 240).map(renderSearchCard).join('');
    }
    input.addEventListener('input', doSearch);
    if (sort) {
      sort.addEventListener('change', doSearch);
    }
    var form = input.closest('form');
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = input.value.trim();
        var newUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
        window.history.replaceState({}, '', newUrl);
        doSearch();
      });
    }
    doSearch();
  }

  ready(function () {
    initMobileMenu();
    initHeroSlider();
    initClientFilters();
    initSearchPage();
  });
})();
