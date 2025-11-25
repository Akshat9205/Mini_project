// Authentication state management
let currentUser = null;

// Check if user is already logged in
function checkAuthState() {
    const userData = localStorage.getItem('skillup_user');
    if (userData) {
        currentUser = JSON.parse(userData);
        updateNavbarForLoggedInUser();
    }
}

// Update navbar for logged in user
function updateNavbarForLoggedInUser() {
    // Hide login option, show dashboard and logout
    const loginBtn = document.getElementById('login-btn');
    const dashboardBtn = document.getElementById('dashboard-btn');
    const logoutBtn = document.getElementById('logout-btn');
    if (loginBtn) loginBtn.style.display = 'none';
    if (dashboardBtn) dashboardBtn.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'block';

    // Update profile text
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    if (currentUser && dropdownToggle) {
        dropdownToggle.innerHTML = `👤 ${currentUser.name || currentUser.email}`;
    }
}

// Update navbar for logged out user
function updateNavbarForLoggedOutUser() {
    // Show login option, hide dashboard and logout
    const loginBtn = document.getElementById('login-btn');
    const dashboardBtn = document.getElementById('dashboard-btn');
    const logoutBtn = document.getElementById('logout-btn');
    if (loginBtn) loginBtn.style.display = 'block';
    if (dashboardBtn) dashboardBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';

    // Reset profile text
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    if (dropdownToggle) {
        dropdownToggle.innerHTML = '👤 Profile';
    }
}

// Show modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Hide modal
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';

    // Clear messages
    const messageDiv = modal.querySelector('[id$="-message"]');
    if (messageDiv) messageDiv.innerHTML = '';
}

// Close login modal
function closeLoginModal() {
    hideModal('login-modal');
}

// Show message in modal
function showMessage(modalId, message, type = 'error') {
    const messageDiv = document.querySelector(`#${modalId} [id$="-message"]`);
    if (messageDiv) {
        messageDiv.innerHTML = `<div class="message ${type}">${message}</div>`;
    }
}

// Close login modal
function closeLoginModal() {
    hideModal('login-modal');
    // Close dropdown if open
    const dropdown = document.querySelector('.dropdown-menu');
    if (dropdown && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
    }
}

// Close signup modal
function closeSignupModal() {
    hideModal('signup-modal');
    // Close dropdown if open
    const dropdown = document.querySelector('.dropdown-menu');
    if (dropdown && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
    }
}

// Switch to signup modal
function switchToSignup() {
    hideModal('login-modal');
    showModal('signup-modal');
}

// Social signup function
function socialSignup(provider) {
    showMessage('signup-modal', `${provider.charAt(0).toUpperCase() + provider.slice(1)} signup coming soon! Please use email for now.`, 'error');
}

// Social login function
function socialLogin(provider) {
    showMessage('login-modal', `${provider.charAt(0).toUpperCase() + provider.slice(1)} login coming soon! Please use email for now.`, 'error');
}

// Password strength helper
function isStrongPassword(pwd) {
    // At least 8 characters, one lowercase, one uppercase, one number, one special character
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
    return re.test(pwd || '');
}

// Login function
async function login(email, password) {
    // Simulate API call - replace with actual API
    return new Promise((resolve) => {
        setTimeout(() => {
            // Check if user exists in localStorage
            const users = JSON.parse(localStorage.getItem('skillup_users') || '[]');
            const normEmail = (email || '').trim().toLowerCase();
            const normPass = (password || '').trim();
            const user = users.find(u => (u.email || '').toLowerCase() === normEmail && (u.password || '') === normPass);

            if (user) {
                resolve({ success: true, user: user });
            } else {
                resolve({ success: false, error: 'Invalid email or password' });
            }
        }, 1000);
    });
}

