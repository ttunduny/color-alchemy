// script.js - Refined Color Alchemy game with fixed clickability and added interest (bubbles, enhanced feedback)
class ColorAlchemyGame {
    constructor() {
        this.level = 1;
        this.totalLevels = 20;
        this.tries = 0;
        this.currentMix = { r: 0, g: 0, b: 0 };
        this.targetColor = null;
        this.colorName = '';
        this.mixedColors = []; // Array of 'red', 'green', 'blue' drops
        this.maxTries = 8;
        this.frustrationLevels = [5, 8, 12, 15, 18]; // Levels with tighter tolerance and bonuses
        this.colorLibrary = {};
        this.currentMode = 'daily'; // 'daily', 'levels', 'picker'
        this.dailyChallenge = this.getDailyChallenge();
        this.playerStats = this.getPlayerStats();
        this.audioContext = null; // For success sounds

        // Initialize everything
        this.initializeColorLibrary();
        this.initializeGame();
        this.setupEventListeners();
        this.startDailyTimer();
        this.updateSocialStats();
    }

    // Generate or load daily challenge from localStorage
    getDailyChallenge() {
        const today = new Date('2025-10-04').toISOString().split('T')[0]; // Use provided date
        const stored = JSON.parse(localStorage.getItem('colorAlchemyDaily')) || {};

        if (stored.date !== today) {
            const dailyColor = this.generateDailyColor();
            const challenge = {
                date: today,
                color: dailyColor.color,
                colorName: dailyColor.name,
                players: Math.floor(Math.random() * 500) + 1000,
                shares: Math.floor(Math.random() * 500) + 1400,
                completed: false,
                tries: 0,
                score: 0
            };
            localStorage.setItem('colorAlchemyDaily', JSON.stringify(challenge));
            return challenge;
        }

        return stored;
    }

    // Select daily color from library using date seed for consistency
    generateDailyColor() {
        const allColors = [];
        for (let tier = 1; tier <= 5; tier++) {
            if (this.colorLibrary[tier]) {
                allColors.push(...this.colorLibrary[tier]);
            }
        }

        if (allColors.length === 0) {
            // Fallback if library not ready
            return { color: { r: 255, g: 255, b: 0 }, name: "Golden Yellow" };
        }

        const today = new Date('2025-10-04');
        const seed = today.getDate() + today.getMonth() * 31;
        const index = seed % allColors.length;
        return allColors[index];
    }

    // Load player stats from localStorage
    getPlayerStats() {
        return JSON.parse(localStorage.getItem('colorAlchemyPlayerStats')) || {
            totalGames: 0,
            dailyCompletions: 0,
            shares: 0,
            rank: 0
        };
    }

    // Save player stats to localStorage
    savePlayerStats() {
        localStorage.setItem('colorAlchemyPlayerStats', JSON.stringify(this.playerStats));
    }

    // Save daily challenge to localStorage
    saveDailyChallenge() {
        localStorage.setItem('colorAlchemyDaily', JSON.stringify(this.dailyChallenge));
    }

    // Update timer for daily reset (fixed for demo date)
    startDailyTimer() {
        const updateTimer = () => {
            const now = new Date('2025-10-04');
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const diff = tomorrow - now;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            document.getElementById('dailyTimer').textContent =
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };
        updateTimer();
        setInterval(updateTimer, 1000);
    }

    // Update UI with social/global stats
    updateSocialStats() {
        document.getElementById('dailyColorName').textContent = this.dailyChallenge.colorName;
        document.getElementById('dailyPlayers').textContent = this.dailyChallenge.players.toLocaleString();
        document.getElementById('globalPlayers').textContent = (this.dailyChallenge.players + Math.floor(Math.random() * 2000)).toLocaleString();
        document.getElementById('todayShares').textContent = this.dailyChallenge.shares.toLocaleString();
        const rank = Math.floor(Math.random() * 500) + 1;
        document.getElementById('globalRank').textContent = `#${rank}`;
        document.getElementById('rank').textContent = `#${rank}`;
    }

