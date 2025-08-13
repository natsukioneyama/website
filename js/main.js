// ===== Masonry（Overviewのみ適用） =====
  const grid = document.querySelector('#overview');
  const msnry = new Masonry(grid, {
    itemSelector: '.masonry-item',
    columnWidth: '.masonry-sizer',
    gutter: 10,
    percentPosition: true,
    horizontalOrder: true
  });

  imagesLoaded(grid, () => {
    msnry.layout();
    grid.classList.add('is-ready');
  }).on('progress', () => msnry.layout());

  grid.querySelectorAll('video').forEach(v => {
    v.addEventListener('loadeddata', () => msnry.layout(), { once: true });
  });

// ====== プロジェクトごとのギャラリー定義（2つ）======
const projectGalleries = [
  [ // Project 0 : 
    { src: "img/untitled/01/11.jpg", type:"image" },
    { src: "img/untitled/01/22.jpg", type:"image" },
    { src: "img/untitled/01/05.jpg", type:"image" },
    { src: "img/untitled/01/19.jpg", type:"image" },
    { src: "img/untitled/01/15.jpg", type:"image" },
    { src: "img/untitled/01/14.jpg", type:"image" }
  ],
  [ // Project 1 : 
    { src: "img/beautypapers/01/07.jpg", type:"image" },
    { src: "img/beautypapers/01/20.jpg", type:"image" },
    { src: "img/beautypapers/01/16.jpg", type:"image" },
    { src: "img/beautypapers/01/14.jpg", type:"image" },
    { src: "img/beautypapers/01/12.jpg", type:"image" },
    { src: "img/beautypapers/01/05.jpg", type:"image" } 
  ]
];

// ====== Lightbox 共通 ======
const lb = document.getElementById('lightbox');
const lbTitle = document.querySelector('.lb-title');
const lbMeta  = document.querySelector('.lb-meta');
const lbPage  = document.querySelector('.lb-page');
const lbStage = document.querySelector('.lb-stage');
const lbClose = document.getElementById('lb-close');
const lbPrev  = document.querySelector('.lb-prev');
const lbNext  = document.querySelector('.lb-next');
const hsL = document.querySelector('.lb-hotspot-left');
const hsR = document.querySelector('.lb-hotspot-right');

let currentItems = [];
let currentIndex = 0;

function render(i){
  currentIndex = i;
  const it = currentItems[i];
  lbStage.innerHTML = '';



 if (it.type === 'video') {
  const v = document.createElement('video');
  v.src = it.src;
  v.autoplay = true;
  v.loop = true;
  v.muted = true;
  v.playsInline = true;
  v.setAttribute('playsinline', '');
  v.controls = true;
  v.preload = 'metadata';
  v.className = 'lb-media';
  lbStage.appendChild(v);

  lb.classList.add('has-video'); // （z-indexを使っているならそのまま）

  // まずデフォルトは「余白クリック＝有効」
  hsL.style.pointerEvents = 'auto';
  hsR.style.pointerEvents = 'auto';

  // ---- ここから：座標ベースの安全域ガード ----
  // 直前のガードがあれば解除（スライド切替時の重複防止）
  if (lb._guardHandler) {
    lb.removeEventListener('mousemove', lb._guardHandler);
    lb._guardHandler = null;
  }
  if (lb._guardTimer) {
    clearTimeout(lb._guardTimer);
    lb._guardTimer = null;
  }

  const PAD = 20;   // ← 動画の周囲 60px を「安全域」にする（好みで 40–100 に調整）
  const DELAY = 100; // ← 離れてからホットスポット復活までの猶予（ms）

  const disableHotspots = () => {
    if (lb._guardTimer) { clearTimeout(lb._guardTimer); lb._guardTimer = null; }
    hsL.style.pointerEvents = 'none';
    hsR.style.pointerEvents = 'none';
  };
  const enableHotspotsWithDelay = () => {
    if (lb._guardTimer) clearTimeout(lb._guardTimer);
    lb._guardTimer = setTimeout(() => {
      hsL.style.pointerEvents = 'auto';
      hsR.style.pointerEvents = 'auto';
      lb._guardTimer = null;
    }, DELAY);
  };

  // 画面内のマウス座標が「動画+安全域」に入っている間はホットスポット無効
  const guard = (ev) => {
    const r = v.getBoundingClientRect();
    const x = ev.clientX, y = ev.clientY;
    const inside =
      x >= r.left - PAD && x <= r.right + PAD &&
      y >= r.top  - PAD && y <= r.bottom + PAD;

    if (inside) {
      disableHotspots();          // → コントロール操作OK & ネイティブUIが消えにくい
    } else {
      enableHotspotsWithDelay();  // → すぐには復活させない（UIが即消えしない）
    }
  };

  lb._guardHandler = guard;
  lb.addEventListener('mousemove', guard);

  // タッチ環境の保険（タップ中は無効、離れて少し後に復活）
  v.addEventListener('touchstart', disableHotspots, { passive: true });
  v.addEventListener('touchend',   enableHotspotsWithDelay, { passive: true });

  // （任意）PC向け：UI延命ハック（必要なら残す）
  let keepAlive;
  if (matchMedia('(pointer:fine)').matches) {
    const startKeepAlive = () => {
      if (keepAlive) clearInterval(keepAlive);
      keepAlive = setInterval(() => {
        try { v.dispatchEvent(new MouseEvent('mousemove', { bubbles: true })); } catch(_) {}
      }, 1200);
    };
    const stopKeepAlive = () => { if (keepAlive) { clearInterval(keepAlive); keepAlive = null; } };
    v.addEventListener('mouseenter', startKeepAlive);
    v.addEventListener('mouseleave', stopKeepAlive);
    document.addEventListener('fullscreenchange', stopKeepAlive, { once: true });
  }

} else {
  // 画像スライド
  lb.classList.remove('has-video');

  const img = document.createElement('img');
  img.src = it.src; img.alt = '';
  img.className = 'lb-media';
  lbStage.appendChild(img);

  // 念のため復帰
  hsL.style.pointerEvents = 'auto';
  hsR.style.pointerEvents = 'auto';

  // video専用ガードの後始末
  if (lb._guardHandler) {
    lb.removeEventListener('mousemove', lb._guardHandler);
    lb._guardHandler = null;
  }
  if (lb._guardTimer) {
    clearTimeout(lb._guardTimer);
    lb._guardTimer = null;
  }
}



  lbPage.textContent = `${String(i+1).padStart(2,'0')}/${String(currentItems.length).padStart(2,'0')}`;

  lbTitle.innerHTML = `<div class="artist-name">NATSUKI ONEYAMA<br>Make-up Artist</div>${(currentItems[i]?.title || '')}`;
  lbMeta.innerHTML  = (currentItems[i]?.meta || '').replace(/\n/g, '<br>');
  resizeLbStage();
}


