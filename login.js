// Login Page JavaScript

// Authentication state handled via window.currentUser from script.js

// Initialize login page
function initLoginPage() {
    checkAuthState();
    setupEventListeners();
    // Initialize captchas on load
    initCaptcha('login');
    initCaptcha('signup');
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
                initCaptcha('login');
            } else {
                showSignup();
                initCaptcha('signup');
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

    // OTP form events (if present on page)
    const otpForm = document.getElementById('otp-form');
    const resendBtn = document.getElementById('resend-otp-btn');
    const backBtn = document.getElementById('back-to-login-btn');
    if (otpForm) {
        otpForm.addEventListener('submit', handleOtpVerify);
    }
    if (resendBtn) {
        resendBtn.addEventListener('click', resendOtp);
    }
    if (backBtn) {
        backBtn.addEventListener('click', cancelOtpFlow);
    }
}

// Simple math captcha helpers
function generateCaptchaQA() {
    const a = Math.floor(1 + Math.random() * 9);
    const b = Math.floor(1 + Math.random() * 9);
    // Randomize + or -, ensure non-negative
    const usePlus = Math.random() < 0.5 || a < b;
    const question = usePlus ? `${a} + ${b}` : `${a} - ${b}`;
    const answer = usePlus ? a + b : a - b;
    return { question, answer: String(answer) };
}

function initCaptcha(type) {
    if (type === 'login') {
        const qe = document.getElementById('login-captcha-question');
        if (qe) {
            const qa = generateCaptchaQA();
            qe.textContent = qa.question;
            qe.dataset.answer = qa.answer;
            const inp = document.getElementById('login-captcha');
            if (inp) inp.value = '';
        }
    } else if (type === 'signup') {
        const qe = document.getElementById('signup-captcha-question');
        if (qe) {
            const qa = generateCaptchaQA();
            qe.textContent = qa.question;
            qe.dataset.answer = qa.answer;
            const inp = document.getElementById('signup-captcha');
            if (inp) inp.value = '';
        }
    }
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
    const captchaInput = (document.getElementById('login-captcha')?.value || '').trim();
    const captchaAnswer = document.getElementById('login-captcha-question')?.dataset?.answer || '';

    // Strong password enforcement
    if (!isStrongPassword(password)) {
        showMessage('login', 'Please enter a strong password (8+ chars, uppercase, lowercase, number, symbol).', 'error');
        return;
    }

    // Captcha validation
    if (captchaInput === '' || captchaInput !== String(captchaAnswer)) {
        showMessage('login', 'Captcha incorrect. Please try again.', 'error');
        initCaptcha('login');
        return;
    }

    // Clear previous messages
    showMessage('login', 'Logging in...', 'info');

    const result = await login(email, password);

    if (result.success) {
        // Start OTP flow instead of immediate login
        startOtpFlow(result.user);
    } else {
        showMessage('login', result.error, 'error');
        initCaptcha('login');
    }
}

// Generate a 6-digit OTP
function generateOtp() {
    return (Math.floor(100000 + Math.random() * 900000)).toString();
}

// Attempt to send OTP via EmailJS if configured, else fallback to on-screen info
async function sendOtpEmail(email, name, code) {
    try {
        const cfgRaw = localStorage.getItem('emailjs_config');
        const cfg = cfgRaw ? JSON.parse(cfgRaw) : null;
        if (window.emailjs && cfg && cfg.publicKey && cfg.serviceId && cfg.templateId) {
            if (!window.emailjs.__inited) {
                window.emailjs.init(cfg.publicKey);
                window.emailjs.__inited = true;
            }
            await window.emailjs.send(cfg.serviceId, cfg.templateId, {
                to_email: email,
                user_name: name || email,
                otp: code
            });
            return { sent: true };
        }
    } catch (err) {
        console.warn('OTP email send failed', err);
        return { sent: false, error: String(err) };
    }
    return { sent: false };
}

