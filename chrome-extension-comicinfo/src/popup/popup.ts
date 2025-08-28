// DMM同人詳細ページから情報を取得してフォームにセット
async function autofillFromDmmDoujin() {
    // 現在のタブでスクリプトを実行
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) return;

    chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            func: () => {
                // Title
                const titleElem = document.querySelector('h1.productTitle__txt');
                let title = '';
                if (titleElem) {
                    // 子要素(タグ)を全て削除
                    const cloned = titleElem.cloneNode(true) as HTMLElement;
                    Array.from(cloned.children).forEach(child => cloned.removeChild(child));
                    title = cloned.textContent?.trim() || '';
                }
                // 配信開始日
                let year = '', month = '', day = '';
                const dateText = Array.from(document.querySelectorAll('dt.informationList__ttl')).find(th => th.textContent?.includes('配信開始日'))?.nextElementSibling?.textContent?.trim();
                if (dateText) {
                    // 例: 2024/08/01
                    const m = dateText.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
                    if (m) {
                        year = String(parseInt(m[1], 10));
                        month = String(parseInt(m[2], 10));
                        day = String(parseInt(m[3], 10));
                    }
                }
                // サークル名
                let circle = '';
                const circleTh = document.querySelector('div.circleName__item');
                if (circleTh) {
                    circle = Array.from(circleTh?.querySelectorAll('a') || [])
                        .map(a => a.textContent?.trim() || '')
                        .filter(Boolean)
                        .join(', ');
                }
                // 作者
                let writer = '';
                const authorTh = Array.from(document.querySelectorAll('dt.informationList__ttl')).find(th => th.textContent?.includes('作者'));
                if (authorTh) {
                    writer = Array.from(authorTh.nextElementSibling?.querySelectorAll('a') || [])
                        .map(a => a.textContent?.trim() || '')
                        .filter(Boolean)
                        .join(', ');
                }
                // writerの先頭にcircleを追加
                if (writer) {
                    writer = `${circle}, ${writer}`;
                } else {
                    writer = circle;
                }

                // ジャンル(タグ)
                let tag = '';
                const genreTh = Array.from(document.querySelectorAll('dt.informationList__ttl')).find(th => th.textContent?.includes('ジャンル'));
                if (genreTh) {
                    tag = Array.from(genreTh.nextElementSibling?.querySelectorAll('a') || [])
                        .map(a => a.textContent?.trim() || '')
                        .filter(Boolean)
                        .join(', ');
                }

                // Series
                let series = '';
                const seriesTh = Array.from(document.querySelectorAll('dt.informationList__ttl')).find(th => th.textContent?.includes('シリーズ'));
                if (seriesTh) {
                    series = Array.from(seriesTh.nextElementSibling?.querySelectorAll('a') || [])
                        .map(a => a.textContent?.trim() || '')
                        .filter(Boolean)
                        .join(', ');
                }

                // Summary: ページURL
                const summary = location.origin + location.pathname;

                // 固定値
                const publisher = '';
                const number = '1';
                const ageRating = 'Adults Only 18+';
                const manga = 'YesAndRightToLeft';

                return {
                    title, year, month, day, writer, tag, summary, series, publisher, number, ageRating, manga
                };
            },
        },
        (results) => {
            if (!results || !results[0] || !results[0].result) return;
            const data = results[0].result;
            (document.getElementById('form-title') as HTMLInputElement).value = data.title;
            (document.getElementById('form-year') as HTMLInputElement).value = data.year;
            (document.getElementById('form-month') as HTMLInputElement).value = data.month;
            (document.getElementById('form-day') as HTMLInputElement).value = data.day;
            (document.getElementById('form-writer') as HTMLInputElement).value = data.writer;
            (document.getElementById('form-tags') as HTMLInputElement).value = data.tag;
            (document.getElementById('form-summary') as HTMLTextAreaElement).value = data.summary;
            (document.getElementById('form-series') as HTMLInputElement).value = data.series;
            (document.getElementById('form-publisher') as HTMLInputElement).value = data.publisher;
            (document.getElementById('form-number') as HTMLInputElement).value = data.number;
            (document.getElementById('form-agerating') as HTMLSelectElement).value = data.ageRating;
            (document.getElementById('form-manga') as HTMLSelectElement).value = data.manga;
            // form-formatを常に'ComicInfo'に設定
            (document.getElementById('form-format') as HTMLInputElement | HTMLSelectElement).value = 'ComicInfo';
        }
    );
}
// FANZAブックス（DMMブックス）商品ページから情報を取得してフォームにセット
async function autofillFromDmmFanzaBooks() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) return;

    chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            func: () => {
                // タイトル
                const title = document.querySelector('h1')?.textContent?.trim() || '';

                // 配信開始日
                let year = '', month = '', day = '';
                const dateElem = Array.from(document.querySelectorAll('section>div>dl')).find(dl => dl.textContent?.includes('配信開始日'));
                const dateText = dateElem?.textContent?.trim();
                if (dateText) {
                    const m = dateText.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
                    if (m) {
                        year = String(parseInt(m[1], 10));
                        month = String(parseInt(m[2], 10));
                        day = String(parseInt(m[3], 10));
                    }
                }

                // 作者
                let writer = '';
                const authorElme = Array.from(document.querySelectorAll('section>div>dl')).find(dl => dl.textContent?.includes('作家'));
                if (authorElme) {
                    writer = Array.from(authorElme?.querySelectorAll('a') || [])
                        .map(a => a.textContent?.trim() || '')
                        .filter(Boolean)
                        .join(', ');
                }

                // ジャンル(タグ)
                let tag = '';
                const genreElem = Array.from(document.querySelectorAll('section>div>dl')).find(dl => dl.textContent?.includes('ジャンル'));
                if (genreElem) {
                    tag = Array.from(genreElem.querySelectorAll('a') || [])
                        .map(a => a.textContent?.trim() || '')
                        .filter(Boolean)
                        .join(', ');
                }

                // シリーズ
                let series = '';
                const seriesElem = Array.from(document.querySelectorAll('section>div>dl')).find(dl => dl.textContent?.includes('シリーズ'));
                if (seriesElem) {
                    series = Array.from(seriesElem.querySelectorAll('a') || [])
                        .map(a => a.textContent?.trim() || '')
                        .filter(Boolean)
                        .join(', ');
                }

                // Summary: ページURL
                const summary = location.origin + location.pathname;

                // 出版社
                let publisher = '';
                const publisherElem = Array.from(document.querySelectorAll('section>div>dl')).find(dl => dl.textContent?.includes('出版社'));
                if (publisherElem) {
                    publisher = Array.from(publisherElem.querySelectorAll('a') || [])
                        .map(a => a.textContent?.trim() || '')
                        .filter(Boolean)
                        .join(', ');
                }

                // 固定値（なければ空文字）
                const number = '1';
                // サイトによってageRatingを切り替え
                let ageRating = 'Adults Only 18+';
                if (location.hostname === 'book.dmm.com') {
                    ageRating = 'Everyone';
                }
                const manga = 'YesAndRightToLeft';

                return {
                    title, year, month, day, writer, tag, summary, series, publisher, number, ageRating, manga
                };
            },
        },
        (results) => {
            if (!results || !results[0] || !results[0].result) return;
            const data = results[0].result;
            (document.getElementById('form-title') as HTMLInputElement).value = data.title;
            (document.getElementById('form-year') as HTMLInputElement).value = data.year;
            (document.getElementById('form-month') as HTMLInputElement).value = data.month;
            (document.getElementById('form-day') as HTMLInputElement).value = data.day;
            (document.getElementById('form-writer') as HTMLInputElement).value = data.writer;
            (document.getElementById('form-tags') as HTMLInputElement).value = data.tag;
            (document.getElementById('form-summary') as HTMLTextAreaElement).value = data.summary;
            (document.getElementById('form-series') as HTMLInputElement).value = data.series;
            (document.getElementById('form-publisher') as HTMLInputElement).value = data.publisher;
            (document.getElementById('form-number') as HTMLInputElement).value = data.number;
            (document.getElementById('form-agerating') as HTMLSelectElement).value = data.ageRating;
            (document.getElementById('form-manga') as HTMLSelectElement).value = data.manga;
            // form-formatを常に'ComicInfo'に設定
            (document.getElementById('form-format') as HTMLInputElement | HTMLSelectElement).value = 'ComicInfo';
        }
    );
}
// 虎の穴詳細ページから情報を取得してフォームにセット
async function autofillFromToranoana() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) return;

    chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            func: () => {
                // タイトル
                let title = '';
                title = document.querySelector('h1.product-detail-desc-title')?.textContent?.trim() || '';

                // サークル名
                let circle = '';
                const circleTr = Array.from(document.querySelectorAll('table.product-detail-spec-table>tbody>tr')).find(tr => tr.querySelectorAll('td')[0].textContent?.includes('サークル'));
                if (circleTr) {
                    const titleAttr = circleTr.querySelectorAll('td')[1].querySelectorAll('a')[0]?.getAttribute('title');
                    circle = titleAttr ? titleAttr.trim() : '';
                }

                // 作家
                let writer = '';
                const writerTr = Array.from(document.querySelectorAll('table.product-detail-spec-table>tbody>tr')).find(tr => tr.querySelectorAll('td')[0].textContent?.includes('作家'));
                if (writerTr) {
                    writer = Array.from(writerTr.querySelectorAll('td')[1]?.querySelectorAll('a') || [])
                        .map(a => a.textContent?.trim() || '')
                        .filter(Boolean)
                        .join(', ');
                }
                // writerの先頭にcircleを追加
                if (writer) {
                    writer = `${circle}, ${writer}`;
                } else {
                    writer = circle;
                }

                // ジャンル/サブジャンル（タグ）
                let tag = '';
                const tagTr = Array.from(document.querySelectorAll('table.product-detail-spec-table>tbody>tr')).find(tr => tr.querySelectorAll('td')[0].textContent?.includes('ジャンル'));
                if (tagTr) {
                    tag = Array.from(tagTr.querySelectorAll('td')[1]?.querySelectorAll('a') || [])
                        .map(a => a.textContent?.trim() || '')
                        .filter(t => t && t !== '入荷アラートを設定')
                        .join(', ');
                }
                // 初出イベントをtagに追加
                const eventTr = Array.from(document.querySelectorAll('table.product-detail-spec-table>tbody>tr')).find(tr => tr.querySelectorAll('td')[0].textContent?.includes('初出イベント'));
                if (eventTr) {
                    const eventRawText = eventTr.querySelectorAll('td')[1]?.textContent?.trim() || '';
                    // イベント名のみ抽出
                    const eventMatch = eventRawText.match(/(コミックマーケット\d+|COMITIA\d+|その他イベント名)/);
                    const eventText = eventMatch ? eventMatch[1] : eventRawText;
                    if (eventText) {
                        tag = tag ? `${tag}, ${eventText}` : eventText;
                    }
                }

                // シリーズ
                let series = '';
                const seriesTr = Array.from(document.querySelectorAll('table.product-detail-spec-table>tbody>tr')).find(tr => tr.querySelectorAll('td')[0].textContent?.includes('シリーズ'));
                if (seriesTr) {
                    series = Array.from(seriesTr.querySelectorAll('td')[1]?.querySelectorAll('a') || [])
                        .map(a => a.textContent?.trim() || '')
                        .filter(Boolean)
                        .join(', ');
                }

                // 発行日（year, month, day）
                let year = '', month = '', day = '';
                const dateTr = Array.from(document.querySelectorAll('table.product-detail-spec-table>tbody>tr')).find(tr => tr.querySelectorAll('td')[0].textContent?.includes('発行日'));
                if (dateTr) {
                    const dateText = dateTr.querySelectorAll('td')[1]?.textContent?.trim();
                    if (dateText) {
                        // 例: 2024/08/01
                        const m = dateText.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
                        if (m) {
                            year = String(parseInt(m[1], 10));
                            month = String(parseInt(m[2], 10));
                            day = String(parseInt(m[3], 10));
                        }
                    }
                }

                const summary = location.origin + location.pathname;
                const publisher = '';
                const number = '1';
                // 年齢区分判定
                let ageRating = 'Adults Only 18+';
                const labelSpans = Array.from(document.querySelectorAll('span.product-detail-label-item'));
                if (labelSpans.some(span => span.classList.contains('mk-all') && span.textContent?.includes('全年齢'))) {
                    ageRating = 'Everyone';
                } else if (labelSpans.some(span => span.classList.contains('mk-rating') && span.textContent?.includes('18禁'))) {
                    ageRating = 'Adults Only 18+';
                }
                const manga = 'YesAndRightToLeft';
                return {
                    title, year, month, day, writer, tag, summary, series, publisher, number, ageRating, manga
                };
            },
        },
        (results) => {
            if (!results || !results[0] || !results[0].result) return;
            const data = results[0].result;
            (document.getElementById('form-title') as HTMLInputElement).value = data.title;
            (document.getElementById('form-year') as HTMLInputElement).value = data.year;
            (document.getElementById('form-month') as HTMLInputElement).value = data.month;
            (document.getElementById('form-day') as HTMLInputElement).value = data.day;
            (document.getElementById('form-writer') as HTMLInputElement).value = data.writer;
            (document.getElementById('form-tags') as HTMLInputElement).value = data.tag;
            (document.getElementById('form-summary') as HTMLTextAreaElement).value = data.summary;
            (document.getElementById('form-series') as HTMLInputElement).value = data.series;
            (document.getElementById('form-publisher') as HTMLInputElement).value = data.publisher;
            (document.getElementById('form-number') as HTMLInputElement).value = data.number;
            (document.getElementById('form-agerating') as HTMLSelectElement).value = data.ageRating;
            (document.getElementById('form-manga') as HTMLSelectElement).value = data.manga;
            // form-formatを常に'ComicInfo'に設定
            (document.getElementById('form-format') as HTMLInputElement | HTMLSelectElement).value = 'ComicInfo';
        }
    );
}
// メロンブックス本詳細ページから情報を取得してフォームにセット
async function autofillFromMelonbooks() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) return;

    chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            func: () => {
                // タイトル
                const title = document.querySelector('h1.page-header')?.textContent?.trim() || '';

                // サークル名
                let circle = '';
                const circleElem = Array.from(document.querySelectorAll('div.table-wrapper>table>tbody>tr')).find(tr => tr.textContent?.includes('サークル名'));
                const circleP = document.querySelector('p.author-name');
                if (circleElem && circleP) {
                    circle = Array.from(circleP.querySelectorAll('a') || [])
                        .map(a => a.textContent?.trim() || '')
                        .filter(Boolean)
                        .join(', ');
                }
                // 著者
                let writer = '';
                const authorElem = Array.from(document.querySelectorAll('div.table-wrapper>table>tbody>tr')).find(dl => dl.textContent?.includes('作家名'));
                if (authorElem) {
                    writer = Array.from(authorElem.querySelectorAll('a') || [])
                        .map(a => a.textContent?.trim() || '')
                        .filter(Boolean)
                        .join(', ');
                }
                // writerの先頭にcircleを追加
                if (circle) {
                    writer = `${circle}, ${writer}`;
                }

                // ジャンル（タグ）
                let tag = '';
                const genreElem = Array.from(document.querySelectorAll('div.table-wrapper>table>tbody>tr')).find(dl => dl.textContent?.includes('ジャンル'));
                if (genreElem) {
                    tag = Array.from(genreElem.querySelectorAll('a') || [])
                        .map(a => a.textContent?.trim() || '')
                        .filter(Boolean)
                        .join(', ');
                }
                // イベントをタグに追加
                const eventTr = Array.from(document.querySelectorAll('div.table-wrapper>table>tbody>tr')).find(tr => tr.textContent?.includes('イベント'));
                const eventText = eventTr?.querySelector('td')?.textContent?.trim();
                if (eventText) {
                    tag = tag ? `${tag}, ${eventText}` : eventText;
                }

                // シリーズ
                let series = '';
                const seriesElem = Array.from(document.querySelectorAll('div.table-wrapper>table>tbody>tr')).find(tr => tr.textContent?.includes('シリーズ名'));
                if (seriesElem) {
                    series = Array.from(seriesElem.querySelectorAll('a') || [])
                        .map(a => a.textContent?.trim() || '')
                        .filter(Boolean)
                        .join(', ');
                }

                // 発売日
                let year = '', month = '', day = '';
                const dateElem = Array.from(document.querySelectorAll('div.table-wrapper>table>tbody>tr')).find(tr => tr.textContent?.includes('発行日'));
                const dateText = dateElem?.querySelector('td')?.textContent?.trim();
                if (dateText) {
                    const m = dateText.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
                    if (m) {
                        year = String(parseInt(m[1], 10));
                        month = String(parseInt(m[2], 10));
                        day = String(parseInt(m[3], 10));
                    }
                }

                // Summary: GETパラメータ付きURL
                const summary = location.href;

                // 出版社
                let publisher = '';
                const publisherElem = Array.from(document.querySelectorAll('div.table-wrapper>table>tbody>tr')).find(tr => tr.textContent?.includes('出版社'));
                const publisherText = publisherElem?.querySelector('td')?.textContent?.trim();
                if (publisherText) {
                    publisher = publisherText;
                }


                // 固定値
                const number = '1';
                // 作品種別でAgeRatingを切り替え
                let ageRating = 'Adults Only 18+';
                const typeTr = Array.from(document.querySelectorAll('div.table-wrapper>table>tbody>tr')).find(tr => tr.textContent?.includes('作品種別'));
                const typeText = typeTr?.querySelector('td')?.textContent?.trim() || '';
                if (typeText.includes('一般')) {
                    ageRating = 'Everyone';
                } else if (typeText.includes('18禁')) {
                    ageRating = 'Adults Only 18+';
                }
                const manga = 'YesAndRightToLeft';

                return {
                    title, year, month, day, writer, tag, summary, series, publisher, number, ageRating, manga
                };
            },
        },
        (results) => {
            if (!results || !results[0] || !results[0].result) return;
            const data = results[0].result;
            (document.getElementById('form-title') as HTMLInputElement).value = data.title;
            (document.getElementById('form-year') as HTMLInputElement).value = data.year;
            (document.getElementById('form-month') as HTMLInputElement).value = data.month;
            (document.getElementById('form-day') as HTMLInputElement).value = data.day;
            (document.getElementById('form-writer') as HTMLInputElement).value = data.writer;
            (document.getElementById('form-tags') as HTMLInputElement).value = data.tag;
            (document.getElementById('form-summary') as HTMLTextAreaElement).value = data.summary;
            (document.getElementById('form-series') as HTMLInputElement).value = data.series;
            (document.getElementById('form-publisher') as HTMLInputElement).value = data.publisher;
            (document.getElementById('form-number') as HTMLInputElement).value = data.number;
            (document.getElementById('form-agerating') as HTMLSelectElement).value = data.ageRating;
            (document.getElementById('form-manga') as HTMLSelectElement).value = data.manga;
            // form-formatを常に'ComicInfo'に設定
            (document.getElementById('form-format') as HTMLInputElement | HTMLSelectElement).value = 'ComicInfo';
        }
    );
}

