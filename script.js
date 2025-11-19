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
        if (theme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
        } else {
            document.body.removeAttribute('data-theme');
        }
        // Update toggle icon on all buttons
        document.querySelectorAll('.theme-toggle').forEach(btn => {
            btn.textContent = document.body.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
            btn.setAttribute('aria-label', document.body.getAttribute('data-theme') === 'dark' ? 'Toggle light mode' : 'Toggle dark mode');
        });
    };
    applyTheme(localStorage.getItem('skillup_theme'));
    // Theme toggle listeners (support multiple pages)
    document.querySelectorAll('.theme-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const isDark = document.body.getAttribute('data-theme') === 'dark';
            const next = isDark ? 'light' : 'dark';
            localStorage.setItem('skillup_theme', next);
            applyTheme(next);
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

                // Redirect to profile page
                window.location.href = 'profile.html';
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
                // Redirect to profile page
                window.location.href = 'profile.html';
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
});
