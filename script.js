const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const hashLinks = document.querySelectorAll('a[href^="#"]');
const scrollTop = document.querySelector('.scroll-top');
const tabBtns = document.querySelectorAll('.tab-btn');
const menuItems = document.querySelectorAll('.menu-items');
const reservationForm = document.querySelector('.reservation-form');
const newsletterForm = document.querySelector('.newsletter-form');

document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeAnimations();
    initializeAppearanceToggle();

    const hasSeenIntro = sessionStorage.getItem('rendezvous-intro-seen');
    if (hasSeenIntro === 'true') {
        hideLoadingScreen(true);
    } else {
        sessionStorage.setItem('rendezvous-intro-seen', 'true');
        hideLoadingScreen(false);
    }
});
function initializeAppearanceToggle() {
    const toggle = document.getElementById('appearance-toggle');
    if (!toggle) {
        return;
    }

    const savedTheme = sessionStorage.getItem('rendezvous-theme');
    applyTheme(savedTheme || 'light');

    toggle.addEventListener('click', function() {
        const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
    });
}

function applyTheme(theme) {
    document.body.dataset.theme = theme;
    const toggle = document.getElementById('appearance-toggle');

    if (!toggle) {
        return;
    }

    const icon = toggle.querySelector('.toggle-icon');
    const label = toggle.querySelector('.toggle-label');

    if (theme === 'dark') {
        toggle.setAttribute('aria-pressed', 'true');
        if (icon) icon.textContent = '🌙';
        if (label) label.textContent = 'Dark';
    } else {
        toggle.setAttribute('aria-pressed', 'false');
        if (icon) icon.textContent = '☀️';
        if (label) label.textContent = 'Light';
    }

    sessionStorage.setItem('rendezvous-theme', theme);
}

function initializeEventListeners() {
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }
    window.addEventListener('scroll', handleNavbarScroll);
    if (scrollTop) {
        scrollTop.addEventListener('click', scrollToTop);
    }
    hashLinks.forEach(link => {
        link.addEventListener('click', handleSmoothScroll);
    });
    tabBtns.forEach(btn => {
        btn.addEventListener('click', handleTabSwitch);
    });
    window.addEventListener('scroll', handleScrollTop);
    if (reservationForm) {
        reservationForm.addEventListener('submit', handleReservationSubmit);
    }
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
    initializeGallery();
    initializeIntersectionObserver();
}
function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    const spans = hamburger.querySelectorAll('span');
    if (hamburger.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
}
function handleNavbarScroll() {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

function handleSmoothScroll(e) {
    const targetId = e.target.getAttribute('href');
    const isHashLink = targetId && targetId.startsWith('#');

    if (!isHashLink) {
        return; // allow normal navigation for external pages
    }

    e.preventDefault();
    const targetSection = document.querySelector(targetId);
    
    if (targetSection) {
        const offsetTop = targetSection.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
        
        if (navMenu.classList.contains('active')) {
            toggleMobileMenu();
        }
    }
}

function handleTabSwitch(e) {
    const targetTab = e.target.getAttribute('data-tab');
    
    tabBtns.forEach(btn => btn.classList.remove('active'));
    menuItems.forEach(item => item.classList.remove('active'));
    
    e.target.classList.add('active');
    const targetItems = document.querySelectorAll(`#${targetTab}`);
    targetItems.forEach(item => item.classList.add('active'));
}

function handleScrollTop() {
    if (!scrollTop) {
        return;
    }

    if (window.scrollY > 300) {
        scrollTop.classList.add('active');
    } else {
        scrollTop.classList.remove('active');
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function handleReservationSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(reservationForm);
    const reservationData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        date: formData.get('date'),
        time: formData.get('time'),
        guests: formData.get('guests'),
        message: formData.get('message')
    };
    
    if (!validateReservationForm(reservationData)) {
        return;
    }
    
    const submitBtn = reservationForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        showNotification('Reservation submitted successfully! We will contact you soon.', 'success');
        reservationForm.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

function handleNewsletterSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(newsletterForm);
    const email = formData.get('email');
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }
    
    const submitBtn = newsletterForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Subscribing...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        showNotification('Successfully subscribed to our newsletter!', 'success');
        newsletterForm.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

function validateReservationForm(data) {
    return data.name && data.email && data.phone && data.date && data.time && data.guests;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function initializeGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = createLightbox();
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const img = this.querySelector('img');
            const title = this.querySelector('.gallery-overlay h3').textContent;
            openLightbox(img.src, title);
        });
    });
}

