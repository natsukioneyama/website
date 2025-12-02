(function () {
  'use strict';

  const container = document.getElementById('grid');
  if (!container) return;

  // ===== 1) justified-layout 用のデータ準備 =====
  const itemElements = Array.from(container.querySelectorAll('.jl-item'));
  const items = itemElements.map(el => {
    const w = Number(el.dataset.w) || 1;
    const h = Number(el.dataset.h) || 1;
    const isVideo = el.classList.contains('is-video');

    // グリッド用のサムネイル src
    let thumbSrc = '';
    if (isVideo) {
      const v = el.querySelector('video');
      if (v) thumbSrc = v.getAttribute('src') || '';
    } else {
      const img = el.querySelector('img');
      if (img) thumbSrc = img.getAttribute('src') || '';
    }

    // ライトボックス用の大きい src
    // data-full があればそれを使い、なければサムネと同じものを使う
    const fullSrc = el.dataset.full || thumbSrc;

    return {
      el,
      aspectRatio: w / h,
      isVideo,
      thumbSrc,
      fullSrc
    };
  });


  // ===== 2) レイアウト描画 =====
  function render() {
    const jl = window.justifiedLayout;
    if (!jl) {
      console.error('justifiedLayout が見つかりません');
      return;
    }

    const containerWidth = container.clientWidth;
    if (!containerWidth) return;

   // 画面幅で条件分岐（数字は好みで）
   const isSmall = window.matchMedia('(max-width: 768px)').matches;

   // モバイルっぽい幅のときと、それ以外で値を変える
   const rowHeight  = isSmall ? 400 : 280;
   const spacing    = isSmall ? 12  : 10;

   const layout = jl(
   items.map(i => ({ aspectRatio: i.aspectRatio })),
   {
     containerWidth,
     targetRowHeight: rowHeight,
     boxSpacing: spacing
   }
 );


    // コンテナ高さ
    container.style.height = layout.containerHeight + 'px';

    // 各 box の位置・サイズを反映
    layout.boxes.forEach((box, index) => {
      const it = items[index];
      const el = it.el;

      el.style.transform = `translate(${box.left}px, ${box.top}px)`;
      el.style.width  = box.width + 'px';
      el.style.height = box.height + 'px';
    });

    // レイアウト完了後に動画を自動再生
    const videos = container.querySelectorAll('video');
    videos.forEach(v => {
      v.muted = true;
      v.playsInline = true;
      v.loop = true;

      const p = v.play();
      if (p && p.catch) {
        p.catch(() => {}); // Safari の再生制限エラー対策
      }
    });
  }

  window.addEventListener('load', render);
  window.addEventListener('resize', render);

  // ===== 3) 動画のフルスクリーンボタン =====
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.fs-btn');
    if (!btn) return;

    const fig = btn.closest('.jl-item.is-video');
    if (!fig) return;

    const video = fig.querySelector('video');
    if (!video) return;

    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen(); // Safari
    } else if (video.msRequestFullscreen) {
      video.msRequestFullscreen();     // 旧 Edge
    }

    const p = video.play();
    if (p && p.catch) {
      p.catch(() => {});
    }
  });

  // ===== 4) Lightbox のセットアップ =====
  const modal    = document.getElementById('gallery-modal');
  const backdrop = modal.querySelector('.gm-backdrop');
  const frame    = modal.querySelector('.gm-frame');
  const imgEl    = modal.querySelector('.gm-image');
  const videoEl  = modal.querySelector('.gm-video');

  let currentIndex = 0;

  function isOpen() {
    return modal.getAttribute('aria-hidden') === 'false';
  }

  function openModal() {
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-lightbox-open');
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-lightbox-open');

    // 画像・動画をクリア
    imgEl.classList.remove('is-active');
    imgEl.removeAttribute('src');

    videoEl.classList.remove('is-active');
    videoEl.pause();
    videoEl.removeAttribute('src');
    videoEl.load();
  }

  function show(i) {
    if (!items.length) return;
    currentIndex = (i + items.length) % items.length;
    const item = items[currentIndex];
    if (!item || !item.fullSrc) return;

    // 一旦クリア
    imgEl.classList.remove('is-active');
    videoEl.classList.remove('is-active');
    imgEl.removeAttribute('src');
    videoEl.pause();
    videoEl.removeAttribute('src');
    videoEl.load();

    if (item.isVideo) {
      // 動画を表示（ライトボックス用の src）
      videoEl.src = item.fullSrc;
      videoEl.classList.add('is-active');
      openModal();

      const p = videoEl.play();
      if (p && p.catch) p.catch(() => {});
    } else {
      // 画像を表示（ライトボックス用の src）
      imgEl.src = item.fullSrc;
      imgEl.alt = '';
      imgEl.classList.add('is-active');
      openModal();
    }
  }


  // サムネイルクリック → Lightbox（fs-btn を除外）
  itemElements.forEach((el, idx) => {
    el.addEventListener('click', (ev) => {
      if (ev.target.closest('.fs-btn')) {
        // フルスクリーンボタンのクリックはライトボックスにしない
        return;
      }
      ev.preventDefault();
      show(idx);
    });
  });

  // 背景クリックで閉じる
  backdrop.addEventListener('click', closeModal);

  // キーボード（Esc / ← / →）
  document.addEventListener('keydown', (ev) => {
    if (!isOpen()) return;
    if (ev.key === 'Escape') {
      ev.preventDefault();
      closeModal();
    } else if (ev.key === 'ArrowRight') {
      ev.preventDefault();
      show(currentIndex + 1);
    } else if (ev.key === 'ArrowLeft') {
      ev.preventDefault();
      show(currentIndex - 1);
    }
  });

  // ===== 5) Lightbox 上でのスワイプ／ドラッグ =====
  // タッチスワイプ
  let touchStartX = null;

  frame.addEventListener('touchstart', (ev) => {
    if (!isOpen()) return;
    if (ev.touches.length === 1) {
      touchStartX = ev.touches[0].clientX;
    }
  }, { passive: true });

  frame.addEventListener('touchend', (ev) => {
    if (!isOpen() || touchStartX == null) return;
    const dx = ev.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      if (dx < 0) {
        show(currentIndex + 1);
      } else {
        show(currentIndex - 1);
      }
    }
    touchStartX = null;
  });

  // マウスドラッグ（PC）
  let dragStartX = null;
  let dragging = false;

  frame.addEventListener('mousedown', (ev) => {
    if (!isOpen()) return;
    dragging = true;
    dragStartX = ev.clientX;
  });

  window.addEventListener('mouseup', (ev) => {
    if (!dragging || !isOpen()) return;
    const dx = ev.clientX - dragStartX;
    if (Math.abs(dx) > 40) {
      if (dx < 0) {
        show(currentIndex + 1);
      } else {
        show(currentIndex - 1);
      }
    }
    dragging = false;
    dragStartX = null;
  });

})(); // IIFE 終了



// ===== BACK ボタン =====
document.getElementById('scrapBack').addEventListener('click', function (ev) {
  ev.preventDefault();

  // もし別タブで開いている場合はウインドウを閉じる
  if (window.history.length <= 1) {
    window.close();
  } else {
    // 通常のページ内遷移（index.html に戻る）
    window.location.href = "../index.html";
  }
});
