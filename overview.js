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
    if (w <= 1200) return 170;  // laptop
    return 180;                 // desktop
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




document.addEventListener('DOMContentLoaded', () => {
  const thumbItems = Array.from(document.querySelectorAll('#grid .jl-item'));

thumbItems.forEach((item) => {
  item.addEventListener('click', (e) => {
    e.preventDefault();

    const img = item.querySelector('img');
    const full = img?.dataset?.full;

    if (!full) return;

    window.location.href = `index.html?full=${encodeURIComponent(full)}`;
  });
});

});