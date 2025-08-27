// このファイルは拡張機能のバックグラウンドスクリプトです。
// 拡張機能のライフサイクル管理やイベントリスナーを設定します。

chrome.runtime.onInstalled.addListener(() => {
    console.log("拡張機能がインストールされました。");
});

chrome.runtime.onStartup.addListener(() => {
    console.log("拡張機能が起動しました。");
});

// ここに他のイベントリスナーやバックグラウンド処理を追加できます。