// Begin OTP flow: store pending login and show OTP UI
async function startOtpFlow(user) {
    const code = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    const pending = { user, code, expiresAt };
    localStorage.setItem('skillup_pending_login', JSON.stringify(pending));

    const sendRes = await sendOtpEmail(user.email, user.name, code);
    const masked = (user.email || '').replace(/(^.).*(@.*$)/, (m, a, b) => a + '*****' + b);
    if (sendRes.sent) {
        showMessage('login', `OTP sent to ${masked}.`, 'success');
    } else {
        showMessage('login', `OTP generated and shown here for testing: ${code}. Configure EmailJS to send emails.`, 'info');
    }

    // Switch UI to OTP form
    const loginBox = document.getElementById('login-form-container');
    const otpBox = document.getElementById('otp-form-container');
    if (loginBox && otpBox) {
        loginBox.style.display = 'none';
        otpBox.style.display = 'block';
        const otpMsg = document.getElementById('otp-message');
        if (otpMsg) {
            otpMsg.innerHTML = `<div class="message info">Enter the 6-digit code sent to ${masked}.</div>`;
        }
        const otpInput = document.getElementById('otp-code');
        if (otpInput) otpInput.value = '';
    }
}

// Verify OTP handler
function handleOtpVerify(e) {
    e.preventDefault();
    const input = (document.getElementById('otp-code')?.value || '').trim();
    const pendingRaw = localStorage.getItem('skillup_pending_login');
    if (!pendingRaw) {
        setOtpMessage('No pending verification found. Please login again.', 'error');
        return;
    }
    const pending = JSON.parse(pendingRaw);
    if (Date.now() > (pending.expiresAt || 0)) {
        setOtpMessage('OTP expired. Please resend or login again.', 'error');
        return;
    }
    if (input !== String(pending.code)) {
        setOtpMessage('Invalid OTP. Please try again.', 'error');
        return;
    }

    // Success: complete login
    window.currentUser = pending.user;
    localStorage.setItem('skillup_user', JSON.stringify(window.currentUser));
    localStorage.removeItem('skillup_pending_login');
    setOtpMessage('Verification successful! Redirecting...', 'success');
    setTimeout(() => {
        window.location.href = 'profile.html';
    }, 1000);
}

function resendOtp() {
    const pendingRaw = localStorage.getItem('skillup_pending_login');
    const pending = pendingRaw ? JSON.parse(pendingRaw) : null;
    if (!pending || !pending.user) {
        setOtpMessage('Nothing to resend. Please login again.', 'error');
        return;
    }
    // issue a new code and extend expiry
    const newCode = generateOtp();
    pending.code = newCode;
    pending.expiresAt = Date.now() + 5 * 60 * 1000;
    localStorage.setItem('skillup_pending_login', JSON.stringify(pending));
    sendOtpEmail(pending.user.email, pending.user.name, newCode).then((res) => {
        const masked = (pending.user.email || '').replace(/(^.).*(@.*$)/, (m, a, b) => a + '*****' + b);
        if (res.sent) setOtpMessage(`A new OTP was sent to ${masked}.`, 'success');
        else setOtpMessage(`New OTP (testing): ${newCode}. Configure EmailJS to send emails.`, 'info');
    });
}

function cancelOtpFlow() {
    localStorage.removeItem('skillup_pending_login');
    const loginBox = document.getElementById('login-form-container');
    const otpBox = document.getElementById('otp-form-container');
    if (loginBox && otpBox) {
        otpBox.style.display = 'none';
        loginBox.style.display = 'block';
    }
}

function setOtpMessage(text, type) {
    const msg = document.getElementById('otp-message');
    if (msg) msg.innerHTML = `<div class="message ${type}">${text}</div>`;
}

// Signup function
async function handleSignup(e) {
    e.preventDefault();

    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim().toLowerCase();
    const password = document.getElementById('signup-password').value.trim();
    const confirmPassword = document.getElementById('signup-confirm-password').value.trim();
    const termsAgree = document.getElementById('terms-agree').checked;
    const captchaInput = (document.getElementById('signup-captcha')?.value || '').trim();
    const captchaAnswer = document.getElementById('signup-captcha-question')?.dataset?.answer || '';

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

    // Captcha validation
    if (captchaInput === '' || captchaInput !== String(captchaAnswer)) {
        showMessage('signup', 'Captcha incorrect. Please try again.', 'error');
        initCaptcha('signup');
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
        initCaptcha('signup');
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
