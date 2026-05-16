// index.js

/* =========================
   INFO PAGE TOGGLE
   ========================= */
(() => {
  const infoLink  = document.querySelector('.js-info');
  const infoPage  = document.getElementById('infoPage');
  const infoClose = document.querySelector('.js-info-close');

  function setInfoOpen(isOpen){
    document.body.classList.toggle('info-open', isOpen);
    if(infoPage){
      infoPage.setAttribute('aria-hidden', String(!isOpen));
    }
  }

  if(infoLink && infoPage){
    infoLink.addEventListener('click', (e) => {
      e.preventDefault();
      setInfoOpen(!document.body.classList.contains('info-open'));
    });

    infoPage.addEventListener('click', (e) => {
      if(e.target.closest('.info-page__inner')) return;
      setInfoOpen(false);
    });
  }

  if(infoClose){
    infoClose.addEventListener('click', (e) => {
      e.preventDefault();
      setInfoOpen(false);
    });
  }
})();










const PROJECTS = {

    adidasadistarcontrol5: [
  {
    src: "img/adidas/02/01.webp",
    title: "ADIDAS ADISTAR CONTROL 5",
    line1: "",
    line2: ""
  },
    {
    src: "img/adidas/02/02.webp",
    title: "ADIDAS ADISTAR CONTROL 5",
    line1: "",
    line2: ""
  },
    {
    src: "img/adidas/02/03.webp",
    title: "ADIDAS ADISTAR CONTROL 5",
    line1: "",
    line2: ""
  },
    {
    src: "img/adidas/02/04.webp",
    title: "ADIDAS ADISTAR CONTROL 5",
    line1: "",
    line2: ""
  }
],

  adidasxodi: [
  {
    src: "img/adidas/01/01.webp",
    title: "ADIDAS X ODI",
    line1: "",
    line2: ""
  },
  {
    src: "img/adidas/01/02.webp",
    title: "ADIDAS X ODI",
    line1: "",
    line2: ""
  }
],

  patcharavipa: [
  {
    src: "img/patcharavipa/ss26/01.webp",
    title: "PATCHARAVIPA SS26",
    line1: "",
    line2: ""
  },
  {
    src: "img/patcharavipa/ss26/02.webp",
    title: "PATCHARAVIPA SS26",
    line1: "",
    line2: ""
  },
  {
    src: "img/patcharavipa/ss26/03.webp",
    title: "PATCHARAVIPA SS26",
    line1: "",
    line2: ""
  }
],

  swarovski: [
  {
    src: "img/swarovski/01/01.webp",
    title: "SWAROVSKI",
    line1: "",
    line2: ""
  },
  {
    src: "img/swarovski/01/02.webp",
    title: "SWAROVSKI",
    line1: "",
    line2: ""
  }
],

  delvaux: [
  {
    src: "img/delvaux/delvaux_xxl/01.webp",
    title: "DELVAUX XXL",
    line1: "",
    line2: ""
  },
  {
    src: "img/delvaux/delvaux_xxl/02.webp",
    title: "DELVAUX XXL",
    line1: "",
    line2: ""
  }
],

  arthusbertrand: [
  {
    src: "img/arthusbertrand/01/01.webp",
    title: "ARHTUS BERTRAND",
    line1: "",
    line2: ""
  },
  {
    src: "img/arthusbertrand/01/02.webp",
    title: "ARHTUS BERTRAND",
    line1: "",
    line2: ""
  }
]



};

/* =========================
   REAL MASONRY (Desandro)
   Smooth resize (RAF throttle + final debounce)
   ========================= */
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('grid');
  if (!grid) return;
  if (typeof Masonry === 'undefined' || typeof imagesLoaded === 'undefined') return;

  const msnry = new Masonry(grid, {
    itemSelector: '.jl-item',
    columnWidth: '.grid-sizer',
    percentPosition: false,
    gutter: 10,
    transitionDuration: 0,
    resize: false
  });

  // 念のため：内部のresizeハンドラを確実に外す（重要）
  if (typeof msnry.unbindResize === 'function') msnry.unbindResize();

  imagesLoaded(grid, () => msnry.layout());


  // 動画の高さ確定 → Masonry再計算（rAFスロットリングに乗せる）
grid.querySelectorAll("video").forEach(v => {
  const kick = () => layoutOncePerFrame(); // ← 連打防止

  v.addEventListener("loadedmetadata", kick, { once: true });
  v.addEventListener("loadeddata", kick, { once: true });





  // 再生可能になった時（保険）
  v.addEventListener("loadeddata", () => {
    msnry.layout();
  });

});

  // ---- 1) rAFで1フレーム1回までlayout ----
  let rafId = 0;
  const layoutOncePerFrame = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      msnry.layout();
    });
  };

  // ---- 2) resizeが止まったら最後に1回だけ確定layout ----
  let stopTimer = 0;
  const scheduleFinalLayout = () => {
    clearTimeout(stopTimer);
    stopTimer = setTimeout(() => {
      msnry.layout();
    }, 140);
  };

  // window resize（ドラッグ）でも対応
  window.addEventListener('resize', () => {
    layoutOncePerFrame();
    scheduleFinalLayout();
  }, { passive: true });

  // さらに確実に：#grid の幅変化も拾う（Safari/ズーム/回転対策）
  const ro = new ResizeObserver(() => {
    layoutOncePerFrame();
    scheduleFinalLayout();
  });
  ro.observe(grid);
});
















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

  const projectId = item.dataset.project;
  const projectItems = PROJECTS[projectId];

  if (!projectId || !projectItems || !projectItems.length) {
    activeCluster = [];
    return fallbackIndex;
  }

  activeCluster = projectItems.map((entry) => ({
    img: {
      src: entry.src,
      dataset: {
        full: entry.src,
        title: entry.title || "",
        line1: entry.line1 || "",
        line2: entry.line2 || ""
      }
    },
    meta: null
  }));

  return 0;
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
    openAt(currentIndex - 1);
  });

  gmNext.addEventListener('click', (e) => {
    e.stopPropagation();
    openAt(currentIndex + 1);
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
      openAt(currentIndex + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      openAt(currentIndex - 1);
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
      if (dx < 0) openAt(currentIndex + 1);
      else openAt(currentIndex - 1);
    }
  }, { passive: false });

  function openFromOverviewParam() {
  const params = new URLSearchParams(window.location.search);
  const full = params.get('full');

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

  if (!targetProject || targetIndex === -1) return;

  const targetThumb = items.find((item) => item.dataset.project === targetProject);
  if (!targetThumb) return;

  setClusterFromThumb(targetThumb, targetIndex);

  requestAnimationFrame(() => {
    openAt(targetIndex);
    history.replaceState({}, '', window.location.pathname);
  });
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
