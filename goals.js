// Goals Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize goals data
    let userGoals = JSON.parse(localStorage.getItem('skillup_goals')) || [];
    let userStats = JSON.parse(localStorage.getItem('userStats')) || {
        totalGoals: 0,
        activeGoals: 0,
        totalXP: 0
    };

    // Get current user
    let currentUser = JSON.parse(localStorage.getItem('skillup_user') || '{}');

    // DOM Elements
    const goalForm = document.getElementById('goal-form');
    const goalMessage = document.getElementById('goal-message');
    const categoryCards = document.querySelectorAll('.category-card');
    const difficultyOptions = document.querySelectorAll('.difficulty-option');
    const xpPreview = document.getElementById('xp-preview');
    const recentGoalsList = document.getElementById('recent-goals-list');

    // Selected values
    let selectedCategory = '';
    let selectedDifficulty = '';

    // Initialize page
    initializePage();

    function initializePage() {
        setupCategorySelection();
        setupDifficultySelection();
        updateStatsDisplay();
        renderRecentGoals();
    }

    // Category Selection
    function setupCategorySelection() {
        categoryCards.forEach(card => {
            card.addEventListener('click', function() {
                // Remove selected class from all cards
                categoryCards.forEach(c => c.classList.remove('selected'));
                // Add selected class to clicked card
                this.classList.add('selected');
                // Update selected category
                selectedCategory = this.getAttribute('data-category');
                // Update hidden input
                document.getElementById('goal-category').value = selectedCategory;
            });
        });
    }

    // Difficulty Selection
    function setupDifficultySelection() {
        difficultyOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Remove selected class from all options
                difficultyOptions.forEach(o => o.classList.remove('selected'));
                // Add selected class to clicked option
                this.classList.add('selected');
                // Update selected difficulty
                selectedDifficulty = this.getAttribute('data-difficulty');
                // Update hidden input
                document.getElementById('goal-difficulty').value = selectedDifficulty;
                // Update XP preview
                updateXPPreview();
            });
        });
    }

    // Update XP Preview based on difficulty
    function updateXPPreview() {
        let xpValue = 100; // Base XP

        switch(selectedDifficulty) {
            case 'easy':
                xpValue = 50;
                break;
            case 'medium':
                xpValue = 100;
                break;
            case 'hard':
                xpValue = 200;
                break;
        }

        if (xpPreview) {
            xpPreview.textContent = `${xpValue} XP`;
        }
    }

    // Form Submission
    goalForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form data
        const goalTitle = document.getElementById('goal-title').value.trim();
        const goalDescription = document.getElementById('goal-description').value.trim();
        const goalDeadline = document.getElementById('goal-deadline').value;

        // Validation
        if (!goalTitle) {
            showMessage('Please enter a goal title', 'error');
            return;
        }

        if (!selectedCategory) {
            showMessage('Please select a skill category', 'error');
            return;
        }

        if (!selectedDifficulty) {
            showMessage('Please select a difficulty level', 'error');
            return;
        }

        if (!goalDeadline) {
            showMessage('Please set a target deadline', 'error');
            return;
        }

        // Check if deadline is in the future
        const deadlineDate = new Date(goalDeadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (deadlineDate < today) {
            showMessage('Please select a future date for your deadline', 'error');
            return;
        }

        // Calculate XP reward
        const xpReward = calculateXPReward();

        // Create goal object
        const newGoal = {
            id: Date.now(),
            userId: currentUser.id,
            title: goalTitle,
            category: selectedCategory,
            description: goalDescription,
            difficulty: selectedDifficulty,
            deadline: goalDeadline,
            xp: xpReward,
            status: 'active',
            createdAt: new Date().toISOString(),
            completed: false,
            completedDate: null
        };

        // Add goal to array
        userGoals.unshift(newGoal);

        // Update stats
        userStats.totalGoals++;
        userStats.activeGoals++;

        // Save to localStorage
        localStorage.setItem('skillup_goals', JSON.stringify(userGoals));
        localStorage.setItem('userStats', JSON.stringify(userStats));

        // Show success message
        showMessage(`🎉 Goal created successfully! You'll earn ${xpReward} XP when completed.`, 'success');

        // Reset form
        goalForm.reset();
        resetSelections();
        updateXPPreview();

        // Update display
        updateStatsDisplay();
        renderRecentGoals();

        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'index.html#goals';
        }, 2000);
    });

    // Calculate XP reward
    function calculateXPReward() {
        let baseXP = 100;

        switch(selectedDifficulty) {
            case 'easy':
                baseXP = 50;
                break;
            case 'medium':
                baseXP = 100;
                break;
            case 'hard':
                baseXP = 200;
                break;
        }

        // Bonus for detailed description
        const description = document.getElementById('goal-description').value.trim();
        if (description.length > 50) {
            baseXP += 20;
        }

        return baseXP;
    }

    // Reset form selections
    function resetSelections() {
        categoryCards.forEach(card => card.classList.remove('selected'));
        difficultyOptions.forEach(option => option.classList.remove('selected'));
        selectedCategory = '';
        selectedDifficulty = '';
        document.getElementById('goal-category').value = '';
        document.getElementById('goal-difficulty').value = '';
    }

    // Show message
    function showMessage(text, type) {
        goalMessage.innerHTML = `<div class="message ${type}">${text}</div>`;

        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                goalMessage.innerHTML = '';
            }, 5000);
        }
    }

    // Update stats display
    function updateStatsDisplay() {
        document.getElementById('total-goals').textContent = userStats.totalGoals;
        document.getElementById('active-goals').textContent = userStats.activeGoals;
        document.getElementById('total-xp').textContent = userStats.totalXP;
    }

    // Render recent goals
    function renderRecentGoals() {
        if (userGoals.length === 0) {
            recentGoalsList.innerHTML = `
                <div class="no-goals">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🎯</div>
                    <h4>No goals set yet!</h4>
                    <p>Ready to start your learning journey? Create your first goal to see it here.</p>
                </div>
            `;
            return;
        }

        const recentGoals = userGoals.slice(0, 5); // Show last 5 goals
        let goalsHTML = '';

        recentGoals.forEach(goal => {
            const deadlineDate = new Date(goal.deadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let statusClass = '';
            let statusText = '';
            let xpText = `${goal.xp} XP`;

            if (goal.status === 'completed') {
                statusClass = 'completed';
                statusText = `✅ Completed on ${new Date(goal.completedDate).toLocaleDateString()}`;
                xpText = `+${goal.xp} XP`;
            } else if (deadlineDate < today) {
                statusText = '⏰ Overdue';
            } else {
                statusText = `Due: ${deadlineDate.toLocaleDateString()}`;
            }

            goalsHTML += `
                <div class="goal-item ${statusClass}">
                    <div class="goal-info">
                        <div class="goal-title">${goal.title}</div>
                        <div class="goal-meta">${getCategoryIcon(goal.category)} ${goal.category} • ${statusText}</div>
                    </div>
                    <div class="goal-xp">${xpText}</div>
                </div>
            `;
        });

        recentGoalsList.innerHTML = goalsHTML;
    }

    // Get category icon
    function getCategoryIcon(category) {
        const icons = {
            'coding': '💻',
            'communication': '🗣️',
            'design': '🎨',
            'finance': '💰',
            'writing': '✍️',
            'other': '🚀'
        };
        return icons[category] || '🎯';
    }

    // Cancel goal creation
    function cancelGoal() {
        if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            goalForm.reset();
            resetSelections();
            updateXPPreview();
            goalMessage.innerHTML = '';
        }
    }

    // Set minimum date for deadline (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('goal-deadline').min = tomorrow.toISOString().split('T')[0];
});