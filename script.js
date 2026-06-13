// ========================================
// PERFORMANCE OPTIMIZATION - Detect device capabilities
// ========================================

let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
let isLowEnd = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : isMobile;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

window.addEventListener('resize', () => {
    const wasMobile = isMobile;
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    isLowEnd = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : isMobile;

    if (wasMobile !== isMobile && typeof particleInterval !== 'undefined') {
        var pc = document.getElementById('particles');
        if (isMobile) {
            if (pc) pc.style.display = 'none';
            if (particleInterval) {
                clearInterval(particleInterval);
                particleInterval = null;
            }
        } else if (!prefersReducedMotion) {
            if (pc) pc.style.display = '';
            if (!particleInterval) {
                particleInterval = setInterval(function() {
                    if (particleCount < maxParticles) {
                        createParticle();
                    }
                }, 5000);
            }
        }
    }
}, { passive: true });

window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function(e) {
    var pc = document.getElementById('particles');
    if (e.matches) {
        if (pc) pc.style.display = 'none';
        if (typeof particleInterval !== 'undefined' && particleInterval) {
            clearInterval(particleInterval);
            particleInterval = null;
        }
    } else if (!isMobile) {
        if (pc) pc.style.display = '';
        if (typeof particleInterval !== 'undefined' && !particleInterval) {
            particleInterval = setInterval(function() {
                if (particleCount < maxParticles) {
                    createParticle();
                }
            }, 5000);
        }
    }
});

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
// CERTIFICATIONS CAROUSEL
// ========================================

(function initCertCarousel() {
    var track = document.getElementById('certCarouselTrack');
    if (!track) return;

    // Skip if prefers-reduced-motion (CSS handles fallback)
    if (prefersReducedMotion) return;

    // Duplicate all original cert cards for seamless infinite loop
    var originalCards = Array.from(track.querySelectorAll('.cert-card'));
    if (originalCards.length === 0) return;

    originalCards.forEach(function(card) {
        var clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.classList.add('cert-card-clone');
        track.appendChild(clone);
    });

    // ---- Pause on hover (desktop) ----
    track.addEventListener('mouseenter', function() {
        track.classList.add('carousel-paused');
    });

    track.addEventListener('mouseleave', function() {
        track.classList.remove('carousel-paused');
    });

    // ---- Pause on touch (mobile) ----
    var touchStartX = 0;
    var touchStartY = 0;
    var touchMoved = false;
    var touchHoldTimer = null;
    var resumeTimer = null;

    track.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchMoved = false;
        track.classList.add('carousel-paused');

        clearTimeout(touchHoldTimer);
        clearTimeout(resumeTimer);
    }, { passive: true });

    track.addEventListener('touchmove', function(e) {
        var dx = Math.abs(e.touches[0].clientX - touchStartX);
        var dy = Math.abs(e.touches[0].clientY - touchStartY);
        if (dx > 10 || dy > 10) {
            touchMoved = true;
        }
    }, { passive: true });

    track.addEventListener('touchend', function() {
        clearTimeout(touchHoldTimer);
        clearTimeout(resumeTimer);
        // Resume quickly (300ms) — matches desktop mouse-leave feel
        resumeTimer = setTimeout(function() {
            track.classList.remove('carousel-paused');
        }, 300);
    }, { passive: true });

    track.addEventListener('touchcancel', function() {
        clearTimeout(touchHoldTimer);
        clearTimeout(resumeTimer);
        track.classList.remove('carousel-paused');
    }, { passive: true });

    // ---- Prevent link-click conflicts during scroll/drag ----
    var isClickDisabled = false;

    // On touch: only follow link if no significant movement occurred
    track.addEventListener('touchstart', function() {
        isClickDisabled = false;
    }, { passive: true });

    track.addEventListener('touchmove', function() {
        isClickDisabled = true;
    }, { passive: true });

    // Use event delegation for cert-card clicks
    track.addEventListener('click', function(e) {
        if (isClickDisabled) {
            e.preventDefault();
            e.stopPropagation();
            isClickDisabled = false;
            return;
        }

        var certCard = e.target.closest('.cert-card');
        if (!certCard) return;

        // Prevent accidental clicks during animation pause transitions
        if (track.classList.contains('carousel-paused')) {
            // Allow the click but mark we just interacted
            return;
        }
    }, true);

    // Prevent cloned (aria-hidden) cards from being focusable or clickable
    track.querySelectorAll('.cert-card-clone').forEach(function(clone) {
        clone.setAttribute('tabindex', '-1');
        clone.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
        }, true);

        // Prevent keyboard focus on cloned cards
        var focusable = clone.querySelectorAll('a, button, [tabindex]');
        focusable.forEach(function(el) {
            el.setAttribute('tabindex', '-1');
        });
    });

    // ---- Dynamic speed adjustment based on content width ----
    var originalSetWidth = 0;
    function recalcSpeed() {
        // Measure the width of the first set of cards
        var cards = track.querySelectorAll('.cert-card:not(.cert-card-clone)');
        var totalWidth = 0;
        var gap = parseFloat(getComputedStyle(track).gap) || 0;
        cards.forEach(function(card, i) {
            totalWidth += card.offsetWidth;
            if (i > 0) totalWidth += gap;
        });
        originalSetWidth = totalWidth;

        if (originalSetWidth > 0) {
            // Base speed: ~40px per second, adjust duration proportionally
            var duration = Math.max(15, originalSetWidth / 40);
            track.style.animationDuration = duration + 's';
        }
    }

    // Calculate after layout is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(recalcSpeed, 100);
        });
    } else {
        setTimeout(recalcSpeed, 100);
    }

    // Recalculate on resize
    var resizeTimer = null;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(recalcSpeed, 200);
    }, { passive: true });

    // ---- Pause animation when section is not visible (performance) ----
    var certSection = document.getElementById('certifications');
    if (certSection && 'IntersectionObserver' in window) {
        var carouselObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (!entry.isIntersecting) {
                    track.classList.add('carousel-paused');
                } else {
                    track.classList.remove('carousel-paused');
                }
            });
        }, { threshold: 0.1 });

        carouselObserver.observe(certSection);
    }
})();