    // Initialize color library with tiers for progressive difficulty
    initializeColorLibrary() {
        // Tier 1: Basic secondary colors (Easy)
        this.colorLibrary[1] = [
            { color: { r: 255, g: 255, b: 0 }, name: "Golden Yellow", hint: "Red + Green" },
            { color: { r: 255, g: 0, b: 255 }, name: "Magical Magenta", hint: "Red + Blue" },
            { color: { r: 0, g: 255, b: 255 }, name: "Enchanted Cyan", hint: "Green + Blue" }
        ];

        // Tier 2: Tertiary colors & simple mixes (Medium)
        this.colorLibrary[2] = [
            { color: { r: 255, g: 128, b: 0 }, name: "Alchemy Orange", hint: "Mostly Red + Some Green" },
            { color: { r: 128, g: 0, b: 255 }, name: "Royal Purple", hint: "Mostly Blue + Some Red" },
            { color: { r: 0, g: 255, b: 128 }, name: "Mystic Mint", hint: "Mostly Green + Some Blue" },
            { color: { r: 255, g: 255, b: 128 }, name: "Light Elixir", hint: "Yellow + More Green" },
            { color: { r: 255, g: 128, b: 128 }, name: "Potion Pink", hint: "Red + Touch of Green/Blue" }
        ];

        // Tier 3: Complex colors (Hard)
        this.colorLibrary[3] = [
            { color: { r: 128, g: 128, b: 128 }, name: "Wizard Gray", hint: "Equal parts of all colors" },
            { color: { r: 192, g: 192, b: 192 }, name: "Silver Essence", hint: "Light gray - careful with ratios" },
            { color: { r: 160, g: 120, b: 80 }, name: "Ancient Brown", hint: "Red + Green, very little Blue" },
            { color: { r: 200, g: 160, b: 120 }, name: "Desert Sand", hint: "Brown with more Green" },
            { color: { r: 100, g: 100, b: 150 }, name: "Twilight Blue", hint: "Balanced with Blue emphasis" }
        ];

        // Tier 4: Very complex colors (Very Hard)
        this.colorLibrary[4] = [
            { color: { r: 180, g: 120, b: 160 }, name: "Mystic Rose", hint: "Specific Red-Green-Blue ratio" },
            { color: { r: 120, g: 180, b: 140 }, name: "Forest Sage", hint: "Green dominant, balanced others" },
            { color: { r: 140, g: 100, b: 180 }, name: "Amethyst", hint: "Blue-Red balance, less Green" },
            { color: { r: 200, g: 140, b: 100 }, name: "Terracotta", hint: "Warm earth tone" },
            { color: { r: 100, g: 140, b: 200 }, name: "Ocean Steel", hint: "Cool blue-gray" }
        ];

        // Tier 5: Expert colors (Frustrating!)
        this.colorLibrary[5] = [
            { color: { r: 150, g: 150, b: 150 }, name: "Perfect Gray", hint: "EXACT equal parts - very sensitive" },
            { color: { r: 220, g: 180, b: 140 }, name: "Ancient Beige", hint: "Very specific warm light tone" },
            { color: { r: 130, g: 170, b: 130 }, name: "Moss Green", hint: "Green with subtle Red/Blue balance" },
            { color: { r: 170, g: 130, b: 170 }, name: "Royal Mauve", hint: "Difficult purple-gray balance" },
            { color: { r: 140, g: 140, b: 180 }, name: "Twilight", hint: "Almost gray but blue-tinted" }
        ];
    }

    // Get difficulty tier based on level
    getDifficultyTier() {
        if (this.level <= 4) return 1;
        if (this.level <= 8) return 2;
        if (this.level <= 12) return 3;
        if (this.level <= 16) return 4;
        return 5;
    }

    // Initialize game state and UI
    initializeGame() {
        this.generateTargetColor();
        this.updateDisplay();
    }

