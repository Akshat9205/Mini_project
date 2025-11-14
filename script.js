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
    // Check authentication state
    checkAuthState();

    // Dropdown toggle
    const dropdownToggleEl = document.querySelector('.dropdown-toggle');
    if (dropdownToggleEl) dropdownToggleEl.addEventListener('click', toggleDropdown);

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
