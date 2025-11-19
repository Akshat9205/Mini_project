// Profile Page JavaScript
let isEditing = false;

// Initialize profile page
function initProfile() {
    checkAuthState();
    loadUserProfile();
    setupEventListeners();
    loadUserProgress();
}

// Helper to safely get/set current user
function getCurrentUser() {
    return window.currentUser || JSON.parse(localStorage.getItem('skillup_user') || 'null');
}
function setCurrentUser(user) {
    window.currentUser = user;
    localStorage.setItem('skillup_user', JSON.stringify(user));
}

// Check authentication state
function checkAuthState() {
    const userData = localStorage.getItem('skillup_user');
    if (userData) {
        window.currentUser = JSON.parse(userData);
        updateNavbarForLoggedInUser && updateNavbarForLoggedInUser();
        updateProfileDisplay();
    } else {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
    }
}

// Provide missing function used in init
function loadUserProfile() {
    updateProfileDisplay();
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.currentUser = null;
        localStorage.removeItem('skillup_user');
        updateNavbarForLoggedOutUser();
        // Redirect to home page
        window.location.href = 'index.html';
    }
}

// Dropdown functionality
function toggleDropdown() {
    const dropdownMenu = document.querySelector('.dropdown-menu');
    if (dropdownMenu) {
        dropdownMenu.classList.toggle('show');
    }
}

// Close dropdown when clicking outside
function closeDropdownOnOutsideClick(e) {
    if (!e.target.closest('.dropdown')) {
        const dropdownMenu = document.querySelector('.dropdown-menu');
        if (dropdownMenu && dropdownMenu.classList.contains('show')) {
            dropdownMenu.classList.remove('show');
        }
    }
}

// Update profile display with user data
function updateProfileDisplay() {
    const cu = getCurrentUser();
    if (cu) {
        document.getElementById('profile-name').textContent = cu.name || 'Your Name';
        // Header subtitle should show bio if available; otherwise email
        const profileData = JSON.parse(localStorage.getItem('skillup_profile') || '{}');
        const subtitle = (profileData.bio && profileData.bio.trim()) ? profileData.bio.trim() : (cu.email || 'your.email@example.com');
        const subtitleEl = document.getElementById('profile-email');
        if (subtitleEl) subtitleEl.textContent = subtitle;

        // Update avatar if available
        const avatarImg = document.getElementById('profile-avatar-img');
        if (cu && cu.avatar) {
            avatarImg.src = cu.avatar;
        }

        // Load profile data
        loadProfileData();
    }
}

// Load profile data from localStorage
function loadProfileData() {
    const profileData = JSON.parse(localStorage.getItem('skillup_profile') || '{}');
    const cu = getCurrentUser() || {};

    // Personal Information
    document.getElementById('display-name').textContent = profileData.name || cu.name || 'Your Full Name';
    document.getElementById('display-email').textContent = profileData.email || cu.email || 'your.email@example.com';
    document.getElementById('display-phone').textContent = profileData.phone || 'Not provided';
    document.getElementById('display-location').textContent = profileData.location || 'Not provided';
    document.getElementById('display-bio').textContent = profileData.bio || 'No bio added yet';
    document.getElementById('display-website').textContent = profileData.website || 'Not provided';

    // Settings
    if (profileData.emailNotifications !== undefined) {
        document.getElementById('email-notifications').checked = profileData.emailNotifications;
    }
    if (profileData.profileVisibility) {
        document.getElementById('profile-visibility').value = profileData.profileVisibility;
    }

    // Fill edit inputs
    document.getElementById('edit-name').value = profileData.name || cu.name || '';
    document.getElementById('edit-email').value = profileData.email || cu.email || '';
    document.getElementById('edit-phone').value = profileData.phone || '';
    document.getElementById('edit-location').value = profileData.location || '';
    document.getElementById('edit-bio').value = profileData.bio || '';
    document.getElementById('edit-website').value = profileData.website || '';
}