    // Generate target color based on mode
    generateTargetColor() {
        switch (this.currentMode) {
            case 'daily':
                this.targetColor = { ...this.dailyChallenge.color };
                this.colorName = this.dailyChallenge.colorName;
                document.getElementById('targetTitle').textContent = '🎯 Daily Challenge';
                document.getElementById('feedbackHeader').textContent = 'Daily Challenge';
                break;
            case 'levels':
                const tier = this.getDifficultyTier();
                const colors = this.colorLibrary[tier] || [];
                const index = (this.level - 1) % colors.length;
                const target = colors[index];
                this.targetColor = { ...target.color };
                this.colorName = target.name;
                document.getElementById('targetTitle').textContent = `🎯 Level ${this.level}`;
                document.getElementById('feedbackHeader').textContent = `Level ${this.level}`;
                break;
            case 'picker':
                // No target initially; set by user
                document.getElementById('targetTitle').textContent = '🎯 Custom Color';
                document.getElementById('feedbackHeader').textContent = 'Color Picker';
                return; // Don't set colorName/hint here
        }

        // Update hint
        this.updateColorHint();
    }

    // Update color hint based on mode/level
    updateColorHint() {
        const colorHint = document.getElementById('colorHint');
        if (this.currentMode === 'levels' && this.frustrationLevels.includes(this.level)) {
            colorHint.textContent = "🤔 Tricky color - good luck!";
            colorHint.style.color = "#dc3545";
            colorHint.style.fontWeight = "bold";
        } else if (this.currentMode === 'picker') {
            colorHint.textContent = "Pick a color above or use random options";
            colorHint.style.color = "#6c757d";
            colorHint.style.fontWeight = "normal";
        } else {
            // Default hint from library or generic
            const hint = this.colorLibrary[this.getDifficultyTier()]?.find(c =>
                c.name === this.colorName
            )?.hint || "Mix colors to match the target";
            colorHint.textContent = hint;
            colorHint.style.color = "#6c757d";
            colorHint.style.fontWeight = "normal";
        }
    }

    // Set custom target from picker
    setCustomColor(hexColor) {
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        this.targetColor = { r, g, b };
        this.colorName = this.generateColorName(this.targetColor);
        this.updateDisplay();
        this.updateColorHint();

        const feedback = document.getElementById('feedback');
        feedback.innerHTML = `🎨 Target set: <strong>${this.colorName}</strong> (RGB: ${r},${g},${b})`;
        feedback.className = 'feedback info';
    }

    // Generate descriptive name for arbitrary color
    generateColorName(color) {
        const { r, g, b } = color;
        if (r > 200 && g > 200 && b > 200) return "Bright White";
        if (r < 50 && g < 50 && b < 50) return "Deep Black";
        if (r > g && r > b) return g > 150 ? "Warm Red" : "Vibrant Red";
        if (g > r && g > b) return r > 150 ? "Lime Green" : "Forest Green";
        if (b > r && b > g) return r > 150 ? "Royal Blue" : "Ocean Blue";
        if (Math.abs(r - g) < 30 && Math.abs(g - b) < 30) return "Neutral Gray";
        return "Mystery Color";
    }

    // Generate random target color
    generateRandomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        this.targetColor = { r, g, b };
        this.colorName = this.generateColorName(this.targetColor);
        this.updateDisplay();
        this.updateColorHint();

