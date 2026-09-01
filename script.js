/* ==========================================================================
   Interactive Engine for Romantic Envelope & Pop-Up Letter App
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const envelopeWrapper = document.getElementById('envelope-wrapper');
    const letterOverlay = document.getElementById('letter-overlay');
    const soundToggle = document.getElementById('sound-toggle');
    const soundIcon = document.getElementById('sound-icon');
    const bgMusic = document.getElementById('bg-music');

    // Buttons
    const btnSendLove = document.getElementById('btn-send-love');
    const btnCloseLetter = document.getElementById('btn-close-letter');

    // State Variables
    let isOpened = false;
    let soundEnabled = true;
    let audioCtx = null;

    // Set initial audio volume
    if (bgMusic) {
        bgMusic.volume = 0.6;
    }

    // Initialize Web Audio API for sound effects
    function getAudioContext() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    // Play High-Quality Background Music
    function startRomanticMusic() {
        if (!soundEnabled || !bgMusic) return;
        bgMusic.play().catch(err => {
            console.log("Audio play prevented until user interaction", err);
        });
    }

    function stopRomanticMusic() {
        if (bgMusic) {
            bgMusic.pause();
        }
    }

    // Play Synthesized Wax Seal Crack Chime Sound
    function playSealBreakSound() {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;

            const osc = ctx.createOscillator();
            const oscGain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.25);

            oscGain.gain.setValueAtTime(0.2, now);
            oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            osc.connect(oscGain);
            oscGain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.35);
        } catch (e) { }
    }

    // Open Envelope Flow
    function openEnvelope() {
        if (isOpened) return;
        isOpened = true;

        envelopeWrapper.classList.remove('bouncing');
        envelopeWrapper.classList.add('opened');

        playSealBreakSound();
        startRomanticMusic();

        const rect = envelopeWrapper.getBoundingClientRect();
        createBurstParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);

        // After flap opens (600ms), reveal the full letter card modal in the center
        setTimeout(() => {
            if (letterOverlay) {
                letterOverlay.classList.add('active');
            }
        }, 600);
    }

    // Close Envelope Flow
    function closeEnvelope() {
        if (!isOpened) return;
        isOpened = false;

        if (letterOverlay) {
            letterOverlay.classList.remove('active');
        }

        setTimeout(() => {
            envelopeWrapper.classList.remove('opened');
            setTimeout(() => {
                envelopeWrapper.classList.add('bouncing');
            }, 600);
        }, 300);
    }

    // Event Listeners
    envelopeWrapper.addEventListener('click', (e) => {
        if (e.target.closest('.btn')) return;
        if (!isOpened) {
            openEnvelope();
        }
    });

    if (btnCloseLetter) {
        btnCloseLetter.addEventListener('click', (e) => {
            e.stopPropagation();
            closeEnvelope();
        });
    }

    // Sound Toggle Handler
    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        if (soundEnabled) {
            soundIcon.textContent = '🎵';
            soundToggle.childNodes[1].nodeValue = ' Music On';
            startRomanticMusic();
        } else {
            soundIcon.textContent = '🔇';
            soundToggle.childNodes[1].nodeValue = ' Music Off';
            stopRomanticMusic();
        }
    });

    // Heart Burst Action ("Send a Kiss")
    if (btnSendLove) {
        btnSendLove.addEventListener('click', (e) => {
            e.stopPropagation();
            startRomanticMusic();

            for (let i = 0; i < 6; i++) {
                setTimeout(() => {
                    const x = Math.random() * window.innerWidth;
                    const y = Math.random() * (window.innerHeight * 0.8) + window.innerHeight * 0.1;
                    createBurstParticles(x, y, 28);
                }, i * 140);
            }
        });
    }

    // ==========================================================================
    // Ambient Particle Canvas Engine
    // ==========================================================================
    const ambientCanvas = document.getElementById('ambient-canvas');
    const ambCtx = ambientCanvas.getContext('2d');

    function resizeCanvas() {
        ambientCanvas.width = window.innerWidth;
        ambientCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const particles = [];
    const numParticles = 35;

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * ambientCanvas.width;
            this.y = ambientCanvas.height + Math.random() * 100;
            this.size = Math.random() * 14 + 8;
            this.speedY = Math.random() * 0.8 + 0.3;
            this.speedX = Math.sin(Math.random() * Math.PI) * 0.5;
            this.opacity = Math.random() * 0.6 + 0.2;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.02;
            this.isHeart = Math.random() > 0.4;
        }

        update() {
            this.y -= this.speedY;
            this.x += Math.sin(this.y * 0.01) * 0.4;
            this.rotation += this.rotSpeed;

            if (this.y < -30) {
                this.reset();
            }
        }

        draw() {
            ambCtx.save();
            ambCtx.translate(this.x, this.y);
            ambCtx.rotate(this.rotation);
            ambCtx.globalAlpha = this.opacity;

            if (this.isHeart) {
                ambCtx.fillStyle = '#ff6b8b';
                ambCtx.beginPath();
                const s = this.size * 0.6;
                ambCtx.moveTo(0, s * 0.3);
                ambCtx.bezierCurveTo(-s, -s * 0.5, -s * 1.5, s * 0.5, 0, s * 1.4);
                ambCtx.bezierCurveTo(s * 1.5, s * 0.5, s, -s * 0.5, 0, s * 0.3);
                ambCtx.fill();
            } else {
                const grad = ambCtx.createRadialGradient(0, 0, 0, 0, 0, this.size);
                grad.addColorStop(0, 'rgba(255, 220, 230, 0.8)');
                grad.addColorStop(1, 'rgba(255, 105, 135, 0)');
                ambCtx.fillStyle = grad;
                ambCtx.beginPath();
                ambCtx.arc(0, 0, this.size, 0, Math.PI * 2);
                ambCtx.fill();
            }
            ambCtx.restore();
        }
    }

    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
    }

    function animateAmbient() {
        ambCtx.clearRect(0, 0, ambientCanvas.width, ambientCanvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateAmbient);
    }
    animateAmbient();

    // ==========================================================================
    // Heart Burst Canvas Engine
    // ==========================================================================
    const burstCanvas = document.getElementById('burst-canvas');
    const burstCtx = burstCanvas.getContext('2d');

    function resizeBurstCanvas() {
        burstCanvas.width = window.innerWidth;
        burstCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeBurstCanvas);
    resizeBurstCanvas();

    let burstParticles = [];

    function createBurstParticles(originX, originY, count = 30) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            burstParticles.push({
                x: originX,
                y: originY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.5,
                size: Math.random() * 16 + 10,
                opacity: 1,
                gravity: 0.12,
                rotation: Math.random() * Math.PI * 2,
                color: ['#e63946', '#ff4d6d', '#ff758f', '#ffb3c1', '#ffd700'][Math.floor(Math.random() * 5)]
            });
        }
    }

    function animateBurst() {
        burstCtx.clearRect(0, 0, burstCanvas.width, burstCanvas.height);

        for (let i = burstParticles.length - 1; i >= 0; i--) {
            const p = burstParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.opacity -= 0.018;

            if (p.opacity <= 0) {
                burstParticles.splice(i, 1);
                continue;
            }

            burstCtx.save();
            burstCtx.translate(p.x, p.y);
            burstCtx.rotate(p.rotation);
            burstCtx.globalAlpha = p.opacity;

            burstCtx.fillStyle = p.color;
            burstCtx.beginPath();
            const s = p.size * 0.5;
            burstCtx.moveTo(0, s * 0.3);
            burstCtx.bezierCurveTo(-s, -s * 0.5, -s * 1.5, s * 0.5, 0, s * 1.4);
            burstCtx.bezierCurveTo(s * 1.5, s * 0.5, s, -s * 0.5, 0, s * 0.3);
            burstCtx.fill();

            burstCtx.restore();
        }

        requestAnimationFrame(animateBurst);
    }
    animateBurst();
});
