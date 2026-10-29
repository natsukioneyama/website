/* index.html: Selected Works top page.
 * One continuous 1-column sequence of giant project thumbnails, plus (Desktop/Tablet
 * only) a fixed-left dynamic caption reflecting whichever thumbnail is currently
 * centered (see the IntersectionObserver below) - both driven by the same SEQUENCE
 * array and the same openProject() function, so there is exactly one navigation
 * code path. Below that, a per-project horizontal filmstrip modal driven by native
 * scroll (no external carousel library, no custom pointer-drag - touch gets native
 * momentum for free).
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const main = $('index-main'), brand = $('index-brand');
  const headerNav = document.querySelector('.index-header-nav');
  const modal = $('index-modal'), stage = $('index-stage'), modalCaption = $('index-modal-caption');
  const modalHeader = $('index-modal-header');
  const info = $('index-info'), infoClose = $('index-info-close');
  const projectsById = new Map(window.PORTFOLIO_PROJECTS.map(p => [p.id, p]));

  // Left fixed-UI dynamic caption (PC only, >=1024px - see report), positioned via
  // index.css relative to #index-brand, not in the central .index-visual. Hand-
  // curated per-project caption content,
  // deliberately kept out of portfolio-data.js: issue/publication metadata like
  // this exists nowhere in that file (confirmed against the current file), and this
  // is display-only copy for this one page's left UI, not portfolio data. Edit this
  // object directly to add/change a project's label or lines - e.g. a future
  // '[FEATURED PROJECT]' entry - nothing else needs to change.
  const INDEX_CAPTIONS = {
    'more-or-less': {
      label: '[NEWEST FEATURED PROJECT]',
      lines: [
        'MORE OR LESS',
        '#9 2026 COVER STORY',
        'DURIMEL'
      ]
    },
    'modern-weekly-style': {
      label: '[NEWEST FEATURED PROJECT]',
      lines: [
        'MODERN WEEKLY STYLE',
        'OCTOBER 2026 COVER STORY',
        'FELIX COOPER'
      ]
    },
    'voguecs': {
      label: '[FEATURED PROJECT]',
      lines: [
        'VOGUE CZECHOSLOVAKIA',
        'OCTOBER ISSUE 2026', 
        'GOSIA TURCZYNSKA'
      ]
    },    
        '10-magazine': {
      label: '[FEATURED PROJECT]',
      lines: [
        '10 MAGAZINE',
        'ISSUE 77  AUTUMN/WINTER 2026',
        'FERRY VAN DER NAT'
      ]
    }
  
  };

  // PC/tablet left caption: a container for the project list built further down
  // (see "list"), where the current project is expanded in place - there is no
  // separate big-caption block any more. Hidden on phones (index.css).
  const caption = document.createElement('div');
  caption.className = 'index-caption';
  main.prepend(caption);

  // Mobile/Tablet Portrait (<=1023px - see report) static caption: same
  // INDEX_CAPTIONS data source as the PC dynamic caption above, just its first
  // entry, rendered once at load and never updated by hover/scroll (unlike
  // .index-caption). A plain block in normal document flow, not fixed/sticky, so it
  // scrolls away with the page - inserted as #index-visual's own previous sibling
  // (not a child of it) so it sits between the header and the first .index-thumb
  // without joining the thumbnail sequence itself. Hidden >=1024px in index.css.
  // Reuses .index-featured-label/.index-first-ref (and their existing <=1023px
  // padding rules) rather than introducing new typography/spacing CSS.
  // (experiment/fixed-index-scroll: now fixed to the bottom of the screen via
  // index.css and updated by updateCaption() together with the PC caption, so it
  // follows the current slide instead of always showing the first entry.)
  const mobileCaption = document.createElement('div');
  mobileCaption.className = 'index-mobile-caption';
  const mobileCaptionLabel = document.createElement('div');
  mobileCaptionLabel.className = 'index-featured-label';
  const mobileCaptionRef = document.createElement('div');
  mobileCaptionRef.className = 'index-first-ref';
  mobileCaption.append(mobileCaptionLabel, mobileCaptionRef);
  main.insertBefore(mobileCaption, $('index-visual'));

  // Caption text for a project. Projects with no INDEX_CAPTIONS entry fall back to
  // the same [title, line1] pairing the modal caption already uses (see
  // openProject); the label line is simply omitted for those.
  function captionFor(project) {
    const entry = INDEX_CAPTIONS[project.id];
    return {label: entry?.label || '', lines: entry ? entry.lines : [project.title, project.line1].filter(Boolean)};
  }
  const toParagraphs = lines => lines.map(text => {
    const p = document.createElement('p');
    p.textContent = text;
    return p;
  });
  // Phone bottom caption (the PC/tablet list expands the current item itself).
  function updateCaption(project) {
    const {label, lines} = captionFor(project);
    mobileCaptionLabel.textContent = label;
    mobileCaptionLabel.hidden = !label;
    mobileCaptionRef.replaceChildren(...toParagraphs(lines));
  }

  // The single 14-project sequence, in display order, for the giant-thumbnail
  // visual column. Entries without mediaIndex use media[0] as the cover image.
  // Verified against the current portfolio-data.js.
  const SEQUENCE = [
    {id: 'more-or-less'},
    {id: 'modern-weekly-style'},
    {id: 'voguecs'},
    {id: '10-magazine'},
  ];

  function buildVisual(container, entries) {
    entries.forEach(({id, mediaIndex = 0}) => {
      const project = projectsById.get(id);
      if (!project) { console.warn(`index.html: unknown project id "${id}"`); return; }
      const media = project.media[mediaIndex];
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'index-thumb';
      button.dataset.projectId = id;
      button.setAttribute('aria-label', `Open ${project.title || project.line1 || id}`);
      const img = document.createElement('img');
      // index.html displays these thumbnails large, so it uses the existing 1200px-class
      // `full` asset instead of the ~350px `thumb` overview.html's own grid uses - no new
      // images generated, portfolio-data.js unchanged. width/height stay the thumb-sized
      // values already in the data (same aspect ratio either way) purely as the img
      // element's intrinsic-size hint; loading="lazy" still keeps off-screen cost down.
      img.src = media.full; img.alt = media.alt || project.title || '';
      img.width = media.width; img.height = media.height;
      // Off-screen slides sit inside an overflow:hidden stage, which native lazy
      // loading may never consider "near the viewport" - see preloadAround() below,
      // which switches the neighbours to eager before they slide in.
      img.loading = 'lazy'; img.decoding = 'async'; img.draggable = false;
      button.append(img);
      button.addEventListener('click', () => openProject(project));
      container.append(button);
    });
  }
  buildVisual($('index-visual'), SEQUENCE);

  // Fixed-screen slide controller (experiment/fixed-index-scroll). The page itself
  // never scrolls (index.css); each .index-thumb is a full-screen slide stacked in
  // the same spot, and data-pos puts it above (prev), on screen (current) or below
  // (next) the viewport. Every slide before the current one is "prev" and every
  // slide after it is "next", so moving one step only ever changes two slides and
  // each always enters from / leaves to the correct side - no reset frames needed.
  const SLIDE_MS = 600;           // must match the transition - set as a CSS var below
  const WHEEL_THRESHOLD = 8;      // px of accumulated deltaY that counts as one step
  const WHEEL_GESTURE_GAP = 150;  // ms of wheel silence that ends one gesture
  const SWIPE_THRESHOLD = 40;     // px of vertical finger travel that counts as a swipe
  const visual = $('index-visual');
  const slides = [...visual.querySelectorAll('.index-thumb')];
  visual.style.setProperty('--index-slide-ms', SLIDE_MS + 'ms');
  let current = 0, animating = false, queuedTarget = null;

  // One list of every SEQUENCE project (PC/tablet only - .index-caption is hidden
  // on phones). Each <li> holds both views of its project: a small two-line button
  // (publication + issue, the first two INDEX_CAPTIONS lines) and the full big
  // caption (label + every line). Only the current item shows the big one, and the
  // whole list is shifted so that block starts just below the image's top edge
  // (alignList) - earlier projects end up above it, later ones below. Hover (PC) and tap (tablet) both just request that slide.
  const list = document.createElement('ol');
  list.className = 'index-list';
  const listRows = [];
  const listItems = slides.map((slide, i) => {
    const {label, lines} = captionFor(projectsById.get(slide.dataset.projectId));
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'index-list-item';
    button.append(...lines.slice(0, 2).map(text => {
      const span = document.createElement('span');
      span.textContent = text;
      return span;
    }));
    button.addEventListener('click', () => requestSlide(i));
    const detail = document.createElement('div');
    detail.className = 'index-list-detail';
    if (label) {
      const labelEl = document.createElement('div');
      labelEl.className = 'index-featured-label';
      labelEl.textContent = label;
      detail.append(labelEl);
    }
    const ref = document.createElement('div');
    ref.className = 'index-first-ref';
    ref.append(...toParagraphs(lines));
    detail.append(ref);
    li.append(button, detail);
    list.append(li);
    listRows.push(li);
    return button;
  });
  caption.append(list);

  // Shift the list so the current item's expanded caption (its first line) starts
  // exactly at .index-caption's top edge, which index.css pins a little below the
  // image's top edge (--index-caption-y). Layout (offsetTop, relative to the
  // positioned .index-list) ignores transforms, so this is stable mid-animation.
  // Later projects stack their predecessors above that line, so when there isn't
  // room for them the whole list is pushed down just enough that its first row
  // stays below --index-safe-top (clear of the logo/nav) - the expanded caption
  // then sits lower than usual rather than the list running under the header.
  //
  // Exception - the first project: its expanded caption starts at the same Y as
  // its small entry does while the second project is selected, so the first
  // caption's top edge never moves when switching between the two. That position
  // is derived from the current layout: with row 0 expanded, row 1 is a small row,
  // whose height (pitch) and button inset are exactly what row 0 would have.
  function alignList() {
    const detail = listRows[current]?.querySelector('.index-list-detail');
    if (!detail) return;
    const safeTop = parseFloat(getComputedStyle(caption).getPropertyValue('--index-safe-top')) || 0;
    const clamp = shift => Math.max(shift, safeTop - caption.getBoundingClientRect().top);
    let shift = clamp(-detail.offsetTop);
    if (current === 0 && listRows.length > 1) {
      const pitch = listRows[1].offsetHeight;
      // Small rows centre their button (index.css: align-items: center). Computed
      // rather than read from offsetTop, which rounds to whole pixels.
      const inset = (pitch - listItems[1].offsetHeight) / 2;
      const gap = detail.offsetTop - listRows[0].offsetTop;
      const shiftWhenSecond = clamp(-(pitch + gap)); // second row's caption then sits at pitch + gap
      shift = shiftWhenSecond + inset - detail.offsetTop;
    }
    list.style.transform = `translateY(${shift}px)`;
  }
  // FLIP: after the current row changes (rows resize, list re-aligns), animate
  // every row from where it was on screen to where it is now, with the same
  // duration/easing as the image slide, and fade in the swapped text of the two
  // rows that changed size. Rows are the animated elements; the Dock scale lives on
  // the inner button, so the two never fight over one transform.
  function relayoutList(from) {
    const before = listRows.map(row => row.getBoundingClientRect().top);
    listRows.forEach((row, i) => row.classList.toggle('is-current', i === current));
    alignList();
    if (reducedMotion.matches || from === current) return; // initial layout: no animation
    listRows.forEach((row, i) => {
      const dy = before[i] - row.getBoundingClientRect().top;
      if (dy) row.animate([{transform: `translateY(${dy}px)`}, {transform: 'none'}], {duration: SLIDE_MS, easing: 'cubic-bezier(0.65, 0, 0.35, 1)'});
      if (i === current || i === from) row.animate([{opacity: 0}, {opacity: 1}], {duration: SLIDE_MS * 0.6, easing: 'ease-out'});
    });
  }
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  function layoutSlides(from) {
    slides.forEach((slide, i) => {
      const pos = i < current ? 'prev' : i > current ? 'next' : 'current';
      // A jump of more than one step (list hover/tap) moves the slides in between
      // from below to above (or back). They're off screen the whole time, so they
      // jump instantly instead of sweeping across the viewport - only the outgoing
      // and incoming slides animate.
      const skipped = i !== from && i !== current && slide.dataset.pos !== pos;
      slide.classList.toggle('is-instant', skipped);
      slide.dataset.pos = pos;
      // Off-screen slides stay out of the tab order and the accessibility tree.
      slide.inert = i !== current;
    });
    visual.offsetWidth; // flush the instant moves before transitions come back
    slides.forEach(slide => slide.classList.remove('is-instant'));
    listItems.forEach((item, i) => item.toggleAttribute('aria-current', i === current));
    relayoutList(from);
  }
  function preloadAround() {
    [current - 1, current + 1].forEach(i => {
      const img = slides[i]?.querySelector('img');
      if (img) img.loading = 'eager';
    });
  }
  // The one place a slide change happens. Whatever the distance, exactly two slides
  // animate: the outgoing one leaves upward when moving forward (downward when
  // moving back) and the target enters from the opposite side, in SLIDE_MS.
  function moveTo(target) {
    if (target < 0 || target >= slides.length || target === current) return;
    const from = current;
    animating = true;
    current = target;
    const img = slides[current].querySelector('img');
    if (img) img.loading = 'eager';
    layoutSlides(from);
    preloadAround();
    updateCaption(projectsById.get(slides[current].dataset.projectId));
    listSettledAt = performance.now() + SLIDE_MS;
    clearTimeout(hoverTimer);
    setTimeout(() => {
      animating = false;
      // The list has stopped moving: whatever row now sits under a still pointer
      // must not count as a hover until the pointer actually moves (see dockFrame).
      hoverArmY = dockY;
      // The latest request that arrived mid-animation (wheel gesture, list hover or
      // tap) runs now - intermediate ones were simply overwritten, so a fast hover
      // sweep never stacks up animations.
      const next = queuedTarget; queuedTarget = null;
      if (next != null && indexActive()) moveTo(next);
    }, SLIDE_MS);
  }
  // Keyboard and touch swipes: ignored while a slide is moving (unchanged behaviour).
  function go(dir) {
    if (!animating) moveTo(current + dir);
  }
  // Wheel gestures and the list: never dropped - queued if a slide is moving.
  function requestSlide(target) {
    target = Math.max(0, Math.min(slides.length - 1, target));
    if (animating) queuedTarget = target === current ? null : target;
    else moveTo(target);
  }
  const indexActive = () => modal.hidden && info.hidden;

  // Initial state: SEQUENCE[0], laid out without animating in.
  layoutSlides(0);
  preloadAround();
  if (slides.length) updateCaption(projectsById.get(slides[0].dataset.projectId));

  // Wheel / trackpad: one gesture = exactly one step, fired as early as possible.
  // A macOS trackpad flick keeps sending inertial wheel events for 1-2s after the
  // finger lifts, with no gap in between, so "wait for silence" alone would swallow
  // any second swipe made during that tail. Instead, once a gesture has fired its
  // step, its remaining events are watched rather than just ignored:
  //  - inertia only ever decays, so after the deltas fall below half their peak
  //    ("decaying"), a renewed rise (two events in a row clearly above the lowest
  //    value seen since) can only be a new finger swipe;
  //  - inertia never reverses, so a delta in the opposite direction is a new swipe;
  //  - WHEEL_GESTURE_GAP ms of silence also ends the gesture (mouse wheels, which
  //    have no inertia and don't decay).
  // A new gesture that completes while a slide is still animating is queued (one
  // step, latest request wins - see requestSlide) and runs the moment the 600ms
  // animation ends.
  let wheelAcc = 0, wheelLast = 0, wheelSign = 0, wheelConsumed = false;
  let wheelPeak = 0, wheelTrough = 0, wheelDecaying = false, wheelRise = 0;
  addEventListener('wheel', e => {
    if (!indexActive() || e.ctrlKey) return; // ctrlKey = trackpad pinch-zoom
    e.preventDefault();
    const scale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1;
    const dy = e.deltaY * scale, dx = e.deltaX * scale;
    if (dy === 0 || Math.abs(dy) < Math.abs(dx)) return; // mostly-horizontal swipe
    const now = performance.now(), abs = Math.abs(dy), sign = Math.sign(dy);

    let newGesture = now - wheelLast > WHEEL_GESTURE_GAP;
    wheelLast = now;
    if (!newGesture && wheelConsumed) {
      if (sign !== wheelSign) {
        newGesture = true;
      } else if (!wheelDecaying) {
        wheelPeak = Math.max(wheelPeak, abs);
        if (abs < wheelPeak * 0.5) { wheelDecaying = true; wheelTrough = abs; }
      } else if (abs > wheelTrough * 2 + 4) {
        newGesture = ++wheelRise >= 2;
      } else {
        wheelRise = 0; wheelTrough = Math.min(wheelTrough, abs);
      }
    }
    if (newGesture) { wheelConsumed = false; wheelAcc = 0; }
    if (wheelConsumed) return;

    if (Math.sign(wheelAcc) !== sign) wheelAcc = 0;
    wheelAcc += dy;
    if (Math.abs(wheelAcc) >= WHEEL_THRESHOLD) {
      requestSlide(current + sign);
      wheelConsumed = true; wheelAcc = 0; wheelSign = sign;
      wheelPeak = abs; wheelDecaying = false; wheelRise = 0;
    }
  }, {passive: false});

  // Touch: vertical swipe, judged on release. A tap (no real movement) falls through
  // to the slide button's normal click, which opens the project modal.
  let touchStartX = 0, touchStartY = 0, touchTracking = false;
  addEventListener('touchstart', e => {
    touchTracking = indexActive() && e.touches.length === 1;
    if (!touchTracking) return;
    touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY;
  }, {passive: true});
  addEventListener('touchend', e => {
    if (!touchTracking) return;
    touchTracking = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX, dy = t.clientY - touchStartY;
    if (Math.abs(dy) >= SWIPE_THRESHOLD && Math.abs(dy) > Math.abs(dx)) go(dy < 0 ? 1 : -1);
  }, {passive: true});
  addEventListener('touchcancel', () => { touchTracking = false; }, {passive: true});

  // PC list hover: macOS Dock-style magnification + hover-to-switch. Mouse only
  // (pointerType check), so tablet taps go through the plain click handler above
  // and phones never see the list at all. Each small item's scale depends only on
  // its distance from the pointer (cosine falloff over DOCK_RANGE px), measured from
  // the <li> rows, and is applied as a transform on the inner button - so nothing
  // is pushed aside. The CSS transition on that transform smooths the wave and the
  // return to 1 on leave; it is separate from the 600ms slide/list movement.
  //
  // Because selecting a project re-centres the list, the row under a motionless
  // pointer changes on its own. To stop that from chaining into further switches:
  //  - no hover switching while the list is moving (until listSettledAt);
  //  - once it settles, the pointer must move HOVER_REARM_PX from where it was
  //    (hoverArmY) before hover counts again;
  //  - a row must stay under the pointer for HOVER_DWELL_MS, so sweeping across
  //    rows on the way to another one doesn't select each of them.
  const DOCK_MAX_SCALE = 1.2;  // first pass, deliberately modest - easy to retune
  const DOCK_RANGE = 72;       // px from the pointer at which magnification reaches 0
  const HOVER_REARM_PX = 12;
  const HOVER_DWELL_MS = 80;
  let dockY = null, dockRaf = null, listSettledAt = 0, hoverArmY = null;
  let hoverTimer = null, hoverPending = -1;
  function rowAt(y) {
    return listRows.findIndex(row => {
      const r = row.getBoundingClientRect();
      return y >= r.top && y < r.bottom;
    });
  }
  function hoverAllowed() {
    if (dockY == null || !indexActive() || performance.now() < listSettledAt) return false;
    if (hoverArmY != null) {
      if (Math.abs(dockY - hoverArmY) < HOVER_REARM_PX) return false;
      hoverArmY = null;
    }
    return true;
  }
  function dockFrame() {
    dockRaf = null;
    if (dockY == null) return;
    listRows.forEach((row, i) => {
      const r = row.getBoundingClientRect();
      const d = Math.abs(dockY - (r.top + r.height / 2));
      const f = i !== current && d < DOCK_RANGE ? (1 + Math.cos(Math.PI * d / DOCK_RANGE)) / 2 : 0;
      listItems[i].style.transform = reducedMotion.matches || f === 0 ? '' : `scale(${1 + (DOCK_MAX_SCALE - 1) * f})`;
    });
    const target = hoverAllowed() ? rowAt(dockY) : -1;
    if (target === hoverPending) return;
    clearTimeout(hoverTimer);
    hoverPending = target;
    if (target < 0 || target === current) return;
    hoverTimer = setTimeout(() => {
      hoverPending = -1;
      if (hoverAllowed() && rowAt(dockY) === target) requestSlide(target);
    }, HOVER_DWELL_MS);
  }
  list.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    dockY = e.clientY;
    dockRaf ??= requestAnimationFrame(dockFrame);
  });
  list.addEventListener('pointerleave', () => {
    dockY = null; hoverArmY = null; hoverPending = -1;
    clearTimeout(hoverTimer);
    listItems.forEach(item => { item.style.transform = ''; });
  });
  // The big caption's size follows the viewport (clamp() in index.css), and web
  // fonts change line heights once loaded - re-centre without animating.
  addEventListener('resize', alignList);
  document.fonts?.ready.then(alignList);

  // Scroll lock/restore: same technique as overview.js's lock()/close() (fixed body,
  // remember scrollY, inert the background, restore and refocus on close). main
  // (thumbnails + caption) and header nav are inerted alongside brand since they're
  // the interactive background elements while the modal is open.
  let returnFocus = null, scrollY = 0;
  function lock() {
    returnFocus = document.activeElement; scrollY = window.scrollY;
    Object.assign(document.body.style, {position: 'fixed', top: -scrollY + 'px', width: '100%'});
    main.inert = true; headerNav.inert = true; brand.inert = true;
  }
  function unlock() {
    main.inert = false; headerNav.inert = false; brand.inert = false;
    Object.assign(document.body.style, {position: '', top: '', width: ''});
    window.scrollTo(0, scrollY); returnFocus?.focus({preventScroll: true});
  }

  // Safari/WebKit resolves :focus-visible on a script-focused element as true even when
  // the interaction that triggered it was a mouse click (see overview.js, which fixed
  // the same bug on its own info-close button) - suppressed the same way here via the
  // shared .no-ring class/CSS rule from overview.css.
  function focusInitial(el, viaKeyboard) {
    el.classList.toggle('no-ring', !viaKeyboard);
    el.focus({preventScroll: true});
  }

  // Information overlay: same content/structure/close-by-button-or-Escape behavior as
  // overview.html's #info, reusing this file's own lock()/unlock() (which don't
  // reference the project modal at all, so they apply equally here).
  function openInfo(viaKeyboard) {
    lock();
    info.hidden = false;
    brand.setAttribute('aria-expanded', 'true');
    focusInitial(infoClose, viaKeyboard);
  }
  function closeInfo() {
    if (info.hidden) return;
    info.hidden = true;
    brand.setAttribute('aria-expanded', 'false');
    unlock();
  }
  brand.addEventListener('click', e => openInfo(e.detail === 0));
  infoClose.addEventListener('click', closeInfo);
  // Background-click close: e.target is the element the click actually landed on
  // (unaffected by bubbling), so this only fires for a direct hit on #index-info
  // itself, outside .info-columns and the close button - clicking any real content
  // never closes it.
  info.addEventListener('click', e => { if (e.target === info) closeInfo(); });

  function makeNode(m, project) {
    const node = document.createElement(m.type === 'video' ? 'video' : 'img');
    // Set the aspect ratio from portfolio-data.js's own dataW/dataH up front, so the
    // strip's layout (offsetLeft/offsetWidth) is correct immediately - not dependent
    // on the image finishing its network fetch/decode before we can position it.
    node.style.aspectRatio = `${m.dataW} / ${m.dataH}`;
    if (m.type === 'video') {
      node.muted = true; node.loop = true; node.playsInline = true; node.controls = true; node.preload = 'auto';
      node.src = m.src;
    } else {
      node.src = m.full; node.alt = m.alt || project.title || ''; node.decoding = 'async'; node.draggable = false;
    }
    return node;
  }

  // A project has a clear first and last image - one set only, no clones, no loop.
  // Reaching either end simply stops the native scroll at its natural 0/max; closing
  // on "one further push past the end" is handled separately below.
  let stripEls = [];
  function buildStrip(project) {
    stage.replaceChildren();
    stripEls = project.media.map(m => makeNode(m, project));
    stripEls.forEach(el => stage.append(el));
    stage.scrollLeft = 0;
  }
  function maxScroll() { return Math.max(0, stage.scrollWidth - stage.clientWidth); }

  // Arrow-key navigation: continuous time-based scroll while a key is held, not a
  // discrete per-image step. Speed is driven by elapsed time between animation
  // frames, not by how many keydown-repeat events fire, so it advances at a constant
  // rate regardless of the OS's repeat rate.
  //
  // Edge-close: reaching the last (or first) image must not close the modal by
  // itself - only a further push past it should. Once continuous scroll is pinned
  // at 0 or maxScroll (the browser clamps further attempts, so scrollLeft stops
  // changing), an elapsed-time timer starts; the modal only closes once the key has
  // stayed held at that pinned edge past EDGE_CLOSE_MS, not the instant it arrives.
  const ARROW_SCROLL_SPEED = 700; // px/s, first pass - easy to retune
  const EDGE_CLOSE_MS = 260; // first pass - a short, deliberate extra push, not instant
  let heldArrowKey = null, arrowRafId = null, arrowLastT = null, edgeHoldStart = null;
  function arrowFrame(t) {
    if (heldArrowKey !== 'ArrowRight' && heldArrowKey !== 'ArrowLeft') { arrowRafId = null; arrowLastT = null; edgeHoldStart = null; return; }
    if (arrowLastT == null) arrowLastT = t;
    const dt = t - arrowLastT; arrowLastT = t;
    const dir = heldArrowKey === 'ArrowRight' ? 1 : -1;
    stage.scrollLeft += dir * ARROW_SCROLL_SPEED * (dt / 1000);
    const atEdge = dir > 0 ? stage.scrollLeft >= maxScroll() - 0.5 : stage.scrollLeft <= 0.5;
    if (atEdge) {
      if (edgeHoldStart == null) edgeHoldStart = t;
      else if (t - edgeHoldStart >= EDGE_CLOSE_MS) { closeProject(); return; }
    } else {
      edgeHoldStart = null;
    }
    arrowRafId = requestAnimationFrame(arrowFrame);
  }
  function startArrowScroll(key) {
    if (heldArrowKey === key) return;
    heldArrowKey = key; edgeHoldStart = null;
    if (arrowRafId == null) { arrowLastT = null; arrowRafId = requestAnimationFrame(arrowFrame); }
  }
  function stopArrowScroll(key) {
    if (heldArrowKey === key) { heldArrowKey = null; edgeHoldStart = null; }
  }
  function stopArrowScrollAll() {
    heldArrowKey = null; edgeHoldStart = null;
    if (arrowRafId != null) { cancelAnimationFrame(arrowRafId); arrowRafId = null; }
    arrowLastT = null;
  }
  // Safety net: if focus leaves the window while a key is physically still held (e.g.
  // switching apps), no keyup ever arrives - stop on blur so scrolling can't get stuck.
  addEventListener('blur', stopArrowScrollAll);

  // Touch: native horizontal scroll is unchanged (no custom pointer-drag). Detecting
  // "swiped past the last/first image" from touch is inherently limited - once
  // scrollLeft is clamped at 0/max, the DOM gives no signal for *how hard* the user
  // kept dragging past it, only that a touch is still active. This tracks whether a
  // touch is currently down and, once scrolling has settled (debounced, so it never
  // fights the browser's own still-resolving momentum/rubber-band physics) pinned at
  // an edge while that touch is still active, starts the same edge-hold timer as the
  // keyboard path. This is a best-effort heuristic, not verified on real iOS Safari -
  // see the report.
  let touchActive = false, touchEdgeHoldStart = null;
  stage.addEventListener('touchstart', () => { touchActive = true; touchEdgeHoldStart = null; }, {passive: true});
  stage.addEventListener('touchend', () => { touchActive = false; touchEdgeHoldStart = null; }, {passive: true});
  stage.addEventListener('touchcancel', () => { touchActive = false; touchEdgeHoldStart = null; }, {passive: true});
  // A normal quick swipe past the edge lifts the finger (touchend, touchActive
  // becomes false) well before the native momentum/rubber-band animation actually
  // settles back at 0/maxScroll, so the debounced touchActive check below alone
  // almost never fires on a real device - that's the reported iPhone bug. iOS's
  // elastic overscroll genuinely reports scrollLeft outside [0, maxScroll] while
  // bouncing (not just a visual effect - the DOM property itself briefly reads past
  // the edge), so checking every raw scroll event for that excursion catches the
  // "swiped past the edge" gesture directly, independent of whether the finger is
  // still down. Kept as a small OVERSCROLL_PX tolerance, not a hard 0/max check, so
  // normal clamped scrolling never triggers it by accident.
  const OVERSCROLL_PX = 8;
  let scrollSyncTimer = null;
  stage.addEventListener('scroll', () => {
    const max = maxScroll();
    if (stage.scrollLeft < -OVERSCROLL_PX || stage.scrollLeft > max + OVERSCROLL_PX) { closeProject(); return; }
    clearTimeout(scrollSyncTimer);
    scrollSyncTimer = setTimeout(() => {
      const atEdge = stage.scrollLeft <= 0.5 || stage.scrollLeft >= max - 0.5;
      if (atEdge && touchActive) {
        if (touchEdgeHoldStart == null) touchEdgeHoldStart = performance.now();
        else if (performance.now() - touchEdgeHoldStart >= EDGE_CLOSE_MS) closeProject();
      } else {
        touchEdgeHoldStart = null;
      }
    }, 120);
  }, {passive: true});

  function openProject(project) {
    lock();
    modalCaption.textContent = [project.title, project.line1].filter(Boolean).join(' // ');
    // Reveal before building the strip: setting scrollLeft on a [hidden] (display:none)
    // subtree is a no-op in browsers, since a non-rendered element has no real scroll
    // position to set. Both happen synchronously in the same turn, so nothing is ever
    // painted at the wrong starting frame.
    modal.hidden = false;
    buildStrip(project);
    modal.focus({preventScroll: true});
  }
  function closeProject() {
    if (modal.hidden) return;
    clearTimeout(scrollSyncTimer);
    stopArrowScrollAll();
    touchActive = false; touchEdgeHoldStart = null;
    stage.replaceChildren(); stripEls = [];
    modal.hidden = true;
    unlock();
  }

  // Click/tap on the brand/caption overlay closes; clicking the background margin
  // or an actual image does not.
  modal.addEventListener('click', e => {
    if (modalHeader.contains(e.target)) closeProject();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (!modal.hidden) { e.preventDefault(); closeProject(); }
      else if (!info.hidden) { e.preventDefault(); closeInfo(); }
      return;
    }
    if (modal.hidden) {
      // Index slide navigation from the keyboard (only while no overlay is open).
      if (!info.hidden) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); go(-1); }
      return;
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      // Ignore the OS's own key-repeat events entirely - our own rAF loop (started
      // once, on the initial non-repeat keydown) drives continuous motion from
      // elapsed time, not from how many repeat events fire.
      if (!e.repeat) startArrowScroll(e.key);
    }
  });
  document.addEventListener('keyup', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') stopArrowScroll(e.key);
  });
})();
