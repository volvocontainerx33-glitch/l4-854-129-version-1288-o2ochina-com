(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentSlide = 0;
    var heroTimer;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === currentSlide);
        });
    }

    if (slides.length) {
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                restartHero();
            });
        });

        function restartHero() {
            clearInterval(heroTimer);
            heroTimer = setInterval(function () {
                showSlide(currentSlide + 1);
            }, 5200);
        }

        restartHero();
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-live-search]'));
    var cardContainer = document.querySelector('[data-card-container]');
    var cards = cardContainer ? Array.prototype.slice.call(cardContainer.querySelectorAll('.movie-card')) : [];
    var emptyState = document.querySelector('[data-empty-state]');
    var activeFilter = '全部';

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function cardText(card) {
        return normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.textContent
        ].join(' '));
    }

    function applyListState() {
        if (!cards.length) {
            return;
        }

        var query = normalize(searchInputs[0] ? searchInputs[0].value : '');
        var visible = 0;

        cards.forEach(function (card) {
            var text = cardText(card);
            var matchesQuery = !query || text.indexOf(query) !== -1;
            var matchesFilter = activeFilter === '全部' || text.indexOf(normalize(activeFilter)) !== -1;
            var shouldShow = matchesQuery && matchesFilter;

            card.style.display = shouldShow ? '' : 'none';

            if (shouldShow) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('show', visible === 0);
        }
    }

    if (searchInputs.length) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        searchInputs.forEach(function (input) {
            if (initialQuery) {
                input.value = initialQuery;
            }

            input.addEventListener('input', applyListState);
        });

        applyListState();
    }

    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeFilter = button.getAttribute('data-filter-value') || '全部';

            filterButtons.forEach(function (item) {
                item.classList.toggle('active', item === button);
            });

            applyListState();
        });
    });

    if (filterButtons.length) {
        filterButtons[0].classList.add('active');
    }

    Array.prototype.slice.call(document.querySelectorAll('.player-card')).forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('.player-start');
        var stream = player.getAttribute('data-stream');
        var loaded = false;
        var hls;

        function loadStream() {
            if (loaded || !video || !stream) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else {
                video.src = stream;
            }

            loaded = true;
        }

        function playVideo() {
            loadStream();
            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (button && video) {
            button.addEventListener('click', playVideo);
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                player.classList.remove('is-playing');
            });
            video.addEventListener('ended', function () {
                player.classList.remove('is-playing');
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
