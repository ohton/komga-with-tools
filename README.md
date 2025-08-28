## プロジェクト概要

このリポジトリは、Komga と連携するためのツール群を含んでいます。

- chrome-extension-comicinfo: ComicInfo 生成 Chrome 拡張機能

### 主な機能

- `chrome-extension-comicinfo` : Komga で扱える書籍情報入りファイルである CBZ/CBR に含まれる ComicInfo.xml に準じた形式の XML ファイルを電子書籍販売サイト情報から取得・保存する Chrome 機能拡張
  - 拡張機能のポップアップ UI から「表示中のサイト上の情報取得」「情報編集」「情報を反映した XML ファイルのダウンロード」を行う

### 利用方法

#### chrome-extension-comicinfo

1. releaseから `chrome-extension-comicinfo.vXXX.zip` をダウンロードし、任意の場所に展開する
2. Chromeで `chrome://extensions/` を開く
3. 「デベロッパーモード」をONにする
4. 「パッケージ化されていない拡張機能を読み込む」→ ZIPの展開先ディレクトリを選択
5. 対応サイトの詳細ページを開く
6. 拡張機能アイコンをクリックし、ポップアップを表示
7. 自動または「ローディング」ボタンでフォームに情報を自動入力
8. 項目を手動編集（特にNumber(巻数)は自動入力未対応なので要修正）
9. 「ダウンロード」ボタンでComicInfo形式のxmlファイルをダウンロード

### 開発・ビルド

1. `chrome-extension-comicinfo/` ディレクトリで依存パッケージをインストール
   ```sh
   cd chrome-extension-comicinfo
   npm install
   ```
2. TypeScript のビルド
   ```sh
   npm run build
   ```
3. Chrome の「デベロッパーモード」で `chrome-extension-comicinfo/` ディレクトリを読み込むことでデバッグ可能

---

Komga: https://komga.org/
