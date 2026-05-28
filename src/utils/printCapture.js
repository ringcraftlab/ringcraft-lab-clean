/** @param {string} bgImage */
export function extractBackgroundImageUrl(bgImage) {
  if (!bgImage || bgImage === 'none') return null;
  const match = /^url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)$/i.exec(bgImage.trim());
  if (!match) return null;
  const url = (match[1] || match[2] || match[3] || '').trim();
  return url || null;
}

/**
 * html2canvas は CSS background-image を低解像度で描きがちなため、
 * キャプチャ直前に role=img の背景を <img> に置き換える。
 */
export function promoteBackgroundImagesForCapture(root) {
  root.querySelectorAll('[role="img"]').forEach((el) => {
    if (el.tagName === 'IMG') return;

    const bgImage = el.style.backgroundImage;
    const src = extractBackgroundImageUrl(bgImage);
    if (!src) return;

    const img = el.ownerDocument.createElement('img');
    img.src = src;
    const label = el.getAttribute('aria-label');
    if (label) img.setAttribute('aria-label', label);

    for (const prop of ['position', 'left', 'top', 'width', 'height', 'transform', 'transformOrigin', 'zIndex']) {
      if (el.style[prop]) img.style[prop] = el.style[prop];
    }

    const bgSize = el.style.backgroundSize;
    if (bgSize === 'cover') img.style.objectFit = 'cover';
    else if (bgSize === 'contain') img.style.objectFit = 'contain';
    else if (bgSize && bgSize !== 'auto') img.style.objectFit = 'fill';
    else img.style.objectFit = 'cover';

    img.style.objectPosition = el.style.backgroundPosition || 'center';

    el.parentNode?.replaceChild(img, el);
  });
}

/** スマホ・タッチ端末向けの印刷フロー（専用ページ＋余白対策） */
export function prefersMobilePrintFlow() {
  if (typeof window === 'undefined') return false;
  const mobileUa = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const narrow = window.matchMedia('(max-width: 900px)').matches;
  return mobileUa || (coarse && narrow);
}

/**
 * 印刷専用 HTML（タイトルはヘッダー表示されにくいよう最小化）
 */
export function buildPrintPageHtml({ dataUrl, pxW, pxH, pageWmm, pageHmm, autoPrint = false }) {
  const autoPrintScript = autoPrint
    ? `<script>
(function(){
  function run(){ try { window.focus(); window.print(); } catch (e) {} }
  if (document.readyState === 'complete') setTimeout(run, 400);
  else window.addEventListener('load', function(){ setTimeout(run, 400); }, { once: true });
})();
</script>`
    : '';

  return `<!DOCTYPE html>
<html lang="ja"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>&#8203;</title>
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    width: ${pageWmm}mm;
    height: ${pageHmm}mm;
    overflow: hidden;
    background: #fff;
  }
  .no-print { display: block; }
  .toolbar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    top: auto;
    z-index: 2;
    max-width: none;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
    border: 1px solid #e0d9cf;
    border-bottom: none;
    border-radius: 16px 16px 0 0;
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 -4px 24px rgba(47, 39, 31, 0.12);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Noto Sans JP", sans-serif;
  }
  button {
    min-height: 44px;
    padding: 0 16px;
    border: 0;
    border-radius: 8px;
    background: linear-gradient(180deg, #c96a4a 0%, #b85a3c 100%);
    color: #fffef9;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
  }
  .hint {
    margin: 0;
    color: #9c7d5e;
    font-size: 11px;
    line-height: 1.5;
  }
  .print-sheet {
    margin: 0;
    padding: 0;
    width: ${pageWmm}mm;
    height: ${pageHmm}mm;
    position: relative;
    overflow: hidden;
    background: #fff;
  }
  .print-sheet img {
    display: block;
    width: ${pageWmm}mm;
    height: ${pageHmm}mm;
    margin: 0;
    padding: 0;
    border: 0;
    object-fit: fill;
  }
  @media print {
    @page {
      margin: 0;
      size: ${pageWmm === 297 && pageHmm === 210 ? 'A4 landscape' : pageWmm === 210 && pageHmm === 297 ? 'A4 portrait' : `${pageWmm}mm ${pageHmm}mm`};
    }
    html, body {
      width: ${pageWmm}mm !important;
      height: ${pageHmm}mm !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .no-print { display: none !important; }
    .print-sheet {
      width: ${pageWmm}mm !important;
      height: ${pageHmm}mm !important;
      margin: 0 !important;
      padding: 0 !important;
      page-break-after: avoid;
      page-break-inside: avoid;
    }
    .print-sheet img {
      position: fixed;
      top: 0;
      left: 0;
      width: ${pageWmm}mm !important;
      height: ${pageHmm}mm !important;
      max-width: none !important;
      max-height: none !important;
      margin: 0 !important;
      padding: 0 !important;
      object-fit: fill;
    }
  }
</style>
</head>
<body>
  <div class="no-print toolbar">
    <button type="button" onclick="window.print()">印刷する</button>
    <p class="hint">余白やサイト名が出る場合：印刷画面で「ヘッダーとフッター」「余白」をオフにし、用紙をA4・向きをレイアウトに合わせてください。</p>
  </div>
  <div class="print-sheet"><img src="${dataUrl}" width="${pxW}" height="${pxH}" alt="" /></div>
${autoPrintScript}
</body></html>`;
}