function createLightbox() {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <span class="lightbox-close">&times;</span>
            <img src="" alt="" class="lightbox-image">
            <h3 class="lightbox-title"></h3>
        </div>
    `;
    
    lightbox.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 10000;
        justify-content: center;
        align-items: center;
        animation: fadeIn 0.3s ease;
    `;
    
    const content = lightbox.querySelector('.lightbox-content');
    content.style.cssText = `
        position: relative;
        max-width: 90%;
        max-height: 90%;
        text-align: center;
    `;
    
    const closeBtn = lightbox.querySelector('.lightbox-close');
    closeBtn.style.cssText = `
        position: absolute;
        top: -40px;
        right: 0;
        color: white;
        font-size: 2rem;
        cursor: pointer;
        transition: transform 0.3s ease;
    `;
    
    closeBtn.addEventListener('click', closeLightbox);
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.transform = 'scale(1.2)';
    });
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.transform = 'scale(1)';
    });
    
    const img = lightbox.querySelector('.lightbox-image');
    img.style.cssText = `
        max-width: 100%;
        max-height: 70vh;
        border-radius: 10px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    `;
    
    const title = lightbox.querySelector('.lightbox-title');
    title.style.cssText = `
        color: white;
        margin-top: 1rem;
        font-size: 1.5rem;
    `;
    
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    document.body.appendChild(lightbox);
    return lightbox;
}

function openLightbox(src, title) {
    const lightbox = document.querySelector('.lightbox');
    const img = lightbox.querySelector('.lightbox-image');
    const titleEl = lightbox.querySelector('.lightbox-title');
    
    img.src = src;
    img.alt = title;
    titleEl.textContent = title;
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.querySelector('.lightbox');
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10001;
        animation: slideInRight 0.3s ease, slideOutRight 0.3s ease 2.7s;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
    `;
    
    const colors = {
        success: 'linear-gradient(135deg, #28a745, #20c997)',
        error: 'linear-gradient(135deg, #dc3545, #c82333)',
        info: 'linear-gradient(135deg, #17a2b8, #138496)'
    };
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

function initializeIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    const animateElements = document.querySelectorAll('.feature, .menu-item, .gallery-item, .about-text, .reservation-info');
    animateElements.forEach(el => observer.observe(el));
}

function initializeAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .animate-in {
            animation: fadeInUp 0.6s ease forwards;
        }
        
        .hamburger.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .hamburger.active span:nth-child(2) {
            opacity: 0;
        }
        
        .hamburger.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
    `;
    document.head.appendChild(style);
}

function hideLoadingScreen(isRepeatVisit = false) {
    const loading = document.querySelector('.loading');
    if (!loading) {
        return;
    }

    if (isRepeatVisit) {
        loading.remove();
        return;
    }

    setTimeout(() => {
        loading.style.opacity = '0';
        loading.style.visibility = 'hidden';
        setTimeout(() => {
            loading.remove();
        }, 600);
    }, 2000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function initializeParallax() {
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', debounce(() => {
            const scrolled = window.pageYOffset;
            const parallax = hero.querySelector('.hero-content');
            if (parallax) {
                const speed = 0.5;
                parallax.style.transform = `translateY(${scrolled * speed}px)`;
            }
        }, 10));
    }
}

window.addEventListener('load', initializeParallax);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLightbox();
    }
});

function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

initializeLazyLoading();