const LB_STAGE_GAP = 0;

function resizeLbStage() {
  const header = document.querySelector('.lb-header');
  const stage  = document.querySelector('.lb-stage');
  if (!header || !stage) return;

  const h = header.offsetHeight;             // ヘッダー高さ
  const top = h + LB_STAGE_GAP;               // 余白込み

  stage.style.top    = top + 'px';
  stage.style.height = `calc(100vh - ${top}px)`;

   lb.style.setProperty('--lb-stage-top',    top + 'px');
  lb.style.setProperty('--lb-stage-height', `calc(100vh - ${top}px)`);
}


function openWith(items, title, meta) {
  currentItems = items.slice();
  render(0); // ここで render() 側がタイトルとmetaを更新してくれる

  lb.classList.add('open');
  lb.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';

  resizeLbStage();
}



function closeLb(){
  lb.classList.remove('open');
  lb.setAttribute('aria-hidden','true');
  lbStage.innerHTML='';
  document.body.style.overflow='';
}
function prev(){ render((currentIndex-1+currentItems.length)%currentItems.length); }
function next(){ render((currentIndex+1)%currentItems.length); }

lbClose.addEventListener('click', closeLb);
lbPrev.addEventListener('click', prev);
lbNext.addEventListener('click', next);
hsL.addEventListener('click', prev);
hsR.addEventListener('click', next);
window.addEventListener('keydown', e=>{
  if(!lb.classList.contains('open')) return;
  if(e.key==='Escape') closeLb();
  if(e.key==='ArrowLeft') prev();
  if(e.key==='ArrowRight') next();
});

// ===== プロジェクトをクリック → そのプロジェクトだけ開く =====
document.querySelectorAll('.project-card').forEach((card)=>{
  card.addEventListener('click', (e)=>{
    e.preventDefault();
    const pIndex = parseInt(card.dataset.project,10);
    // ★ 各スライドにカードの title/meta を付ける
    const withMeta = projectGalleries[pIndex].map(it => ({
      ...it,
      title: it.title ?? card.dataset.title,
      meta:  it.meta  ?? card.dataset.meta
    }));
    openWith(withMeta); // ← title/meta は各アイテムに入ったので渡さなくてOK
  });
});


// ===== Overview の全アイテムを 1つのギャラリーとして開く =====
const overviewLinks = Array.from(document.querySelectorAll('#overview .masonry-item'));
const overviewItems = overviewLinks.map(a=>({
  src: a.getAttribute('href'),
  type: a.dataset.type || 'image',
  title: a.dataset.title || '',
  meta: a.dataset.meta || ''
}));

overviewLinks.forEach((a,idx)=>{
  a.addEventListener('click', (e)=>{
    e.preventDefault();
    // header はクリックした要素から：
    openWith(overviewItems, a.dataset.title || '', a.dataset.meta || '');
    // ページイン後にその画像へジャンプ
    render(idx);
  });
});
window.addEventListener('resize', () => {
  if (lb.classList.contains('open')) resizeLbStage();
});