// Signup function
async function signup(name, email, password) {
    // Simulate API call - replace with actual API
    return new Promise((resolve) => {
        setTimeout(() => {
            // Check if user already exists
            const users = JSON.parse(localStorage.getItem('skillup_users') || '[]');
            const existingUser = users.find(u => u.email === email);

            if (existingUser) {
                resolve({ success: false, error: 'User with this email already exists' });
                return;
            }

            // Create new user
            const newUser = {
                id: Date.now(),
                name: name,
                email: email,
                password: password,
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('skillup_users', JSON.stringify(users));

            resolve({ success: true, user: newUser });
        }, 1000);
    });
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        localStorage.removeItem('skillup_user');
        updateNavbarForLoggedOutUser();
    }
}

// Dropdown functionality
function toggleDropdown() {
    const dropdownMenu = document.querySelector('.dropdown-menu');
    dropdownMenu.classList.toggle('show');
}

// Close dropdown when clicking outside
function closeDropdownOnOutsideClick(e) {
    if (!e.target.closest('.dropdown')) {
        const dropdownMenu = document.querySelector('.dropdown-menu');
        if (dropdownMenu.classList.contains('show')) {
            dropdownMenu.classList.remove('show');
        }
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Splash overlay handling
    const splash = document.getElementById('splash');
    if (splash) {
        document.body.classList.add('no-scroll');

        const finishSplash = () => {
            if (!splash.classList.contains('done')) {
                splash.classList.add('done');
                splash.style.display = 'none';
                document.body.classList.remove('no-scroll');
            }
        };

        splash.addEventListener('animationend', (e) => {
            if (e.animationName === 'splashFade') {
                finishSplash();
            }
        });

        // Fallback in case animationend doesn't fire
        setTimeout(finishSplash, 3200);
    }

    // Check authentication state
    checkAuthState();

    // Theme: initialize from localStorage
    const applyTheme = (theme) => {
        document.body.removeAttribute('data-theme');
    };
    localStorage.removeItem('skillup_theme');
    applyTheme('light');

    // Auth guard: require login before accessing goals.html
    document.querySelectorAll('a[href$="goals.html"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const userData = localStorage.getItem('skillup_user');
            if (!userData) {
                e.preventDefault();
                localStorage.setItem('post_login_redirect', 'goals.html');
                window.location.href = 'login.html';
            }
        });
    });

    // Dropdown toggle
    const dropdownToggleEl = document.querySelector('.dropdown-toggle');
    if (dropdownToggleEl) dropdownToggleEl.addEventListener('click', toggleDropdown);

    // Mobile nav toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (navToggle && navLinks) {
        const closeMobileMenu = () => {
            navLinks.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        };

        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navLinks.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                closeMobileMenu();
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.navbar')) closeMobileMenu();
        });

        // Close on resize to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) closeMobileMenu();
        });
    }

    // Signup form handler
    if (document.getElementById('signup-form')) {
        document.getElementById('signup-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = (document.getElementById('signup-name').value || '').trim();
            const email = (document.getElementById('signup-email').value || '').trim().toLowerCase();
            const password = (document.getElementById('signup-password').value || '').trim();
            const confirm = (document.getElementById('signup-confirm-password').value || '').trim();

            const msgEl = document.getElementById('signup-message');
            msgEl.innerHTML = '<div class="message" style="background:#e3f2fd;color:#1976d2;border:1px solid #90caf9;">Creating your account...</div>';

            if (!name) {
                msgEl.innerHTML = '<div class="message error">Please enter your full name.</div>';
                return;
            }
            if (!email || !email.includes('@')) {
                msgEl.innerHTML = '<div class="message error">Please enter a valid email address.</div>';
                return;
            }
            if (password !== confirm) {
                msgEl.innerHTML = '<div class="message error">Passwords do not match.</div>';
                return;
            }
            if (!isStrongPassword(password)) {
                msgEl.innerHTML = '<div class="message error">Please use a strong password (8+ chars, uppercase, lowercase, number, symbol).</div>';
                return;
            }

            const result = await signup(name, email, password);
            if (result.success) {
                currentUser = result.user;
                localStorage.setItem('skillup_user', JSON.stringify(currentUser));

                // Initialize profile data with basic fields
                const initialProfile = {
                    name: name,
                    email: email,
                    emailNotifications: true,
                    profileVisibility: 'public'
                };
                localStorage.setItem('skillup_profile', JSON.stringify(initialProfile));

                // Redirect to intended destination (default: goals)
                const redirectTo = localStorage.getItem('post_login_redirect') || 'goals.html';
                localStorage.removeItem('post_login_redirect');
                window.location.href = redirectTo;
            } else {
                msgEl.innerHTML = `<div class="message error">${result.error || 'Signup failed. Try again.'}</div>`;
            }
        });
    }

    // Login button in dropdown
    const loginBtnEl = document.getElementById('login-btn');
    if (loginBtnEl) loginBtnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        window.location.href = 'login.html';
        const dm = document.querySelector('.dropdown-menu');
        if (dm) dm.classList.remove('show');
    });

    // Logout button in dropdown
    const logoutBtnEl = document.getElementById('logout-btn');
    if (logoutBtnEl) logoutBtnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        logout();
        const dm = document.querySelector('.dropdown-menu');
        if (dm) dm.classList.remove('show');
    });

    // Dashboard button in dropdown
    const dashboardBtnEl = document.getElementById('dashboard-btn');
    if (dashboardBtnEl) dashboardBtnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        // Redirect to dashboard or goals page
        window.location.href = 'goals.html';
        const dm = document.querySelector('.dropdown-menu');
        if (dm) dm.classList.remove('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', closeDropdownOnOutsideClick);

    // Login form handler
    if (document.getElementById('login-form')) {
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('login-email').value.trim().toLowerCase();
            const password = document.getElementById('login-password').value.trim();
            const messageDiv = document.getElementById('login-message');

            // Clear previous messages
            messageDiv.innerHTML = '<div class="message" style="background: #e3f2fd; color: #1976d2; border: 1px solid #90caf9;">Logging in...</div>';

            // Enforce strong password
            if (!isStrongPassword(password)) {
                showMessage('login-modal', 'Please enter a strong password (8+ chars, uppercase, lowercase, number, symbol).', 'error');
                return;
            }

            const result = await login(email, password);

            if (result.success) {
                currentUser = result.user;
                localStorage.setItem('skillup_user', JSON.stringify(currentUser));
                updateNavbarForLoggedInUser();
                // Redirect to intended destination (default: goals)
                const redirectTo = localStorage.getItem('post_login_redirect') || 'goals.html';
                localStorage.removeItem('post_login_redirect');
                window.location.href = redirectTo;
            } else {
                showMessage('login-modal', result.error, 'error');
            }
        });
    }

    // Social buttons handler (for login modal only)
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const provider = e.target.textContent.toLowerCase().includes('google') ? 'google' : 'facebook';
            socialLogin(provider);
        });
    });

    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all sections for animation
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('animate-on-scroll');
        observer.observe(section);
    });

    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));

    const animateCounter = (el) => {
        const target = parseInt(el.getAttribute('data-target') || '0', 10);
        const dur = 1400;
        const start = performance.now();
        const step = (now) => {
            const p = Math.min(1, (now - start) / dur);
            const val = Math.floor(target * (p < 0.5 ? 2*p*p : -1+(4-2*p)*p));
            el.textContent = val.toLocaleString();
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    const counters = document.querySelectorAll('.counter');
    if (counters.length) {
        const countersObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });
        counters.forEach(c => countersObserver.observe(c));
    }

    const hero = document.querySelector('.hero');
    if (hero) {
        const movables = hero.querySelectorAll('.hero-floating, .hero-blob');
        hero.addEventListener('mousemove', (e) => {
            const r = hero.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            movables.forEach((el, i) => {
                const d = (i+1) * 6;
                el.style.transform = `translate(${x*d}px, ${y*d}px)`;
            });
        });
        hero.addEventListener('mouseleave', () => {
            movables.forEach(el => { el.style.transform = ''; });
        });
    }

    // Modal close buttons and outside click handlers
    if (document.getElementById('login-modal')) {
        document.getElementById('login-modal-close').addEventListener('click', () => {
            closeLoginModal();
        });

        document.getElementById('login-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('login-modal')) {
                closeLoginModal();
            }
        });
    }

    // Contact Us modal wiring (index.html)
    const contactNav = document.getElementById('contact-nav');
    const contactCta = document.getElementById('contact-cta-btn');
    const contactFooter = document.getElementById('contact-footer');
    const contactModal = document.getElementById('contact-modal');
    const contactClose = document.getElementById('contact-modal-close');
    const contactCancel = document.getElementById('contact-cancel');
    const contactForm = document.getElementById('contact-form');

    const openContact = (e) => {
        if (contactModal) { if (e) e.preventDefault(); showModal('contact-modal'); }
        // else let default navigation to contact.html proceed
    };
    const closeContact = () => { if (contactModal) hideModal('contact-modal'); };

    if (contactNav) contactNav.addEventListener('click', openContact);
    if (contactCta) contactCta.addEventListener('click', openContact);
    if (contactFooter) contactFooter.addEventListener('click', openContact);
    if (contactClose) contactClose.addEventListener('click', closeContact);
    if (contactCancel) contactCancel.addEventListener('click', closeContact);
    if (contactModal) {
        contactModal.addEventListener('click', (e) => { if (e.target === contactModal) closeContact(); });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const first = (document.getElementById('contact-first')?.value || '').trim();
            const last = (document.getElementById('contact-last')?.value || '').trim();
            const fallbackName = (document.getElementById('contact-name')?.value || '').trim();
            const name = (first || last) ? `${first}${first&&last?' ':''}${last}`.trim() : fallbackName;
            const email = (document.getElementById('contact-email')?.value || '').trim();
            const msg = (document.getElementById('contact-msg')?.value || '').trim();

            const setMsg = (type, text) => {
                const target = contactModal ? document.querySelector('#contact-modal [id$="-message"]') : document.getElementById('contact-message');
                if (target) target.innerHTML = `<div class="message ${type}">${text}</div>`;
            };

            if (!name || !email || !msg) { setMsg('error', 'Please fill out all fields.'); return; }
            setMsg('info', 'Sending your message...');

            // Try EmailJS if configured
            let sent = false;
            try {
                const cfgRaw = localStorage.getItem('emailjs_config');
                const cfg = cfgRaw ? JSON.parse(cfgRaw) : null;
                if (window.emailjs && cfg && cfg.publicKey && cfg.serviceId && cfg.templateId) {
                    if (!window.emailjs.__inited) { window.emailjs.init(cfg.publicKey); window.emailjs.__inited = true; }
                    await window.emailjs.send(cfg.serviceId, cfg.templateId, {
                        from_name: name,
                        from_email: email,
                        message: msg
                    });
                    sent = true;
                }
            } catch (err) { /* fallback below */ }

            if (!sent) {
                const inboxKey = 'skillup_contact_messages';
                const arr = JSON.parse(localStorage.getItem(inboxKey) || '[]');
                arr.push({ id: Date.now(), name, email, message: msg, createdAt: new Date().toISOString() });
                localStorage.setItem(inboxKey, JSON.stringify(arr));
            }

            setMsg('success', 'Thanks! Your message has been received. We will reach out soon.');
            contactForm.reset();
            if (contactModal) setTimeout(closeContact, 1200);
            const thankyou = document.getElementById('thankyou-modal');
            if (thankyou) {
                showModal('thankyou-modal');
                const tyClose = document.getElementById('thankyou-close');
                const tyOk = document.getElementById('thankyou-ok');
                if (tyClose) tyClose.onclick = () => hideModal('thankyou-modal');
                if (tyOk) tyOk.onclick = () => hideModal('thankyou-modal');
                thankyou.addEventListener('click', (ev) => { if (ev.target === thankyou) hideModal('thankyou-modal'); });
            }
        });
    }
});
