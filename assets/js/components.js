// コンポーネント専用スクリプト（将来拡張用）
(function() {
    // 例: トースト、モーダル等
    window.showToast = function(message, opts = {}) {
        const containerId = 'toast-container';
        let container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        const div = document.createElement('div');
        div.className = 'toast' + (opts.error ? ' toast--error' : '');
        div.textContent = message;
        container.appendChild(div);
        // 次フレームで表示
        requestAnimationFrame(() => div.classList.add('toast--show'));
        const duration = opts.duration ?? 1500;
        setTimeout(() => {
            div.classList.remove('toast--show');
            setTimeout(() => div.remove(), 250);
        }, duration);
    };

    // Web Audio API によるビープ再生
    const AUDIO = { ctx: null };
    function ensureAudioContext() {
        if (!AUDIO.ctx) {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return null;
            AUDIO.ctx = new Ctx();
        }
        if (AUDIO.ctx.state === 'suspended') {
            // 再開はユーザー操作時に行う
        }
        return AUDIO.ctx;
    }
    function unlockAudio() {
        const ctx = ensureAudioContext();
        if (!ctx) return;
        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
        }
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('click', unlockAudio);
    }
    // 初回ジェスチャーで解放
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });
    window.addEventListener('click', unlockAudio, { once: true });

    window.beep = function(frequency = 880, durationSec = 0.08, volume = 0.06) {
        const ctx = ensureAudioContext();
        if (!ctx) return;
        if (ctx.state === 'suspended') {
            // まだ解放されていない場合はスキップ
            return;
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = frequency;
        gain.gain.value = volume;
        osc.connect(gain);
        gain.connect(ctx.destination);
        const now = ctx.currentTime;
        osc.start(now);
        osc.stop(now + durationSec);
    };

    // Vibration API 対応可否
    window.isVibrateSupported = function() {
        return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
    };
})(); 