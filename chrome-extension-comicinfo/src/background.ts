// このファイルは拡張機能のバックグラウンドスクリプトです。
// 拡張機能のライフサイクル管理やイベントリスナーを設定します。

chrome.runtime.onInstalled.addListener(() => {
    console.log("拡張機能がインストールされました。");
});

chrome.runtime.onStartup.addListener(() => {
    console.log("拡張機能が起動しました。");
});


// popupからのダウンロードリクエストを受けてchrome.downloads.downloadで保存
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'download-xml') {
        const { filename, base64 } = message;
        const url = `data:application/xml;base64,${base64}`;
        chrome.downloads.download({
            url,
            filename,
            saveAs: false
        }, () => {
            sendResponse();
        });
        // 非同期応答を明示
        return true;
    }
});