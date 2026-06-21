  /* =========================================================
  OVERVIEW SITE (PART 1/4)
  1) Justified Layout: items収集 / render / resize
  2) Grouping + Caption: data-title 単位でグループ化して先頭にだけキャプション
  3) Group Highlight: PC=hover / Touch=1st tap highlight, 2nd tap -> lightboxへ
  ========================================================= */

  /* =========================
  1) Justified Layout 設定（レスポンシブ）
  - row height / box spacing を viewport 幅で可変にする
  ========================= */

(function () {
  const container = document.getElementById('grid');
  if (!container) return;


  function getRowHeight() {
    const w = window.innerWidth;
    if (w <= 480) return 180;   // iPhone
    if (w <= 768) return 160;   // tablet small
    if (w <= 1200) return 210;  // laptop
    return 210;                 // desktop
  }

  function getBoxSpacing() {
    const w = window.innerWidth;
    if (w <= 480) return 10;
    if (w <= 768) return 9;
    if (w <= 1200) return 8;
    return 7;
  }

  /* =========================
     2) Overview items 収集（.jl-item 想定）
     - data-w / data-h から aspect ratio を作る
     ========================= */

  const itemElements = Array.from(container.children);

  const items = itemElements.map((el) => {
    const w = Number(el.dataset.w) || 1;
    const h = Number(el.dataset.h) || 1;
    return { el, aspectRatio: w / h };
  });

  /* =========================
     3) Grouping + Caption 生成（data-title 単位）
     - key = title + line1 でグループ化
     - グループ先頭だけ figcaption(.ov-cap) を付与
     - 先頭アイテムは data-head="1" を付ける
     ========================= */

  const groups = new Map(); // key -> { title, line1, line2, members[] }

  itemElements.forEach((el) => {
    // 画像 or 動画のメタ情報を取得（.lb-data があれば優先、なければ img）
    const meta = el.querySelector('.lb-data, img');
    if (!meta) return;

    let title = meta.dataset.title || '';
    const line1 = meta.dataset.line1 || '';
    const line2 = meta.dataset.line2 || '';

    // title が空なら line1 を仮タイトル扱い
    if (!title && line1) title = line1;

    // 両方空ならスキップ
    if (!title) return;

    const key = `${title}|||${line1}`;

    if (!groups.has(key)) {
      groups.set(key, { title, line1, line2, members: [] });
    }
    groups.get(key).members.push(el);

    // このアイテムが属するグループキーをDOMにも保存
    el.dataset.groupKey = key;
  });

  // グループ先頭だけキャプションを付与
  groups.forEach((group) => {
    if (!group.members.length) return;

    const headEl = group.members[0];
    headEl.dataset.head = '1';

    const cap = document.createElement('figcaption');
    cap.className = 'ov-cap';

    // title と line1 の関係で表示を分ける
    if (group.title === group.line1) {
      // data-title="" だった → line1 がタイトル扱い
      const b = document.createElement('b');
      b.textContent = group.line1;
      cap.appendChild(b);
    } else {
      // 通常ケース：title がメイン、line1 がサブ
      const b = document.createElement('b');
      b.textContent = group.title;
      cap.appendChild(b);

      if (group.line1) {
        const em = document.createElement('em');
        em.textContent = group.line1;
        cap.appendChild(em);
      }
    }

    if (group.line2) {
      const i = document.createElement('i');
      i.textContent = group.line2;
      cap.appendChild(i);
    }

    headEl.appendChild(cap);
  });

  /* =========================
     4) Group Highlight 制御（Hover / Tap 共通）
     - clear: ハイライト解除
     - set: keyから同グループのメンバーにclass付与
     ========================= */

  function clearGroupHighlight() {
    container.classList.remove('is-group-hover', 'is-group-tap');
    itemElements.forEach((el) => {
      el.classList.remove('is-in-group', 'tap-armed');
    });
  }

  function setGroupHighlightByKey(key, mode) {
    const group = groups.get(key);
    if (!group) return;

    clearGroupHighlight();

    group.members.forEach((el) => el.classList.add('is-in-group'));

    if (mode === 'hover') container.classList.add('is-group-hover');
    if (mode === 'tap') container.classList.add('is-group-tap');
  }

  /* =========================
     5) PC: hoverでグループをハイライト
     ========================= */

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    itemElements.forEach((el) => {
      const key = el.dataset.groupKey;
      if (!key) return;

      el.addEventListener('mouseenter', () => {
        setGroupHighlightByKey(key, 'hover');
      });

      el.addEventListener('mouseleave', () => {
        clearGroupHighlight();
      });
    });
  }

  /* =========================
     6) Touch: 1回目タップでハイライト、2回目でLightboxへ
     - capture=true で Lightbox の click より先に処理
     ========================= */

  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  if (isTouchDevice) {
    let armedItem = null;

    container.addEventListener('click', (e) => {
      const item = e.target.closest('.jl-item');
      if (!item) return;

      const key = item.dataset.groupKey;
      if (!key) return;

      // 1st tap: highlight only
      if (armedItem !== item) {
        e.preventDefault();
        e.stopPropagation();

        armedItem = item;
        item.classList.add('tap-armed');
        setGroupHighlightByKey(key, 'tap');
        return;
      }

      // 2nd tap: release highlight, then allow Lightbox handler to run
      clearGroupHighlight();
      armedItem = null;
    }, true);
  }

  /* =========================
     7) Justified Layout: render
     - items(aspectRatio) -> justifiedLayout -> boxes を absolute 配置
     ========================= */

  function render() {
    const jl = window.justifiedLayout;
    if (!jl) {
      console.error('justifiedLayout が見つかりません');
      return;
    }

    const containerWidth = container.clientWidth;
    if (!containerWidth) return;

    const layout = jl(
      items.map((i) => ({ aspectRatio: i.aspectRatio })),
      {
        containerWidth,
        targetRowHeight: getRowHeight(),
        boxSpacing: getBoxSpacing()
      }
    );

    container.style.height = layout.containerHeight + 'px';

    layout.boxes.forEach((box, index) => {
      const el = items[index].el;
      el.style.position = 'absolute';
      el.style.left = box.left + 'px';
      el.style.top = box.top + 'px';
      el.style.width = box.width + 'px';
      el.style.height = box.height + 'px';
    });

    document.body.classList.add('jl-ready');
  }

  // 初回描画
  render();

  /* =========================
     8) resize: debounceしてrender
     ========================= */

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      render();
    }, 150);
  });

})();










































