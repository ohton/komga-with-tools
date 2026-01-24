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

// Amazon.co.jp 商品ページ（書籍/eBook）から情報を取得してフォームにセット
async function autofillFromAmazon() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) return;

    chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            func: () => {
                const title = (document.getElementById('productTitle')?.textContent || document.querySelector('h1#title')?.textContent || '').trim();

                // Authors
                const authorElems = Array.from(document.querySelectorAll('#bylineInfo a, .contributorNameID, .author a')) as HTMLElement[];
                let writer = authorElems.map(a => a.textContent?.trim() || '').filter(Boolean).join(', ');

                // Amazon書籍ページにはタグ表記がないため空にする
                const tag = '';

                // Registration block: parse publisher and release date from detail bullets
                let publisher = '';
                let year = '', month = '', day = '';
                let asin = '';
                const detailItems = Array.from(document.querySelectorAll('#detailBullets_feature_div li')) as HTMLElement[];
                detailItems.forEach(li => {
                    const boldSpan = li.querySelector('.a-text-bold');
                    const bold = boldSpan?.textContent || '';
                    const spanList = Array.from(li.querySelectorAll('span'));
                    let value = '';
                    if (spanList.length > 0) {
                        for (let i = spanList.length - 1; i >= 0; i--) {
                            const s = spanList[i];
                            if (s === boldSpan) continue;
                            const txt = s.textContent?.trim() || '';
                            if (txt) { value = txt; break; }
                        }
                    }
                    if (/ASIN/.test(bold)) {
                        if (value) asin = value.trim();
                    }
                    if (/出版社/.test(bold)) {
                        // value may be like: "光プロダクション (2025/3/3)"
                        const m = value.match(/^(.+?)\s*\((\d{4}\/\d{1,2}\/\d{1,2})\)\s*$/);
                        if (m) {
                            publisher = m[1].trim();
                            const dm = m[2].match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
                            if (dm) {
                                year = String(parseInt(dm[1], 10));
                                month = String(parseInt(dm[2], 10));
                                day = String(parseInt(dm[3], 10));
                            }
                        } else if (value) {
                            publisher = value.replace(/\s*\(.+\)\s*$/, '').trim();
                        }
                    }
                    if (/発売日/.test(bold)) {
                        const dm = value.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
                        if (dm) {
                            year = String(parseInt(dm[1], 10));
                            month = String(parseInt(dm[2], 10));
                            day = String(parseInt(dm[3], 10));
                        }
                    }
                });

                // Series and Number: prefer seriesBulletWidget, fallback to page body
                let series = '';
                let number = '1';
                const seriesAnchor = document.querySelector('#seriesBulletWidget_feature_div a') as HTMLElement | null;
                if (seriesAnchor) {
                    const stext = seriesAnchor.textContent?.trim() || '';
                    const serMatch = stext.match(/全\s*\d+\s*巻中第\s*(\d+)\s*巻\s*[:：]?\s*(.+)/);
                    if (serMatch) {
                        number = String(parseInt(serMatch[1], 10));
                        series = serMatch[2].trim();
                    } else {
                        const serMatch2 = stext.match(/第\s*(\d+)\s*巻\s*[:：]?\s*(.+)/);
                        if (serMatch2) {
                            number = String(parseInt(serMatch2[1], 10));
                            series = serMatch2[2].trim();
                        } else {
                            series = stext;
                        }
                    }
                } else {
                    const combined = document.body.textContent || '';
                    const seriesMatch = combined.match(/シリーズ[:：\s]*([^\n]+)/);
                    if (seriesMatch) series = seriesMatch[1].trim();
                }

                // Summary: 商品ページのURL - '?'以降のクエリパラメータを除去 ASIN記載
                const summary = location.href.split('?')[0] + '\nASIN: ' + asin;

                // writer内のスペースを削除
                writer = writer.replace(/\s+/g, '');

                // 固定値
                const ageRating = 'Everyone';
                const manga = 'YesAndRightToLeft';

                return { title, year, month, day, writer, tag, summary, series, publisher, number, ageRating, manga };
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

// DMM動画(AV)ページから情報を取得してフォームにセット
async function autofillFromDmmVideo() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) return;

    chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            func: () => {
                // タイトル
                let title = '';
                const titleElem = document.querySelector('h1>span');
                if (titleElem) {
                    // 子要素のhtmlタグを除いたtextContentをtitleに設定
                    title = Array.from(titleElem.childNodes)
                        .filter(node => node.nodeType === Node.TEXT_NODE)
                        .map(node => node.textContent?.trim())
                        .join(' ') || '';
                }

                // 配信開始日
                let year = '', month = '', day = '';
                const dateElem = Array.from(document.querySelectorAll('th'))
                    .find(th => th.textContent?.includes('配信開始日'));
                const dateText = dateElem?.nextElementSibling?.textContent?.trim();
                if (dateText) {
                    const m = dateText.match(/(\d{4})[/. -](\d{1,2})[/. -](\d{1,2})/);
                    if (m) {
                        year = String(parseInt(m[1], 10));
                        month = String(parseInt(m[2], 10));
                        day = String(parseInt(m[3], 10));
                    }
                }

                // 出演者
                let writer = '';
                const castElem = Array.from(document.querySelectorAll('th'))
                    .find(th => th.textContent?.includes('出演者'));
                if (castElem) {
                    writer = Array.from(castElem.nextElementSibling?.querySelectorAll('a') || [])
                        .map(a => a.textContent?.trim() || '')
                        .filter(Boolean)
                        .join(', ');
                }

                // ジャンル(タグ)
                let tag = '';
                const genreElem = Array.from(document.querySelectorAll('th'))
                    .find(th => th.textContent?.includes('ジャンル'));
                if (genreElem) {
                    tag = Array.from(genreElem.nextElementSibling?.querySelectorAll('a') || [])
                        .map(a => a.textContent?.trim() || '')
                        .filter(Boolean)
                        .join(', ');
                }

                // シリーズ
                let series = '';
                const seriesElem = Array.from(document.querySelectorAll('th'))
                    .find(th => th.textContent?.includes('シリーズ'));
                if (seriesElem) {
                    series = Array.from(seriesElem.nextElementSibling?.querySelectorAll('a') || [])
                        .map(a => a.textContent?.trim() || '')
                        .filter(Boolean)
                        .join(', ');
                }

                // Summary: ページURL
                const summary = location.href.split('?')[0];

                // メーカー名（Publisher）
                let publisher = '';
                const makerElem = Array.from(document.querySelectorAll('th'))
                    .find(th => th.textContent?.includes('メーカー'));
                if (makerElem) {
                    publisher = makerElem.nextElementSibling?.textContent?.trim() || '';
                }

                // メーカー品番（form-code用）
                let code = '';
                const codeElem = Array.from(document.querySelectorAll('th'))
                    .find(th => th.textContent?.includes('メーカー品番'));
                if (codeElem) {
                    code = codeElem.nextElementSibling?.textContent?.trim() || '';
                }

                const number = '1';
                const ageRating = 'Adults Only 18+';
                const manga = 'No';

                return {
                    title, year, month, day, writer, tag, summary, series, publisher, number, ageRating, manga, code
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
            (document.getElementById('form-code') as HTMLInputElement).value = data.code;
            // form-formatを常に'NFO'に設定
            (document.getElementById('form-format') as HTMLInputElement | HTMLSelectElement).value = 'NFO';
        }
    );
}

