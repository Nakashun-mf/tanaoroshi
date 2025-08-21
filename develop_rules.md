#### **1. 基本原則**

- **目的:** 本仕様書は、`pryzo tools` の開発における技術的要件、規約、品質プロセスを定義する。全てのコード生成タスクは本仕様書に厳格に従うこと。
- **技術スタック:**
    - **使用許可技術:** `HTML5`, `CSS3`, `JavaScript (ES6+)`。
    - **禁止事項:**  `Node.js` 等の追加ビルド環境を要する技術の使用は禁止する。
    - **外部ライブラリ:** CDN経由での読み込みに限り、使用を許可する。

#### **2. ファイル仕様**

- **文字コード:** `UTF-8` (BOM無し) に統一すること。
- **改行コード:** `LF` に統一すること。
- **インデント:** 半角スペース4つに統一すること。タブ文字の使用は禁止する。

#### **3. プロジェクト構造**

- **ディレクトリ構成:**
    ```
    project-root/
    ├── index.html                 # メインページ
    ├── pages/                     # 各ツールページ
    │   ├── tool1.html
    │   ├── tool2.html
    │   └── ...
    ├── common/                    # 共通コンポーネント
    │   ├── header.html
    │   ├── footer.html
    │   └── navigation.html
    ├── assets/                    # 静的リソース
    │   ├── css/
    │   │   ├── common.css         # 共通スタイル
    │   │   ├── components.css     # コンポーネントスタイル
    │   │   └── pages.css          # ページ固有スタイル
    │   ├── js/
    │   │   ├── common.js          # 共通スクリプト
    │   │   ├── components.js      # コンポーネントスクリプト
    │   │   └── tools/             # 各ツール固有スクリプト
    │   │       ├── tool1.js
    │   │       └── tool2.js
    │   ├── images/                # 画像ファイル
    │   └── icons/                 # アイコンファイル
    ├── docs/                      # ドキュメント
    │   ├── README.md
    │   ├── API.md                 # API仕様書
    │   └── CHANGELOG.md           # 変更履歴
    └── tests/                     # テストファイル
        ├── unit/
        └── integration/
    ```

#### **4. 共通コンポーネントの動的読み込み**

- **共通化:** ヘッダー、フッター等の共通HTMLブロックは、外部ファイル (`header.html`, `footer.html` 等) として作成し、JavaScriptの `fetch API` を用いて動的に読み込み、各ページに挿入すること。
        
- **読み込み用JavaScript (`common.js`):**
    - **実装コード:** 以下のロジックを共通JSファイルに実装し、全ページから読み込むこと。
        
        JavaScript
        
        ```
        document.addEventListener('DOMContentLoaded', () => {
          // フッター読み込みとコピーライト設定
          fetch('/common/footer.html') // フッターHTMLのパスは適宜調整
            .then(response => {
              if (!response.ok) throw new Error('Network response was not ok');
              return response.text();
            })
            .then(data => {
              document.querySelector('footer').innerHTML = data;
              // コピーライトの年をJSで設定
              const yearElement = document.getElementById('copyright-year');
              if (yearElement) {
                yearElement.textContent = new Date().getFullYear();
              }
            })
            .catch(error => console.error('Error fetching footer:', error));
        
          // 他の共通要素（ヘッダーなど）の読み込みも同様に実装
        });
        ```
        

#### **5. コーディング規約**

- **命名規則:**
    - **CSS:** BEM (`.block__element--modifier`) に厳格に従うこと。
    - **JavaScript:** 変数/関数は `camelCase`、定数は `UPPER_SNAKE_CASE`、クラスは `PascalCase` とする。
    - **ファイル:** `kebab-case` (`example-tool.js`) とする。
- **JavaScript実装:**
    - **スコープ:** グローバルスコープの汚染を防止するため、各スクリプトはモジュールとして扱うか、即時実行関数 `(function() { ... })();` でラップすること。
- **デバッグ**
  - logか起動時のターミナルのみでデバッグができる構成とし、開発タブのコンソールだけでも同様にデバッグができる構成とすること。

#### **6. HTMLテンプレート規約**

