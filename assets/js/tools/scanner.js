(function() {
    const KEY_SETTINGS = 'inventory.settings';
    const KEY_COUNTS = 'inventory.counts';
    const KEY_HISTORY = 'inventory.history';
    const HISTORY_LIMIT = 1000;

    let stream = null;
    let currentDeviceId = null;
    let isRunning = true;
    let canvas = null;
    let ctx = null;
    let currentFacing = 'environment';
    const lastScanByModel = {};

    function emitCountsUpdated() {
        try {
            const event = new CustomEvent('counts:updated');
            window.dispatchEvent(event);
        } catch (_) {}
    }

    function canCountNow(model, cooldownMs) {
        const now = Date.now();
        const last = lastScanByModel[model] || 0;
        if (now - last < cooldownMs) return false;
        lastScanByModel[model] = now;
        return true;
    }

    async function getBackCamera() {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videos = devices.filter(d => d.kind === 'videoinput');
        const back = videos.find(d => /back|rear|environment/i.test(d.label)) || videos[0];
        return back ? back.deviceId : null;
    }

    async function startWithConstraints(constraints) {
        const video = document.getElementById('preview');
        const s = await navigator.mediaDevices.getUserMedia({ video: constraints, audio: false });
        stream = s;
        video.srcObject = s;
        await video.play();
        const settings = s.getVideoTracks()[0]?.getSettings?.();
        if (settings?.facingMode) currentFacing = settings.facingMode;
        if (settings?.deviceId) currentDeviceId = settings.deviceId;
        isRunning = true;
        loopDecode();
    }

    async function startCamera() {
        try {
            await startWithConstraints({ facingMode: { exact: 'environment' } });
        } catch (e1) {
            try {
                await startWithConstraints({ facingMode: 'environment' });
            } catch (e2) {
                try {
                    const deviceId = currentDeviceId || await getBackCamera();
                    if (deviceId) {
                        await startWithConstraints({ deviceId });
                    } else {
                        await startWithConstraints(true);
                    }
                } catch (e3) {
                    document.getElementById('status').textContent = 'カメラ起動に失敗しました（HTTPSでアクセスしているか確認してください）';
                }
            }
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
            stream = null;
        }
        isRunning = false;
    }

    async function switchCamera() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videos = devices.filter(d => d.kind === 'videoinput');
            if (videos.length < 2) {
                currentFacing = currentFacing === 'environment' ? 'user' : 'environment';
                stopCamera();
                await startWithConstraints({ facingMode: currentFacing });
                return;
            }
            const idx = videos.findIndex(v => v.deviceId === currentDeviceId);
            const next = videos[(idx + 1) % videos.length];
            currentDeviceId = next.deviceId;
            stopCamera();
            await startWithConstraints({ deviceId: currentDeviceId });
        } catch (_) {
            try {
                currentFacing = currentFacing === 'environment' ? 'user' : 'environment';
                stopCamera();
                await startWithConstraints({ facingMode: currentFacing });
            } catch (_) {}
        }
    }

    function loadSettings() {
        const defaults = { extraction: { startIndex: 50 }, scan: { cooldownMs: 100, beep: true, vibrate: true } };
        try { return JSON.parse(localStorage.getItem(KEY_SETTINGS) || 'null') || defaults; } catch (_) { return defaults; }
    }

    function addHistory(entry) {
        const arr = JSON.parse(localStorage.getItem(KEY_HISTORY) || '[]');
        arr.push(entry);
        const trimmed = arr.slice(-HISTORY_LIMIT);
        localStorage.setItem(KEY_HISTORY, JSON.stringify(trimmed));
    }

    function incCount(model, delta, raw) {
        const counts = JSON.parse(localStorage.getItem(KEY_COUNTS) || '{}');
        const current = parseInt(counts[model] || '0', 10) || 0;
        const next = Math.max(0, Math.min(999999, current + delta));
        counts[model] = next;
        localStorage.setItem(KEY_COUNTS, JSON.stringify(counts));
        addHistory({ ts: Date.now(), model, delta, raw });
        emitCountsUpdated();
    }

    let lastTs = 0;
    function maybeBeepVibrate(settings) {
        try { if (settings.scan?.beep && window.beep) window.beep(1200, 0.06, 0.05); } catch(_){ }
        try { if (settings.scan?.vibrate && navigator.vibrate) navigator.vibrate(30); } catch(_){ }
    }

    function loopDecode() {
        const statusEl = document.getElementById('status');
        const video = document.getElementById('preview');
        const settings = loadSettings();
        if (!window.jsQR) {
            statusEl.textContent = 'ライブラリ読み込み失敗（jsQR）';
            return;
        }
        if (!canvas) {
            canvas = document.createElement('canvas');
            ctx = canvas.getContext('2d');
        }
        const tick = () => {
            if (!isRunning) return;
            if (video.readyState >= 2) {
                const w = video.videoWidth;
                const h = video.videoHeight;
                if (w && h) {
                    const scale = Math.min(1, 640 / Math.max(w, h));
                    const cw = Math.max(1, Math.floor(w * scale));
                    const ch = Math.max(1, Math.floor(h * scale));
                    canvas.width = cw;
                    canvas.height = ch;
                    ctx.drawImage(video, 0, 0, cw, ch);
                    const imageData = ctx.getImageData(0, 0, cw, ch);
                    const result = jsQR(imageData.data, cw, ch, { inversionAttempts: 'dontInvert' });
                    if (result && result.data) {
                        const raw = String(result.data);
                        const n = settings.extraction?.startIndex ?? 50;
                        const model = (raw || '').slice(n).trim();
                        const cooldown = settings.scan?.cooldownMs ?? 100;
                        if (model) {
                            if (!canCountNow(model, cooldown)) {
                                // 同一型番のクールダウン中は無視
                            } else {
                                incCount(model, +1, raw);
                                maybeBeepVibrate(settings);
                                lastTs = Date.now();
                                statusEl.textContent = `${model} を+1`;
                                if (window.showToast) window.showToast(`${model} を+1`);
                            }
                        }
                    }
                }
            }
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);

        const fileInput = document.getElementById('file-input');
        fileInput?.addEventListener('change', async (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const settings = loadSettings();
            try {
                const url = URL.createObjectURL(file);
                const img = new Image();
                img.onload = () => {
                    const scale = Math.min(1, 1024 / Math.max(img.width, img.height));
                    const cw = Math.max(1, Math.floor(img.width * scale));
                    const ch = Math.max(1, Math.floor(img.height * scale));
                    canvas.width = cw;
                    canvas.height = ch;
                    ctx.drawImage(img, 0, 0, cw, ch);
                    const imageData = ctx.getImageData(0, 0, cw, ch);
                    const result = jsQR(imageData.data, cw, ch, { inversionAttempts: 'dontInvert' });
                    if (result && result.data) {
                        const raw = String(result.data);
                        const n = settings.extraction?.startIndex ?? 50;
                        const model = (raw || '').slice(n).trim();
                        const cooldown = settings.scan?.cooldownMs ?? 100;
                        if (model) {
                            if (!canCountNow(model, cooldown)) {
                                // 同一型番のクールダウン中は無視
                            } else {
                                incCount(model, +1, raw);
                                maybeBeepVibrate(settings);
                                statusEl.textContent = `${model} を+1（画像）`;
                                if (window.showToast) window.showToast(`${model} を+1（画像）`);
                            }
                        } else {
                            statusEl.textContent = '抽出結果が空（開始位置を見直してください）';
                            if (window.showToast) window.showToast('抽出結果が空', { error: true });
                        }
                    } else {
                        statusEl.textContent = '画像からQRを検出できませんでした';
                        if (window.showToast) window.showToast('画像からQRを検出できませんでした', { error: true });
                    }
                    URL.revokeObjectURL(url);
                };
                img.onerror = () => {
                    statusEl.textContent = '画像の読み込みに失敗しました';
                    if (window.showToast) window.showToast('画像の読み込みに失敗しました', { error: true });
                    URL.revokeObjectURL(url);
                };
                img.src = url;
            } catch (_) {
                statusEl.textContent = '画像解析でエラーが発生しました';
                if (window.showToast) window.showToast('画像解析でエラーが発生しました', { error: true });
            }
        });

        document.addEventListener('keydown', (ev) => {
            if (!isRunning) return;
            if (ev.key === 'Enter') {
                const settings = loadSettings();
                const raw = prompt('デバッグ用: QR RAW を入力してください');
                if (raw != null) {
                    const n = settings.extraction?.startIndex ?? 50;
                    const model = (raw || '').slice(n).trim();
                    const cooldown = settings.scan?.cooldownMs ?? 100;
                    if (model) {
                        if (!canCountNow(model, cooldown)) {
                            // 同一型番のクールダウン中は無視
                        } else {
                            incCount(model, +1, raw);
                            maybeBeepVibrate(settings);
                            document.getElementById('status').textContent = `${model} を+1`;
                            if (window.showToast) window.showToast(`${model} を+1`);
                        }
                    }
                }
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        const statusEl = document.getElementById('status');
        if (!window.isSecureContext && location.hostname !== 'localhost') {
            statusEl.textContent = 'カメラはHTTPS環境でのみ動作します（GitHub Pages等でhttpsアクセスしてください）';
            return;
        }
        if (!navigator.mediaDevices?.getUserMedia) {
            statusEl.textContent = 'この端末/ブラウザはカメラに対応していません';
            return;
        }
        document.getElementById('btn-toggle')?.addEventListener('click', () => {
            if (isRunning) {
                stopCamera();
                document.getElementById('btn-toggle').textContent = '再開';
            } else {
                startCamera();
                document.getElementById('btn-toggle').textContent = '停止';
            }
        });
        document.getElementById('btn-switch')?.addEventListener('click', switchCamera);
        startCamera();
    });
})(); 