// av-wiki.netページから情報を取得してフォームにセット
async function autofillFromAvWiki() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) return;

    chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            func: () => {
                // タイトル: h1またはページのタイトルから抽出
                let title = '';
                const h1Elem = document.querySelector('h1');
                if (h1Elem) {
                    // h1の最初のテキストノードを取得
                    title = Array.from(h1Elem.childNodes)
                        .find(node => node.nodeType === Node.TEXT_NODE)
                        ?.textContent?.trim() || h1Elem.textContent?.trim() || '';
                    // 余分なテキストを削除
                    title = title.split('に出てる')[0].trim();
                }

                // 配信開始日: 「配信日：」を含むリスト要素から取得
                let year = '', month = '', day = '';
                const items = Array.from(document.querySelectorAll('ul li'));
                const dateItem = items.find(li => li.textContent?.includes('配信日：'));
                if (dateItem) {
                    const dateText = dateItem.textContent?.replace('配信日：', '').trim() || '';
                    // 例: 2018-04-22
                    const m = dateText.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
                    if (m) {
                        year = String(parseInt(m[1], 10));
                        month = String(parseInt(m[2], 10));
                        day = String(parseInt(m[3], 10));
                    }
                }

                // AV女優名（出演者）
                let writer = '';
                const actressItem = items.find(li => li.textContent?.includes('AV女優名'));
                if (actressItem) {
                    writer = Array.from(actressItem.querySelectorAll('a'))
                        .map(a => a.textContent?.trim() || '')
                        .filter(Boolean)
                        .join(', ');
                }

                // メーカー品番（code）
                let code = '';
                const codeItem = items.find(li => li.textContent?.includes('品番：'));
                if (codeItem) {
                    code = codeItem.textContent?.replace('品番：', '').trim() || '';
                }

                // メーカー名（Publisher）
                let publisher = '';
                const publisherItem = items.find(li => li.textContent?.includes('メーカー'));
                if (publisherItem) {
                    publisher = publisherItem.textContent?.replace('メーカー：', '').trim() || '';
                }

                // Summary: ページURL
                const summary = location.href.split('?')[0];

                const tag = '';
                const series = '';
                const number = '1';
                const ageRating = 'Adults Only 18+';
                const manga = 'No';

                return {
                    title, year, month, day, writer, tag, summary, series, publisher, number, ageRating, manga, code
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
            (document.getElementById('form-code') as HTMLInputElement).value = data.code;
            // form-formatを常に'NFO'に設定
            (document.getElementById('form-format') as HTMLInputElement | HTMLSelectElement).value = 'NFO';
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
    } else if (url.startsWith('https://www.amazon.co.jp/gp/product/')) {
        autofillFromAmazon();
    } else if (url.startsWith('https://video.dmm.co.jp/av/content/?id=')) {
        autofillFromDmmVideo();
    } else if (url.startsWith('https://av-wiki.net/')) {
        autofillFromAvWiki();
    } else {
        showAlertMessage('パース非対応のページです。\nDMMブックス・DMM同人・虎の穴・メロンブックス・Amazon・DMM動画・av-wikiの詳細ページで実行してください。');
    }
}