// ========================================
// TECHNICAL SKILLS CAROUSEL (same logic as certifications)
// ========================================

(function initSkillsCarousel() {
    var track = document.getElementById('skillsCarouselTrack');
    if (!track) return;
    if (prefersReducedMotion) return;

    var originalCards = Array.from(track.querySelectorAll('.skill-card'));
    if (originalCards.length === 0) return;

    originalCards.forEach(function(card) {
        var clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.classList.add('skill-card-clone');
        track.appendChild(clone);
    });

    track.addEventListener('mouseenter', function() {
        track.classList.add('carousel-paused');
    });
    track.addEventListener('mouseleave', function() {
        track.classList.remove('carousel-paused');
    });

    var touchStartX = 0, touchStartY = 0, touchMoved = false;
    var resumeTimer = null;

    track.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchMoved = false;
        track.classList.add('carousel-paused');
        clearTimeout(resumeTimer);
    }, { passive: true });

    track.addEventListener('touchmove', function(e) {
        var dx = Math.abs(e.touches[0].clientX - touchStartX);
        var dy = Math.abs(e.touches[0].clientY - touchStartY);
        if (dx > 10 || dy > 10) touchMoved = true;
    }, { passive: true });

    track.addEventListener('touchend', function() {
        clearTimeout(resumeTimer);
        resumeTimer = setTimeout(function() {
            track.classList.remove('carousel-paused');
        }, 300);
    }, { passive: true });

    track.addEventListener('touchcancel', function() {
        clearTimeout(resumeTimer);
        track.classList.remove('carousel-paused');
    }, { passive: true });

    var isClickDisabled = false;
    track.addEventListener('touchstart', function() {
        isClickDisabled = false;
    }, { passive: true });
    track.addEventListener('touchmove', function() {
        isClickDisabled = true;
    }, { passive: true });

    track.querySelectorAll('.skill-card-clone').forEach(function(clone) {
        clone.setAttribute('tabindex', '-1');
    });

    function recalcSpeed() {
        var cards = track.querySelectorAll('.skill-card:not(.skill-card-clone)');
        var totalWidth = 0;
        var gap = parseFloat(getComputedStyle(track).gap) || 0;
        cards.forEach(function(card, i) {
            totalWidth += card.offsetWidth;
            if (i > 0) totalWidth += gap;
        });
        if (totalWidth > 0) {
            var duration = Math.max(12, totalWidth / 40);
            track.style.animationDuration = duration + 's';
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(recalcSpeed, 100);
        });
    } else {
        setTimeout(recalcSpeed, 100);
    }

    var resizeTimer = null;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(recalcSpeed, 200);
    }, { passive: true });

    var skillsSection = document.getElementById('technical-skills');
    if (skillsSection && 'IntersectionObserver' in window) {
        var skillsObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (!entry.isIntersecting) {
                    track.classList.add('carousel-paused');
                } else {
                    track.classList.remove('carousel-paused');
                }
            });
        }, { threshold: 0.1 });
        skillsObserver.observe(skillsSection);
    }
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