/** スマホ PDF 表示時の印刷手順（iOS / Android） */
export function detectMobilePdfPrintPlatform() {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return null;
}

const MOBILE_PDF_PRINT_HINTS = {
  ios: '画面下の共有ボタン→「プリント」を選んでください',
  android: '右上のメニュー→「印刷」を選んでください',
};

/**
 * スマホで PDF を開くとき：手順テキスト付きビューア HTML
 * （生 PDF タブだけだと説明を載せられないため）
 */
export function buildMobilePdfViewerHtml({ pdfUrl, platform }) {
  const hint = MOBILE_PDF_PRINT_HINTS[platform] || MOBILE_PDF_PRINT_HINTS.android;
  const safeUrl = String(pdfUrl).replace(/"/g, '&quot;');

  return `<!DOCTYPE html>
<html lang="ja"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
<title>&#8203;</title>
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    height: 100dvh;
    background: #f5f0e8;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Noto Sans JP", sans-serif;
  }
  body {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
  }
  .pdf-viewer-hint {
    flex-shrink: 0;
    margin: 0;
    padding: 8px 14px calc(8px + env(safe-area-inset-top, 0px));
    font-size: 11px;
    line-height: 1.5;
    font-weight: 400;
    color: #9c7d5e;
    background: rgba(255, 255, 255, 0.92);
    border-bottom: 1px solid #e8e0d6;
  }
  .pdf-viewer-hint strong {
    font-weight: 600;
    color: #7a6550;
  }
  .pdf-viewer-frame {
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
    background: #fff;
  }
  .pdf-viewer-frame embed,
  .pdf-viewer-frame iframe,
  .pdf-viewer-frame object {
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
  }
</style>
</head>
<body>
  <p class="pdf-viewer-hint"><strong>印刷手順：</strong>${hint}</p>
  <div class="pdf-viewer-frame">
    <embed type="application/pdf" src="${safeUrl}" />
  </div>
</body></html>`;
}

/**
 * PDF ブロブを新規タブで開く。スマホ（iOS/Android）は手順付きビューア経由。
 */
export async function openSheetPdfBlob(pdfBlob, { revokeAfterMs = 120000 } = {}) {
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const platform = detectMobilePdfPrintPlatform();
  const useViewer = prefersMobilePrintFlow() && platform;

  if (useViewer) {
    const html = buildMobilePdfViewerHtml({ pdfUrl, platform });
    const result = await openPrintDocument(html);
    if (result.ok) {
      setTimeout(() => URL.revokeObjectURL(pdfUrl), revokeAfterMs);
      return { ok: true, ...result };
    }
    URL.revokeObjectURL(pdfUrl);
    return { ok: false };
  }

  const win = window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  if (!win) {
    URL.revokeObjectURL(pdfUrl);
    return { ok: false };
  }
  setTimeout(() => URL.revokeObjectURL(pdfUrl), revokeAfterMs);
  return { ok: true, win, printUrl: pdfUrl };
}

/** 誤ってメイン画面を印刷したとき用に document.title を一時的に空にする */
const BLANK_PRINT_TITLE = '\u200B';

export async function openPrintDocument(html, { autoPrint = false } = {}) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const printUrl = URL.createObjectURL(blob);
  const win = window.open(printUrl, '_blank');
  if (win) {
    setTimeout(() => URL.revokeObjectURL(printUrl), 120000);
    return { ok: true, win, printUrl };
  }
  URL.revokeObjectURL(printUrl);
  return printViaHiddenIframe(html, { autoPrint });
}