document.getElementById('loading-btn')?.addEventListener('click', handleAutofill);
// ポップアップ表示時にも同じ動作を実行
document.addEventListener('DOMContentLoaded', () => {
    handleAutofill();
});

// alert-messageを表示
function showAlertMessage(message: string, delay = 2000) {
    const alertDiv = document.getElementById('alert-message');
    if (!alertDiv) return;
    alertDiv.textContent = message;
    alertDiv.style.display = 'block';
    setTimeout(() => {
        alertDiv.style.display = 'none';
        alertDiv.textContent = '';
    }, delay);
}

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
    // FileFormatを判定
    const isNFO = fields.format === 'NFO';
    let xmlContent = '';
    let filename = '';
    let mimeType = 'application/xml';
    if (isNFO) {
        // NFO形式xml生成
        const actors = fields.writer.split(',').map(w => w.trim()).filter(Boolean);
        xmlContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<movie>\n  <title>${fields.code} ${fields.title}</title>\n  <originaltitle>${fields.title}</originaltitle>\n  <year>${fields.year}</year>\n  <ratings/>\n  <userrating>0</userrating>\n  <top250>0</top250>\n  <plot>${fields.summary}</plot>\n  <outline>${fields.summary}</outline>\n  <id/>\n  <tmdbid/>\n  <premiered>${fields.year}-${fields.month.padStart(2, '0')}-${fields.day.padStart(2, '0')}</premiered>\n  <watched>false</watched>\n  <playcount>0</playcount>\n  <genre>chrome extension</genre>\n  <genre>アダルトビデオ</genre>\n${actors.map(actor => `  <actor>\n    <name>${actor}</name>\n    <role>${actor}</role>\n    <type>Actor</type>\n  </actor>`).join('\n')}\n  <trailer/>\n  <languages/>\n</movie>`;
        // ファイル名生成: Code.nfo
        const idValue = fields.code;
        filename = idValue ? `${idValue}.nfo` : 'movie.nfo';
        mimeType = 'application/x-nfo';
    } else {
        // 通常ComicInfo形式
        xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n<ComicInfo>\n  <Year>${fields.year}</Year>\n  <Month>${fields.month}</Month>\n  <Day>${fields.day}</Day>\n  <Writer>${fields.writer}</Writer>\n  <Penciller/>\n  <Inker/>\n  <Colorist/>\n  <Letterer/>\n  <CoverArtist/>\n  <Editor/>\n  <Translator/>\n  <Title>${fields.title}</Title>\n  <Summary>${fields.summary}</Summary>\n  <Number>${fields.number}</Number>\n  <Tags>${fields.tags}</Tags>\n  <GTIN/>\n  <Series>${fields.series}</Series>\n  <Volume>${fields.volume}</Volume>\n  <AgeRating>${fields.ageRating}</AgeRating>\n  <Publisher>${fields.publisher}</Publisher>\n  <Manga>YesAndRightToLeft</Manga>\n  <Genre>${fields.genre}</Genre>\n  <LanguageISO>ja</LanguageISO>\n</ComicInfo>`;
        // ファイル名生成: [writer] title number.xml
        const writerPart = fields.writer.split(',').map(w => w.trim()).filter(Boolean).join('×');
        const titlePart = fields.title.replace(/[\\/:*?"<>|]/g, ''); // ファイル名に使えない文字を除去
        const numberPart = fields.number.padStart(2, '0');
        filename = `[${writerPart}] ${titlePart} ${numberPart}.xml`;
        mimeType = 'application/xml';
    }

    // Blobをbase64に変換してbackground経由でダウンロード
    const blob = new Blob([xmlContent], { type: mimeType });
    const reader = new FileReader();
    reader.onload = function () {
        const base64 = reader.result?.toString().split(',')[1];
        chrome.runtime.sendMessage({
            type: 'download-xml',
            filename,
            base64,
            mimeType
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