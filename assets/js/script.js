// ========================================
// PERFORMANCE OPTIMIZATION - Detect device capabilities
// ========================================

let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
let isLowEnd = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : isMobile;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ========================================
// NAVIGATION
// ========================================

const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const mobileNavOverlay = document.getElementById('mobileNavOverlay');

function toggleMenu() {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    mobileNavOverlay.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    const isExpanded = navLinks.classList.contains('active');
    hamburger.setAttribute('aria-expanded', isExpanded);

    if (isExpanded) {
        const focusableElements = navLinks.querySelectorAll('a');
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        const handleKeyDown = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable.focus();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                }
            } else if (e.key === 'Escape') {
                closeMenu();
                hamburger.focus();
            }
        };
        navLinks.addEventListener('keydown', handleKeyDown);
        navLinks._focusTrapHandler = handleKeyDown;
        const firstLink = navLinks.querySelector('a');
        if (firstLink) firstLink.focus();
    } else {
        if (navLinks._focusTrapHandler) {
            navLinks.removeEventListener('keydown', navLinks._focusTrapHandler);
            delete navLinks._focusTrapHandler;
        }
    }
}

function closeMenu() {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
    mobileNavOverlay.classList.remove('active');
    document.body.style.overflow = '';
    hamburger.setAttribute('aria-expanded', 'false');

    if (navLinks._focusTrapHandler) {
        navLinks.removeEventListener('keydown', navLinks._focusTrapHandler);
        delete navLinks._focusTrapHandler;
    }
}

if (hamburger) {
    hamburger.addEventListener('click', toggleMenu);
}

if (mobileNavOverlay) {
    mobileNavOverlay.addEventListener('click', closeMenu);
}

if (navLinks) {
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks && navLinks.classList.contains('active')) {
        closeMenu();
    }
});

let lastNavWidth = window.innerWidth;
window.addEventListener('resize', () => {
    const currentWidth = window.innerWidth;
    if (currentWidth > 768 && lastNavWidth <= 768) {
        if (navLinks && navLinks.classList.contains('active')) {
            closeMenu();
        }
    }
    if (currentWidth !== lastNavWidth) {
        lastNavWidth = currentWidth;
    }
}, { passive: true });

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#') {
          e.preventDefault();
          return;
        }

        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            const navHeight = document.querySelector('.navbar')?.offsetHeight || 0;
            const targetPosition = target.offsetTop - navHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ========================================
// NAVBAR SCROLL EFFECT (throttled)
// ========================================

const navbar = document.querySelector('.navbar');
let navbarTicking = false;

function updateNavbar() {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
    navbarTicking = false;
}

window.addEventListener('scroll', () => {
    if (!navbarTicking) {
        requestAnimationFrame(updateNavbar);
        navbarTicking = true;
    }
}, { passive: true });

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinksList = document.querySelectorAll('.nav-links a');
    const navHeight = document.querySelector('.navbar')?.offsetHeight || 0;

    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop - navHeight - 100;
        const sectionHeight = section.offsetHeight;

        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinksList.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

let navTicking = false;
window.addEventListener('scroll', () => {
    if (!navTicking) {
        requestAnimationFrame(() => {
            updateActiveNavLink();
            navTicking = false;
        });
        navTicking = true;
    }
}, { passive: true });

const backToTop = document.getElementById('backToTop');

if (backToTop) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }, { passive: true });

    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ========================================
// REUSABLE CAROUSEL FACTORY
// ========================================

/**
 * Initializes an infinite-scroll carousel.
 *
 * @param {Object} config
 * @param {string} config.trackId         - ID of the carousel track element
 * @param {string} config.cardSelector    - CSS selector for original cards within the track
 * @param {string} config.cloneClass      - Class name added to cloned cards
 * @param {boolean} config.showDots       - When true, renders clickable position dots
 */