/* =========================
   LIGHTBOX (gm)  ※移植版
   ========================= */
document.addEventListener('DOMContentLoaded', () => {
  const gm      = document.getElementById('gm');
  if (!gm) return;

  let activeCluster = [];

  const gmImg   = gm.querySelector('#gmImage');
  const gmVWrap = gm.querySelector('.gm-video-wrap');
  const gmVideo = gm.querySelector('#gmVideo');

  const gmTitle = gm.querySelector('.gm-ttl');
  const gmSub   = gm.querySelector('.gm-sub');
  const gmCount = gm.querySelector('.gm-counter');

  const gmClose = gm.querySelector('.gm-close');
  const gmPrev  = gm.querySelector('.gm-prev');
  const gmNext  = gm.querySelector('.gm-next');
  const gmBg    = gm.querySelector('.gm-backdrop');

  const gmNextProject = gm.querySelector('.gm-next-project');
  const gmPrevProject = gm.querySelector('.gm-prev-project');

  const items = Array.from(document.querySelectorAll('#grid .jl-item'));
  if (!items.length) return;





    // -------------------------
  // THUMB CAPTION: build from data-title
  // -------------------------
items.forEach((item) => {
  if (item.querySelector('.jl-caption')) return;

  const img  = item.querySelector('img[data-title]');
  const meta = item.querySelector('.lb-data[data-title]');

  const title =
    (img && img.dataset.title) ||
    (meta && meta.dataset.title) ||
    '';

  if (!title) return;

  const line1 =
    (img && img.dataset.line1) ||
    (meta && meta.dataset.line1) ||
    '';

  const line2 =
    (img && img.dataset.line2) ||
    (meta && meta.dataset.line2) ||
    '';

  const cap = document.createElement('div');
  cap.className = 'jl-caption';

  cap.innerHTML = `
    <div class="jl-cap-title">${title}</div>
    ${line1 ? `<div class="jl-cap-line">${line1}</div>` : ''}
    ${line2 ? `<div class="jl-cap-line">${line2}</div>` : ''}
  `;

  item.appendChild(cap);
});



  // -------------------------
  // 2-tap behavior on touch devices
  // 1st tap: show caption
  // 2nd tap: open lightbox
  // -------------------------
  const isTouch = (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);

  let lastTappedItem = null;
  let lastTapTime = 0;

  const closeAllCaptions = () => {
    items.forEach((el) => el.classList.remove('is-caption-visible'));
  };

  // 画面のどこかを触ったら閉じる（任意だが使いやすい）
  document.addEventListener('click', (e) => {
    if (e.target.closest('#grid .jl-item')) return;
    closeAllCaptions();
  }, true);






  let currentIndex = 0;

  function getActiveItems() {
  return activeCluster.length ? activeCluster : items;
}
  const imgCache = new Map(); 
  
  // full src -> { image, promise }
  function preloadFullImage(full) {
    if (!full) return null;
    let record = imgCache.get(full);
    if (record) return record;

    const image = new Image();
    image.src = full;

    let promise;
    if (image.decode) {
      promise = image.decode().catch(() => {});
    } else {
      promise = new Promise((resolve) => {
        image.onload  = () => resolve();
        image.onerror = () => resolve();
      });
    }

    record = { image, promise };
    imgCache.set(full, record);
    return record;
  }

  function preloadAround(index) {
    const targets = [index + 1, index - 1, index + 2, index - 2];
    targets.forEach((i) => {
      const safeIndex = (i + items.length) % items.length;
      const item = items[safeIndex];
      if (!item || item.classList.contains('is-video')) return;

      const img = item.querySelector('img');
      if (!img) return;

      const full = img.dataset.full || img.src;
      preloadFullImage(full);
    });
  }

  function updateCaption(img, meta) {
    const t  = (img && img.dataset.title) || (meta && meta.dataset.title) || '';
    const l1 = (img && img.dataset.line1) || (meta && meta.dataset.line1) || '';
    const l2 = (img && img.dataset.line2) || (meta && meta.dataset.line2) || '';
    gmTitle.textContent = t;
    gmSub.textContent   = [l1, l2].filter(Boolean).join(' / ');
  }

  function updateCounter() {
    if (gmCount) {
    gmCount.textContent = `${currentIndex + 1} / ${getActiveItems().length}`;    }
  }

  function showImage(img) {
    const full = img.dataset.full || img.src;
    const record = preloadFullImage(full);

    const apply = () => {
      gmImg.src = full;
      gmImg.hidden = false;
      gmImg.classList.add('ready');
    };

    if (record && record.promise) {
      record.promise.then(apply);
    } else {
      apply();
    }
  }

  function showVideo(meta) {
    const src = meta.dataset.full;
    if (!src) return;

    gmImg.hidden = true;
    gmImg.classList.remove('ready');
    gmImg.style.pointerEvents = 'none';

    gmVWrap.hidden = false;
    gmVideo.hidden = false;
    gmVWrap.classList.remove('is-ready');

    gmVideo.loop = true;

    if (gmVideo.src !== src) gmVideo.src = src;
    gmVideo.currentTime = 0;

    const onFirstFrame = () => {
      gmVWrap.classList.add('is-ready');
      gmVideo.removeEventListener('loadeddata', onFirstFrame);
    };
    gmVideo.addEventListener('loadeddata', onFirstFrame);

    const p = gmVideo.play();
    if (p && p.then) p.catch(() => {});
  }

  function openAt(index) {
  const activeItems = getActiveItems();

  currentIndex = (index + activeItems.length) % activeItems.length;
  const item = activeItems[currentIndex];

  const img = item.img || (item.querySelector ? item.querySelector('img') : null);
  const meta = item.meta || (item.querySelector ? item.querySelector('.lb-data') : null);

    gmImg.src = '';
    gmImg.classList.remove('ready');
    gmImg.hidden = false;

    gmVideo.pause();
    gmVideo.removeAttribute('src');
    gmVideo.currentTime = 0;
    gmVideo.hidden = true;
    gmVWrap.hidden = true;

    if (meta && meta.dataset.type === 'video') {
      showVideo(meta);
    } else if (img) {
      showImage(img);
    }

    updateCaption(img, meta);
    updateCounter();
    preloadAround(currentIndex);

    gm.setAttribute('aria-hidden', 'false');
  }


    function openNextImageOrProject() {
  const activeItems = getActiveItems();

  if (currentIndex < activeItems.length - 1) {
    openAt(currentIndex + 1);
  } else {
    openNextProject();
  }
}

function openPrevImageOrProject() {
  const activeItems = getActiveItems();

  if (currentIndex > 0) {
    openAt(currentIndex - 1);
  } else {
    openPrevProjectLastImage();
  }
}

function openPrevProjectLastImage() {
  if (!lastTappedItem) return;

  const allThumbs = items.filter(item => item.dataset.project);
  const thumbIndex = allThumbs.indexOf(lastTappedItem);

  if (thumbIndex === -1) return;

  const prevThumb =
    allThumbs[(thumbIndex - 1 + allThumbs.length) % allThumbs.length];

  setClusterFromThumb(prevThumb, 0);

  const activeItems = getActiveItems();
  openAt(activeItems.length - 1);
}


  function closeModal() {
    gm.setAttribute('aria-hidden', 'true');

    gmImg.src = '';
    gmImg.classList.remove('ready');
    gmImg.hidden = false;

    gmVideo.pause();
    gmVideo.removeAttribute('src');
    gmVideo.currentTime = 0;
    gmVideo.hidden = true;
    gmVWrap.hidden = true;
  }



 function openNextProject() {
  if (!lastTappedItem) return;

  const allThumbs = items.filter(item => item.dataset.project);
  const currentIndex = allThumbs.indexOf(lastTappedItem);

  if (currentIndex === -1) return;

  const nextThumb = allThumbs[(currentIndex + 1) % allThumbs.length];

  openAt(setClusterFromThumb(nextThumb, 0));
}

function openPrevProject() {
  if (!lastTappedItem) return;

  const allThumbs = items.filter(item => item.dataset.project);
  const currentIndex = allThumbs.indexOf(lastTappedItem);

  if (currentIndex === -1) return;

  const prevThumb =
    allThumbs[(currentIndex - 1 + allThumbs.length) % allThumbs.length];

  openAt(setClusterFromThumb(prevThumb, 0));
}

function setClusterFromThumb(item, fallbackIndex) {
  lastTappedItem = item;

activeCluster = Array.from(document.querySelectorAll("#grid .jl-item")).map((thumb) => {    
  const img = thumb.querySelector("img");

    return {
      img: {
        src: img.dataset.full,
        dataset: {
          full: img.dataset.full,
          title: img.dataset.title || "",
          line1: img.dataset.line1 || "",
          line2: img.dataset.line2 || ""
        }
      },
      meta: null
    };
  });

  return fallbackIndex;
}



  items.forEach((item, index) => {
    item.addEventListener('click', (e) => {
      // デスクトップは今まで通り（ホバーはCSS側）
      if (!isTouch) {
        e.preventDefault();
        openAt(setClusterFromThumb(item, index));
        return;
      }

      const now = Date.now();
      const isSame = (lastTappedItem === item);
      const isQuickSecondTap = (now - lastTapTime) < 800;

      // 2回目タップなら lightbox を開く
      if (item.classList.contains('is-caption-visible') && isSame && isQuickSecondTap) {
        e.preventDefault();
        openAt(setClusterFromThumb(item, index));

        lastTapTime = now;
        return;
      }

      // 1回目タップ：lightboxは開かずキャプションだけ
      e.preventDefault();
      e.stopPropagation();

      closeAllCaptions();
      item.classList.add('is-caption-visible');

      lastTappedItem = item;
      lastTapTime = now;
    });
  });  

gmPrev.addEventListener('click', (e) => {
  e.stopPropagation();
  openPrevImageOrProject();
});

 gmNext.addEventListener('click', (e) => {
  e.stopPropagation();
  openNextImageOrProject();
});

  gmClose.addEventListener('click', (e) => {
    e.stopPropagation();
    closeModal();
  });

  if (gmNextProject) {
  gmNextProject.addEventListener('click', (e) => {
    e.stopPropagation();
    openNextProject();
  });
}

if (gmPrevProject) {
  gmPrevProject.addEventListener('click', (e) => {
    e.stopPropagation();
    openPrevProject();
  });
}


  gmBg.addEventListener('click', () => closeModal());

  window.addEventListener('keydown', (e) => {
  if (gm.getAttribute('aria-hidden') === 'true') return;

  if (e.key === 'Escape') {
    e.preventDefault();
    closeModal();

  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    openNextImageOrProject();

  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    openPrevImageOrProject();
  }
});


  // swipe (mobile)
  let touchStartX = 0;
  let touchStartY = 0;
  let touchOnControls = false;

  gm.addEventListener('touchstart', (e) => {
    if (gm.getAttribute('aria-hidden') === 'true') return;
    const t = e.touches[0];
    if (!t) return;

    const target = e.target;
    if (target.closest('.gm-video-wrap') || target.closest('.sv-controls')) {
      touchOnControls = true;
      return;
    }

    touchOnControls = false;
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  }, { passive: true });









  gm.addEventListener('touchend', (e) => {
    if (gm.getAttribute('aria-hidden') === 'true') return;
    if (touchOnControls) {
      touchOnControls = false;
      return;
    }

    const t = e.changedTouches[0];
    if (!t) return;

    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;

    const minDist = 50;
    const maxVert = 40;

    const controls = gm.querySelector('.sv-controls');

   if (Math.abs(dx) > minDist && Math.abs(dy) < maxVert) {
  e.preventDefault();
  if (controls) controls.classList.remove('is-visible');

  if (dx < 0) {
    openNextImageOrProject();
  } else {
    openPrevImageOrProject();
  }
}
  }, { passive: false });



  function openFromOverviewParam() {
  const params = new URLSearchParams(window.location.search);
  const full = params.get('full');
  console.log(full);
  console.log("full from URL:", full);

  if (!full) return;

  const cleanPath = full
  .replace(window.location.origin, '')
  .replace(/^\.?\//, '');

  let targetProject = null;
  let targetIndex = -1;

  Object.entries(PROJECTS).some(([projectKey, projectItems]) => {
    const foundIndex = projectItems.findIndex((entry) => {
      return entry.src.replace(/^\.?\//, '') === cleanPath;
    });

    if (foundIndex !== -1) {
      targetProject = projectKey;
      targetIndex = foundIndex;
      return true;
    }

    return false;
  });

  if (!targetProject || targetIndex === -1) {
  console.log("NOT FOUND");
  return;
}

  const targetThumb = items.find((item) => item.dataset.project === targetProject);
  if (!targetThumb) return;

  setClusterFromThumb(targetThumb, targetIndex);

  setTimeout(() => {
  openAt(targetIndex);
  //history.replaceState({}, '', window.location.pathname);
}, 100);
}

openFromOverviewParam();


});



/* =========================
   gm video controls: progress + PLAY/FULL
   ========================= 
document.addEventListener('DOMContentLoaded', () => {
  const gm = document.getElementById('gm');
  if (!gm) return;

  const videoWrap = gm.querySelector('.gm-video-wrap');
  const video     = document.getElementById('gmVideo');
  const controls  = gm.querySelector('.sv-controls');
  if (!videoWrap || !video || !controls) return;

  const progTrack = controls.querySelector('.sv-progress');
  const progBar   = controls.querySelector('.sv-progress__bar');
  const btnPlay   = controls.querySelector('.sv-btn--play');
  const btnFs     = controls.querySelector('.sv-btn--fs');

  if (progTrack && video) {
    let isSeeking = false;

    const seekFromClientX = (clientX) => {
      const rect = progTrack.getBoundingClientRect();
      if (!rect.width || !video.duration) return;
      let ratio = (clientX - rect.left) / rect.width;
      ratio = Math.max(0, Math.min(1, ratio));
      video.currentTime = ratio * video.duration;
    };

    const onPointerMove = (e) => {
      if (!isSeeking) return;
      e.preventDefault();
      seekFromClientX(e.clientX);
    };

    const onPointerUp = () => {
      if (!isSeeking) return;
      isSeeking = false;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    progTrack.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      isSeeking = true;
      seekFromClientX(e.clientX);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    });
  }

  if (video && progBar) {
    video.addEventListener('timeupdate', () => {
      if (!video.duration) return;
      const ratio = video.currentTime / video.duration;
      progBar.style.width = `${ratio * 100}%`;
    });
    video.addEventListener('loadedmetadata', () => {
      progBar.style.width = '0%';
    });
  }

  if (btnPlay && video) {
    btnPlay.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (video.paused) {
        video.play().catch(() => {});
        btnPlay.textContent = 'PAUSE';
      } else {
        video.pause();
        btnPlay.textContent = 'PLAY';
      }
    });
  }

  if (btnFs && video) {
    btnFs.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (video.requestFullscreen) video.requestFullscreen();
      else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
    });
  }

  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);

  if (isTouch) {
    const AUTO_HIDE_MS = 2000;
    let hideControlsTimer = null;

    const clearHideTimer = () => {
      if (hideControlsTimer) {
        clearTimeout(hideControlsTimer);
        hideControlsTimer = null;
      }
    };

    const scheduleHide = () => {
      clearHideTimer();
      hideControlsTimer = setTimeout(() => {
        controls.classList.remove('is-visible');
        try {
          controls.style.opacity = '0';
          controls.style.pointerEvents = 'none';
        } catch {}
        hideControlsTimer = null;
      }, AUTO_HIDE_MS);
    };

    const showControlsOnce = () => {
      try {
        controls.style.opacity = '';
        controls.style.pointerEvents = '';
      } catch {}
      controls.classList.add('is-visible');
      scheduleHide();
    };

    const handleVideoTap = (e) => {
      if (e.target.closest('.sv-controls') || e.target.closest('.sv-btn')) return;
      e.stopPropagation();
      if (controls.classList.contains('is-visible')) {
        clearHideTimer();
        controls.classList.remove('is-visible');
      } else {
        showControlsOnce();
      }
    };

    let lastTouchTime = 0;

    video.addEventListener('touchend', (e) => {
      lastTouchTime = Date.now();
      handleVideoTap(e);
    }, { passive: true });

    video.addEventListener('click', (e) => {
      if (Date.now() - lastTouchTime < 700) return;
      handleVideoTap(e);
    });

    const suspendAutoHide = (e) => {
      e.stopPropagation();
      clearHideTimer();
      try {
        controls.style.opacity = '';
        controls.style.pointerEvents = '';
      } catch {}
      controls.classList.add('is-visible');
    };

    const resumeAutoHide = (e) => {
      e.stopPropagation();
      scheduleHide();
    };

    controls.addEventListener('pointerdown', suspendAutoHide);
    controls.addEventListener('pointerup', resumeAutoHide);
    controls.addEventListener('touchstart', suspendAutoHide, { passive: true });
    controls.addEventListener('touchend', resumeAutoHide);
  } else {
    controls.classList.remove('is-visible');
  }
});
*/