// ボタンにイベントを追加
async function handleAutofill() {
    // 現在のタブのURLを取得
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab?.url || '';
    if (url.startsWith('https://www.dmm.co.jp/dc/doujin/-/detail/=/cid=')) {
        autofillFromDmmDoujin();
    } else if (url.startsWith('https://book.dmm.co.jp/product/') || url.startsWith('https://book.dmm.com/product/')) {
        autofillFromDmmFanzaBooks();
    } else if (url.startsWith('https://ec.toranoana.jp/tora_r/ec/item/')) {
        autofillFromToranoana();
    } else if (url.startsWith('https://www.melonbooks.co.jp/detail/detail.php?product_id=')) {
        autofillFromMelonbooks();
    } else {
        const alertDiv = document.getElementById('alert-message');
        if (alertDiv) {
            alertDiv.textContent = 'パース非対応のページです。\nDMMブックス・DMM同人・虎の穴・メロンブックス・DMM動画の詳細ページで実行してください。';
            alertDiv.style.display = 'block';
        }
    }
}

document.getElementById('loading-btn')?.addEventListener('click', handleAutofill);
// ポップアップ表示時にも同じ動作を実行
document.addEventListener('DOMContentLoaded', () => {
    handleAutofill();
});

function downloadXmlFile(fields: {
    title: string,
    year: string,
    month: string,
    day: string,
    writer: string,
    summary: string,
    number: string,
    tags: string,
    series: string,
    volume: string,
    ageRating: string,
    publisher: string,
    genre: string,
    format: string,
    rating: string,
    code: string,
}, onComplete?: () => void) {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<ComicInfo>
  <Year>${fields.year}</Year>
  <Month>${fields.month}</Month>
  <Day>${fields.day}</Day>
  <Writer>${fields.writer}</Writer>
  <Penciller/>
  <Inker/>
  <Colorist/>
  <Letterer/>
  <CoverArtist/>
  <Editor/>
  <Translator/>
  <Title>${fields.title}</Title>
  <Summary>${fields.summary}</Summary>
  <Number>${fields.number}</Number>
  <Tags>${fields.tags}</Tags>
  <GTIN/>
  <Series>${fields.series}</Series>
  <Volume>${fields.volume}</Volume>
  <AgeRating>${fields.ageRating}</AgeRating>
  <Publisher>${fields.publisher}</Publisher>
  <Manga>YesAndRightToLeft</Manga>
  <Genre>${fields.genre}</Genre>
  <LanguageISO>ja</LanguageISO>
</ComicInfo>`;
    // ファイル名生成: [writer] title number
    const writerPart = fields.writer.split(',').map(w => w.trim()).filter(Boolean).join('×');
    const titlePart = fields.title.replace(/[\\/:*?"<>|]/g, ''); // ファイル名に使えない文字を除去
    const numberPart = fields.number.padStart(2, '0');
    const filename = `[${writerPart}] ${titlePart} ${numberPart}.xml`;

    // Blobをbase64に変換してbackground経由でダウンロード
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const reader = new FileReader();
    reader.onload = function() {
        const base64 = reader.result?.toString().split(',')[1];
        chrome.runtime.sendMessage({
            type: 'download-xml',
            filename,
            base64
        }, () => {
            if (onComplete) onComplete();
        });
    };
    reader.readAsDataURL(blob);
}

const btn_dl = document.getElementById('dl-btn');
if (btn_dl) {
    btn_dl.addEventListener('click', () => {
        // 各フォーム値を取得
        const getValue = (id: string) => {
            const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null;
            return el ? el.value : '';
        };
        const fields = {
            title: getValue('form-title'),
            year: getValue('form-year'),
            month: getValue('form-month'),
            day: getValue('form-day'),
            writer: getValue('form-writer'),
            summary: getValue('form-summary'),
            number: getValue('form-number'),
            tags: getValue('form-tags'),
            series: getValue('form-series'),
            volume: getValue('form-volume'),
            ageRating: getValue('form-agerating'),
            publisher: getValue('form-publisher'),
            genre: getValue('form-genre'),
            format: getValue('form-format'),
            rating: getValue('form-rating'),
            code: getValue('form-code'),
        };
        chrome.tabs.query({ active: true, currentWindow: true }, () => {
            downloadXmlFile(fields, () => {
                window.close();
            });
        });
    });
}