function initScrollCarousel(config) {
    var track = document.getElementById(config.trackId);
    if (!track) return;
    var container = track.parentElement;
    if (!container) return;

    var cards = Array.from(track.querySelectorAll(config.cardSelector));
    if (cards.length === 0) return;

    // Duplicate the card set once for a seamless infinite loop (skip under reduced motion)
    if (!prefersReducedMotion) {
        cards.forEach(function(card) {
            var clone = card.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            clone.classList.add(config.cloneClass);
            clone.setAttribute('tabindex', '-1');
            track.appendChild(clone);

            var focusable = clone.querySelectorAll('a, button, [tabindex]');
            focusable.forEach(function(el) {
                el.setAttribute('tabindex', '-1');
                el.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                }, true);
            });
        });
    }

    var isPaused = false;
    var isDragging = false;
    var autoScrollEnabled = !prefersReducedMotion;

    function loopPoint() {
        // Half of the full (duplicated) content width aligns the clone set to the start
        return track.scrollWidth / 2;
    }

    function step() {
        if (isPaused || isDragging || !autoScrollEnabled) return;
        var loop = loopPoint();
        if (loop <= container.clientWidth) return;
        var next = container.scrollLeft + config.speed;
        if (next >= loop) {
            container.scrollLeft = next - loop;
        } else {
            container.scrollLeft = next;
        }
    }

    if (autoScrollEnabled) {
        setInterval(step, 30);
    }

    // Pause auto-scroll while the pointer is over the carousel
    container.addEventListener('mouseenter', function() { isPaused = true; });
    container.addEventListener('mouseleave', function() { isPaused = false; });

    // Pause while touching (native swipe handles scrolling)
    container.addEventListener('touchstart', function() { isPaused = true; }, { passive: true });
    container.addEventListener('touchend', function() { isPaused = false; }, { passive: true });
    container.addEventListener('touchcancel', function() { isPaused = false; }, { passive: true });

    // Wheel / trackpad -> horizontal scroll ONLY for horizontal intent.
    // Vertical scroll (up/down) is left for the page.
    container.addEventListener('wheel', function(e) {
        var loop = loopPoint();
        if (loop <= container.clientWidth) return;
        var horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;
        if (!horizontal) return;
        e.preventDefault();
        var delta = e.shiftKey ? e.deltaY : e.deltaX;
        var target = container.scrollLeft + delta;
        if (target >= loop) {
            target -= loop;
        } else if (target < 0) {
            target += loop;
        }
        container.scrollLeft = target;
    }, { passive: false });

    // Mouse drag-to-scroll (desktop)
    var startX = 0;
    var startScroll = 0;
    var moved = false;

    container.addEventListener('pointerdown', function(e) {
        if (e.pointerType === 'touch') return;
        isDragging = true;
        moved = false;
        startX = e.clientX;
        startScroll = container.scrollLeft;
        try { container.setPointerCapture(e.pointerId); } catch (err) {}
    });

    container.addEventListener('pointermove', function(e) {
        if (!isDragging) return;
        var dx = e.clientX - startX;
        if (Math.abs(dx) > 5) moved = true;
        container.scrollLeft = startScroll - dx;
    });

    function endDrag(e) {
        if (!isDragging) return;
        isDragging = false;
        try { container.releasePointerCapture(e.pointerId); } catch (err) {}
    }

    container.addEventListener('pointerup', endDrag);
    container.addEventListener('pointercancel', endDrag);

    // Prevent the card's click after a drag
    container.addEventListener('click', function(e) {
        if (moved) {
            e.preventDefault();
            e.stopPropagation();
            moved = false;
        }
    }, true);

    // Pause when the carousel scrolls out of view
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                isPaused = !entry.isIntersecting;
            });
        }, { threshold: 0.1 });
        observer.observe(container);
    }

    // ========================================
    // POSITION DOTS (optional) - smooth, scroll-synced
    // ========================================
    if (config.showDots) {
        // Use the pre-clone card list so we get exactly one dot per real card
        var originalCards = cards;
        var totalDots = originalCards.length;

        // Container for the dots, placed right below the carousel
        var dotsWrap = document.createElement('div');
        dotsWrap.className = 'carousel-dots';

        var dots = [];
        for (var di = 0; di < totalDots; di++) {
            (function(index) {
                var dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'carousel-dot' + (index === 0 ? ' active' : '');
                dot.setAttribute('aria-label', 'Go to item ' + (index + 1));
                dot.addEventListener('click', function() {
                    if (totalDots <= 1) return;
                    // Pause continuous autoplay so the jump is clean
                    isPaused = true;
                    var original = originalCards[index];
                    var offset = original.offsetLeft;
                    container.scrollTo({ left: offset, behavior: 'smooth' });
                });
                dots.push(dot);
                dotsWrap.appendChild(dot);
            })(di);
        }
        container.parentElement.insertBefore(dotsWrap, container.nextSibling);

        // Compute card step from the first original card + gap
        function cardStep() {
            if (originalCards.length === 0) return 1;
            var first = originalCards[0];
            var gap = parseFloat(getComputedStyle(track).gap) || 0;
            return (first.offsetWidth || 1) + gap;
        }

        // Map scrollLeft -> active dot index (respects the clone loop)
        function syncDots() {
            if (totalDots <= 1) {
                return;
            }
            var step = cardStep();
            if (!step) return;
            var pos = container.scrollLeft;
            var idx = Math.round(pos / step);
            // Clamp into [0, totalDots-1]; when reaching the clone set, wrap to start
            idx = ((idx % totalDots) + totalDots) % totalDots;
            for (var k = 0; k < dots.length; k++) {
                dots[k].classList.toggle('active', k === idx);
            }
        }

        var dotTicking = false;
        container.addEventListener('scroll', function() {
            if (!dotTicking) {
                requestAnimationFrame(function() {
                    syncDots();
                    dotTicking = false;
                });
                dotTicking = true;
            }
        }, { passive: true });

        var dotResizeTimer = null;
        window.addEventListener('resize', function() {
            clearTimeout(dotResizeTimer);
            dotResizeTimer = setTimeout(syncDots, 120);
        });

        syncDots();
    }
}

