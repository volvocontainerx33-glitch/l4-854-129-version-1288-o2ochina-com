(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-nav]");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var show = function (index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === current);
                });
            };
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                });
            });
            if (slides.length > 1) {
                setInterval(function () {
                    show(current + 1);
                }, 5000);
            }
        }

        document.querySelectorAll("[data-filter-form]").forEach(function (form) {
            var input = form.querySelector("[data-filter-input]");
            var scope = form.closest("main") || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var empty = scope.querySelector("[data-empty-state]");
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q") || "";
            if (input && initial) {
                input.value = initial;
            }
            var apply = function () {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var text = card.getAttribute("data-search") || "";
                    var matched = !keyword || text.indexOf(keyword) !== -1;
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            };
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                apply();
            });
            if (input) {
                input.addEventListener("input", apply);
            }
            apply();
        });
    });
})();
