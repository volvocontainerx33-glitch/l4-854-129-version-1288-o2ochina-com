(function () {
  var navToggle = document.querySelector('.nav-toggle');

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      var opened = document.body.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    var startHero = function () {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(index);
        startHero();
      });
    });

    showSlide(0);
    startHero();
  }

  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    var input = filterPanel.querySelector('[data-filter-input]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var regionSelect = filterPanel.querySelector('[data-filter-region]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-grid] .filter-card'));

    var fillSelect = function (select, key) {
      if (!select || select.children.length > 1) {
        return;
      }

      var values = cards.map(function (card) {
        return card.getAttribute(key) || '';
      }).filter(Boolean).filter(function (value, index, array) {
        return array.indexOf(value) === index;
      });

      values.sort().reverse();

      values.slice(0, 60).forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    };

    fillSelect(yearSelect, 'data-year');
    fillSelect(regionSelect, 'data-region');

    var query = new URLSearchParams(window.location.search).get('q') || '';
    if (input && query) {
      input.value = query;
    }

    var applyFilter = function () {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();

        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedYear = !year || card.getAttribute('data-year') === year;
        var matchedRegion = !region || card.getAttribute('data-region') === region;

        card.classList.toggle('is-hidden', !(matchedKeyword && matchedYear && matchedRegion));
      });
    };

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }

    if (regionSelect) {
      regionSelect.addEventListener('change', applyFilter);
    }

    applyFilter();
  }

  var detailPlay = document.querySelector('[data-detail-play]');
  var overlay = document.getElementById('play-overlay');

  if (detailPlay && overlay) {
    detailPlay.addEventListener('click', function () {
      overlay.click();
      var player = document.getElementById('player-wrap');
      if (player) {
        player.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
})();
