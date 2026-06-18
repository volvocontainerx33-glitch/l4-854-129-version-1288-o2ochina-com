(function () {
    function selectAll(selector, parent) {
        return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = selectAll(".hero-slide", hero);
        var dots = selectAll("[data-hero-dots] button", hero);
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === current);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === current);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(index);
                start();
            });
        });
        start();
    }

    function setupLocalFilter() {
        var filter = document.querySelector(".local-filter");
        var grid = document.querySelector("[data-card-grid]");
        if (!filter || !grid) {
            return;
        }
        var input = filter.querySelector("[data-filter-text]");
        var year = filter.querySelector("[data-filter-year]");
        var tag = filter.querySelector("[data-filter-tag]");
        var sort = filter.querySelector("[data-sort-cards]");
        var cards = selectAll(".movie-card", grid);
        function applyFilter() {
            var query = (input.value || "").trim().toLowerCase();
            var selectedYear = year.value;
            var selectedTag = tag.value.toLowerCase();
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type")
                ].join(" ").toLowerCase();
                var yearMatch = !selectedYear || card.getAttribute("data-year") === selectedYear;
                var tagMatch = !selectedTag || haystack.indexOf(selectedTag) !== -1;
                var textMatch = !query || haystack.indexOf(query) !== -1;
                card.classList.toggle("is-filtered-out", !(yearMatch && tagMatch && textMatch));
            });
        }
        function applySort() {
            var value = sort.value;
            var sorted = cards.slice();
            if (value === "year") {
                sorted.sort(function (a, b) {
                    return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
                });
            }
            if (value === "heat") {
                sorted.sort(function (a, b) {
                    return Number(b.getAttribute("data-heat")) - Number(a.getAttribute("data-heat"));
                });
            }
            if (value === "title") {
                sorted.sort(function (a, b) {
                    return a.getAttribute("data-title").localeCompare(b.getAttribute("data-title"), "zh-Hans-CN");
                });
            }
            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
        }
        [input, year, tag].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });
        if (sort) {
            sort.addEventListener("change", function () {
                applySort();
                applyFilter();
            });
        }
    }

    function getSearchQuery() {
        var params = new URLSearchParams(window.location.search);
        return (params.get("q") || "").trim();
    }

    function setupSearchPage() {
        var results = document.getElementById("search-results");
        if (!results || !window.SEARCH_ITEMS) {
            return;
        }
        var input = document.querySelector("[data-search-input]");
        var query = getSearchQuery();
        if (input) {
            input.value = query;
        }
        var keywords = query.toLowerCase().split(/\s+/).filter(Boolean);
        var pool = window.SEARCH_ITEMS.filter(function (item) {
            if (!keywords.length) {
                return item.rank <= 60;
            }
            var haystack = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.line].join(" ").toLowerCase();
            return keywords.every(function (word) {
                return haystack.indexOf(word) !== -1;
            });
        }).slice(0, 120);
        results.innerHTML = pool.map(function (item) {
            return [
                '<article class="movie-card">',
                '<a class="poster-link" href="./' + item.href + '">',
                '<img src="./' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
                '<span class="poster-badge">' + escapeHtml(String(item.year)) + '</span>',
                '</a>',
                '<div class="card-body">',
                '<div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
                '<h2><a href="./' + item.href + '">' + escapeHtml(item.title) + '</a></h2>',
                '<p>' + escapeHtml(item.line) + '</p>',
                '<div class="tag-row">' + item.tags.split(" ").slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join("") + '</div>',
                '</div>',
                '</article>'
            ].join("");
        }).join("");
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                """: "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    window.createPlayer = function (videoId, overlayId, streamUrl) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        if (!video || !overlay || !streamUrl) {
            return;
        }
        var attached = false;
        function attachStream() {
            if (attached) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                attached = true;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                attached = true;
                return;
            }
            video.src = streamUrl;
            attached = true;
        }
        function playVideo() {
            attachStream();
            overlay.classList.add("is-hidden");
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && playPromise.catch) {
                playPromise.catch(function () {});
            }
        }
        overlay.addEventListener("click", playVideo);
        video.addEventListener("click", function () {
            if (!attached) {
                playVideo();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupLocalFilter();
        setupSearchPage();
    });
})();
