class ColorAlchemyGame {
    constructor() {
        this.level = 1;
        this.totalLevels = 20;
        this.tries = 0;
        this.bestScore = this.getStoredBestScore();
        this.currentMix = { r: 0, g: 0, b: 0 };
        this.targetColor = null;
        this.colorName = '';
        this.mixedColors = [];
        this.maxTries = 8;
        this.frustrationLevels = [5, 8, 12, 15, 18];
        this.colorLibrary = {};

        this.initializeColorLibrary();
        this.initializeGame();
        this.setupEventListeners();
    }

    initializeColorLibrary() {
        // Level 1-4: Basic secondary colors (Easy)
        this.colorLibrary[1] = [
            { color: { r: 255, g: 255, b: 0 }, name: "Golden Yellow", hint: "Red + Green" },
            { color: { r: 255, g: 0, b: 255 }, name: "Magical Magenta", hint: "Red + Blue" },
            { color: { r: 0, g: 255, b: 255 }, name: "Enchanted Cyan", hint: "Green + Blue" }
        ];

        // Level 5-8: Tertiary colors & simple mixes (Medium)
        this.colorLibrary[2] = [
            { color: { r: 255, g: 128, b: 0 }, name: "Alchemy Orange", hint: "Mostly Red + Some Green" },
            { color: { r: 128, g: 0, b: 255 }, name: "Royal Purple", hint: "Mostly Blue + Some Red" },
            { color: { r: 0, g: 255, b: 128 }, name: "Mystic Mint", hint: "Mostly Green + Some Blue" },
            { color: { r: 255, g: 255, b: 128 }, name: "Light Elixir", hint: "Yellow + More Green" },
            { color: { r: 255, g: 128, b: 128 }, name: "Potion Pink", hint: "Red + Touch of Green/Blue" }
        ];

        // Level 9-12: Complex colors (Hard)
        this.colorLibrary[3] = [
            { color: { r: 128, g: 128, b: 128 }, name: "Wizard Gray", hint: "Equal parts of all colors" },
            { color: { r: 192, g: 192, b: 192 }, name: "Silver Essence", hint: "Light gray - careful with ratios" },
            { color: { r: 160, g: 120, b: 80 }, name: "Ancient Brown", hint: "Red + Green, very little Blue" },
            { color: { r: 200, g: 160, b: 120 }, name: "Desert Sand", hint: "Brown with more Green" },
            { color: { r: 100, g: 100, b: 150 }, name: "Twilight Blue", hint: "Balanced with Blue emphasis" }
        ];

        // Level 13-16: Very complex colors (Very Hard)
        this.colorLibrary[4] = [
            { color: { r: 180, g: 120, b: 160 }, name: "Mystic Rose", hint: "Specific Red-Green-Blue ratio" },
            { color: { r: 120, g: 180, b: 140 }, name: "Forest Sage", hint: "Green dominant, balanced others" },
            { color: { r: 140, g: 100, b: 180 }, name: "Amethyst", hint: "Blue-Red balance, less Green" },
            { color: { r: 200, g: 140, b: 100 }, name: "Terracotta", hint: "Warm earth tone" },
            { color: { r: 100, g: 140, b: 200 }, name: "Ocean Steel", hint: "Cool blue-gray" }
        ];

        // Level 17-20: Expert colors (Frustrating!)
        this.colorLibrary[5] = [
            { color: { r: 150, g: 150, b: 150 }, name: "Perfect Gray", hint: "EXACT equal parts - very sensitive" },
            { color: { r: 220, g: 180, b: 140 }, name: "Ancient Beige", hint: "Very specific warm light tone" },
            { color: { r: 130, g: 170, b: 130 }, name: "Moss Green", hint: "Green with subtle Red/Blue balance" },
            { color: { r: 170, g: 130, b: 170 }, name: "Royal Mauve", hint: "Difficult purple-gray balance" },
            { color: { r: 140, g: 140, b: 180 }, name: "Twilight", hint: "Almost gray but blue-tinted" }
        ];
    }

    getDifficultyTier() {
        if (this.level <= 4) return 1;
        if (this.level <= 8) return 2;
        if (this.level <= 12) return 3;
        if (this.level <= 16) return 4;
        return 5;
    }

    initializeGame() {
        this.generateTargetColor();
        this.updateDisplay();
        this.updateBestScore();
    }

    getStoredBestScore() {
        return localStorage.getItem('colorAlchemyBestScore') || '-';
    }

    updateBestScore() {
        document.getElementById('best').textContent = this.bestScore;
    }