// ========================================
// CAROUSEL INITIALIZATION
// ========================================

initScrollCarousel({
    trackId: 'certCarouselTrack',
    cardSelector: '.cert-card',
    cloneClass: 'cert-card-clone',
    speed: 1.5,
    showDots: true
});

initScrollCarousel({
    trackId: 'skillsCarouselTrack',
    cardSelector: '.skill-card',
    cloneClass: 'skill-card-clone',
    speed: 1.5,
    showDots: true
});

// ========================================
// MOBILE PROJECTS CAROUSEL AUTO-SCROLL
// ========================================
(function() {
    var projectsCarousel = document.querySelector('.projects-carousel');
    var projectsTrack = document.getElementById('projectsCarouselTrack');
    if (!projectsCarousel || !projectsTrack || prefersReducedMotion) return;

    var scrollInterval = null;
    var isPaused = false;

    function startAutoScroll() {
        if (!isMobile || isPaused) return;
        stopAutoScroll();
        scrollInterval = setInterval(function() {
            var cardWidth = projectsCarousel.querySelector('.project-card');
            if (!cardWidth) return;
            var scrollAmount = cardWidth.offsetWidth + parseFloat(getComputedStyle(projectsTrack).gap) || 16;
            var maxScroll = projectsTrack.scrollWidth - projectsCarousel.clientWidth;

            if (projectsCarousel.scrollLeft >= maxScroll - 5) {
                projectsCarousel.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                projectsCarousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }, 2000);
    }

    function stopAutoScroll() {
        if (scrollInterval) {
            clearInterval(scrollInterval);
            scrollInterval = null;
        }
    }

    // Touch: pause on touch, resume immediately (0ms) after touchend
    projectsCarousel.addEventListener('touchstart', function() {
        isPaused = true;
        stopAutoScroll();
    }, { passive: true });

    projectsCarousel.addEventListener('touchend', function() {
        isPaused = false;
        startAutoScroll();
    }, { passive: true });

    projectsCarousel.addEventListener('touchcancel', function() {
        isPaused = false;
        startAutoScroll();
    }, { passive: true });

    // Mouse: pause on enter, resume immediately on leave
    projectsCarousel.addEventListener('mouseenter', function() {
        isPaused = true;
        stopAutoScroll();
    });

    projectsCarousel.addEventListener('mouseleave', function() {
        isPaused = false;
        startAutoScroll();
    });

    // Resume auto-scroll when returning from another tab
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible' && isMobile) {
            startAutoScroll();
        } else {
            stopAutoScroll();
        }
    });

    function onResize() {
        var wasMobile = isMobile;
        isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
        if (isMobile && !wasMobile) {
            startAutoScroll();
        } else if (!isMobile && wasMobile) {
            stopAutoScroll();
        }
    }

    window.addEventListener('resize', onResize, { passive: true });

    if (isMobile) {
        setTimeout(startAutoScroll, 1500);
    }
})();