function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');

    skillBars.forEach(bar => {
        const targetWidth = bar.getAttribute('data-width');
        if (targetWidth) {
            bar.style.width = targetWidth;
            bar.classList.add('animate');
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSkillBars);
} else {
    initSkillBars();
}

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
        let typingTimeout = null;
        let removeCursorTimeout = null;

        function typeWriter() {
            if (charIndex < text.length) {
                tagline.textContent += text.charAt(charIndex);
                charIndex++;
                typingTimeout = setTimeout(typeWriter, typingSpeed);
            } else {
                removeCursorTimeout = setTimeout(() => {
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

if (!document.getElementById('ripple-style')) {
    const rippleStyle = document.createElement('style');
    rippleStyle.id = 'ripple-style';
    rippleStyle.textContent = `
        @keyframes ripple {
            from {
                transform: scale(0);
                opacity: 1;
            }
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);
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

// Touch feedback for interactive elements (excluding cert-cards now handled by carousel)
const touchElements = document.querySelectorAll('.education-card, .experience-card, .project-card, .strength-card, .stat, .contact-item, .skill-card, .strength-item, .skill-tag, .language-item');

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

    // Handle blur - remove touched class when focus leaves (helps with back navigation on mobile)
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

// Also handle pageshow (for back-forward cache on mobile)
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

            // Skip animation for year values (exact 4-digit years without '+')
            if (/^\d{4}$/.test(text.trim()) && !hasPlus) {
                target.textContent = text;
                counterObserver.unobserve(target);
                return;
            }

            let current = 0;
            const increment = number / 50;
            const duration = 1500;
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
        var resumeVersion = 'v1'; // <-- UPDATE THIS when Resume.pdf changes
        var resumeLinks = document.querySelectorAll('a[href="Resume.pdf"]');
        for (var i = 0; i < resumeLinks.length; i++) {
            var link = resumeLinks[i];
            var separator = link.hasAttribute('download') ? '?' : '?';
            link.href = 'Resume.pdf' + separator + 'v=' + resumeVersion;
        }
    })();
});

// ========================================
// EMAIL PROTECTION - Obfuscated & click-to-reveal
// ========================================

(function() {
    var encodedEmail = 'cmFnaHVrZWVydGhhbmE3NjJAZ21haWwuY29t';
    var email;
    try {
        email = atob(encodedEmail);
    } catch (e) {
        console.error('Email decoding failed:', e);
        // Fallback to a generic email or suppress
        email = '';
    }

    var emailLinks = document.querySelectorAll('.email-link');
    for (var i = 0; i < emailLinks.length; i++) {
        (function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                // Redirect directly without setting href — prevents status bar from showing mailto:
                window.open('mailto:' + email, '_blank');
            });
        })(emailLinks[i]);
    }

    var emailDisplay = document.querySelector('.email-display');
    if (emailDisplay) {
        emailDisplay.textContent = 'Click to reveal';
        emailDisplay.style.cursor = 'pointer';
        emailDisplay.addEventListener('click', function(e) {
          e.stopPropagation();
          window.location.href = 'mailto:' + email;
        });
    }
})();
