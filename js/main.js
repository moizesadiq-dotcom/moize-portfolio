(function () {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var hasGsap = typeof window.gsap !== 'undefined';
    var hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';
    if (hasGsap && hasScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    var currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();

    /* Preloader and Swarm System Initialization */
    fitPortfolio();
    window.addEventListener('resize', fitPortfolio);
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { fitPortfolio(); });
    }

    window.addEventListener('load', function () {
        fitPortfolio();
        initSwarmSystem();
        setTimeout(function () {
            var pre = document.getElementById('preloader');
            if (pre) pre.classList.add('done');
            if (window.__animateHeroSwarm) window.__animateHeroSwarm();
        }, reduceMotion ? 0 : 500);
    });

    /* Navigation */
    var nav = document.getElementById('nav');
    function onScroll() {
        if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var drawer = document.getElementById('drawer');
    var toggle = document.getElementById('navToggle');
    function setDrawer(open) {
        if (!drawer || !toggle) return;
        drawer.classList.toggle('open', open);
        drawer.setAttribute('aria-hidden', String(!open));
        toggle.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';
    }
    if (toggle) {
        toggle.addEventListener('click', function () {
            setDrawer(!drawer.classList.contains('open'));
        });
    }
    if (drawer) {
        drawer.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', function () { setDrawer(false); });
        });
    }
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { setDrawer(false); closeGallery(); }
    });

    /* Active nav link */
    var sectionIds = ['about', 'skills', 'projects', 'wordpress', 'experience', 'contact'];
    var navLinks = document.querySelectorAll('.nav-link');
    if ('IntersectionObserver' in window) {
        var activeObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                navLinks.forEach(function (l) {
                    l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id);
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        sectionIds.forEach(function (id) {
            var el = document.getElementById(id);
            if (el) activeObserver.observe(el);
        });
    }

    /* Hero PORTFOLIO Title Fitting */
    function fitPortfolio() {
        var el = document.querySelector('.hero-display');
        if (!el) return;
        try {
            el.style.fontSize = '';
            var cs = window.getComputedStyle(el);
            var pad = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
            var limit = el.clientWidth - pad - 4;
            if (limit < 80) return;
            var size = parseFloat(cs.fontSize) || 80;
            var range = document.createRange();
            range.selectNodeContents(el);
            var w = range.getBoundingClientRect().width;
            if (w > 8) {
                size = size * (limit / w);
                el.style.fontSize = size + 'px';
                range = document.createRange();
                range.selectNodeContents(el);
                w = range.getBoundingClientRect().width;
                if (w > limit + 0.5) {
                    size = size * (limit / w);
                    el.style.fontSize = size + 'px';
                }
            }
            document.documentElement.style.setProperty('--hero-size', (parseFloat(el.style.fontSize) || size).toFixed(2) + 'px');
        } catch (err) { /* leave the CSS size in place */ }
    }

    /* ========================================================
     * SWARM MULTI-CURSOR BOX DRAWING ANIMATION SYSTEM
     * ======================================================== */
    var SWARM_PALETTE = [
        { color: '#e10600', label: 'Moize' },
        { color: '#ffffff', label: 'Architect' },
        { color: '#00e5ff', label: 'Swarm-01' },
        { color: '#ffd60a', label: 'Core-02' },
        { color: '#ff5c4d', label: 'Agent-X' },
        { color: '#30d158', label: 'Swarm-03' },
        { color: '#c5cad3', label: 'System' }
    ];

    var CURSOR_SVG = '<svg class="swarm-cursor-arrow" viewBox="0 0 24 24" aria-hidden="true">' +
        '<path d="M5 2.5 5.8 19.2 10.4 14.4 14.2 22 17.1 20.5 13.2 13.2 19.6 12.2 5 2.5Z" fill="currentColor" stroke="rgba(0,0,0,0.7)" stroke-width="1.2" stroke-linejoin="round"/>' +
        '</svg>';

    function drawElementBoxWithCursor(el, theme, index, onComplete) {
        if (!el || !el.isConnected) {
            if (onComplete) onComplete();
            return;
        }
        if (el.classList.contains('swarm-done')) {
            if (onComplete) onComplete();
            return;
        }

        var r = el.getBoundingClientRect();
        if (r.width < 10 || r.height < 10) {
            el.classList.add('swarm-done');
            if (onComplete) onComplete();
            return;
        }

        var scrollX = window.pageXOffset || document.documentElement.scrollLeft || 0;
        var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        var pad = 4;
        var x = Math.round(r.left + scrollX - pad);
        var y = Math.round(r.top + scrollY - pad);
        var w = Math.round(r.width + pad * 2);
        var h = Math.round(r.height + pad * 2);
        var rx = 8;

        var svgNS = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('class', 'swarm-box-overlay');
        svg.setAttribute('aria-hidden', 'true');
        svg.style.left = x + 'px';
        svg.style.top = y + 'px';
        svg.style.width = w + 'px';
        svg.style.height = h + 'px';
        svg.style.color = theme.color;

        var rect = document.createElementNS(svgNS, 'rect');
        rect.setAttribute('x', '1.5');
        rect.setAttribute('y', '1.5');
        rect.setAttribute('width', String(Math.max(2, w - 3)));
        rect.setAttribute('height', String(Math.max(2, h - 3)));
        rect.setAttribute('rx', String(rx));
        rect.setAttribute('ry', String(rx));
        rect.setAttribute('fill', 'none');
        rect.setAttribute('stroke', theme.color);
        rect.setAttribute('stroke-width', '2');
        rect.setAttribute('stroke-linecap', 'round');
        rect.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(rect);
        document.body.appendChild(svg);

        var len = rect.getTotalLength ? rect.getTotalLength() : (w + h) * 2;
        rect.style.strokeDasharray = len + ' ' + len;
        rect.style.strokeDashoffset = String(len);

        var cursor = document.createElement('div');
        cursor.className = 'swarm-cursor';
        cursor.setAttribute('aria-hidden', 'true');
        cursor.style.color = theme.color;

        var isLight = theme.color === '#ffffff' || theme.color === '#ffd60a' || theme.color === '#00e5ff' || theme.color === '#30d158' || theme.color === '#c5cad3';
        cursor.innerHTML = CURSOR_SVG + '<span class="swarm-cursor-badge" style="background:' + theme.color + '; color:' + (isLight ? '#070b12' : '#ffffff') + ';">' + theme.label + '</span>';
        document.body.appendChild(cursor);

        var p0 = rect.getPointAtLength ? rect.getPointAtLength(0) : { x: rx, y: 0 };
        var spawnOffsetX = (index % 2 === 0 ? -1 : 1) * (45 + (index % 3) * 25);
        var spawnOffsetY = -(40 + (index % 4) * 20);
        var startX = x + p0.x + spawnOffsetX;
        var startY = y + p0.y + spawnOffsetY;

        gsap.set(cursor, { x: startX, y: startY, opacity: 0, scale: 0.6 });

        var staggerDelay = (index || 0) * 0.08;
        var tl = gsap.timeline({
            delay: staggerDelay
        });

        // Step 1: Cursor appears and flies to element outline start point
        tl.to(cursor, {
            x: x + p0.x - 4,
            y: y + p0.y - 2,
            opacity: 1,
            scale: 1,
            duration: 0.35,
            ease: 'power3.out'
        });

        // Step 2: Cursor traces around the box perimeter while drawing stroke 0% -> 100%
        var drawProgress = { t: 0 };
        tl.to(drawProgress, {
            t: 1,
            duration: 0.78 + (index % 3) * 0.06,
            ease: 'power2.inOut',
            onUpdate: function () {
                var currentDist = drawProgress.t * len;
                rect.style.strokeDashoffset = String(Math.max(0, len - currentDist));
                if (rect.getPointAtLength) {
                    var pt = rect.getPointAtLength(currentDist);
                    gsap.set(cursor, { x: x + pt.x - 4, y: y + pt.y - 2 });
                }
            }
        });

        // Step 3: DRAWING IS 100% COMPLETE.
        // Seal outline and reveal inner content strictly after drawing finishes
        tl.call(function () {
            rect.style.strokeDashoffset = '0';
            el.classList.add('swarm-done');
            el.style.visibility = 'visible';
        });

        // Animate inner content entrance - strictly chained AFTER drawing completes!
        tl.fromTo(el,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.34, ease: 'power2.out', clearProps: 'transform' }
        );

        // Step 4: Keep the completed box and cursor briefly visible, then smoothly fade out and cleanup
        tl.to([cursor, svg], {
            opacity: 0,
            duration: 0.28,
            ease: 'power2.in',
            onComplete: function () {
                if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
                if (svg.parentNode) svg.parentNode.removeChild(svg);
                if (onComplete) onComplete();
            }
        }, '+=0.12');

        // Fallback safety timeout
        setTimeout(function () {
            el.classList.add('swarm-done');
            el.style.visibility = 'visible';
        }, 4000);
    }

    function initSwarmSystem() {
        if (reduceMotion || !hasGsap) {
            document.querySelectorAll('[data-swarm-target]').forEach(function (el) {
                el.classList.add('swarm-done');
            });
            return;
        }

        document.body.classList.add('swarm-active');

        // Animate Hero section
        function animateHeroSwarm() {
            var hero = document.getElementById('home');
            if (!hero || hero.getAttribute('data-swarm-done') === 'true') return;
            hero.setAttribute('data-swarm-done', 'true');

            var heroTargets = Array.prototype.slice.call(hero.querySelectorAll('[data-swarm-target]:not(.swarm-done)'));
            heroTargets.forEach(function (el, idx) {
                var theme = SWARM_PALETTE[idx % SWARM_PALETTE.length];
                drawElementBoxWithCursor(el, theme, idx);
            });
        }

        // Scroll trigger for all subsequent elements outside Hero
        var nonHeroTargets = Array.prototype.slice.call(document.querySelectorAll('main > section:not(#home) [data-swarm-target], footer [data-swarm-target]'));

        if (!('IntersectionObserver' in window)) {
            nonHeroTargets.forEach(function (el) { el.classList.add('swarm-done'); });
            window.__animateHeroSwarm = animateHeroSwarm;
            return;
        }

        // Any element already scrolled past above viewport is marked done immediately
        var pendingTargets = [];
        nonHeroTargets.forEach(function (el) {
            var r = el.getBoundingClientRect();
            if (r.bottom < 0) {
                el.classList.add('swarm-done');
            } else {
                pendingTargets.push(el);
            }
        });

        var batchTimer = null;
        var pendingBatch = [];

        function processBatch() {
            if (!pendingBatch.length) return;
            var current = pendingBatch.slice();
            pendingBatch = [];
            current.forEach(function (el, idx) {
                var theme = SWARM_PALETTE[idx % SWARM_PALETTE.length];
                drawElementBoxWithCursor(el, theme, idx);
            });
        }

        var swarmObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var target = entry.target;
                    swarmObserver.unobserve(target);
                    if (!target.classList.contains('swarm-done')) {
                        pendingBatch.push(target);
                    }
                }
            });

            if (pendingBatch.length) {
                if (batchTimer) clearTimeout(batchTimer);
                batchTimer = setTimeout(processBatch, 40);
            }
        }, {
            root: null,
            rootMargin: '0px 0px -8% 0px',
            threshold: 0.1
        });

        pendingTargets.forEach(function (el) {
            swarmObserver.observe(el);
        });

        window.__animateHeroSwarm = animateHeroSwarm;
    }

    /* Filters */
    var filterBtns = document.querySelectorAll('.filter-btn');
    var cards = document.querySelectorAll('.project-card');
    function matches(card, filter) {
        return filter === 'all' || (card.getAttribute('data-categories') || '').split(' ').indexOf(filter) !== -1;
    }
    filterBtns.forEach(function (btn) {
        var filter = btn.getAttribute('data-filter');
        var count = btn.querySelector('.count');
        if (count) {
            count.textContent = Array.prototype.filter.call(cards, function (c) { return matches(c, filter); }).length;
        }
        btn.addEventListener('click', function () {
            filterBtns.forEach(function (b) {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            var shown = [];
            cards.forEach(function (card) {
                var show = matches(card, filter);
                card.classList.toggle('is-hidden', !show);
                if (show) {
                    card.classList.add('swarm-done');
                    shown.push(card);
                }
            });
            if (hasGsap && !reduceMotion) {
                gsap.fromTo(shown, { opacity: 0, y: 24, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.05, ease: 'expo.out', clearProps: 'transform' });
            }
        });
    });

    /* Gallery */
    var galleries = {
        marketlink: ['images/dashboardzz.jpeg', 'images/dashboardzz2.jpeg', 'images/adminzz.jpeg', 'images/clientzz.jpeg', 'images/managezzz.jpeg', 'images/serviceszz.jpeg', 'images/footerzz.jpeg'],
        origami: ['images/origam.png'],
        salon: ['images/dashboard.png', 'images/appoinment.png', 'images/bookings.png', 'images/services.png', 'images/reports.png'],
        zacnus: ['images/dashboardzz.jpeg', 'images/dashboardzz2.jpeg', 'images/footerzz.jpeg', 'images/adminzz.jpeg', 'images/clientzz.jpeg', 'images/managezzz.jpeg', 'images/serviceszz.jpeg']
    };
    var modal = document.getElementById('galleryModal');
    var modalImg = document.getElementById('galleryImage');
    var counter = document.getElementById('galleryCounter');
    var current = [], index = 0, lastTrigger = null;

    function showImage() {
        if (!modalImg || !counter) return;
        modalImg.src = current[index];
        counter.textContent = (index + 1) + ' / ' + current.length;
    }
    function openGallery(name, trigger) {
        if (!galleries[name] || !modal) return;
        current = galleries[name];
        index = 0;
        lastTrigger = trigger;
        showImage();
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        var closeBtn = document.getElementById('galleryClose');
        if (closeBtn) closeBtn.focus();
    }
    function closeGallery() {
        if (!modal || !modal.classList.contains('active')) return;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        if (modalImg) modalImg.removeAttribute('src');
        document.body.style.overflow = '';
        if (lastTrigger) lastTrigger.focus();
    }
    function step(dir) {
        if (!current.length) return;
        index = (index + dir + current.length) % current.length;
        showImage();
    }
    document.querySelectorAll('[data-gallery]').forEach(function (btn) {
        btn.addEventListener('click', function () { openGallery(btn.getAttribute('data-gallery'), btn); });
    });
    var gClose = document.getElementById('galleryClose');
    if (gClose) gClose.addEventListener('click', closeGallery);
    var gPrev = document.getElementById('galleryPrev');
    if (gPrev) gPrev.addEventListener('click', function () { step(-1); });
    var gNext = document.getElementById('galleryNext');
    if (gNext) gNext.addEventListener('click', function () { step(1); });
    if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) closeGallery(); });
    document.addEventListener('keydown', function (e) {
        if (!modal || !modal.classList.contains('active')) return;
        if (e.key === 'ArrowRight') step(1);
        if (e.key === 'ArrowLeft') step(-1);
    });

})();