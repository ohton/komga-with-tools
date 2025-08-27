
# Comic Info Downloader（Chrome拡張機能）

このプロジェクトは、ComicInfo.xmlファイルをWebページから自動生成・ダウンロードするChrome拡張機能です。TypeScriptで実装されています。

主な対応サイト：
- メロンブックス
- FANZAブックス（DMMブックス）
- DMM同人
- 虎の穴

各サイトの詳細ページから書誌情報を抽出し、ComicInfo.xml形式でダウンロードできます。


## ディレクトリ構成

```
chrome-extension-comicinfo/
├── src/
│   ├── background.ts        # 拡張機能のライフサイクル・イベント管理
│   ├── content.ts           # Webページ連携用スクリプト
│   ├── popup/
│   │   ├── popup.html       # ポップアップUI
│   │   ├── popup.ts         # ポップアップのロジック
│   │   └── styles.css       # ポップアップ用スタイル
│   └── types/
│       └── index.ts         # 型定義
├── images/                  # アイコン画像
├── affinity design/         # デザイン素材
├── manifest.json            # Chrome拡張機能設定
├── package.json             # npm設定
├── tsconfig.json            # TypeScript設定
└── README.md                # このドキュメント
```


## セットアップ手順

1. **リポジトリをクローン**
   ```zsh
   git clone <repository-url>
   cd komga_with_tools/chrome-extension-comicinfo
   ```
2. **依存パッケージをインストール**
   ```zsh
   npm install
   ```
3. **TypeScriptでビルド**
   ```zsh
   npm run build
   ```
4. **Chromeに拡張機能を読み込む**
   - Chromeで `chrome://extensions/` を開く
   - 「デベロッパーモード」をON
   - 「パッケージ化されていない拡張機能を読み込む」→ `chrome-extension-comicinfo` ディレクトリを選択


## 使い方

1. 対応サイトの詳細ページを開く
2. 拡張機能アイコンをクリックし、ポップアップを表示
3. 「ローディング」ボタンでフォームに情報を自動入力
4. 「ダウンロード」ボタンでComicInfo.xmlファイルをダウンロード

### 対応サイト
- メロンブックス
- FANZAブックス（DMMブックス）
- DMM同人
- 虎の穴

### 主な機能
- ページから書誌情報（タイトル、著者、サークル、タグ、シリーズ、発行日など）を抽出
- ComicInfo.xml形式でダウンロード
- 年齢区分（AgeRating）を自動判定


## ライセンス

MIT License