// top.js
document.addEventListener('DOMContentLoaded', () => {

/* ===== INFO PAGE TOGGLE ===== */

const infoLink = document.querySelector('.js-info');
const infoPage = document.getElementById('infoPage');

function setInfoOpen(isOpen) {
  document.body.classList.toggle('info-open', isOpen);
  if (infoPage) {
    infoPage.setAttribute('aria-hidden', String(!isOpen));
  }
}

if (infoLink && infoPage) {
  infoLink.addEventListener('click', (e) => {
    e.preventDefault();

    if (document.body.classList.contains('gm-open')) return;

    const isOpen = document.body.classList.contains('info-open');
    setInfoOpen(!isOpen);
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    setInfoOpen(false);
  }
});




  /* ===== LIGHTBOX (gm) ===== */
  const gm       = document.getElementById('gm');
  const gmImg    = document.getElementById('gmImage');
  const gmTtl    = gm ? gm.querySelector('.gm-ttl') : null;
  const gmSub    = gm ? gm.querySelector('.gm-sub') : null;
  const gmCount  = gm ? gm.querySelector('.gm-counter') : null;
  const btnClose = gm ? gm.querySelector('.gm-close') : null;
  const btnPrev  = gm ? gm.querySelector('.gm-prev') : null;
  const btnNext  = gm ? gm.querySelector('.gm-next') : null;
  const backdrop = gm ? gm.querySelector('.gm-backdrop') : null;

  const thumbImgs = Array.from(
    document.querySelectorAll('.thumbs .jl-item img')
  );

  // ★ サムネはすべて lazy load にする（対応ブラウザでは有効）
  thumbImgs.forEach((img) => {
    img.loading = 'lazy';
  });

  // gm / 画像 / サムネがなければ何もしない
  if (!gm || !gmImg || !thumbImgs.length) return;

  const items = thumbImgs.map((img) => ({
    thumbEl: img,
    full:   img.dataset.full || img.src,
    title:  img.dataset.title || '',
    line1:  img.dataset.line1 || '',
    line2:  img.dataset.line2 || ''
  }));

  // ★ 現在のインデックス
  let currentIndex = 0;
  // ★ 開いているかどうか（DOM 属性を見る前に軽くチェック）
  let gmIsOpen = false;

  // ★ スワイプ用
  let touchStartX = 0;
  let touchStartY = 0;
  let isTouching  = false;

  // ★ iPhone / iPod のみタップ fw/rv を無効化（iPad は PC と同じ扱い）
  const isIPhone = /iPhone|iPod/.test(navigator.userAgent || '');

  // ★ プリロード用キャッシュ（同じ画像を何度も読み込まないように）
  const preloadCache = new Map();

  function preload(index) {
    const item = items[index];
    if (!item) return;

    const src = item.full;
    if (preloadCache.has(src)) return; // 既にプリロード済み

    const img = new Image();
    img.src = src;

    let p;
    if (img.decode) {
      // decode 対応ブラウザならデコード完了まで待つ
      p = img.decode().catch(() => {});
    } else {
      // 古いブラウザ用フォールバック
      p = new Promise((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    }
    preloadCache.set(src, p);
  }

  async function updateSlide(index) {
    const item = items[index];
    if (!item) return;

    const src = item.full;

    // ★ 今回のリクエスト番号を記録（連打対策）
    const myIndex = index;

    // ★ フェードアウト（opacity:0 に戻す）
    gmImg.classList.remove('ready');

    // ★ 裏読み込み用の Image を作成
    const preloadImg = new Image();
    preloadImg.src = src;

    try {
      // decode() が使えるブラウザ → 完全読み込みまで待つ
      if (preloadImg.decode) {
        await preloadImg.decode();
      } else {
        // フォールバック
        await new Promise((resolve) => {
          preloadImg.onload = resolve;
          preloadImg.onerror = resolve;
        });
      }
    } catch (err) {
      // 読み込み失敗でも続行
    }

    // ★ その間に currentIndex が変更されていたら無効化（古い表示を防止）
    if (myIndex !== currentIndex || !gmIsOpen) return;

    // ★ 完全読み込み → 即時差し替え（ちらつきゼロ）
    gmImg.src = src;
    gmImg.alt = item.title || item.line1 || '';

    if (gmTtl) gmTtl.textContent = item.title || '';
    if (gmSub) {
      gmSub.textContent = [item.line1, item.line2]
        .filter(Boolean)
        .join(' / ');
    }
    if (gmCount) gmCount.textContent = `${index + 1} / ${items.length}`;

    // ★ “次” と “前” の画像もプリロード開始
    preload(index + 1);
    preload(index - 1);

    // ★ 次フレームで .ready を付けてフェードイン
    requestAnimationFrame(() => {
      gmImg.classList.add('ready');
    });
  }

  function openLightbox(index) {
    currentIndex = index;
    gmIsOpen = true;

    updateSlide(currentIndex);

    gm.setAttribute('aria-hidden', 'false');
    document.body.classList.add('gm-open');
  }

  function closeLightbox() {
    gmIsOpen = false;

    gm.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('gm-open');
  }

  function showNext(delta) {
    if (!items.length) return;
    currentIndex = (currentIndex + delta + items.length) % items.length;
    updateSlide(currentIndex);
  }

  // サムネクリックでオープン（iPhone 含め全端末で有効）
  thumbImgs.forEach((img, idx) => {
    img.addEventListener('click', () => {
      openLightbox(idx);
    });
  });

  // 閉じる（クリック / タッチを確実に拾う）
  if (btnClose) {
    ['click', 'touchend'].forEach((ev) => {
      btnClose.addEventListener(ev, (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeLightbox();
      }, { passive: ev === 'touchend' });
    });
  }

  // 保険：gm 全体で .gm-close を拾う（X のどこを押しても閉じる）
  gm.addEventListener('click', (e) => {
    if (e.target.closest('.gm-close')) {
      e.preventDefault();
      e.stopPropagation();
      closeLightbox();
    }
  });

  // 背景クリックで閉じる
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      closeLightbox();
    });
  }

  // 前後ボタン（iPhone ではタップで次へ・前へを無効化）
  if (btnPrev && !isIPhone) {
    btnPrev.addEventListener('click', () => showNext(-1));
  }
  if (btnNext && !isIPhone) {
    btnNext.addEventListener('click', () => showNext(1));
  }

  // ★★ iPhone / タッチ端末用：スワイプで前後 ★★
  gm.addEventListener('touchstart', (e) => {
    if (!gmIsOpen) return;
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    isTouching  = true;
  }, { passive: true });

  gm.addEventListener('touchend', (e) => {
    if (!isTouching || !gmIsOpen) return;
    isTouching = false;

    const t  = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // 縦方向の動きが大きい / 横の移動が小さいときは無視
    if (absDx < 40 || absDx < absDy) return;

    if (dx < 0) {
      // 左にスワイプ → 次へ
      showNext(1);
    } else {
      // 右にスワイプ → 前へ
      showNext(-1);
    }
  }, { passive: true });

  // キーボード操作（PC 向け）
  window.addEventListener('keydown', (e) => {
    if (!gmIsOpen) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      showNext(1);
    } else if (e.key === 'ArrowLeft') {
      showNext(-1);
    }
  });
});
