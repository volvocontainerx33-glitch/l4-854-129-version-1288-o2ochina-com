(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startHero();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    startHero();
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    var scope = panel.parentElement || document;
    var search = panel.querySelector('[data-card-search]');
    var selects = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-field]'));
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var emptyState = scope.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (initialQuery && search) {
      search.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function cardText(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
    }

    function applyFilters() {
      var query = normalize(search ? search.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var matched = true;

        if (query && cardText(card).indexOf(query) === -1) {
          matched = false;
        }

        selects.forEach(function (select) {
          var field = select.getAttribute('data-filter-field');
          var value = normalize(select.value);
          var cardValue = normalize(card.getAttribute('data-' + field));

          if (value && cardValue !== value) {
            matched = false;
          }
        });

        card.style.display = matched ? '' : 'none';

        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    if (search) {
      search.addEventListener('input', applyFilters);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });

    applyFilters();
  });
})();
