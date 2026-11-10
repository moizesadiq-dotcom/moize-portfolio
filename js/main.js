(function () {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var hasGsap = typeof window.gsap !== 'undefined';
    var hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';
    if (hasGsap && hasScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    document.getElementById('currentYear').textContent = new Date().getFullYear();

    /* Preloader, then a scroll-driven swarm. Nothing here moves the page. */
    fitPortfolio();
    window.addEventListener('resize', fitPortfolio);
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { fitPortfolio(); });
    }
    window.addEventListener('load', function () {
        fitPortfolio();
        setTimeout(function () {
            var pre = document.getElementById('preloader');
            if (pre) pre.classList.add('done');
            try { initSwarm(); }
            catch (err) { /* real text stays visible */ }
        }, reduceMotion ? 0 : 680);
    });

    /* Navigation */
    var nav = document.getElementById('nav');
    function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 40); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var drawer = document.getElementById('drawer');
    var toggle = document.getElementById('navToggle');
    function setDrawer(open) {
        drawer.classList.toggle('open', open);
        drawer.setAttribute('aria-hidden', String(!open));
        toggle.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';
    }
    toggle.addEventListener('click', function () { setDrawer(!drawer.classList.contains('open')); });
    drawer.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { setDrawer(false); });
    });
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

    /* Content is visible without JS. The class is only a hook. */
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });

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

    /*
     * Each selector is its own target. Cards and the text inside them are
     * listed separately so a title is never boxed together with its paragraph.
     */
    var SWARM_SELECTORS = [
        '.hero-display',
        '.hero-hello',
        '.hero-name',
        '.hero-intro',
        '.hero-social a',
        '.hero-portrait',
        '.hero-facts span',
        '.marquee-item',
        '#about .eyebrow',
        '#about .section-title',
        '#about .about-text p',
        '#about .fact .k',
        '#about .fact .v',
        '#skills .eyebrow',
        '#skills .section-title',
        '#skills .skill-card',
        '#skills .skill-card h3',
        '#skills .chip',
        '#projects .eyebrow',
        '#projects .section-title',
        '#projects .filter-btn',
        '#projects .project-card',
        '#projects .project-head h3',
        '#projects .project-body > p',
        '#projects .project-category',
        '#projects .project-no',
        '#projects .project-tags span',
        '#wordpress .eyebrow',
        '#wordpress .section-title',
        '#wordpress .section-lead',
        '#wordpress .wp-list strong',
        '#wordpress .wp-list li span',
        '#experience .eyebrow',
        '#experience .section-title',
        '#experience .timeline-col > h3',
        '#experience .tl-item',
        '#experience .tl-date',
        '#experience .tl-item h4',
        '#experience .tl-sub',
        '#experience .tl-item > p',
        '#contact .eyebrow',
        '#contact .contact-cta',
        '#contact .section-lead',
        '#contact .btn',
        '#contact .contact-link .label',
        '#contact .contact-link .value',
        '.footer-inner > span',
        '.footer-links a'
    ];
    var SWARM_COLORS = ['#e10600', '#f4f6f8', '#ff5c4d', '#c5cad3', '#ff2a22', '#ffffff', '#ffb0a6', '#8d96a3', '#ff7a6e', '#d7dbe2'];

    function initSwarm() {
        if (reduceMotion || !hasGsap || !('IntersectionObserver' in window)) return;
        var seen = [];
        var targets = [];
        SWARM_SELECTORS.forEach(function (sel) {
            var nodes;
            try { nodes = document.querySelectorAll(sel); }
            catch (err) { return; }
            Array.prototype.forEach.call(nodes, function (el) {
                if (seen.indexOf(el) !== -1) return;
                seen.push(el);
                targets.push(el);
            });
        });
        if (!targets.length) return;

        var queue = [];
        var active = 0;
        var colorIndex = 0;
        var POINTER = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 2.5 5.8 19.2 10.4 14.4 14.2 22 17.1 20.5 13.2 13.2 19.6 12.2 5 2.5Z"/></svg>';

        function cap() {
            return window.matchMedia('(max-width: 700px)').matches ? 2 : 4;
        }
        function safeRect(el) {
            try {
                if (!el || !el.isConnected || !el.getBoundingClientRect) return null;
                var style = window.getComputedStyle(el);
                if (!style || style.display === 'none' || style.visibility === 'hidden') return null;
                var r = el.getBoundingClientRect();
                if (!isFinite(r.left) || !isFinite(r.top) || !isFinite(r.width) || !isFinite(r.height)) return null;
                if (r.width < 2 || r.height < 2) return null;
                return r;
            } catch (err) {
                return null;
            }
        }
        function removeNode(node) {
            if (node && node.parentNode) node.parentNode.removeChild(node);
        }
        function drawOne(el, color, slot, done) {
            var settled = false;
            var cursor = null;
            var box = null;
            var timer = 0;
            function finish() {
                if (settled) return;
                settled = true;
                if (timer) window.clearTimeout(timer);
                removeNode(cursor);
                removeNode(box);
                if (done) done();
            }
            var rect = safeRect(el);
            if (!rect) { finish(); return; }
            try {
                var pageX = rect.left + (window.pageXOffset || document.documentElement.scrollLeft || 0);
                var pageY = rect.top + (window.pageYOffset || document.documentElement.scrollTop || 0);
                var pad = 4;
                var x = pageX - pad;
                var y = pageY - pad;
                var w = Math.round(rect.width + pad * 2);
                var h = Math.round(rect.height + pad * 2);
                if (w < 2 || h < 2) { finish(); return; }

                cursor = document.createElement('div');
                cursor.className = 'build-cursor';
                cursor.setAttribute('aria-hidden', 'true');
                cursor.style.color = color;
                cursor.innerHTML = POINTER;
                document.body.appendChild(cursor);

                box = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                box.setAttribute('class', 'build-box');
                box.setAttribute('aria-hidden', 'true');
                box.style.left = Math.round(x) + 'px';
                box.style.top = Math.round(y) + 'px';
                box.style.width = w + 'px';
                box.style.height = h + 'px';
                var stroke = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                var inset = 1;
                stroke.setAttribute('x', String(inset));
                stroke.setAttribute('y', String(inset));
                stroke.setAttribute('width', String(Math.max(0, w - inset * 2)));
                stroke.setAttribute('height', String(Math.max(0, h - inset * 2)));
                stroke.setAttribute('fill', 'none');
                stroke.setAttribute('stroke', color);
                stroke.setAttribute('stroke-width', '1.5');
                box.appendChild(stroke);
                document.body.appendChild(box);

                var len = 2 * (Math.max(0, w - inset * 2) + Math.max(0, h - inset * 2));
                stroke.style.strokeDasharray = String(len);
                stroke.style.strokeDashoffset = String(len);

                var angle = ((slot || 0) % 8) * (Math.PI / 4);
                var dist = 34 + (slot % 3) * 10;
                gsap.set(cursor, {
                    x: x + Math.cos(angle) * dist,
                    y: y + Math.sin(angle) * dist,
                    opacity: 0
                });
                var tl = gsap.timeline({ onComplete: finish });
                tl.to(cursor, { x: x - 1, y: y - 1, opacity: 1, duration: 0.38, ease: 'power3.out' });
                tl.to(stroke, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.inOut' }, '-=0.06');
                tl.to(cursor, { opacity: 0, duration: 0.18 }, '+=0.14');
                tl.to(box, { opacity: 0, duration: 0.22 }, '<');
                timer = window.setTimeout(finish, 2200);
            } catch (err) {
                finish();
            }
        }
        function pump() {
            var max = cap();
            if (active >= max || !queue.length) return;
            var job = queue.shift();
            active += 1;
            var delay = (active - 1) * (max === 2 ? 120 : 70);
            window.setTimeout(function () {
                try {
                    drawOne(job.el, job.color, job.slot, function () {
                        active = Math.max(0, active - 1);
                        pump();
                    });
                } catch (err) {
                    active = Math.max(0, active - 1);
                    pump();
                }
            }, delay);
            if (active < max && queue.length) pump();
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting || entry.intersectionRatio < 0.12) return;
                var el = entry.target;
                observer.unobserve(el);
                if (el.getAttribute('data-swarm-armed') === '1') return;
                el.setAttribute('data-swarm-armed', '1');
                queue.push({
                    el: el,
                    color: SWARM_COLORS[colorIndex % SWARM_COLORS.length],
                    slot: colorIndex
                });
                colorIndex += 1;
            });
            pump();
        }, { root: null, rootMargin: '0px 0px -8% 0px', threshold: [0.12, 0.4] });

        targets.forEach(function (el) {
            try { observer.observe(el); }
            catch (err) { /* skip an element that cannot be observed */ }
        });
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
        count.textContent = Array.prototype.filter.call(cards, function (c) { return matches(c, filter); }).length;
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
                if (show) shown.push(card);
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
        modalImg.src = current[index];
        counter.textContent = (index + 1) + ' / ' + current.length;
    }
    function openGallery(name, trigger) {
        if (!galleries[name]) return;
        current = galleries[name];
        index = 0;
        lastTrigger = trigger;
        showImage();
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        document.getElementById('galleryClose').focus();
    }
    function closeGallery() {
        if (!modal.classList.contains('active')) return;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        modalImg.removeAttribute('src');
        document.body.style.overflow = '';
        if (lastTrigger) lastTrigger.focus();
    }
    function step(dir) {
        index = (index + dir + current.length) % current.length;
        showImage();
    }
    document.querySelectorAll('[data-gallery]').forEach(function (btn) {
        btn.addEventListener('click', function () { openGallery(btn.getAttribute('data-gallery'), btn); });
    });
    document.getElementById('galleryClose').addEventListener('click', closeGallery);
    document.getElementById('galleryPrev').addEventListener('click', function () { step(-1); });
    document.getElementById('galleryNext').addEventListener('click', function () { step(1); });
    modal.addEventListener('click', function (e) { if (e.target === modal) closeGallery(); });
    document.addEventListener('keydown', function (e) {
        if (!modal.classList.contains('active')) return;
        if (e.key === 'ArrowRight') step(1);
        if (e.key === 'ArrowLeft') step(-1);
    });

})();