- **基本構造:** 全てのHTMLファイルは以下の基本構造に従うこと：
    ```html
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ページタイトルs</title>
        <meta name="description" content="ページの説明">
        <link rel="stylesheet" href="/assets/css/common.css">
        <link rel="stylesheet" href="/assets/css/components.css">
        <link rel="stylesheet" href="/assets/css/pages.css">
    </head>
    <body>
        <header id="header"></header>
        <main>
            <!-- ページコンテンツ -->
        </main>
        <footer id="footer"></footer>
        <script src="/assets/js/common.js"></script>
        <script src="/assets/js/components.js"></script>
    </body>
    </html>
    ```

#### **7. CSS設計規約**

- **アーキテクチャ:** ITCSS（Inverted Triangle CSS）に基づく設計とする：
    - **Settings:** 変数、設定値
    - **Tools:** ミックスイン、関数
    - **Generic:** リセット、ベーススタイル
    - **Elements:** HTML要素のスタイル
    - **Objects:** レイアウト、構造
    - **Components:** UIコンポーネント
    - **Utilities:** ユーティリティクラス

- **レスポンシブデザイン:**
    - **ブレークポイント:** 
        - モバイル: `max-width: 767px`
        - タブレット: `min-width: 768px` and `max-width: 1023px`
        - デスクトップ: `min-width: 1024px`

#### **8. JavaScript設計規約**

- **モジュール化:** 各機能は独立したモジュールとして実装し、必要に応じてイベント駆動で連携すること。
- **エラーハンドリング:** 全ての非同期処理には適切なエラーハンドリングを実装すること。
- **パフォーマンス:** DOM操作は最小限に抑え、必要に応じてデバウンスやスロットリングを実装すること。

#### **9. デバッグ・開発支援規約**

- **ファイル分割戦略:**
    - **機能別分割:** 各機能は独立したJSファイルとして実装し、必要に応じて動的読み込みを行うこと。
    - **ページ別分割:** 各ページ固有の機能は `pages/` ディレクトリ配下に配置すること。
    - **コンポーネント別分割:** 再利用可能なコンポーネントは `components/` ディレクトリ配下に配置すること。

- **デバッグ環境別監視システム:**
    - **Python環境:** ターミナル出力とlogファイルによる監視
    - **その他環境（JavaScript/HTML/CSS）:** 開発タブのコンソールとlogファイルによる監視
    - **共通:** 全ての環境でlogファイルによる永続的なログ記録

- **Python環境デバッグ実装:**
    - **ターミナル出力:** 以下のコードを `debug_utils.py` として実装すること：
        ```python
        import logging
        import sys
        from datetime import datetime
        import os
        
        class PythonDebugLogger:
            def __init__(self, log_file_path="debug.log"):
                self.log_file_path = log_file_path
                self.setup_logging()
            
            def setup_logging(self):
                # ログフォーマット設定
                formatter = logging.Formatter(
                    '%(asctime)s - %(levelname)s - %(message)s',
                    datefmt='%Y-%m-%d %H:%M:%S'
                )
                
                # ファイルハンドラー設定
                file_handler = logging.FileHandler(self.log_file_path, encoding='utf-8')
                file_handler.setLevel(logging.DEBUG)
                file_handler.setFormatter(formatter)
                
                # コンソールハンドラー設定
                console_handler = logging.StreamHandler(sys.stdout)
                console_handler.setLevel(logging.INFO)
                console_handler.setFormatter(formatter)
                
                # ロガー設定
                self.logger = logging.getLogger('PythonDebug')
                self.logger.setLevel(logging.DEBUG)
                self.logger.addHandler(file_handler)
                self.logger.addHandler(console_handler)
            
            def debug(self, message, data=None):
                """デバッグレベルのログ（ファイルのみ）"""
                if data:
                    self.logger.debug(f"{message} - Data: {data}")
                else:
                    self.logger.debug(message)
            
            def info(self, message, data=None):
                """情報レベルのログ（ターミナルとファイル）"""
                if data:
                    self.logger.info(f"{message} - Data: {data}")
                else:
                    self.logger.info(message)
            
            def warning(self, message, data=None):
                """警告レベルのログ（ターミナルとファイル）"""
                if data:
                    self.logger.warning(f"{message} - Data: {data}")
                else:
                    self.logger.warning(message)
            
            def error(self, message, error=None):
                """エラーレベルのログ（ターミナルとファイル）"""
                if error:
                    self.logger.error(f"{message} - Error: {str(error)}")
                else:
                    self.logger.error(message)
            
            def performance(self, operation, duration):
                """パフォーマンス測定ログ"""
                self.logger.info(f"Performance - {operation}: {duration:.2f}ms")
        
        # グローバルインスタンス
        debug_logger = PythonDebugLogger()
        ```

