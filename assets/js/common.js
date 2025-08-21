document.addEventListener('DOMContentLoaded', () => {
    // ベースパス（/pages/ 配下かどうかで相対パスを切替）
    const isInPages = /\/pages\//.test(location.pathname);
    const base = isInPages ? '..' : '.';

    // ヘッダー/フッター読み込み
    Promise.all([
        fetch(`${base}/common/header.html`).then(r => r.ok ? r.text() : ''),
        fetch(`${base}/common/footer.html`).then(r => r.ok ? r.text() : '')
    ]).then(([headerHtml, footerHtml]) => {
        const headerEl = document.getElementById('header');
        const footerEl = document.getElementById('footer');
        if (headerEl && headerHtml) headerEl.innerHTML = headerHtml;
        if (footerEl && footerHtml) footerEl.innerHTML = footerHtml;
        const yearElement = document.getElementById('copyright-year');
        if (yearElement) yearElement.textContent = String(new Date().getFullYear());

        // フッター内ナビのリンクを現在の深さに合わせて書き換え
        const to = (p) => `${base}/${p.replace(/^\//, '')}`;
        document.querySelectorAll('.nav__link').forEach((a) => {
            const name = a.textContent?.trim();
            switch (name) {
                case 'スキャン': a.href = to('/pages/scan.html'); break;
                case '一覧': a.href = to('/pages/summary.html'); break;
                case '設定': a.href = to('/pages/settings.html'); break;
                case '履歴': a.href = to('/pages/history.html'); break;
                case 'ダッシュボード': a.href = to('/index.html'); break;
                default: break;
            }
        });
    }).catch(() => {});
}); 