// Load user progress and stats
function loadUserProgress() {
    const cu = getCurrentUser();
    const goalsData = JSON.parse(localStorage.getItem('skillup_goals') || '[]');
    const userGoals = cu ? goalsData.filter(goal => goal.userId === cu.id) : [];

    // Calculate stats
    const totalGoals = userGoals.length;
    const completedGoals = userGoals.filter(goal => goal.completed).length;
    const totalXP = userGoals.reduce((sum, goal) => sum + (goal.xp || 0), 0);
    const level = Math.floor(totalXP / 1000) + 1;

    // Update display
    document.getElementById('total-goals').textContent = totalGoals;
    document.getElementById('total-xp').textContent = totalXP;
    document.getElementById('level').textContent = level;
    document.getElementById('completed-goals').textContent = completedGoals;
    document.getElementById('earned-xp').textContent = totalXP;
    document.getElementById('current-streak').textContent = calculateStreak();

    // Update progress bars
    const goalsProgress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
    document.getElementById('goals-progress').style.width = goalsProgress + '%';

    const xpProgress = (totalXP % 1000) / 10; // Progress within current level
    document.getElementById('xp-progress').style.width = xpProgress + '%';

    // Load recent activity
    loadRecentActivity(userGoals);
}

// Calculate current streak
function calculateStreak() {
    // Simple streak calculation - can be enhanced
    return Math.floor(Math.random() * 15) + 1; // Placeholder
}