        const feedback = document.getElementById('feedback');
        feedback.innerHTML = `🎲 Random color: <strong>${this.colorName}</strong> (RGB: ${r},${g},${b})`;
        feedback.className = 'feedback info';
    }

    // Generate tricky challenge color (subtle variations)
    generateChallengeColor() {
        const base = Math.floor(Math.random() * 100) + 78;
        const variation = Math.floor(Math.random() * 40) - 20;
        const r = Math.max(0, Math.min(255, base + variation));
        const g = Math.max(0, Math.min(255, base + Math.floor(Math.random() * 40) - 20));
        const b = Math.max(0, Math.min(255, base + Math.floor(Math.random() * 40) - 20));
        this.targetColor = { r, g, b };
        this.colorName = "Challenge Color";
        this.updateDisplay();
        this.updateColorHint();

        const feedback = document.getElementById('feedback');
        feedback.innerHTML = `🤔 Challenge accepted! This one's tricky! (RGB: ${r},${g},${b})`;
        feedback.className = 'feedback info';
    }

    // Setup all event listeners for interactivity (refined for click reliability)
    setupEventListeners() {
        // Mode switching
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                if (mode === this.currentMode) return;

                // Update active class
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                // Switch mode
                this.currentMode = mode;
                document.getElementById('colorPickerSection').style.display = mode === 'picker' ? 'block' : 'none';
                document.getElementById('dailyChallenge').style.display = mode === 'daily' ? 'block' : 'none';

                // Reset and generate new target
                this.resetMix();
                this.tries = 0;
                document.getElementById('tries').textContent = '0';
                this.generateTargetColor();
                this.updateDisplay();
            });
        });

        // Color dropper interactions (enhanced with keydown for accessibility)
        document.querySelectorAll('.color-dropper').forEach((dropper, index) => {
            const color = dropper.dataset.color;

            // Click event
            dropper.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Clicked ${color}`); // Debug log
                this.addColor(color);
            });

            // Keyboard support
            dropper.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.addColor(color);
                }
            });

            // Drag and drop to mixing area
            dropper.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', color);
            });
        });

        const mixingArea = document.getElementById('mixingArea');
        mixingArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            mixingArea.classList.add('drag-over');
        });
        mixingArea.addEventListener('dragleave', () => {
            mixingArea.classList.remove('drag-over');
        });
        mixingArea.addEventListener('drop', (e) => {
            e.preventDefault();
            mixingArea.classList.remove('drag-over');
            const color = e.dataTransfer.getData('text/plain');
            this.addColor(color);
        });

        // Control buttons
        document.getElementById('checkBtn').addEventListener('click', () => this.checkMatch());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetMix());
        document.getElementById('hintBtn').addEventListener('click', () => this.giveHint());
        document.getElementById('setTargetBtn').addEventListener('click', () => {
            this.setCustomColor(document.getElementById('customColorPicker').value);
        });
        document.getElementById('randomColorBtn').addEventListener('click', () => this.generateRandomColor());
        document.getElementById('challengeColorBtn').addEventListener('click', () => this.generateChallengeColor());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.checkMatch();
            if (e.key === ' ') { e.preventDefault(); this.resetMix(); }
            if (e.key.toLowerCase() === 'h') this.giveHint();
        });

        // Share buttons (mock implementations)
        document.getElementById('shareTwitter').addEventListener('click', () => this.share('twitter'));
        document.getElementById('shareFacebook').addEventListener('click', () => this.share('facebook'));
        document.getElementById('copyLink').addEventListener('click', () => this.share('copy'));
        document.getElementById('modalShareTwitter').addEventListener('click', () => this.share('twitter'));
        document.getElementById('modalShareFacebook').addEventListener('click', () => this.share('facebook'));

        // Modal close/continue
        document.getElementById('nextLevelBtn').addEventListener('click', () => this.hideModal());

        // Success sound setup
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            // Audio not supported
        }
    }

    // Add a color drop to the mix (core fun mechanic: weighted average)
    addColor(color) {
        if (this.mixedColors.length >= this.maxTries) {
            const feedback = document.getElementById('feedback');
            feedback.innerHTML = '⚠️ Max drops reached! Check your mix or reset.';
            feedback.className = 'feedback error';
            return;
        }

        this.mixedColors.push(color);
        this.updateCurrentMix(); // Recalculate weighted average
        this.updateDisplay(); // Updates liquid height and color

        // Trigger swinging cauldron animation
        const cauldron = document.getElementById('cauldron');
        cauldron.classList.add('swing', 'bubbling'); // Add bubbles for interest
        setTimeout(() => {
            cauldron.classList.remove('swing', 'bubbling');
        }, 2000);

        // Enhanced vial pour animation with color-specific flair
        const dropper = document.querySelector(`[data-color="${color}"]`);
        const originalBg = dropper.style.background;
        dropper.style.transform = 'scale(0.95) rotate(-5deg)';
        dropper.style.background = color === 'red' ? '#ff0000' : color === 'green' ? '#00ff00' : '#0000ff'; // Brighter pour
        setTimeout(() => {
            dropper.style.transform = 'scale(1) rotate(0deg)';
            dropper.style.background = originalBg;
        }, 300);

        // Engaging feedback with RGB preview
        const { r, g, b } = this.currentMix;
        const feedback = document.getElementById('feedback');
        feedback.innerHTML = `✨ Poured ${color.charAt(0).toUpperCase() + color.slice(1)}! Current: rgb(${r},${g},${b})`;
        feedback.className = 'feedback info';
    }

    // Update current mix using weighted average for fun ratio experimentation
    updateCurrentMix() {
        const counts = { red: 0, green: 0, blue: 0 };
        this.mixedColors.forEach(c => counts[c]++);
        const total = this.mixedColors.length;

        if (total > 0) {
            this.currentMix.r = Math.round((counts.red * 255) / total);
            this.currentMix.g = Math.round((counts.green * 255) / total);
            this.currentMix.b = Math.round((counts.blue * 255) / total);
        } else {
            this.currentMix = { r: 0, g: 0, b: 0 };
        }
    }

    // Check if mix matches target (with progressive tolerance)
    checkMatch() {
        if (this.mixedColors.length === 0) {
            const feedback = document.getElementById('feedback');
            feedback.innerHTML = '🧪 Add some colors first to brew!';
            feedback.className = 'feedback error';
            return;
        }

        if (this.tries >= this.maxTries) {
            this.showGameOver(false);
            return;
        }

        this.tries++;
        document.getElementById('tries').textContent = this.tries;

        // Dynamic tolerance: Starts loose, tightens with level; frustration levels stricter
        let baseTolerance = this.getDifficultyTier() <= 2 ? 70 : 50;
        const levelAdjustment = Math.max(0, 60 - (this.level * 2));
        const frustrationPenalty = this.frustrationLevels.includes(this.level) ? 15 : 0;
        const tolerance = Math.max(10, baseTolerance + levelAdjustment - frustrationPenalty);

        const diff = this.colorDifference(this.currentMix, this.targetColor);
        const feedback = document.getElementById('feedback');

        if (diff <= tolerance) {
            let message = `🎉 Perfect brew! You crafted <strong>${this.colorName}</strong> in ${this.tries} tries! ✨`;
            if (this.frustrationLevels.includes(this.level)) {
                message = `🏆 Legendary! You conquered the elusive <strong>${this.colorName}</strong>! 🌟`;
            }
            feedback.innerHTML = message;
            feedback.className = 'feedback success';

            // Enhanced celebrate: swing + bubbles + scale
            const cauldron = document.getElementById('cauldron');
            cauldron.classList.add('swing', 'bubbling', 'celebrate');
            document.getElementById('targetColor').classList.add('celebrate');

            // Success sound
            this.playSuccessSound();

            setTimeout(() => {
                cauldron.classList.remove('swing', 'bubbling', 'celebrate');
                this.showGameOver(true);
            }, this.frustrationLevels.includes(this.level) ? 1500 : 1000);
        } else {
            const remaining = this.maxTries - this.tries;
            let message = `🔥 Almost! Distance: ${Math.round(diff)} (Tolerance: ${tolerance})`;
            if (this.frustrationLevels.includes(this.level) && remaining <= 3) {
                message += `<br>💡 Tweak those ratios—precision is key!`;
            }
            if (remaining <= 2) {
                message += `<br>⚠️ ${remaining} tries left—choose wisely!`;
            }
            feedback.innerHTML = message;
            feedback.className = 'feedback error';

            if (this.tries >= this.maxTries) {
                setTimeout(() => this.showGameOver(false), 1500);
            }
        }
    }

    // Provide contextual hint (costs a try)
    giveHint() {
        if (this.tries >= this.maxTries) {
            const feedback = document.getElementById('feedback');
            feedback.innerHTML = "❌ No hints left - out of tries! Reset to try again.";
            feedback.className = 'feedback error';
            return;
        }

        this.tries++;
        document.getElementById('tries').textContent = this.tries;

        let hint = "💡 Alchemical Insight: ";
        const { r, g, b } = this.targetColor;

        if (this.frustrationLevels.includes(this.level) || this.currentMode === 'picker') {
            hint += `Target RGB: R${r} G${g} B${b}. `;
            if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20) {
                hint += "Seek perfect balance—equal drops!";
            } else if (r > g && r > b) {
                hint += "Red dominates; pour more crimson essence.";
            } else if (g > r && g > b) {
                hint += "Green leads; verdant vibes ahead.";
            } else if (b > r && b > g) {
                hint += "Blue reigns; oceanic depths call.";
            } else {
                hint += "Two forces clash—harmonize them!";
            }
        } else {
            hint += this.colorLibrary[this.getDifficultyTier()]?.find(c => c.name === this.colorName)?.hint || "Experiment boldly with ratios!";
        }

        const feedback = document.getElementById('feedback');
        feedback.innerHTML = hint;
        feedback.className = 'feedback info';
    }

    // Euclidean distance for color difference
    colorDifference(color1, color2) {
        const dr = color1.r - color2.r;
        const dg = color1.g - color2.g;
        const db = color1.b - color2.b;
        return Math.sqrt(dr * dr + dg * dg + db * db);
    }

    // Play short success chime
    playSuccessSound() {
        if (!this.audioContext) return;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        const baseFreq = this.frustrationLevels.includes(this.level) ? 300 : 400;
        oscillator.frequency.value = baseFreq + (Math.random() * 100);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.15);
    }

    // Show completion/failure modal
    showGameOver(success) {
        const modal = document.getElementById('gameOverModal');
        const finalTries = document.getElementById('finalTries');
        const finalScoreElem = document.getElementById('finalScore');
        const finalRank = document.getElementById('finalRank');
        const scoreLabel1 = document.getElementById('scoreLabel1');
        const scoreValue1 = document.getElementById('scoreValue1');
        const scoreLabelTotal = document.getElementById('scoreLabelTotal');
        const modalTitle = document.getElementById('modalTitle');
        const shareMessage = document.getElementById('shareMessage');

        finalTries.textContent = this.tries;

        if (success) {
            // Calculate score: Base + efficiency + level/frustration bonus
            const baseScore = 100;
            const efficiency = Math.max(0, this.maxTries - this.tries);
            const efficiencyPoints = efficiency * 10; // Higher reward for fewer tries
            const levelBonus = this.level * 5;
            const frustrationBonus = this.frustrationLevels.includes(this.level) ? 50 : 0;
            const totalScore = baseScore + efficiencyPoints + levelBonus + frustrationBonus;
            finalScoreElem.textContent = totalScore;

            // Mode-specific modal content
            let title, label1, value1, labelTotal, shareMsg, rank = '-';
            switch (this.currentMode) {
                case 'daily':
                    title = '🎉 Daily Challenge Complete!';
                    label1 = 'Color:';
                    value1 = this.colorName;
                    labelTotal = 'Daily Score:';
                    shareMsg = '🎊 Share your daily achievement with friends!';
                    rank = `#${Math.floor(Math.random() * 200) + 1}`;
                    this.completeDailyChallenge(totalScore);
                    break;
                case 'levels':
                    title = `🎉 Level ${this.level} Complete!`;
                    label1 = 'Level:';
                    value1 = this.level;
                    labelTotal = 'Level Score:';
                    shareMsg = `🎮 Share your Level ${this.level} achievement!`;
                    break;
                case 'picker':
                    title = '🎉 Color Matched!';
                    label1 = 'Color:';
                    value1 = this.colorName;
                    labelTotal = 'Score:';
                    shareMsg = '🎨 Share your color creation skills!';
                    break;
            }

            modalTitle.textContent = title;
            scoreLabel1.textContent = label1;
            scoreValue1.textContent = value1;
            scoreLabelTotal.textContent = labelTotal;
            shareMessage.textContent = shareMsg;
            finalRank.textContent = rank;

            modal.style.display = 'flex';
        } else {
            // Failure: Show reveal and reset after delay
            const feedback = document.getElementById('feedback');
            let message = `❌ Out of tries! The elusive color was <strong>${this.colorName}</strong>.`;
            if (this.frustrationLevels.includes(this.level)) {
                message += `<br>That was a true test of mastery—sharpen your skills!`;
            }
            feedback.innerHTML = message;
            feedback.className = 'feedback error';
            setTimeout(() => this.resetLevel(), 2500);
        }
    }

    // Mark daily as complete and update stats
    completeDailyChallenge(score) {
        this.dailyChallenge.completed = true;
        this.dailyChallenge.tries = this.tries;
        this.dailyChallenge.score = score;
        this.dailyChallenge.players += Math.floor(Math.random() * 50) + 20;
        this.playerStats.dailyCompletions++;
        this.playerStats.totalGames++;
        this.saveDailyChallenge();
        this.savePlayerStats();
    }

    // Hide modal and advance/reset
    hideModal() {
        document.getElementById('gameOverModal').style.display = 'none';
        if (this.currentMode === 'levels') {
            this.levelUp();
        } else {
            this.resetLevel();
        }
    }

    // Advance to next level
    levelUp() {
        this.level = Math.min(this.level + 1, this.totalLevels);
        this.resetLevel();
        let message = `🚀 Ascend to Level ${this.level}! Brew <strong>${this.colorName}</strong>`;
        if (this.frustrationLevels.includes(this.level)) {
            message = `🔥 Enter the Forge: Challenge Level ${this.level}! <strong>${this.colorName}</strong> beckons!`;
        }
        const feedback = document.getElementById('feedback');
        feedback.innerHTML = message;
        feedback.className = 'feedback info';
    }

    // Reset current level/mix
    resetLevel() {
        this.tries = 0;
        this.resetMix();
        document.getElementById('tries').textContent = '0';
        this.generateTargetColor();
        this.updateDisplay();

        const feedback = document.getElementById('feedback');
        feedback.innerHTML = `🔄 The cauldron awaits! Brew <strong>${this.colorName}</strong>`;
        feedback.className = 'feedback info';
    }

    // Clear current mix
    resetMix() {
        this.mixedColors = [];
        this.currentMix = { r: 0, g: 0, b: 0 };
        this.updateDisplay();

        const feedback = document.getElementById('feedback');
        feedback.innerHTML = '🧪 Cauldron cleansed! Begin your alchemy anew.';
        feedback.className = 'feedback info';
        setTimeout(() => {
            feedback.innerHTML = 'Drag or click colors to brew—watch the magic unfold!';
            feedback.className = 'feedback info';
        }, 1500);

        // Clear animations
        document.getElementById('targetColor').classList.remove('celebrate');
        document.getElementById('currentMix').classList.remove('celebrate');
        document.getElementById('cauldron').classList.remove('swing', 'bubbling');
    }

    // Update all UI elements
    updateDisplay() {
        // Stats
        document.getElementById('level').textContent = this.level;
        document.getElementById('tries').textContent = this.tries;

        // Target color
        const targetElem = document.getElementById('targetColor');
        targetElem.style.background = this.rgbToString(this.targetColor || { r: 0, g: 0, b: 0 });
        document.getElementById('colorName').textContent = this.colorName;

        // Current mix - update color and liquid height
        const mixElem = document.getElementById('currentMix');
        mixElem.style.background = this.rgbToString(this.currentMix);
        const totalDrops = this.mixedColors.length;
        const fillHeight = totalDrops > 0 ? Math.min(70, (totalDrops / this.maxTries) * 70) : 0;
        mixElem.style.height = `${fillHeight}px`;

        // Mix composition
        const composition = document.getElementById('mixComposition');
        if (this.mixedColors.length > 0) {
            const counts = { red: 0, green: 0, blue: 0 };
            this.mixedColors.forEach(c => counts[c]++);
            const parts = Object.entries(counts)
                .filter(([, count]) => count > 0)
                .map(([color, count]) => `${count} ${color.charAt(0).toUpperCase() + color.slice(1)}`)
                .join(' + ');
            composition.textContent = `Cauldron: ${parts} (${totalDrops}/${this.maxTries})`;
        } else {
            composition.textContent = 'Drag or click colors below to pour';
        }
    }

    // Convert RGB to CSS string
    rgbToString(rgb) {
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }

    // Mock share functionality
    share(platform) {
        const message = `I just brewed ${this.colorName} in Color Alchemy! Score: ${document.getElementById('finalScore')?.textContent || 'Epic'}. Join the magic! #ColorAlchemy`;
        // In production, integrate actual sharing APIs
        if (platform === 'copy') {
            navigator.clipboard.writeText(message);
            alert('Brew shared—copied to clipboard! 🧪');
        } else {
            alert(`Sharing your brew to ${platform}: ${message}`);
        }
        this.playerStats.shares++;
        this.savePlayerStats();
    }
}

// Initialize game on DOM load
document.addEventListener('DOMContentLoaded', () => {
    new ColorAlchemyGame();
});