- **JavaScript環境デバッグ実装:**
    - **開発モード検出:** 以下のコードで開発環境を検出し、デバッグ機能を有効化すること：
        ```javascript
        const IS_DEVELOPMENT = window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1' ||
                              window.location.search.includes('debug=true');
        ```
    
    - **統合デバッグシステム:** 以下のデバッグユーティリティを `debug-utils.js` として実装すること：
        ```javascript
        class DebugLogger {
            constructor() {
                this.isEnabled = IS_DEVELOPMENT;
                this.logLevel = IS_DEVELOPMENT ? 'debug' : 'error';
                this.logFile = 'debug.log';
                this.setupLogFile();
            }
            
            setupLogFile() {
                // ログファイルへの書き込み準備
                this.logQueue = [];
                this.flushInterval = setInterval(() => this.flushLogs(), 5000);
            }
            
            async writeToLogFile(level, message, data = null) {
                const timestamp = new Date().toISOString();
                const logEntry = {
                    timestamp,
                    level,
                    message,
                    data,
                    url: window.location.href,
                    userAgent: navigator.userAgent
                };
                
                this.logQueue.push(logEntry);
                
                // 開発環境では即座にファイルに書き込み
                if (IS_DEVELOPMENT) {
                    await this.flushLogs();
                }
            }
            
            async flushLogs() {
                if (this.logQueue.length === 0) return;
                
                try {
                    const logs = this.logQueue.map(entry => 
                        `${entry.timestamp} - ${entry.level.toUpperCase()} - ${entry.message}${entry.data ? ` - Data: ${JSON.stringify(entry.data)}` : ''}`
                    ).join('\n');
                    
                    // File System Access APIを使用（対応ブラウザのみ）
                    if ('showSaveFilePicker' in window) {
                        const handle = await window.showSaveFilePicker({
                            suggestedName: this.logFile,
                            types: [{
                                description: 'Log files',
                                accept: { 'text/plain': ['.log'] }
                            }]
                        });
                        const writable = await handle.createWritable();
                        await writable.write(logs + '\n');
                        await writable.close();
                    } else {
                        // フォールバック: ダウンロードリンクでログを保存
                        const blob = new Blob([logs], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = this.logFile;
                        a.click();
                        URL.revokeObjectURL(url);
                    }
                    
                    this.logQueue = [];
                } catch (error) {
                    console.error('Failed to write to log file:', error);
                }
            }
            
            log(message, data = null) {
                if (this.isEnabled) {
                    console.log(`[DEBUG] ${message}`, data);
                    this.writeToLogFile('debug', message, data);
                }
            }
            
            error(message, error = null) {
                console.error(`[ERROR] ${message}`, error);
                this.writeToLogFile('error', message, error);
            }
            
            warn(message, data = null) {
                if (this.isEnabled) {
                    console.warn(`[WARN] ${message}`, data);
                    this.writeToLogFile('warn', message, data);
                }
            }
            
            info(message, data = null) {
                if (this.isEnabled) {
                    console.info(`[INFO] ${message}`, data);
                    this.writeToLogFile('info', message, data);
                }
            }
            
            group(label) {
                if (this.isEnabled) {
                    console.group(label);
                    this.writeToLogFile('group', `Group: ${label}`);
                }
            }
            
            groupEnd() {
                if (this.isEnabled) {
                    console.groupEnd();
                    this.writeToLogFile('group', 'Group End');
                }
            }
            
            performance(operation, duration) {
                const message = `Performance - ${operation}: ${duration.toFixed(2)}ms`;
                if (this.isEnabled) {
                    console.log(`[PERF] ${message}`);
                }
                this.writeToLogFile('performance', message);
            }
        }
        
        const debugLogger = new DebugLogger();
        ```