// ========================================
// PROJECTS AUTO-DETECT - FUTURE-READY (disabled)
// ========================================
// When 2-3+ data projects exist, this will render project cards from the
// GitHub API automatically. It is intentionally disabled until then.
// To enable later: set ENABLE_AUTO_DETECT = true AND add 'api.github.com'
// to the CSP connect-src directive in index.html.
(function() {
    var ENABLE_AUTO_DETECT = false;
    if (!ENABLE_AUTO_DETECT) return;
    // NOTE: the querySelector below targets the projects track. When this is
    // enabled, new project cards are appended and the layout re-flows.
    var projectsTrack = document.getElementById('projectsCarouselTrack');
    if (!projectsTrack) return;
    var done = false;
    function build(repos) {
        // placeholder — filled with fetch logic when enabled
        console.log('GitHub repos detected:', repos.length);
    }
    fetch('https://api.github.com/users/Keerthanaraghu22/repos?sort=updated&per_page=100')
        .then(function(r) { return r.json(); })
        .then(function(repos) {
            if (!Array.isArray(repos)) return;
            // Drop the auto-generated profile repo + the portfolio repo
            var filtered = repos.filter(function(r) {
                return r.name !== 'keerthanaraghu22' &&
                       r.name !== 'Keerthana-R-Portfolio';
            });
            if (filtered.length >= 2) { build(filtered); done = true; }
        })
        .catch(function() {});
})();

// ========================================
// FLOATING PARTICLES (disabled on mobile/low-end)
// ========================================

const particlesContainer = document.getElementById('particles');

if (!isMobile && !prefersReducedMotion) {
    const particleColors = ['#ec4899', '#f472b6', '#db2777', '#8b5cf6', '#a78bfa'];
    let particleCount = 0;
    const maxParticles = isLowEnd ? 15 : 30;
    let particleInterval = null;

    function createParticle() {
        if (particleCount >= maxParticles) return;

        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.background = particleColors[Math.floor(Math.random() * particleColors.length)];

        const duration = Math.random() * 10 + 10;
        const delay = Math.random() * 5;
        const size = Math.random() * 8 + 4;

        particle.style.animationDuration = duration + 's';
        particle.style.animationDelay = delay + 's';
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';

        particlesContainer.appendChild(particle);
        particleCount++;

        const totalTime = (duration + delay) * 1000;
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
                particleCount--;
            }
        }, totalTime);
    }

    for (let i = 0; i < 10; i++) {
        setTimeout(createParticle, i * 300);
    }

    particleInterval = setInterval(() => {
        if (particleCount < maxParticles) {
            createParticle();
        }
    }, 5000);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && particleInterval) {
            clearInterval(particleInterval);
            particleInterval = null;
        } else if (!document.hidden && !particleInterval) {
            particleInterval = setInterval(() => {
                if (particleCount < maxParticles) {
                    createParticle();
                }
            }, 5000);
        }
    });
} else if (particlesContainer) {
    particlesContainer.style.display = 'none';
}

const sections = document.querySelectorAll('section');

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

sections.forEach(section => {
    section.classList.add('animate-on-scroll');
    sectionObserver.observe(section);
});

// ========================================
// TYPING EFFECT FOR TAGLINE (simplified on mobile)
// ========================================

const tagline = document.querySelector('.tagline');

if (tagline && tagline.dataset.originalText === undefined) {
    tagline.dataset.originalText = tagline.textContent;

    if (isMobile || prefersReducedMotion) {
        tagline.textContent = tagline.dataset.originalText;
    } else {
        const text = tagline.dataset.originalText;
        tagline.textContent = '';

        const cursor = document.createElement('span');
        cursor.classList.add('typing-cursor');
        tagline.appendChild(cursor);

        let charIndex = 0;
        const typingSpeed = 50;
        const startDelay = 1500;

        function typeWriter() {
            if (charIndex < text.length) {
                tagline.textContent += text.charAt(charIndex);
                charIndex++;
                setTimeout(typeWriter, typingSpeed);
            } else {
                setTimeout(() => {
                    if (cursor.parentNode) {
                        cursor.remove();
                    }
                }, 1000);
            }
        }

        setTimeout(typeWriter, startDelay);
    }
}

