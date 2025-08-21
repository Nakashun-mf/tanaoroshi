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
})(); 