// Load recent activity
function loadRecentActivity(goals) {
    const activityList = document.getElementById('recent-activity');

    if (goals.length === 0) {
        activityList.innerHTML = `
            <div class="no-activity">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📋</div>
                <h4>No recent activity</h4>
                <p>Start setting goals to see your progress here!</p>
            </div>
        `;
        return;
    }

    const recentGoals = goals
        .filter(goal => goal.createdAt)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    activityList.innerHTML = recentGoals.map(goal => `
        <div class="activity-item">
            <div class="activity-icon">🎯</div>
            <div class="activity-content">
                <h4>Goal Created: ${goal.title}</h4>
                <p>${new Date(goal.createdAt).toLocaleDateString()}</p>
                <span class="activity-xp">+${goal.xp || 100} XP</span>
            </div>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Edit profile button
    document.getElementById('edit-profile-btn').addEventListener('click', toggleEditMode);

    // Avatar upload
    document.getElementById('avatar-edit-btn').addEventListener('click', () => {
        document.getElementById('avatar-input').click();
    });

    document.getElementById('avatar-input').addEventListener('change', handleAvatarUpload);

    // Settings
    document.getElementById('change-password-btn').addEventListener('click', openPasswordModal);
    document.getElementById('two-factor-btn').addEventListener('click', enableTwoFactor);
    document.getElementById('email-notifications').addEventListener('change', saveNotificationSettings);
    document.getElementById('profile-visibility').addEventListener('change', saveVisibilitySettings);

    // Password modal
    document.getElementById('password-form').addEventListener('submit', handlePasswordChange);
    document.getElementById('password-modal-close').addEventListener('click', closePasswordModal);

    // Logout button in dropdown
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            logout();
            const dropdown = document.querySelector('.dropdown-menu');
            if (dropdown) dropdown.classList.remove('show');
        });
    }

    // Dropdown toggle
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    if (dropdownToggle) {
        dropdownToggle.addEventListener('click', toggleDropdown);
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', closeDropdownOnOutsideClick);

    // Auto-refresh progress and recent activity when goals change in another tab/page
    window.addEventListener('storage', (e) => {
        if (e.key === 'skillup_goals') {
            loadUserProgress();
        }
    });

    // Refresh when user returns to the tab or window focus
    window.addEventListener('focus', () => {
        loadUserProgress();
    });
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) loadUserProgress();
    });
}

// Toggle edit mode
function toggleEditMode() {
    isEditing = !isEditing;

    if (isEditing) {
        // Show edit inputs
        document.querySelectorAll('.info-input').forEach(input => {
            input.style.display = 'block';
        });
        document.querySelectorAll('.info-value').forEach(value => {
            value.style.display = 'none';
        });

        document.getElementById('edit-profile-btn').innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            </svg>
            Done Editing
        `;

        // Show action buttons
        document.querySelector('.profile-actions').style.display = 'flex';
    } else {
        // Hide edit inputs
        document.querySelectorAll('.info-input').forEach(input => {
            input.style.display = 'none';
        });
        document.querySelectorAll('.info-value').forEach(value => {
            value.style.display = 'flex';
        });

        document.getElementById('edit-profile-btn').innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Edit Profile
        `;

        // Hide action buttons
        document.querySelector('.profile-actions').style.display = 'none';

        // Cancel any unsaved changes
        loadProfileData();
    }
}

// Handle avatar upload
function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const avatarImg = document.getElementById('profile-avatar-img');
            avatarImg.src = e.target.result;

            // Save avatar to user data
            const cu = getCurrentUser() || {};
            cu.avatar = e.target.result;
            setCurrentUser(cu);

            // Also persist in skillup_users list
            const users = JSON.parse(localStorage.getItem('skillup_users') || '[]');
            const idx = users.findIndex(u => u.id === cu.id);
            if (idx > -1) {
                users[idx].avatar = cu.avatar;
                localStorage.setItem('skillup_users', JSON.stringify(users));
            }
        };
        reader.readAsDataURL(file);
    }
}

// Save profile changes
function saveProfile() {
    const profileData = {
        name: document.getElementById('edit-name').value,
        email: document.getElementById('edit-email').value,
        phone: document.getElementById('edit-phone').value,
        location: document.getElementById('edit-location').value,
        bio: document.getElementById('edit-bio').value,
        website: document.getElementById('edit-website').value,
        emailNotifications: document.getElementById('email-notifications').checked,
        profileVisibility: document.getElementById('profile-visibility').value
    };

    // Update current user data
    const cu = getCurrentUser() || {};
    cu.name = profileData.name;
    cu.email = profileData.email;
    setCurrentUser(cu);

    // Update in users list
    const users = JSON.parse(localStorage.getItem('skillup_users') || '[]');
    const idx = users.findIndex(u => u.id === cu.id);
    if (idx > -1) {
        users[idx].name = cu.name;
        users[idx].email = cu.email;
        localStorage.setItem('skillup_users', JSON.stringify(users));
    }

    // Save profile data
    localStorage.setItem('skillup_profile', JSON.stringify(profileData));

    // Update display
    updateProfileDisplay();
    toggleEditMode();

    // Show success message
    showMessage('Profile updated successfully!', 'success');
}

// Cancel editing
function cancelEdit() {
    loadProfileData();
    toggleEditMode();
}

// Delete account
function deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        // Clear all user data
        localStorage.removeItem('skillup_user');
        localStorage.removeItem('skillup_profile');
        localStorage.removeItem('skillup_goals');

        // Redirect to home
        window.location.href = 'index.html';
    }
}

// Open password change modal
function openPasswordModal() {
    document.getElementById('password-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Close password modal
function closePasswordModal() {
    document.getElementById('password-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('password-form').reset();
    document.getElementById('password-message').innerHTML = '';
}

// Handle password change
function handlePasswordChange(e) {
    e.preventDefault();

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-new-password').value;

    if (newPassword !== confirmPassword) {
        showMessage('New passwords do not match', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showMessage('Password must be at least 6 characters long', 'error');
        return;
    }

    // In a real app, verify current password with backend
    // For demo, just update the password (if matches user in list)
    const cu = getCurrentUser();
    if (cu) {
        cu.password = newPassword;
        setCurrentUser(cu);
        const users = JSON.parse(localStorage.getItem('skillup_users') || '[]');
        const idx = users.findIndex(u => u.id === cu.id);
        if (idx > -1) {
            users[idx].password = newPassword;
            localStorage.setItem('skillup_users', JSON.stringify(users));
        }
    }

    closePasswordModal();
    showMessage('Password updated successfully!', 'success');
}

// Enable two-factor authentication
function enableTwoFactor() {
    alert('Two-factor authentication setup coming soon! For now, your account is secure.');
}

// Save notification settings
function saveNotificationSettings() {
    const profileData = JSON.parse(localStorage.getItem('skillup_profile') || '{}');
    profileData.emailNotifications = document.getElementById('email-notifications').checked;
    localStorage.setItem('skillup_profile', JSON.stringify(profileData));
}

// Save visibility settings
function saveVisibilitySettings() {
    const profileData = JSON.parse(localStorage.getItem('skillup_profile') || '{}');
    profileData.profileVisibility = document.getElementById('profile-visibility').value;
    localStorage.setItem('skillup_profile', JSON.stringify(profileData));
}

// Show message
function showMessage(message, type = 'info') {
    // Create a temporary message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;

    if (type === 'success') {
        messageDiv.style.background = '#28a745';
    } else if (type === 'error') {
        messageDiv.style.background = '#dc3545';
    } else {
        messageDiv.style.background = '#007bff';
    }

    document.body.appendChild(messageDiv);

    // Animate in
    setTimeout(() => {
        messageDiv.style.transform = 'translateX(0)';
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        messageDiv.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initProfile);