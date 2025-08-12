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
    { src: "img/untitled/01/06.jpg", type:"image" },
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

  if(it.type === 'video'){
    const v = document.createElement('video');
    v.src = it.src;
    v.autoplay = true; v.loop = true; v.muted = true; v.playsInline = true; v.setAttribute('playsinline','');
    v.controls = false; // 操作はさせない
    v.className = 'lb-media';
    lbStage.appendChild(v);
  }else{
    const img = document.createElement('img');
    img.src = it.src; img.alt = '';
    img.className = 'lb-media';
    lbStage.appendChild(img);
  }
  lbPage.textContent = `${String(i+1).padStart(2,'0')}/${String(currentItems.length).padStart(2,'0')}`;

  lbTitle.innerHTML = `<div class="artist-name">NATSUKI ONEYAMA</div>${(currentItems[i]?.title || '')}`;
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
