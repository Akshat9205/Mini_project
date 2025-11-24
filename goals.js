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
    const freqToggle = document.querySelector('.freq-toggle');
    const goalFrequencyInput = document.getElementById('goal-frequency');
    const moreOptionsBtn = document.getElementById('more-options-btn');
    const morePanel = document.getElementById('more-panel');
    const emojiGrid = document.getElementById('emoji-grid');
    const goalEmojiInput = document.getElementById('goal-emoji');
    const goalNotesInput = document.getElementById('goal-notes');
    const suggestionChips = document.getElementById('suggestion-chips');

    // Selected values
    let selectedCategory = '';
    let selectedDifficulty = '';

    // Initialize page
    initializePage();

    function initializePage() {
        setupCategorySelection();
        setupDifficultySelection();
        setupFrequencyToggle();
        setupMoreOptions();
        setupEmojiPicker();
        setupSuggestions();
        setupButtonInteractions();
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
        setupButtonInteractions(recentGoalsList);
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
        const goalFrequency = (goalFrequencyInput && goalFrequencyInput.value) || 'daily';
        const goalEmoji = (goalEmojiInput && goalEmojiInput.value) || '';
        const goalNotes = (goalNotesInput && goalNotesInput.value || '').trim();

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
            completedDate: null,
            frequency: goalFrequency,
            emoji: goalEmoji,
            notes: goalNotes
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
        // reset frequency and emoji selections
        if (freqToggle) {
            freqToggle.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
            const daily = freqToggle.querySelector('[data-frequency="daily"]');
            if (daily) daily.classList.add('active');
            if (goalFrequencyInput) goalFrequencyInput.value = 'daily';
        }
        if (emojiGrid) {
            emojiGrid.querySelectorAll('.emoji').forEach(e => e.classList.remove('selected'));
            if (goalEmojiInput) goalEmojiInput.value = '';
        }

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

        const recentGoals = mine.slice(0, 8);
        let goalsHTML = '';

        recentGoals.forEach(goal => {
            const created = new Date(goal.createdAt);
            const deadline = new Date(goal.deadline);
            const now = new Date();
            const total = Math.max(1, deadline - created);
            const elapsed = Math.max(0, Math.min(total, now - created));
            let progress = Math.round((elapsed / total) * 100);
            if (goal.completed) progress = 100;
            const radius = 28; const circ = 2 * Math.PI * radius; const offset = circ * (1 - progress/100);
            const dueText = goal.completed ? `✅ Completed` : `Due: ${deadline.toLocaleDateString()}`;
            const gradId = `gradRing-${goal.id}`;

            goalsHTML += `
            <div class="goal-card" data-goal-id="${goal.id}">
              <div class="card-inner">
                <div class="card-face front">
                  <div class="ring">
                    <svg viewBox="0 0 72 72" width="72" height="72" aria-hidden="true">
                      <defs>
                        <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stop-color="#10b981"/>
                          <stop offset="100%" stop-color="#6a11cb"/>
                        </linearGradient>
                      </defs>
                      <circle class="bg" cx="36" cy="36" r="28"/>
                      <circle class="fg" cx="36" cy="36" r="28" stroke="url(#${gradId})" stroke-dasharray="${circ}" stroke-dashoffset="${offset}"/>
                    </svg>
                  </div>
                  <div class="title">${goal.emoji || ''} ${goal.title}</div>
                  <div class="meta"><span class="chip">${getCategoryIcon(goal.category)} ${goal.category}</span><span class="chip">${goal.frequency || 'daily'}</span></div>
                </div>
                <div class="card-face back">
                  <div style="text-align:center;">
                    <div>${dueText}</div>
                    <div class="meta" style="margin-top:6px;"><span class="chip">${goal.difficulty}</span><span class="chip">${goal.xp} XP</span></div>
                    <div class="actions">
                      <button class="btn-ghost complete-btn" data-goal-id="${goal.id}">${goal.completed ? 'Mark Active' : 'Mark Done'}</button>
                      <button class="btn-danger delete-btn" data-goal-id="${goal.id}">Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>`;
        });

        recentGoalsList.innerHTML = goalsHTML;

        // Tilt + flip interactions
        recentGoalsList.querySelectorAll('.goal-card').forEach(card => {
            const inner = card.querySelector('.card-inner');
            card.addEventListener('mousemove', (e) => {
                const r = card.getBoundingClientRect();
                const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
                const y = ((e.clientY - r.top) / r.height - 0.5) * -2;
                card.style.setProperty('--rx', `${y*6}deg`);
                card.style.setProperty('--ry', `${x*6}deg`);
                card.classList.add('tilt');
            });
            card.addEventListener('mouseleave', () => {
                card.style.removeProperty('--rx');
                card.style.removeProperty('--ry');
                card.classList.remove('tilt');
            });
            card.addEventListener('click', () => {
                inner.classList.toggle('flipped');
            });
        });

        // Complete and delete actions
        recentGoalsList.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = Number(btn.getAttribute('data-goal-id'));
                const all = getAllGoals();
                const idx = all.findIndex(g => g.id === id && g.userId === currentUser.id);
                if (idx > -1) {
                    const g = all[idx];
                    const nowCompleted = !g.completed;
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
        recentGoalsList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = Number(btn.getAttribute('data-goal-id'));
                if (!confirm('Delete this goal?')) return;
                const all = getAllGoals();
                const remaining = all.filter(g => !(g.id === id && g.userId === currentUser.id));
                setAllGoals(remaining);
                updateStatsDisplay();
                renderRecentGoals();
                renderChart();
                showMessage('🗑️ Goal deleted', 'success');
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

    function setupButtonInteractions(scope) {
        const root = scope || document;
        const sel = ['.goals-page .btn', '.goals-page .btn-primary', '.goals-page .btn-ghost', '.goals-page .btn-danger', '.goals-page .btn-cancel', '.smart-suggestions .chip'];
        const elements = root.querySelectorAll(sel.join(','));
        elements.forEach(el => {
            el.addEventListener('mousedown', () => el.classList.add('pressed'));
            el.addEventListener('mouseup', () => el.classList.remove('pressed'));
            el.addEventListener('mouseleave', () => el.classList.remove('pressed'));
            el.addEventListener('click', (e) => {
                const rect = el.getBoundingClientRect();
                const r = document.createElement('span');
                r.className = 'ripple' + (el.classList.contains('btn-ghost') || el.classList.contains('chip') ? ' dark-ripple' : '');
                const size = Math.max(rect.width, rect.height);
                r.style.width = r.style.height = size + 'px';
                const x = e.clientX - rect.left - size/2;
                const y = e.clientY - rect.top - size/2;
                r.style.left = x + 'px';
                r.style.top = y + 'px';
                el.appendChild(r);
                setTimeout(() => r.remove(), 650);
            });
        });
    }

    // Frequency toggle setup
    function setupFrequencyToggle() {
        if (!freqToggle) return;
        freqToggle.querySelectorAll('.pill').forEach(pill => {
            pill.addEventListener('click', () => {
                freqToggle.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                if (goalFrequencyInput) goalFrequencyInput.value = pill.getAttribute('data-frequency') || 'daily';
            });
        });
    }

    // More options toggle
    function setupMoreOptions() {
        if (!moreOptionsBtn || !morePanel) return;
        moreOptionsBtn.addEventListener('click', () => {
            const open = morePanel.classList.toggle('open');
            morePanel.hidden = !open;
            moreOptionsBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    // Emoji picker
    function setupEmojiPicker() {
        if (!emojiGrid) return;
        emojiGrid.querySelectorAll('.emoji').forEach(btn => {
            btn.addEventListener('click', () => {
                emojiGrid.querySelectorAll('.emoji').forEach(e => e.classList.remove('selected'));
                btn.classList.add('selected');
                if (goalEmojiInput) goalEmojiInput.value = btn.getAttribute('data-emoji') || '';
            });
        });
    }

    // Suggestions
    function setupSuggestions() {
        if (!suggestionChips) return;
        suggestionChips.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const title = chip.getAttribute('data-title') || '';
                const category = chip.getAttribute('data-category') || '';
                const difficulty = chip.getAttribute('data-difficulty') || '';
                const frequency = chip.getAttribute('data-frequency') || 'daily';
                const emoji = chip.getAttribute('data-emoji') || '';

                const titleEl = document.getElementById('goal-title');
                if (titleEl) titleEl.value = title;

                // category select via cards
                if (category) {
                    categoryCards.forEach(c => c.classList.remove('selected'));
                    const match = Array.from(categoryCards).find(c => c.getAttribute('data-category') === category);
                    if (match) {
                        match.classList.add('selected');
                        document.getElementById('goal-category').value = category;
                        selectedCategory = category;
                    }
                }

                // difficulty selection
                if (difficulty) {
                    difficultyOptions.forEach(o => o.classList.remove('selected'));
                    const d = Array.from(difficultyOptions).find(o => o.getAttribute('data-difficulty') === difficulty);
                    if (d) {
                        d.classList.add('selected');
                        document.getElementById('goal-difficulty').value = difficulty;
                        selectedDifficulty = difficulty;
                        updateXPPreview();
                    }
                }

                // frequency
                if (freqToggle) {
                    freqToggle.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
                    const target = freqToggle.querySelector(`[data-frequency="${frequency}"]`);
                    if (target) target.classList.add('active');
                    if (goalFrequencyInput) goalFrequencyInput.value = frequency;
                }

                // emoji
                if (emojiGrid && emoji) {
                    emojiGrid.querySelectorAll('.emoji').forEach(e => e.classList.remove('selected'));
                    const eBtn = Array.from(emojiGrid.querySelectorAll('.emoji')).find(e => e.getAttribute('data-emoji') === emoji);
                    if (eBtn) eBtn.classList.add('selected');
                    if (goalEmojiInput) goalEmojiInput.value = emoji;
                    if (moreOptionsBtn && morePanel && morePanel.hidden) {
                        moreOptionsBtn.click();
                    }
                }
            });
        });
    }
});