// ========================================
// PARALLAX EFFECT (disabled on mobile)
// ========================================

if (!isMobile && !prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const floatItems = document.querySelectorAll('.float-item');

    if (floatItems.length > 0) {
        let mouseX = 0;
        let mouseY = 0;
        let currentX = 0;
        let currentY = 0;
        let animationId = null;

        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        }, { passive: true });

        function updateParallax() {
            currentX += (mouseX - currentX) * 0.1;
            currentY += (mouseY - currentY) * 0.1;

            floatItems.forEach((item, index) => {
                const factor = (index + 1) * 0.3;
                const x = currentX * factor * 10;
                const y = currentY * factor * 10;
                item.style.transform = `translate(${x}px, ${y}px)`;
            });

            animationId = requestAnimationFrame(updateParallax);
        }

        updateParallax();

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (animationId) cancelAnimationFrame(animationId);
            } else {
                updateParallax();
            }
        });
    }
}

if (!isMobile) {
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const existingRipple = this.querySelector('.ripple');
            if (existingRipple) {
                existingRipple.remove();
            }

            const ripple = document.createElement('span');
            ripple.classList.add('ripple');

            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);

            ripple.style.cssText = `
                position: absolute;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                pointer-events: none;
                width: ${size}px;
                height: ${size}px;
                left: ${e.clientX - rect.left - size / 2}px;
                top: ${e.clientY - rect.top - size / 2}px;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
            `;

            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

const touchElements = document.querySelectorAll('.education-card, .experience-card, .project-card, .stat, .contact-item, .skill-card, .strength-item, .skill-tag, .language-item');

touchElements.forEach(el => {
    let touchTimeout = null;

    el.addEventListener('touchstart', function(e) {
        this.style.transform = 'scale(0.97)';
        this.style.boxShadow = '0 5px 25px rgba(236, 72, 153, 0.4)';
        if (this.classList.contains('education-card') || this.classList.contains('experience-card')) {
            this.style.transform = 'scale(0.97) translateX(5px)';
        }
        if (this.classList.contains('project-card')) {
            this.style.transform = 'scale(0.97) translateY(-5px)';
            this.classList.add('touched');
        }
        if (this.classList.contains('contact-item')) {
            this.style.transform = 'scale(0.97) translateX(5px)';
            this.style.background = 'rgba(236, 72, 153, 0.3)';
        }
    }, { passive: true });

    el.addEventListener('touchend', function(e) {
        this.style.transform = '';
        this.style.boxShadow = '';
        this.classList.remove('touched');
        if (this.classList.contains('contact-item')) {
            this.style.background = '';
        }
    }, { passive: true });

    el.addEventListener('touchcancel', function(e) {
        this.style.transform = '';
        this.style.boxShadow = '';
        this.classList.remove('touched');
        if (this.classList.contains('contact-item')) {
            this.style.background = '';
        }
    }, { passive: true });

    el.addEventListener('blur', function() {
        this.classList.remove('touched');
    }, { passive: true });
});

// Cert card touch feedback (handled separately for carousel compat)
document.querySelectorAll('.cert-card').forEach(function(card) {
    card.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.97)';
        this.style.boxShadow = '0 5px 25px rgba(236, 72, 153, 0.4)';
        this.style.background = 'linear-gradient(135deg, #fff 0%, #fce7f3 100%)';
    }, { passive: true });

    card.addEventListener('touchend', function() {
        this.style.transform = '';
        this.style.boxShadow = '';
        this.style.background = '';
    }, { passive: true });

    card.addEventListener('touchcancel', function() {
        this.style.transform = '';
        this.style.boxShadow = '';
        this.style.background = '';
    }, { passive: true });
});

// Visibility change handler - remove touched class when returning to page
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        document.querySelectorAll('.touched').forEach(el => {
            el.classList.remove('touched');
        });
    }
});

window.addEventListener('pageshow', function(e) {
    if (e.persisted) {
        document.querySelectorAll('.touched').forEach(el => {
            el.classList.remove('touched');
        });
    }
});