- **外部化・設定管理:**
    - **設定ファイル:** 環境別設定を `config/` ディレクトリ配下に配置すること：
        ```
        config/
        ├── development.js    # 開発環境設定
        ├── production.js     # 本番環境設定
        └── common.js         # 共通設定
        ```
    
    - **設定読み込み:** 以下のコードで環境別設定を動的読み込みすること：
        ```javascript
        class ConfigManager {
            constructor() {
                this.config = {};
                this.loadConfig();
            }
            
            async loadConfig() {
                const env = IS_DEVELOPMENT ? 'development' : 'production';
                try {
                    const commonConfig = await import(`/config/common.js`);
                    const envConfig = await import(`/config/${env}.js`);
                    this.config = { ...commonConfig.default, ...envConfig.default };
                    debugLogger.log('Config loaded', this.config);
                } catch (error) {
                    debugLogger.error('Failed to load config', error);
                }
            }
            
            get(key) {
                return this.config[key];
            }
        }
        
        const configManager = new ConfigManager();
        ```

- **モジュール動的読み込み:**
    - **遅延読み込み:** ページ固有の機能は必要時に動的読み込みすること：
        ```javascript
        class ModuleLoader {
            constructor() {
                this.loadedModules = new Set();
            }
            
            async loadModule(moduleName) {
                if (this.loadedModules.has(moduleName)) {
                    debugLogger.log(`Module ${moduleName} already loaded`);
                    return;
                }
                
                try {
                    debugLogger.log(`Loading module: ${moduleName}`);
                    const module = await import(`/assets/js/modules/${moduleName}.js`);
                    this.loadedModules.add(moduleName);
                    debugLogger.log(`Module ${moduleName} loaded successfully`);
                    return module;
                } catch (error) {
                    debugLogger.error(`Failed to load module: ${moduleName}`, error);
                    throw error;
                }
            }
        }
        
        const moduleLoader = new ModuleLoader();
        ```

- **エラー監視・報告:**
    - **グローバルエラーハンドラー:** 以下のコードを `error-handler.js` として実装すること：
        ```javascript
        class ErrorHandler {
            constructor() {
                this.setupGlobalErrorHandling();
            }
            
            setupGlobalErrorHandling() {
                window.addEventListener('error', (event) => {
                    this.handleError(event.error, event.filename, event.lineno);
                });
                
                window.addEventListener('unhandledrejection', (event) => {
                    this.handleError(event.reason, 'Promise rejection');
                });
            }
            
            handleError(error, source, lineNumber) {
                debugLogger.error('Global error caught', {
                    error: error.message,
                    stack: error.stack,
                    source,
                    lineNumber,
                    url: window.location.href,
                    userAgent: navigator.userAgent
                });
                
                // 本番環境では外部サービスに送信
                if (!IS_DEVELOPMENT) {
                    this.reportError(error, source, lineNumber);
                }
            }
            
            reportError(error, source, lineNumber) {
                // 外部エラー報告サービスの実装
                // 例: Sentry, LogRocket等
            }
        }
        
        const errorHandler = new ErrorHandler();
        ```

- **パフォーマンス監視:**
    - **パフォーマンス測定:** 以下のコードを `performance-monitor.js` として実装すること：
        ```javascript
        class PerformanceMonitor {
            constructor() {
                this.metrics = {};
            }
            
            startTimer(name) {
                this.metrics[name] = performance.now();
                debugLogger.log(`Timer started: ${name}`);
            }
            
            endTimer(name) {
                if (this.metrics[name]) {
                    const duration = performance.now() - this.metrics[name];
                    debugLogger.performance(name, duration);
                    delete this.metrics[name];
                    return duration;
                }
            }
            
            measurePageLoad() {
                window.addEventListener('load', () => {
                    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                    debugLogger.performance('Page load', loadTime);
                });
            }
        }
        
        const performanceMonitor = new PerformanceMonitor();
        ```

- **開発者ツール統合:**
    - **コンソールコマンド:** 開発環境でのみ利用可能なデバッグコマンドを実装すること：
        ```javascript
        if (IS_DEVELOPMENT) {
            window.debugTools = {
                reloadConfig: () => configManager.loadConfig(),
                showLoadedModules: () => console.log(moduleLoader.loadedModules),
                clearCache: () => {
                    localStorage.clear();
                    sessionStorage.clear();
                    console.log('Cache cleared');
                },
                testError: () => {
                    throw new Error('Test error for debugging');
                },
                downloadLogs: () => debugLogger.flushLogs(),
                showPerformance: () => console.log(performanceMonitor.metrics)
            };
            
            console.log('Debug tools available. Use window.debugTools to access them.');
        }
        ```

