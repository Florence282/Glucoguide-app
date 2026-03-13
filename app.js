/**
 * GlucoGuide - Main Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // === Navigation Logic ===
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.view-section');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinksContainer = document.querySelector('.nav-links');
    const goToMonitorBtns = document.querySelectorAll('.go-to-monitor');

    function switchSection(targetId) {
        // Update active class on links
        navLinks.forEach(link => {
            if (link.dataset.target === targetId) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });

        // Show target section, hide others
        sections.forEach(section => {
            if (section.id === targetId) {
                section.classList.add('active');
                section.classList.remove('hidden');
            } else {
                section.classList.remove('active');
                section.classList.add('hidden');
            }
        });

        // Close mobile menu if open
        if (navLinksContainer.classList.contains('show')) {
            navLinksContainer.classList.remove('show');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
        
        // Announce route change for screen readers (Optional enhancement)
        window.scrollTo(0,0);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.dataset.target;
            switchSection(target);
        });
    });

    goToMonitorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchSection('monitor');
        });
    });

    // Mobile Menu Toggle
    mobileMenuBtn.addEventListener('click', () => {
        navLinksContainer.classList.toggle('show');
        const expanded = navLinksContainer.classList.contains('show');
        mobileMenuBtn.setAttribute('aria-expanded', expanded);
    });

    // === Accessibility Settings Panel ===
    const settingsBtn = document.getElementById('settings-toggle-btn');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const settingsPanel = document.getElementById('accessibility-panel');
    
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const highContrastToggle = document.getElementById('high-contrast-toggle');
    const largeTextToggle = document.getElementById('large-text-toggle');
    const simpleModeToggle = document.getElementById('simple-mode-toggle');

    // Load settings from localStorage
    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('glucoSettings')) || {
            darkMode: false,
            highContrast: false,
            largeText: false,
            simpleMode: false
        };

        darkModeToggle.checked = settings.darkMode;
        highContrastToggle.checked = settings.highContrast;
        largeTextToggle.checked = settings.largeText;
        simpleModeToggle.checked = settings.simpleMode;

        applySettings(settings);
    }

    function saveSettings() {
        const settings = {
            darkMode: darkModeToggle.checked,
            highContrast: highContrastToggle.checked,
            largeText: largeTextToggle.checked,
            simpleMode: simpleModeToggle.checked
        };
        localStorage.setItem('glucoSettings', JSON.stringify(settings));
        applySettings(settings);
    }

    function applySettings(settings) {
        const root = document.documentElement;
        
        // Theme application
        if (settings.highContrast) {
            document.body.setAttribute('data-theme', 'high-contrast');
            // If high contrast is on, it overrides dark mode
            darkModeToggle.disabled = true;
        } else if (settings.darkMode) {
            document.body.setAttribute('data-theme', 'dark');
            darkModeToggle.disabled = false;
        } else {
            document.body.removeAttribute('data-theme');
            darkModeToggle.disabled = false;
        }

        // Text Size
        if (settings.largeText) {
            document.body.setAttribute('data-large-text', 'true');
        } else {
            document.body.removeAttribute('data-large-text');
        }

        // Simple Mode applied as class to body to hide complex elements
        if (settings.simpleMode) {
            document.body.classList.add('simple-mode');
        } else {
            document.body.classList.remove('simple-mode');
        }
    }

    // Settings Event Listeners
    settingsBtn.addEventListener('click', () => {
        settingsPanel.classList.toggle('hidden');
        const expanded = !settingsPanel.classList.contains('hidden');
        settingsBtn.setAttribute('aria-expanded', expanded);
    });

    closeSettingsBtn.addEventListener('click', () => {
        settingsPanel.classList.add('hidden');
        settingsBtn.setAttribute('aria-expanded', 'false');
    });

    [darkModeToggle, highContrastToggle, largeTextToggle, simpleModeToggle].forEach(toggle => {
        toggle.addEventListener('change', saveSettings);
    });

    // === Monitor Form Logic ===
    const readingForm = document.getElementById('reading-form');
    const timeInput = document.getElementById('reading-time');
    const voiceInputBtn = document.getElementById('voice-input-btn');
    const glucoseInput = document.getElementById('glucose-level');

    // Pre-fill time with current time
    function setCurrentTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeInput.value = `${hours}:${minutes}`;
    }

    // Call it when opening the monitor section
    goToMonitorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setCurrentTime();
        });
    });

    // Also call on load just in case
    setCurrentTime();

    // Setup rudimentary Voice Input Mock for now
    voiceInputBtn.addEventListener('click', () => {
        const isListening = voiceInputBtn.classList.contains('listening');
        if(!isListening) {
            voiceInputBtn.classList.add('listening');
            voiceInputBtn.innerHTML = '<i class="fa-solid fa-microphone-lines fa-fade text-primary"></i>';
            voiceInputBtn.setAttribute('aria-label', 'Listening...');
            
            // Mock delay to simulate speech to text
            setTimeout(() => {
                glucoseInput.value = Math.floor(Math.random() * (200 - 80) + 80); // random reading
                voiceInputBtn.classList.remove('listening');
                voiceInputBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
                voiceInputBtn.setAttribute('aria-label', 'Use Microphone to enter reading');
            }, 2000);
        }
    });

    // Verification Logic & Result Rendering
    const resultArea = document.getElementById('result-area');
    const contextSelect = document.getElementById('reading-context');

    function checkSugarLevel(level, context) {
        // Advanced logic based on context (Fasting vs Post-Meal vs Random)
        // Values are illustrative examples conforming somewhat to general health guidelines
        
        let status, title, message, suggestion, themeClass, icon;

        if (context === 'fasting') {
            if (level < 70) {
                status = 'LOW';
                themeClass = 'status-elevated'; // Yellow/Orange warning for low
                icon = 'fa-arrow-down';
                title = 'Low Blood Sugar';
                message = 'Your fasting reading is below the normal range.';
                suggestion = 'Consume fast-acting carbohydrates (like juice or candy) and recheck in 15 mins.';
            } else if (level >= 70 && level <= 99) {
                status = 'NORMAL';
                themeClass = 'status-normal'; // Green
                icon = 'fa-check-circle';
                title = 'Normal';
                message = 'Your reading is within a healthy fasting range.';
                suggestion = 'Maintain your balanced diet and regular exercise routine.';
            } else if (level >= 100 && level <= 125) {
                status = 'ELEVATED';
                themeClass = 'status-elevated'; // Orange
                icon = 'fa-exclamation-triangle';
                title = 'Elevated (Pre-diabetes range)';
                message = 'Your fasting reading is slightly above normal.';
                suggestion = 'Monitor your diet closely and consider discussing with your doctor.';
            } else if (level >= 126 && level <= 180) {
                status = 'HIGH';
                themeClass = 'status-high'; // Red
                icon = 'fa-arrow-up';
                title = 'High';
                message = 'Your fasting reading is above the recommended range.';
                suggestion = 'Follow your healthcare provider\'s plan and stay hydrated.';
            } else { // level >= 181
                status = 'CRITICAL';
                themeClass = 'status-critical'; // Dark Red
                icon = 'fa-radiation';
                title = 'Very High (Critical)';
                message = 'Your reading is significantly elevated.';
                suggestion = 'Seek medical guidance immediately if this persists or you feel unwell.';
            }
        } else {
            // Post-Meal or Random logic
            if (level < 70) {
                status = 'LOW';
                themeClass = 'status-elevated';
                icon = 'fa-arrow-down';
                title = 'Low Blood Sugar';
                message = 'Your reading is below the normal range.';
                suggestion = 'Consume fast-acting carbohydrates and recheck in 15 mins.';
            } else if (level >= 70 && level <= 140) {
                status = 'NORMAL';
                themeClass = 'status-normal';
                icon = 'fa-check-circle';
                title = 'Normal';
                message = 'Your reading is within a healthy range for post-meal/random check.';
                suggestion = 'Great job! Maintain your current lifestyle habits.';
            } else if (level >= 141 && level <= 180) {
                status = 'ELEVATED';
                themeClass = 'status-elevated';
                icon = 'fa-exclamation-triangle';
                title = 'Elevated';
                message = 'Your reading is slightly higher than target for post-meal.';
                suggestion = 'Monitor your diet, engage in light activity like a walk.';
            } else if (level >= 181 && level <= 250) {
                status = 'HIGH';
                themeClass = 'status-high';
                icon = 'fa-arrow-up';
                title = 'High';
                message = 'Your reading is above the recommended range.';
                suggestion = 'Follow your healthcare provider\'s action plan.';
            } else { // level > 250
                status = 'CRITICAL';
                themeClass = 'status-critical';
                icon = 'fa-radiation';
                title = 'Very High (Critical)';
                message = 'Your reading is significantly elevated.';
                suggestion = 'Seek medical guidance, check for ketones if advised by doctor.';
            }
        }

        return { status, title, message, suggestion, themeClass, icon };
    }

    function renderResultCard(result) {
        resultArea.classList.remove('hidden');
        
        // Use a lively pop-up modal construction
        resultArea.innerHTML = `
            <div class="result-card ${result.themeClass} glass-card popup-anim">
                <button class="icon-btn close-modal-btn" aria-label="Close result" style="position: absolute; top: 1rem; right: 1rem;">
                    <i class="fa-solid fa-times"></i>
                </button>
                <div class="result-header" style="flex-direction: column; text-align: center; margin-bottom: 1rem;">
                    <i class="fa-solid ${result.icon} result-icon" style="font-size: 3.5rem; margin-bottom: 0.5rem;"></i>
                    <h3 style="font-size: var(--fs-xlarge); line-height: 1.1; margin: 0;">${result.title}</h3>
                </div>
                <div class="result-body" style="text-align: center;">
                    <p class="result-message" style="font-size: var(--fs-large); font-weight: 500; margin-bottom: 1rem;">${result.message}</p>
                    <div class="suggestion-box" style="text-align: left; font-size: var(--fs-base); padding: 1rem;">
                        <strong><i class="fa-solid fa-lightbulb"></i> Suggestion:</strong>
                        <p style="margin-top: 0.5rem;">${result.suggestion}</p>
                    </div>
                </div>
                <div class="result-actions" style="justify-content: center; margin-top: 1rem;">
                    <button class="btn btn-primary btn-large save-reading-btn" style="width: 100%;">
                        <i class="fa-solid fa-bookmark"></i> Save & Continue
                    </button>
                </div>
            </div>
        `;

        const saveBtn = resultArea.querySelector('.save-reading-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const level = parseInt(glucoseInput.value, 10);
                const context = contextSelect.value;
                const time = timeInput.value;
                saveReading(level, context, time, result.status);
                
                // Reset form gracefully
                glucoseInput.value = '';
                resultArea.classList.add('hidden');
            });
        }

        const closeBtn = resultArea.querySelector('.close-modal-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                resultArea.classList.add('hidden');
            });
        }
    }

    readingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const level = parseInt(glucoseInput.value, 10);
        const context = contextSelect.value;
        const time = timeInput.value;

        if (isNaN(level) || level <= 0) {
            alert('Please enter a valid blood sugar level.');
            return;
        }

        const result = checkSugarLevel(level, context);
        renderResultCard(result);
    });

    // === Data Tracking & History Logic ===
    const historySection = document.getElementById('history-section');
    const historyTbody = document.getElementById('history-tbody');
    const trendIndicator = document.getElementById('trend-indicator');

    function getReadings() {
        return JSON.parse(localStorage.getItem('glucoReadings')) || [];
    }

    function saveReading(level, context, time, status) {
        const readings = getReadings();
        const date = new Date().toLocaleDateString();
        
        const newReading = {
            id: Date.now(),
            date,
            time,
            level,
            context,
            status
        };

        readings.unshift(newReading); // Add to beginning
        // Keep only last 50 readings to save space for MVP
        if (readings.length > 50) readings.pop();
        
        localStorage.setItem('glucoReadings', JSON.stringify(readings));
        renderHistory();
    }

    function calculateTrend(readings) {
        if (readings.length < 2) return { text: 'Stable &rarr;', color: 'var(--text-muted)' };

        const current = readings[0].level;
        const previous = readings[1].level;
        const diff = current - previous;

        if (diff > 10) return { text: 'Rising &uarr;', color: 'var(--status-high)' };
        if (diff < -10) return { text: 'Dropping &darr;', color: 'var(--status-normal)' };
        return { text: 'Stable &rarr;', color: 'var(--text-muted)' };
    }

    function formatContext(ctx) {
        if (ctx === 'fasting') return 'Fasting';
        if (ctx === 'post-meal') return 'Post-Meal';
        return 'Random';
    }

    function getStatusBadge(status) {
        let bg = 'var(--status-normal)';
        if (status === 'ELEVATED') bg = 'var(--status-elevated)';
        if (status === 'HIGH') bg = 'var(--status-high)';
        if (status === 'CRITICAL') bg = 'var(--status-critical)';
        
        return `<span class="badge" style="background-color: ${bg};">${status}</span>`;
    }

    function renderHistory() {
        const readings = getReadings();
        
        if (readings.length === 0) {
            historySection.classList.add('hidden');
            return;
        }

        historySection.classList.remove('hidden');
        historyTbody.innerHTML = '';

        // Render Trend
        const trend = calculateTrend(readings);
        trendIndicator.innerHTML = `Trend: <strong style="color: ${trend.color};">${trend.text}</strong>`;

        // Render rows (show up to 5 on main screen)
        const displayReadings = readings.slice(0, 5);
        
        displayReadings.forEach(r => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${r.date} <br><small class="text-muted">${r.time}</small></td>
                <td>${formatContext(r.context)}</td>
                <td><strong>${r.level}</strong></td>
                <td>${getStatusBadge(r.status)}</td>
            `;
            historyTbody.appendChild(tr);
        });
    }

    // Initialize Trackers
    loadSettings();
    renderHistory();
    initWidgets();

    // === Dashboard Widgets Logic ===
    function initWidgets() {
        initChecklist();
        initWaterTracker();
        initBMICalculator();
    }

    // === Calendar Logic ===
    const calendarMonthYear = document.getElementById('calendar-month-year');
    const calendarBody = document.getElementById('calendar-body');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    
    const dayDetailView = document.getElementById('day-detail-view');
    const detailDateTitle = document.getElementById('detail-date-title');
    const detailTbody = document.getElementById('detail-tbody');
    const noDataMsg = document.getElementById('no-data-msg');

    let currentDate = new Date(); // Track currently viewed month

    function getReadingsByDate() {
        // Returns an object mapping date strings to arrays of readings
        const readings = getReadings();
        const map = {};
        readings.forEach(r => {
            if (!map[r.date]) map[r.date] = [];
            map[r.date].push(r);
        });
        return map;
    }

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Formatter for heading
        calendarMonthYear.innerText = currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

        // Calculate days in month and starting day
        const firstDay = new Date(year, month, 1).getDay(); // 0-6 (Sun-Sat)
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Get data
        const dateMap = getReadingsByDate();
        
        calendarBody.innerHTML = '';
        dayDetailView.classList.add('hidden'); // Clear any old state
        const todayStr = new Date().toLocaleDateString();

        let todayCellToClick = null;

        // Fill empty spaces before the 1st
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-cell empty-cell';
            calendarBody.appendChild(emptyCell);
        }

        // Fill actual days
        for (let day = 1; day <= daysInMonth; day++) {
            const cellDateObj = new Date(year, month, day);
            const cellDateStr = cellDateObj.toLocaleDateString();
            
            const cell = document.createElement('div');
            cell.className = 'calendar-cell';

            if (cellDateStr === todayStr) {
                cell.classList.add('today');
                todayCellToClick = cell;
            }

            // Add day number
            const numSpan = document.createElement('span');
            numSpan.className = 'day-number';
            numSpan.innerText = day;
            cell.appendChild(numSpan);

            // Add dots if readings exist
            const dayReadings = dateMap[cellDateStr] || [];
            if (dayReadings.length > 0) {
                const dotContainer = document.createElement('div');
                dotContainer.className = 'reading-dots';
                
                // Show up to 3 dots
                const displayDots = dayReadings.slice(0, 3);
                displayDots.forEach(dr => {
                    const dot = document.createElement('span');
                    dot.className = `dot ${dr.status.toLowerCase()}`;
                    dotContainer.appendChild(dot);
                });
                
                cell.appendChild(dotContainer);
            }

            // Click Handler
            cell.addEventListener('click', () => {
                // Remove active class from all
                document.querySelectorAll('.calendar-cell').forEach(c => c.classList.remove('active-day'));
                cell.classList.add('active-day');
                
                showDayDetails(cellDateStr, dayReadings);
            });

            calendarBody.appendChild(cell);
        }

        // Automatically show details for Today if we are looking at the current month
        if (todayCellToClick) {
            todayCellToClick.click();
        }
    }

    function showDayDetails(dateStr, readingsForDay) {
        dayDetailView.classList.remove('hidden');
        detailDateTitle.innerText = `Details for ${dateStr}`;
        detailTbody.innerHTML = '';

        if (readingsForDay.length === 0) {
            noDataMsg.classList.remove('hidden');
            detailTbody.parentElement.classList.add('hidden');
        } else {
            noDataMsg.classList.add('hidden');
            detailTbody.parentElement.classList.remove('hidden');
            
            readingsForDay.forEach(r => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${r.time}</td>
                    <td>${formatContext(r.context)}</td>
                    <td><strong>${r.level}</strong></td>
                    <td>${getStatusBadge(r.status)}</td>
                `;
                detailTbody.appendChild(tr);
            });
        }
    }

    if(prevMonthBtn && nextMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            dayDetailView.classList.add('hidden');
            renderCalendar();
        });

        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            dayDetailView.classList.add('hidden');
            renderCalendar();
        });
    }

    // Wrap the save reading functionality to also update the calendar
    const originalSaveReading = saveReading;
    saveReading = function(level, context, time, status) {
        originalSaveReading(level, context, time, status);
        renderCalendar(); // Re-render so dots update instantly
    };

    // 1. Daily Checklist
    function initChecklist() {
        const checkboxes = document.querySelectorAll('.custom-checkbox input[type="checkbox"]');
        
        // Reset checklist daily based on date
        const todayStr = new Date().toDateString();
        const storedDate = localStorage.getItem('glucoChecklistDate');
        
        let checklistState = JSON.parse(localStorage.getItem('glucoChecklist')) || {};
        
        if (storedDate !== todayStr) {
            checklistState = {}; // clear if new day
            localStorage.setItem('glucoChecklistDate', todayStr);
        }

        checkboxes.forEach(chk => {
            if (checklistState[chk.id]) {
                chk.checked = true;
            }

            chk.addEventListener('change', (e) => {
                checklistState[chk.id] = e.target.checked;
                localStorage.setItem('glucoChecklist', JSON.stringify(checklistState));
            });
        });
    }

    // 2. Water Tracker
    function initWaterTracker() {
        const waterContainer = document.getElementById('water-glasses');
        const waterCount = document.getElementById('water-count');
        const addWaterBtn = document.getElementById('add-water-btn');
        
        const todayStr = new Date().toDateString();
        let trackerData = JSON.parse(localStorage.getItem('glucoWaterTracker')) || { date: todayStr, count: 0 };
        
        if (trackerData.date !== todayStr) {
            trackerData = { date: todayStr, count: 0 };
        }

        function renderGlasses() {
            waterContainer.innerHTML = '';
            for (let i = 0; i < 8; i++) {
                const glass = document.createElement('i');
                glass.className = `fa-solid fa-glass-water glass-icon ${i < trackerData.count ? 'filled' : ''}`;
                waterContainer.appendChild(glass);
            }
            waterCount.innerText = trackerData.count;
            localStorage.setItem('glucoWaterTracker', JSON.stringify(trackerData));
        }

        addWaterBtn.addEventListener('click', () => {
            if (trackerData.count < 8) {
                trackerData.count++;
                renderGlasses();
            } else {
                alert("Great job! You've reached your daily water goal!");
            }
        });

        renderGlasses();
    }

    // 3. BMI Calculator
    function initBMICalculator() {
        const bmiForm = document.getElementById('bmi-form');
        const bmiResult = document.getElementById('bmi-result');

        bmiForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const weight = parseFloat(document.getElementById('bmi-weight').value);
            const heightCm = parseFloat(document.getElementById('bmi-height').value);
            
            if (weight > 0 && heightCm > 0) {
                const heightM = heightCm / 100;
                const bmi = (weight / (heightM * heightM)).toFixed(1);
                
                let category, color;
                if (bmi < 18.5) { category = 'Underweight'; color = 'var(--status-elevated)'; }
                else if (bmi >= 18.5 && bmi <= 24.9) { category = 'Normal weight'; color = 'var(--status-normal)'; }
                else if (bmi >= 25 && bmi <= 29.9) { category = 'Overweight'; color = 'var(--status-elevated)'; }
                else { category = 'Obese'; color = 'var(--status-high)'; }

                bmiResult.classList.remove('hidden');
                bmiResult.innerHTML = `
                    <h4>Your BMI: <strong>${bmi}</strong></h4>
                    <p style="color: ${color}; font-weight: 600;">${category}</p>
                `;
            }
        });
    }
});