    generateTargetColor() {
        const tier = this.getDifficultyTier();
        const colors = this.colorLibrary[tier];
        const index = (this.level - 1) % colors.length;

        const target = colors[index];
        this.targetColor = target.color;
        this.colorName = target.name;

        // Update color hint based on level difficulty
        const colorHint = document.getElementById('colorHint');
        if (this.frustrationLevels.includes(this.level)) {
            colorHint.textContent = "🤔 Tricky color - good luck!";
            colorHint.style.color = "#dc3545";
            colorHint.style.fontWeight = "bold";
        } else {
            colorHint.textContent = target.hint;
            colorHint.style.color = "#6c757d";
            colorHint.style.fontWeight = "normal";
        }
    }

    setupEventListeners() {
        const mixingArea = document.getElementById('mixingArea');
        const colorDroppers = document.querySelectorAll('.color-dropper');
        const mixButtons = document.querySelectorAll('.mix-btn');
        const checkBtn = document.getElementById('checkBtn');
        const resetBtn = document.getElementById('resetBtn');
        const hintBtn = document.getElementById('hintBtn');
        const nextLevelBtn = document.getElementById('nextLevelBtn');

        // Drag and drop events
        colorDroppers.forEach(dropper => {
            dropper.addEventListener('dragstart', this.handleDragStart.bind(this));
        });

        mixingArea.addEventListener('dragover', this.handleDragOver.bind(this));
        mixingArea.addEventListener('dragenter', this.handleDragEnter.bind(this));
        mixingArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        mixingArea.addEventListener('drop', this.handleDrop.bind(this));

        // Mix button events
        mixButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                this.mixColor(color);
            });
        });

        // Control button events
        checkBtn.addEventListener('click', this.checkMatch.bind(this));
        resetBtn.addEventListener('click', this.resetMix.bind(this));
        hintBtn.addEventListener('click', this.giveHint.bind(this));
        nextLevelBtn.addEventListener('click', this.hideModal.bind(this));

        // Touch events for mobile
        colorDroppers.forEach(dropper => {
            dropper.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleTouchStart(e, dropper.dataset.color);
            });
        });

        mixingArea.addEventListener('touchend', this.handleTouchEnd.bind(this));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') this.mixColor('red');
            if (e.key === 'g' || e.key === 'G') this.mixColor('green');
            if (e.key === 'b' || e.key === 'B') this.mixColor('blue');
            if (e.key === 'Enter') this.checkMatch();
            if (e.key === ' ') {
                e.preventDefault();
                this.resetMix();
            }
            if (e.key === 'h' || e.key === 'H') this.giveHint();
        });
    }

    handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.color);
        e.dataTransfer.effectAllowed = 'copy';
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }

    handleDragEnter(e) {
        e.preventDefault();
        e.target.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.target.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        e.target.classList.remove('drag-over');

        const color = e.dataTransfer.getData('text/plain');
        this.mixColor(color);
    }

    handleTouchStart(e, color) {
        this.touchColor = color;
    }

    handleTouchEnd(e) {
        if (this.touchColor && e.target.id === 'mixingArea') {
            this.mixColor(this.touchColor);
            this.touchColor = null;
        }
    }

    mixColor(color) {
        if (this.tries >= this.maxTries) {
            this.showGameOver(false);
            return;
        }

        this.mixedColors.push(color);

        // Enhanced mixing algorithm with progressive complexity
        let mix = { r: 0, g: 0, b: 0 };

        // Count colors
        const colorCount = {
            red: this.mixedColors.filter(c => c === 'red').length,
            green: this.mixedColors.filter(c => c === 'green').length,
            blue: this.mixedColors.filter(c => c === 'blue').length
        };

        // Base values - these create the core colors
        mix.r = Math.min(255, colorCount.red * 85);      // 3 reds = 255
        mix.g = Math.min(255, colorCount.green * 85);    // 3 greens = 255
        mix.b = Math.min(255, colorCount.blue * 85);     // 3 blues = 255

        // Add color interaction effects (more complex in higher levels)
        if (this.level >= 8) {
            // Red-Green interaction creates yellows/oranges
            if (colorCount.red > 0 && colorCount.green > 0) {
                const interaction = Math.min(colorCount.red, colorCount.green) * 10;
                mix.r = Math.min(255, mix.r + interaction);
                mix.g = Math.min(255, mix.g + interaction);
            }

            // Red-Blue interaction creates purples
            if (colorCount.red > 0 && colorCount.blue > 0) {
                const interaction = Math.min(colorCount.red, colorCount.blue) * 8;
                mix.r = Math.min(255, mix.r + interaction);
                mix.b = Math.min(255, mix.b + interaction);
            }

            // Green-Blue interaction creates cyans
            if (colorCount.green > 0 && colorCount.blue > 0) {
                const interaction = Math.min(colorCount.green, colorCount.blue) * 8;
                mix.g = Math.min(255, mix.g + interaction);
                mix.b = Math.min(255, mix.b + interaction);
            }
        }

        // Add frustration elements for specific levels
        if (this.frustrationLevels.includes(this.level)) {
            // Make colors less predictable
            const noise = (Math.random() - 0.5) * 15;
            mix.r = Math.max(0, Math.min(255, mix.r + noise));
            mix.g = Math.max(0, Math.min(255, mix.g + noise));
            mix.b = Math.max(0, Math.min(255, mix.b + noise));
        }

        this.currentMix = mix;
        this.updateDisplay();
        this.playMixSound();
    }

    playMixSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Different sounds for frustration levels
            const baseFreq = this.frustrationLevels.includes(this.level) ? 300 : 400;
            oscillator.frequency.value = baseFreq + (Math.random() * 100);
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
        } catch (e) {
            // Audio not supported
        }
    }

    checkMatch() {
        if (this.tries >= this.maxTries) {
            this.showGameOver(false);
            return;
        }

        this.tries++;
        document.getElementById('tries').textContent = this.tries;

        // Progressive difficulty - tighter tolerance for higher levels
        const baseTolerance = this.getDifficultyTier() <= 2 ? 70 : 50;
        const frustrationBonus = this.frustrationLevels.includes(this.level) ? 10 : 0;
        const tolerance = baseTolerance - (this.level * 1.5) + frustrationBonus;

        const diff = this.colorDifference(this.currentMix, this.targetColor);

        const feedback = document.getElementById('feedback');

        if (diff <= tolerance) {
            let message = `🎉 Perfect! You made <strong>${this.colorName}</strong>!`;

            // Special messages for frustration levels
            if (this.frustrationLevels.includes(this.level)) {
                message = `🏆 AMAZING! You beat the tricky <strong>${this.colorName}</strong>!`;
            }

            feedback.innerHTML = message;
            feedback.className = 'feedback success';

            document.getElementById('targetColor').classList.add('celebrate');
            document.getElementById('currentMix').classList.add('celebrate');

            setTimeout(() => {
                this.showGameOver(true);
            }, this.frustrationLevels.includes(this.level) ? 1200 : 800);
        } else {
            const remainingTries = this.maxTries - this.tries;
            let message = `Not quite right! Difference: ${Math.round(diff)}`;

            // Frustration level hints
            if (this.frustrationLevels.includes(this.level) && remainingTries <= 3) {
                message += `<br>💡 This is a tricky one! Try different ratios.`;
            }

            if (remainingTries <= 2) {
                message += `<br>⚠️ Only ${remainingTries} tries left!`;
            }

            feedback.innerHTML = message;
            feedback.className = 'feedback error';

            if (this.tries >= this.maxTries) {
                setTimeout(() => {
                    this.showGameOver(false);
                }, 1000);
            }
        }
    }

    giveHint() {
        if (this.tries >= this.maxTries) {
            document.getElementById('feedback').innerHTML = "❌ No hints available! Out of tries.";
            document.getElementById('feedback').className = 'feedback error';
            return;
        }

        // Cost 1 try for using hint
        this.tries++;
        document.getElementById('tries').textContent = this.tries;

        const tier = this.getDifficultyTier();
        const colors = this.colorLibrary[tier];
        const index = (this.level - 1) % colors.length;
        const target = colors[index];

        let hintMessage = "💡 Hint: ";

        if (this.frustrationLevels.includes(this.level)) {
            // More specific hints for frustration levels
            const r = this.targetColor.r;
            const g = this.targetColor.g;
            const b = this.targetColor.b;

            hintMessage += `Target: R${r} G${g} B${b}. `;

            if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20) {
                hintMessage += "This is a balanced color - need equal parts!";
            } else if (r > g && r > b) {
                hintMessage += "Red is dominant here";
            } else if (g > r && g > b) {
                hintMessage += "Green is dominant here";
            } else if (b > r && b > g) {
                hintMessage += "Blue is dominant here";
            } else {
                hintMessage += "Two colors are competing for dominance";
            }
        } else {
            hintMessage += target.hint;
        }

        document.getElementById('feedback').innerHTML = hintMessage;
        document.getElementById('feedback').className = 'feedback info';
    }

    colorDifference(color1, color2) {
        const dr = color1.r - color2.r;
        const dg = color1.g - color2.g;
        const db = color1.b - color2.b;
        return Math.sqrt(dr * dr + dg * dg + db * db);
    }

    showGameOver(success) {
        const modal = document.getElementById('gameOverModal');
        const finalLevel = document.getElementById('finalLevel');
        const finalTries = document.getElementById('finalTries');
        const finalScore = document.getElementById('finalScore');

        finalLevel.textContent = this.level;
        finalTries.textContent = this.tries;

        if (success) {
            const baseScore = 100;
            const efficiency = Math.max(0, this.maxTries - this.tries);
            const efficiencyPoints = efficiency * 8;
            const levelBonus = this.level * 10;
            const frustrationBonus = this.frustrationLevels.includes(this.level) ? 50 : 0;
            const totalScore = baseScore + efficiencyPoints + levelBonus + frustrationBonus;

            finalScore.textContent = totalScore;

            if (this.bestScore === '-' || totalScore > this.bestScore) {
                this.bestScore = totalScore;
                localStorage.setItem('colorAlchemyBestScore', totalScore);
                this.updateBestScore();
            }

            modal.style.display = 'flex';
        } else {
            let message = `❌ Game Over! The color was <strong>${this.colorName}</strong>.`;

            if (this.frustrationLevels.includes(this.level)) {
                message += `<br>That was a tricky one! Don't give up!`;
            }

            document.getElementById('feedback').innerHTML = message;
            document.getElementById('feedback').className = 'feedback error';

            setTimeout(() => {
                this.resetLevel();
            }, 2500);
        }
    }

    hideModal() {
        document.getElementById('gameOverModal').style.display = 'none';
        this.levelUp();
    }

    levelUp() {
        this.level++;
        this.tries = 0;
        this.resetMix();
        this.generateTargetColor();
        this.updateDisplay();

        let message = `🚀 Level ${this.level}! Match <strong>${this.colorName}</strong>`;

        if (this.frustrationLevels.includes(this.level)) {
            message = `🔥 Challenge Level ${this.level}! <strong>${this.colorName}</strong> awaits!`;
        }

        document.getElementById('feedback').innerHTML = message;
        document.getElementById('feedback').className = 'feedback info';
    }

    resetLevel() {
        this.tries = 0;
        this.resetMix();
        this.updateDisplay();

        document.getElementById('feedback').innerHTML =
            `🔄 Try again! Match <strong>${this.colorName}</strong>`;
        document.getElementById('feedback').className = 'feedback info';
    }

    resetMix() {
        this.currentMix = { r: 0, g: 0, b: 0 };
        this.mixedColors = [];
        this.updateDisplay();

        document.getElementById('feedback').innerHTML = 'Colors reset! Start fresh.';
        document.getElementById('feedback').className = 'feedback info';
        setTimeout(() => {
            document.getElementById('feedback').innerHTML = 'Mix colors to match the target!';
            document.getElementById('feedback').className = 'feedback';
        }, 1500);

        document.getElementById('targetColor').classList.remove('celebrate');
        document.getElementById('currentMix').classList.remove('celebrate');
    }

    updateDisplay() {
        // Update stats
        document.getElementById('level').textContent = this.level;
        document.getElementById('tries').textContent = this.tries;

        // Update target color
        const targetElement = document.getElementById('targetColor');
        targetElement.style.background = this.rgbToString(this.targetColor);
        document.getElementById('colorName').textContent = this.colorName;

        // Update current mix
        const currentMixElement = document.getElementById('currentMix');
        currentMixElement.style.background = this.rgbToString(this.currentMix);

        // Update mix composition display
        const mixComposition = document.getElementById('mixComposition');
        if (this.mixedColors.length > 0) {
            const colorCount = {
                red: this.mixedColors.filter(c => c === 'red').length,
                green: this.mixedColors.filter(c => c === 'green').length,
                blue: this.mixedColors.filter(c => c === 'blue').length
            };

            const parts = [];
            if (colorCount.red > 0) parts.push(`${colorCount.red} Red`);
            if (colorCount.green > 0) parts.push(`${colorCount.green} Green`);
            if (colorCount.blue > 0) parts.push(`${colorCount.blue} Blue`);

            mixComposition.textContent = `Mix: ${parts.join(' + ')}`;
        } else {
            mixComposition.textContent = 'Drag or click colors below';
        }
    }

    rgbToString(rgb) {
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ColorAlchemyGame();
});