/**
 * ポップアップブロック時：iframe 印刷（親ページの title も一時変更してヘッダー表示を抑える）
 */
export function printViaHiddenIframe(html, { autoPrint = false } = {}) {
  return new Promise((resolve) => {
    const prevTitle = document.title;
    document.title = BLANK_PRINT_TITLE;

    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    Object.assign(iframe.style, {
      position: 'fixed',
      width: '0',
      height: '0',
      border: '0',
      opacity: '0',
      pointerEvents: 'none',
      right: '0',
      bottom: '0',
    });

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      document.title = prevTitle;
      iframe.remove();
      resolve({ ok: true, win: null, printUrl: null });
    };

    iframe.onload = () => {
      const iw = iframe.contentWindow;
      if (!iw) {
        finish();
        return;
      }
      try {
        iw.document.title = BLANK_PRINT_TITLE;
      } catch {
        /* cross-origin では不可 */
      }

      const trigger = () => {
        try {
          iw.focus();
          iw.print();
        } catch {
          finish();
        }
      };

      if (autoPrint) {
        setTimeout(trigger, 400);
      } else {
        trigger();
      }

      try {
        iw.addEventListener('afterprint', finish, { once: true });
      } catch {
        /* ignore */
      }
      setTimeout(finish, 90000);
    };

    iframe.srcdoc = html;
    document.body.appendChild(iframe);
  });
}

/** React の描画と img の decode を待ってからキャプチャする */
export function nextPaintFrames(count = 2) {
  return new Promise((resolve) => {
    let left = count;
    const tick = () => {
      left -= 1;
      if (left <= 0) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

export function waitForImagesLoaded(root, timeoutMs = 5000) {
  if (!root) return Promise.resolve();
  const imgs = [...root.querySelectorAll('img')].filter((img) => img.getAttribute('src'));
  if (!imgs.length) return Promise.resolve();
  return Promise.all(
    imgs.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          const done = () => resolve();
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
          setTimeout(done, timeoutMs);
        }),
    ),
  );
}

/**
 * html2canvas は object-fit を正しく描画しないことがあるため、
 * キャプチャ直前に枠サイズへ画像をラスタライズする。
 */
export async function rasterizeFitImagesForCapture(root) {
  const imgs = [...root.querySelectorAll('img[data-fit-mode]')];
  await Promise.all(imgs.map((img) => rasterizeFitImage(img)));
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function rasterizeFitImage(img) {
  const fit = img.getAttribute('data-fit-mode') || 'cover';
  const rotation = Number(img.getAttribute('data-rotation') || 0);
  const box = img.parentElement;
  if (!box || !img.src) return;

  const w = Math.round(box.offsetWidth);
  const h = Math.round(box.offsetHeight);
  if (w < 1 || h < 1) return;

  const image = await loadImage(img.src);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  const swap = rotation % 180 !== 0;
  const iw = image.naturalWidth || image.width;
  const ih = image.naturalHeight || image.height;
  const srcW = swap ? ih : iw;
  const srcH = swap ? iw : ih;
  const scale =
    fit === 'fill'
      ? Math.max(w / srcW, h / srcH)
      : fit === 'contain'
        ? Math.min(w / srcW, h / srcH)
        : Math.max(w / srcW, h / srcH);
  const dw = srcW * scale;
  const dh = srcH * scale;
  const rad = (rotation * Math.PI) / 180;

  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(rad);
  ctx.drawImage(image, -dw / 2, -dh / 2, dw, dh);
  ctx.restore();

  img.src = canvas.toDataURL('image/png');
  img.style.position = 'absolute';
  img.style.left = '0';
  img.style.top = '0';
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.transform = 'none';
  img.style.objectFit = 'fill';
  img.style.maxWidth = 'none';
  img.style.maxHeight = 'none';
}
