document.addEventListener('DOMContentLoaded', () => {
    // ヘッダー/フッター読み込み
    Promise.all([
        fetch('/common/header.html').then(r => r.ok ? r.text() : ''),
        fetch('/common/footer.html').then(r => r.ok ? r.text() : '')
    ]).then(([headerHtml, footerHtml]) => {
        const headerEl = document.getElementById('header');
        const footerEl = document.getElementById('footer');
        if (headerEl && headerHtml) headerEl.innerHTML = headerHtml;
        if (footerEl && footerHtml) footerEl.innerHTML = footerHtml;
        const yearElement = document.getElementById('copyright-year');
        if (yearElement) yearElement.textContent = String(new Date().getFullYear());
    }).catch(() => {});
}); 