// Skill card touch feedback (handled separately for skills carousel compat)
document.querySelectorAll('.skill-card').forEach(function(card) {
    card.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.97)';
        this.style.boxShadow = '0 5px 25px rgba(139, 92, 246, 0.4)';
        this.style.background = 'linear-gradient(135deg, #fff 0%, #ede7f6 100%)';
    }, { passive: true });

    card.addEventListener('touchend', function() {
        this.style.transform = '';
        this.style.boxShadow = '';
        this.style.background = '';
    }, { passive: true });

    card.addEventListener('touchcancel', function() {
        this.style.transform = '';
        this.style.boxShadow = '';
        this.style.background = '';
    }, { passive: true });
});

const statNumbers = document.querySelectorAll('.stat-number');

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = entry.target;
            const text = target.textContent;
            const hasPlus = text.includes('+');
            const number = parseInt(text.replace(/[^0-9]/g, ''));

            if (/^\d{4}$/.test(text.trim()) && !hasPlus) {
                target.textContent = text;
                counterObserver.unobserve(target);
                return;
            }

            let current = 0;
            const increment = number / 50;
            const duration = 800;
            const stepTime = duration / 50;

            const counter = setInterval(() => {
                current += increment;
                if (current >= number) {
                    current = number;
                    clearInterval(counter);
                }
                target.textContent = Math.round(current) + (hasPlus ? '+' : '');
            }, stepTime);

            counterObserver.unobserve(target);
        }
    });
}, {
    threshold: 0.5
});

statNumbers.forEach(stat => {
    counterObserver.observe(stat);
});

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'auto';
}

window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    document.documentElement.classList.add('js-loaded');

    const yearSpan = document.getElementById('footer-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // ========================================
    // RESUME CACHE-BUSTING - Force all devices to load the latest PDF
    // ========================================
    // Append a version timestamp to Resume.pdf links to bypass aggressive
    // browser caching (especially on mobile devices). When you update
    // Resume.pdf, simply update the VERSION string below and re-deploy.
    // The timestamp ensures every device fetches the fresh file.
    (function() {
        var resumeVersion = 'v1';
        var resumeLinks = document.querySelectorAll('a[href="assets/docs/Resume.pdf"]');
        for (var i = 0; i < resumeLinks.length; i++) {
            var link = resumeLinks[i];
            link.href = 'assets/docs/Resume.pdf' + '?v=' + resumeVersion;
        }
    })();
});

// ========================================
// ASYNC CSS - flip deferred stylesheets to active once loaded
// (replaces inline onload handlers so CSP can drop 'unsafe-inline')
// ========================================

(function() {
    var asyncLinks = document.querySelectorAll('link[data-async-css]');
    for (var i = 0; i < asyncLinks.length; i++) {
        (function(link) {
            if (link.sheet) {
                link.media = 'all';
            } else {
                link.addEventListener('load', function() { link.media = 'all'; });
            }
        })(asyncLinks[i]);
    }
})();

// ========================================
// EMAIL PROTECTION - ROT13 obfuscation, assemble-on-click
// ========================================

(function() {
    // ROT13-encoded address. The plaintext address never appears in the HTML;
    // it is only decoded in memory when the user clicks "Email me" or "Copy".
    // rot13("raghukeerthana762@gmail.com") === "entuhxrregunan762@tznvy.pbz"
    var encodedEmail = 'entuhxrregunan762@tznvy.pbz';

    function rot13(str) {
        return str.replace(/[a-zA-Z]/g, function(ch) {
            var code = ch.charCodeAt(0);
            var base = ch <= 'Z' ? 65 : 97;
            return String.fromCharCode(((code - base + 13) % 26) + base);
        });
    }

    function assembleEmail() {
        try {
            return rot13(encodedEmail);
        } catch (e) {
            return '';
        }
    }

    // Any element with .email-link opens a mailto: using the assembled address (no plaintext in source)
    var emailLinks = document.querySelectorAll('.email-link');
    for (var i = 0; i < emailLinks.length; i++) {
        (function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                var email = assembleEmail();
                if (!email) return;
                window.location.href = 'mailto:' + email;
            });
        })(emailLinks[i]);
    }

    // Contact email display: click to assemble + open mailto
    var emailDisplay = document.querySelector('.email-display');
    if (emailDisplay) {
        emailDisplay.textContent = 'Click to reveal email';
        emailDisplay.style.cursor = 'pointer';
        emailDisplay.addEventListener('click', function(e) {
            e.stopPropagation();
            var email = assembleEmail();
            if (!email) return;
            window.location.href = 'mailto:' + email;
        });
    }
})();