- **デバッグ用HTML構造:**
    - **開発環境表示:** 開発環境でのみ表示されるデバッグ情報を実装すること：
        ```html
        <!-- 開発環境でのみ表示 -->
        <div id="debug-panel" style="display: none;">
            <div class="debug-info">
                <h3>Debug Information</h3>
                <p>Environment: <span id="env-info"></span></p>
                <p>Loaded Modules: <span id="modules-info"></span></p>
                <p>Config: <span id="config-info"></span></p>
                <p>Log File: <span id="log-file-info"></span></p>
            </div>
        </div>
        
        <script>
            if (IS_DEVELOPMENT) {
                document.getElementById('debug-panel').style.display = 'block';
                document.getElementById('env-info').textContent = 'Development';
                document.getElementById('log-file-info').textContent = 'debug.log';
            }
        </script>
        ```

#### **10. SEO・メタデータ要件**

- **実装箇所:** 全てのSEO関連タグは、各ページの静的なHTMLファイル内の `<head>` セクションに直接記述すること（JSでの動的生成は避ける）。
- **必須メタタグ:**
    - `charset`
    - `viewport`
    - `title`
    - `description`
    - `robots`
    - `canonical`

#### **11. 品質・性能要件**

- **ブラウザサポート:**
    - **定義:** `Google Chrome`, `Firefox`, `Safari`, `Edge`。
    - **バージョン:** 各ブラウザの最新メジャーバージョンおよび、その1つ前のバージョン。
- **アクセシビリティ:**
    - **目標:** `WCAG 2.1` 達成基準レベル `AA` に準拠すること。
    - **実装:** セマンティックHTML、適切なARIA属性、キーボードナビゲーション対応
- **パフォーマンス:**
    - **目標:** `Google PageSpeed Insights` のCore Web Vitals全指標で「良好」を達成するコードを生成すること。
    - **CLS対策:** JavaScriptによるコンポーネントの動的読み込みでレイアウトシフトが発生しないよう、読み込み先のコンテナ要素 (`<header>`, `<footer>`等) に、あらかじめCSSで `min-height` を設定しておくこと。

#### **12. テスト要件**

- **単体テスト:** 各JavaScriptモジュールには単体テストを実装すること。
- **統合テスト:** ページ間の連携、共通コンポーネントの動作確認を行うこと。
- **ブラウザテスト:** サポート対象ブラウザでの動作確認を必須とする。

#### **13. ドキュメント要件**

- **README.md:** プロジェクトの概要、セットアップ手順、使用方法を記載すること。
- **API.md:** 各ツールのAPI仕様、パラメータ、戻り値を記載すること。
- **CHANGELOG.md:** バージョンごとの変更履歴を記載すること。

#### **14. デプロイ要件**

- **環境:** 静的ファイルホスティング（GitHub Pages、Netlify等）での動作を前提とする。
- **設定:** `.htaccess`（Apache）または `_redirects`（Netlify）でSPA対応のルーティング設定を行うこと。

#### **15. バージョン管理規約**

- **ブランチモデル:** `main`, `develop`, `feature/*`, `fix/*` のブランチモデルを適用すること。
- **コミットメッセージ:**
    - **ルール:** `Conventional Commits` 規約に準拠したコミットメッセージを生成すること。
    - **例:** `feat: 共通フッターの動的読み込み機能を実装`, `fix(script): 特定条件下での計算エラーを修正`
- **タグ:** リリース時にはセマンティックバージョニングに従ったタグを付与すること。

#### **16. セキュリティ要件**

- **XSS対策:** ユーザー入力の適切なサニタイゼーションを実装すること。
- **CSRF対策:** 必要に応じてトークンベースの保護を実装すること。
- **HTTPS:** 本番環境ではHTTPS通信を必須とする。

#### **17. 監視・ログ要件**

- **エラーログ:** JavaScriptエラーは適切にログ出力し、必要に応じて外部サービスに送信すること。
- **パフォーマンス監視:** Core Web Vitalsの監視を実装すること。