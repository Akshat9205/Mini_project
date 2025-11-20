// Goals Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Helpers for storage
    const getAllGoals = () => JSON.parse(localStorage.getItem('skillup_goals') || '[]');
    const setAllGoals = (arr) => localStorage.setItem('skillup_goals', JSON.stringify(arr || []));

    // Initialize derived user goals and stats (per current user)
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
        renderChart();

        // Reset Goals button
        const resetBtn = document.getElementById('reset-goals-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                if (!currentUser || !currentUser.id) return;
                if (!confirm('This will remove all your goals. Continue?')) return;

                const all = getAllGoals();
                const remaining = all.filter(g => g.userId !== currentUser.id);
                setAllGoals(remaining);
                userStats = { totalGoals: 0, activeGoals: 0, totalXP: 0 };
                localStorage.setItem('userStats', JSON.stringify(userStats));
                updateStatsDisplay();
                renderRecentGoals();
                renderChart();
            });
        }
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

        // Persist goal to global list without affecting other users
        const all = getAllGoals();
        all.unshift(newGoal);
        setAllGoals(all);

        // Update daily streak once per day on first goal creation
        updateDailyStreakOnGoalCreate();

        // Update stats (recompute for current user)
        const mine = all.filter(g => g.userId === currentUser.id);
        userStats.totalGoals = mine.length;
        userStats.activeGoals = mine.filter(g => g.status !== 'completed').length;
        userStats.totalXP = mine.reduce((sum, g) => sum + (g.completed ? (g.xp || 0) : 0), 0);

        // Save to localStorage
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

    // Update the user's daily streak when a goal is created
    function updateDailyStreakOnGoalCreate() {
        if (!currentUser || !currentUser.id) return;
        const key = 'skillup_streaks';
        const map = JSON.parse(localStorage.getItem(key) || '{}');
        const userId = String(currentUser.id);
        const today = new Date();
        const todayStr = today.toLocaleDateString('en-CA'); // YYYY-MM-DD in local time

        const entry = map[userId] || { currentStreak: 0, lastIncrementDate: null };

        if (entry.lastIncrementDate === todayStr) {
            // already incremented today
            map[userId] = entry;
            localStorage.setItem(key, JSON.stringify(map));
            return;
        }

        // Determine if last increment was yesterday to continue streak
        let nextStreak = 1;
        if (entry.lastIncrementDate) {
            const last = new Date(entry.lastIncrementDate);
            // compute yesterday string
            const y = new Date(today);
            y.setDate(today.getDate() - 1);
            const yStr = y.toLocaleDateString('en-CA');
            if (entry.lastIncrementDate === yStr) {
                nextStreak = (entry.currentStreak || 0) + 1;
            } else {
                nextStreak = 1; // reset
            }
        }

        map[userId] = { currentStreak: nextStreak, lastIncrementDate: todayStr };
        localStorage.setItem(key, JSON.stringify(map));
    }

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
        const all = getAllGoals();
        const mine = all.filter(g => currentUser && g.userId === currentUser.id);
        const totalGoals = mine.length;
        const activeGoals = mine.filter(g => g.status !== 'completed').length;
        const totalXP = mine.reduce((sum, g) => sum + (g.completed ? (g.xp || 0) : 0), 0);

        userStats = { totalGoals, activeGoals, totalXP };
        localStorage.setItem('userStats', JSON.stringify(userStats));

        document.getElementById('total-goals').textContent = totalGoals;
        document.getElementById('active-goals').textContent = activeGoals;
        document.getElementById('total-xp').textContent = totalXP;
    }

    // Render recent goals
    function renderRecentGoals() {
        const all = getAllGoals();
        const mine = all.filter(g => currentUser && g.userId === currentUser.id);
        if (mine.length === 0) {
            recentGoalsList.innerHTML = `
                <div class="no-goals">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🎯</div>
                    <h4>No goals set yet!</h4>
                    <p>Ready to start your learning journey? Create your first goal to see it here.</p>
                </div>
            `;
            return;
        }

        const recentGoals = mine.slice(0, 5); // Show last 5 goals for this user
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
                    <input type="checkbox" class="goal-complete" data-goal-id="${goal.id}" ${goal.completed ? 'checked' : ''} title="Mark as completed" style="margin-right:10px; width:18px; height:18px;">
                    <div class="goal-info">
                        <div class="goal-title">${goal.title}</div>
                        <div class="goal-meta">${getCategoryIcon(goal.category)} ${goal.category} • ${statusText}</div>
                    </div>
                    <div class="goal-xp">${xpText}</div>
                </div>
            `;
        });

        recentGoalsList.innerHTML = goalsHTML;

        // Attach toggle handlers
        recentGoalsList.querySelectorAll('.goal-complete').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const id = Number(e.target.getAttribute('data-goal-id'));
                const all = getAllGoals();
                const idx = all.findIndex(g => g.id === id && g.userId === currentUser.id);
                if (idx > -1) {
                    const g = all[idx];
                    const nowCompleted = e.target.checked;
                    g.completed = nowCompleted;
                    g.status = nowCompleted ? 'completed' : 'active';
                    g.completedDate = nowCompleted ? new Date().toISOString() : null;
                    setAllGoals(all);
                    updateStatsDisplay();
                    renderRecentGoals();
                    renderChart();
                    showMessage(nowCompleted ? `✅ Marked completed: ${g.title}` : `↩️ Marked active: ${g.title}`, 'success');
                }
            });
        });
    }

    // Draw a simple bar chart (Completed vs Active) without external libs
    function renderChart() {
        const canvas = document.getElementById('goals-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const all = getAllGoals();
        const mine = all.filter(g => currentUser && g.userId === currentUser.id);
        const completed = mine.filter(g => g.completed).length;
        const active = mine.length - completed;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Colors depending on theme
        const dark = document.body.getAttribute('data-theme') === 'dark';
        const axis = dark ? '#9ca3af' : '#4b5563';
        const bar1 = '#10b981';
        const bar2 = '#3b82f6';

        // Axis
        const pad = 30; const baseY = canvas.height - pad; const startX = pad; const endX = canvas.width - pad;
        ctx.strokeStyle = axis; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(startX, baseY); ctx.lineTo(endX, baseY); ctx.stroke();

        // Bars
        const maxVal = Math.max(1, completed, active);
        const barW = 60; const gap = 50; const yScale = (canvas.height - pad*2) / maxVal;
        const bar1X = startX + 40; const bar2X = bar1X + barW + gap;
        const bar1H = completed * yScale; const bar2H = active * yScale;
        ctx.fillStyle = bar1; ctx.fillRect(bar1X, baseY - bar1H, barW, bar1H);
        ctx.fillStyle = bar2; ctx.fillRect(bar2X, baseY - bar2H, barW, bar2H);

        // Labels
        ctx.fillStyle = axis; ctx.font = '12px Poppins, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(`Done (${completed})`, bar1X + barW/2, baseY + 16);
        ctx.fillText(`Active (${active})`, bar2X + barW/2, baseY + 16);
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