## プロジェクト概要

このリポジトリは、Komga と連携するためのツール群を含んでいます。

- chrome-extension-comicinfo: ComicInfo 生成 Chrome 拡張機能

### 主な機能

- `chrome-extension-comicinfo` : Komga で扱える書籍情報入りファイルである CBZ/CBR に含まれる ComicInfo.xml に準じた形式の XML ファイルを電子書籍販売サイト情報から取得・保存する Chrome 機能拡張
  - 拡張機能のポップアップ UI から「表示中のサイト上の情報取得」「情報編集」「情報を反映した XML ファイルのダウンロード」を行う

### 利用方法

1. `chrome-extension-comicinfo.crx` を Chrome にドラッグ＆ドロップして拡張機能をインストール
2. Komga の Web UI で拡張機能を利用
3. 書誌情報の取得・編集・保存が可能

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
