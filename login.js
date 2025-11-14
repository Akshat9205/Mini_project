// Login Page JavaScript

// Authentication state handled via window.currentUser from script.js

// Initialize login page
function initLoginPage() {
    checkAuthState();
    setupEventListeners();
}

// Password strength helper
function isStrongPassword(pwd) {
    // At least 8 characters, one lowercase, one uppercase, one number, one special character
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
    return re.test(pwd || '');
}

// Check if user is already logged in
function checkAuthState() {
    const userData = localStorage.getItem('skillup_user');
    if (userData) {
        window.currentUser = JSON.parse(userData);
        // Redirect to goals page if already logged in
        window.location.href = 'profile.html';
        return;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.login-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const targetForm = this.textContent.includes('Login') ? 'login' : 'signup';

            if (targetForm === 'login') {
                showLogin();
            } else {
                showSignup();
            }
        });
    });

    // Form submissions (guard for pages that don't include both forms)
    const loginFormEl = document.getElementById('login-form');
    if (loginFormEl) {
        loginFormEl.addEventListener('submit', handleLogin);
    }
    const signupFormEl = document.getElementById('signup-form');
    if (signupFormEl) {
        signupFormEl.addEventListener('submit', handleSignup);
    }

    // Social login buttons
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const text = (e.currentTarget && e.currentTarget.textContent) ? e.currentTarget.textContent.toLowerCase() : btn.textContent.toLowerCase();
            const provider = text.includes('google') ? 'google' : 'facebook';

            // Check which form is active
            const loginContainer = document.getElementById('login-form-container');
            if (loginContainer && loginContainer.style.display !== 'none') {
                socialLogin(provider);
            } else {
                socialSignup(provider);
            }
        });
    });

    // Password visibility toggles
    document.querySelectorAll('.toggle-password').forEach(t => {
        t.addEventListener('click', () => {
            const targetId = t.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (!input) return;
            input.type = (input.type === 'password') ? 'text' : 'password';
            t.setAttribute('aria-label', input.type === 'password' ? 'Show password' : 'Hide password');
        });
    });
}

// Show login form
function showLogin() {
    document.getElementById('login-form-container').style.display = 'block';
    document.getElementById('signup-form-container').style.display = 'none';

    document.querySelectorAll('.login-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector('.login-tab:first-child').classList.add('active');
}

// Show signup form
function showSignup() {
    document.getElementById('login-form-container').style.display = 'none';
    document.getElementById('signup-form-container').style.display = 'block';

    document.querySelectorAll('.login-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector('.login-tab:last-child').classList.add('active');
}

// Social login function
function socialLogin(provider) {
    showMessage('login', `${provider.charAt(0).toUpperCase() + provider.slice(1)} login coming soon! Please use email for now.`, 'error');
}

// Social signup function
function socialSignup(provider) {
    showMessage('signup', `${provider.charAt(0).toUpperCase() + provider.slice(1)} signup coming soon! Please use email for now.`, 'error');
}

// Login function
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value.trim();

    // Strong password enforcement
    if (!isStrongPassword(password)) {
        showMessage('login', 'Please enter a strong password (8+ chars, uppercase, lowercase, number, symbol).', 'error');
        return;
    }

    // Clear previous messages
    showMessage('login', 'Logging in...', 'info');

    const result = await login(email, password);

    if (result.success) {
        window.currentUser = result.user;
        localStorage.setItem('skillup_user', JSON.stringify(window.currentUser));
        showMessage('login', 'Login successful! Redirecting...', 'success');

        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 1500);
    } else {
        showMessage('login', result.error, 'error');
    }
}

// Signup function
async function handleSignup(e) {
    e.preventDefault();

    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim().toLowerCase();
    const password = document.getElementById('signup-password').value.trim();
    const confirmPassword = document.getElementById('signup-confirm-password').value.trim();
    const termsAgree = document.getElementById('terms-agree').checked;

    // Validation
    if (password !== confirmPassword) {
        showMessage('signup', 'Passwords do not match', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage('signup', 'Password must be at least 6 characters long', 'error');
        return;
    }

    if (!isStrongPassword(password)) {
        showMessage('signup', 'Please use a strong password (8+ chars, uppercase, lowercase, number, symbol).', 'error');
        return;
    }

    if (!termsAgree) {
        showMessage('signup', 'Please agree to the Terms & Conditions', 'error');
        return;
    }

    // Clear previous messages
    showMessage('signup', 'Creating account...', 'info');

    const result = await signup(name, email, password);

    if (result.success) {
        currentUser = result.user;
        localStorage.setItem('skillup_user', JSON.stringify(currentUser));
        showMessage('signup', 'Account created successfully! Redirecting...', 'success');

        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 1500);
    } else {
        showMessage('signup', result.error, 'error');
    }
}

// Login function (API simulation)
async function login(email, password) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Check if user exists in localStorage
            const users = JSON.parse(localStorage.getItem('skillup_users') || '[]');
            const user = users.find(u => (u.email || '').toLowerCase() === (email || '').toLowerCase() && u.password === password);

            if (user) {
                resolve({ success: true, user: user });
            } else {
                resolve({ success: false, error: 'Invalid email or password' });
            }
        }, 1000);
    });
}

// Signup function (API simulation)
async function signup(name, email, password) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Check if user already exists
            const users = JSON.parse(localStorage.getItem('skillup_users') || '[]');
            const existingUser = users.find(u => (u.email || '').toLowerCase() === (email || '').toLowerCase());

            if (existingUser) {
                resolve({ success: false, error: 'User with this email already exists' });
                return;
            }

            // Create new user
            const newUser = {
                id: Date.now(),
                name: name,
                email: (email || '').toLowerCase(),
                password: password,
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('skillup_users', JSON.stringify(users));

            resolve({ success: true, user: newUser });
        }, 1000);
    });
}

// Show message
function showMessage(formType, message, type = 'error') {
    const messageDiv = document.getElementById(`${formType}-message`);
    if (messageDiv) {
        messageDiv.innerHTML = `<div class="message ${type}">${message}</div>`;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initLoginPage);
