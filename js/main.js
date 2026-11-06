(function () {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var hasGsap = typeof window.gsap !== 'undefined';
    var hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';
    if (hasGsap && hasScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    document.getElementById('currentYear').textContent = new Date().getFullYear();

    /* Preloader */
    window.addEventListener('load', function () {
        setTimeout(function () {
            document.getElementById('preloader').classList.add('done');
        }, reduceMotion ? 0 : 1100);
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

    /* Reveal on scroll */
    var revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        var revealObserver = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('visible'); });
    }

    /* Hero entrance and motion */
    if (hasGsap && !reduceMotion) {
        var intro = gsap.timeline({ delay: 0.3, defaults: { ease: 'expo.out' } });
        intro.from('.hero-title .line > span', { yPercent: 110, duration: 1.4, stagger: 0.12 })
            .from('.hero-badge, .hero-role, .hero-intro, .hero-actions, .hero-social', { y: 24, opacity: 0, duration: 1, stagger: 0.08 }, '-=1')
            .from('.editor', { y: 60, opacity: 0, rotateX: 8, duration: 1.6 }, '-=1.3')
            .from('.float-chip', { scale: 0.8, opacity: 0, duration: 0.9, stagger: 0.15, ease: 'back.out(1.6)' }, '-=1');

        gsap.to('.chip-a', { y: -14, duration: 3.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
        gsap.to('.chip-b', { y: 12, duration: 4.2, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 0.6 });
        gsap.to('.chip-c', { y: -10, duration: 3.8, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1.2 });

        if (hasScrollTrigger) {
            gsap.to('.hero-visual', {
                yPercent: -10,
                ease: 'none',
                scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
            });
            gsap.to('.hero-copy', {
                yPercent: 8,
                ease: 'none',
                scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
            });
            gsap.utils.toArray('.section-title').forEach(function (title) {
                gsap.from(title, {
                    y: 40, opacity: 0, duration: 1.2, ease: 'expo.out',
                    scrollTrigger: { trigger: title, start: 'top 85%' }
                });
            });
            gsap.utils.toArray('.project-card').forEach(function (card, i) {
                gsap.from(card, {
                    y: 60, opacity: 0, duration: 1, ease: 'expo.out', delay: (i % 3) * 0.08,
                    scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none none' }
                });
            });
        }

        var marquee = document.querySelector('.marquee-track');
        if (marquee) {
            gsap.to(marquee, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
        }
    }

    /* Editor tilt and cursor-driven motion */
    var editor = document.getElementById('editor');
    if (finePointer && !reduceMotion && hasGsap) {
        var rotX = gsap.quickTo(editor, 'rotateX', { duration: 0.8, ease: 'power3.out' });
        var rotY = gsap.quickTo(editor, 'rotateY', { duration: 0.8, ease: 'power3.out' });
        var wrap = editor.parentElement;
        wrap.addEventListener('pointermove', function (e) {
            var r = wrap.getBoundingClientRect();
            var px = (e.clientX - r.left) / r.width - 0.5;
            var py = (e.clientY - r.top) / r.height - 0.5;
            rotY(px * 8);
            rotX(-py * 6);
        });
        wrap.addEventListener('pointerleave', function () { rotX(0); rotY(0); });
    }

    if (finePointer && !reduceMotion) {
        var dot = document.getElementById('cursorDot');
        var glow = document.getElementById('cursorGlow');
        var mx = window.innerWidth / 2, my = window.innerHeight / 2, gx = mx, gy = my;
        dot.classList.add('on');
        glow.classList.add('on');
        document.addEventListener('pointermove', function (e) {
            mx = e.clientX; my = e.clientY;
            dot.style.transform = 'translate(' + mx + 'px, ' + my + 'px)';
        });
        (function followGlow() {
            gx += (mx - gx) * 0.12;
            gy += (my - gy) * 0.12;
            glow.style.transform = 'translate(' + gx + 'px, ' + gy + 'px)';
            requestAnimationFrame(followGlow);
        })();
        document.querySelectorAll('a, button, .project-card, .chip').forEach(function (el) {
            el.addEventListener('pointerenter', function () { dot.classList.add('hover'); });
            el.addEventListener('pointerleave', function () { dot.classList.remove('hover'); });
        });

        if (hasGsap) {
            document.querySelectorAll('.btn').forEach(function (btn) {
                var qx = gsap.quickTo(btn, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.5)' });
                var qy = gsap.quickTo(btn, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.5)' });
                btn.addEventListener('pointermove', function (e) {
                    var r = btn.getBoundingClientRect();
                    qx((e.clientX - r.left - r.width / 2) * 0.25);
                    qy((e.clientY - r.top - r.height / 2) * 0.35);
                });
                btn.addEventListener('pointerleave', function () { qx(0); qy(0); });
            });
        }

        document.querySelectorAll('.project-card').forEach(function (card) {
            card.addEventListener('pointermove', function (e) {
                var r = card.getBoundingClientRect();
                card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
                card.style.setProperty('--my', (e.clientY - r.top) + 'px');
            });
        });
    }

    /* Hero role typing */
    var roleEl = document.getElementById('roleText');
    var roles = ['Web Developer', 'Laravel & PHP Developer', 'Frontend Developer'];
    if (roleEl && !reduceMotion) {
        var roleIndex = 0, charIndex = 0, deleting = false;
        (function typeRole() {
            var word = roles[roleIndex];
            roleEl.textContent = word.slice(0, charIndex);
            if (!deleting && charIndex < word.length) { charIndex++; return setTimeout(typeRole, 70); }
            if (!deleting) { deleting = true; return setTimeout(typeRole, 1800); }
            if (charIndex > 0) { charIndex--; return setTimeout(typeRole, 35); }
            deleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            setTimeout(typeRole, 300);
        })();
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

    /* Ambient particles */
    var canvas = document.getElementById('particles');
    if (canvas && canvas.getContext && !reduceMotion && finePointer) {
        var ctx = canvas.getContext('2d');
        var pts = [];
        var w, h;
        function resize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);
        for (var i = 0; i < 40; i++) {
            pts.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.4 + 0.4, vx: (Math.random() - 0.5) * 0.15, vy: -Math.random() * 0.25 - 0.05, a: Math.random() * 0.5 + 0.2 });
        }
        function draw() {
            ctx.clearRect(0, 0, w, h);
            pts.forEach(function (p) {
                p.x += p.vx; p.y += p.vy;
                if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
                ctx.beginPath();
                ctx.fillStyle = 'rgba(232, 238, 242,' + p.a + ')';
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            });
            requestAnimationFrame(draw);
        }
        draw();
    }
})();
