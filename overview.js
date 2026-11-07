/* HTML13.00 Phase 1. JL engine and box placement retained from HTML12.02.
 * One ordered data sequence; one current modal node; no large-image preload pool.
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const grid = $('grid'), modal = $('modal'), stage = $('stage'), info = $('info');
  const headerNav = document.querySelector('.index-header-nav');
  const sequence = window.PORTFOLIO_PROJECTS.flatMap(project => project.media.map(media => ({project, media})));
  const fine = () => matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let selected = -1, current = -1, active = null, returnFocus, scrollY = 0;
  let wheelSum = 0, wheelLast = 0, wheelCooldown = 0, gesture = null;
  // Two-node slide transition state: `liveNode` is the settled, currently-visible media
  // element (the one drag/keyboard/wheel act on); `transitioning` locks out new navigation
  // input for the duration of a committed slide so inputs never overlap animations.
  let liveNode = null, transitioning = false, activeAnimations = [];
  const SLIDE_MS = 280, SLIDE_EASING = 'ease-out';
  // Neighbor preloading: warms the browser's network+decode cache for the media one step
  // ahead/behind the current index (wrapping across the page sequence), so by the time
  // the user actually navigates there the image is already fetched/decoded. Never awaited
  // by navigation itself, so it can never slow down the response to input.
  const preloadedSrcs = new Set();
  function preloadMedia(index) {
    const m = sequence[index]?.media;
    if (!m || m.type === 'video' || preloadedSrcs.has(m.full)) return;
    preloadedSrcs.add(m.full);
    const img = new Image();
    img.src = m.full;
    img.decode?.().catch(() => {});
  }
  function preloadNeighbors(index) {
    const n = sequence.length;
    preloadMedia((index + 1) % n);
    preloadMedia((index - 1 + n) % n);
  }

  function caption(target, index) {
    target.replaceChildren();
    if (index < 0) return;
    const p = sequence[index].project;
    [p.title, p.line1, p.line2].filter(Boolean).forEach(text => {
      const line = document.createElement('span'); line.textContent = text; target.append(line);
    });
  }
  const videos = new Set();
  const visibleVideos = new Set();

  function syncVideos() {
    for (const video of videos) {
      if (!active && !document.hidden && visibleVideos.has(video)) {
        if (video.paused) video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
    if (document.hidden) stage.querySelectorAll('video').forEach(video => video.pause());
  }

  const observer = new IntersectionObserver(entries => {
    for (const { target, isIntersecting } of entries) {
      if (isIntersecting) visibleVideos.add(target);
      else visibleVideos.delete(target);
    }
    syncVideos();
  });

  const buttonsByProject = new Map();
  let highlighted = null;
  function clearGroupHighlight() {
    if (highlighted) buttonsByProject.get(highlighted).forEach(b => b.classList.remove('is-in-group'));
    highlighted = null;
  }
  function setGroupHighlight(projectId) {
    clearGroupHighlight();
    highlighted = projectId;
    buttonsByProject.get(projectId).forEach(b => b.classList.add('is-in-group'));
  }
  // The project's caption, shown only on its first thumbnail (see .ov-cap).
  function groupCaption(project) {
    const cap = document.createElement('span'); cap.className = 'ov-cap';
    cap.append(...[...new Set([project.title, project.line1, project.line2].filter(Boolean))].map(text => {
      const line = document.createElement('span'); line.textContent = text; return line;
    }));
    return cap;
  }
  const buttons = sequence.map(({project, media: m}, index) => {
    const button = document.createElement('button'); button.className = 'jl-item';
    button.type = 'button';
    const isVideo = m.type === 'video';
    const mediaLabel = isVideo ? 'Play film' : `Open image ${project.media.indexOf(m) + 1}`;
    button.setAttribute('aria-label', `${mediaLabel} · ${project.title}`);
    button.dataset.w = m.dataW; button.dataset.h = m.dataH;
    const node = document.createElement(isVideo ? 'video' : 'img');
    if (isVideo) {
      node.muted = true;
      node.loop = true;
      node.playsInline = true;
      node.preload = 'none';
      if (m.thumb) node.poster = m.thumb;
      node.src = m.src;
      videos.add(node);
      observer.observe(node);
    } else {
      node.src = m.thumb;
      node.alt = '';
      node.width = m.width;
      node.height = m.height;
      node.loading = 'lazy';
      node.decoding = 'async';
    }
    node.draggable = false;
    button.append(node);
    grid.append(button);
    if (!buttonsByProject.has(project.id)) {
      buttonsByProject.set(project.id, []);
      button.dataset.head = '1';
      button.append(groupCaption(project));
    }
    buttonsByProject.get(project.id).push(button);
    // Hovering highlights this button's whole project, not just itself. Moving the
    // pointer between two thumbnails of the same project fires mouseleave and
    // mouseenter back to back before the next paint, so nothing flickers in between.
    button.addEventListener('mouseenter', () => { if (fine()) setGroupHighlight(project.id); });
    button.addEventListener('mouseleave', () => { if (fine()) clearGroupHighlight(); });
    button.addEventListener('click', e => {
      if (fine() || e.detail === 0 || selected === index) {
        selected = -1;
        clearGroupHighlight();
        openModal(index, e.detail === 0);
      } else {
        // Touch has no hover, so a first tap previews the project and a second tap
        // on the same item opens it (the `selected === index` case above).
        selected = index;
        setGroupHighlight(project.id);
      }
    });
    return button;
  });
  // A tap anywhere but a thumbnail ends the touch preview, so it can't get stuck.
  document.addEventListener('click', e => {
    if (selected < 0 || e.target.closest('.jl-item')) return;
    selected = -1;
    clearGroupHighlight();
  });

  function render() {
    if (!sequence.length) return;
    const width = grid.clientWidth;
    const mobile = innerWidth <= 767;
    const spacing = 12;
    const options = {
      containerWidth: width,
      targetRowHeight: mobile ? Math.min(240, width / 2) : 210,
      boxSpacing: spacing,
    };
    const boxes = [];
    let top = 0;
    let photos = [];

    function placeRows(items) {
      if (!items.length) return;
      const layout = window.justifiedLayout(items, options);
      boxes.push(...layout.boxes.map(box => ({ ...box, top: box.top + top })));
      top += layout.containerHeight + spacing;
    }

    for (const { media } of sequence) {
      const aspectRatio = media.dataW / media.dataH;
      if (mobile && media.type === 'video') {
        placeRows(photos);
        photos = [];
        const height = width / aspectRatio;
        boxes.push({ left: 0, top, width, height });
        top += height + spacing;
      } else {
        photos.push({ aspectRatio });
      }
    }
    placeRows(photos);

    grid.style.height = (top - spacing) + 'px';
    boxes.forEach((box, i) => Object.assign(buttons[i].style, {
      position: 'absolute', left: box.left + 'px', top: box.top + 'px',
      width: box.width + 'px', height: box.height + 'px',
    }));
  }
  let resizeTimer;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(render, 150); });
  render();

  function lock(panel) {
    returnFocus = document.activeElement; scrollY = window.scrollY; active = panel;
    Object.assign(document.body.style, {position:'fixed', top:-scrollY+'px', width:'100%'});
    $('overview').inert = true; $('info-toggle').inert = true; headerNav.inert = true;
    panel.hidden = false;
    syncVideos();
  }
  function releaseVideo(node) {
    const video = node.querySelector('video');
    if (!video) return;
    video.pause();
    video.removeAttribute('src');
    video.load();
  }
  function disposeAll() {
    activeAnimations.forEach(a => a.cancel()); activeAnimations = []; transitioning = false;
    [...stage.children].forEach(n => { releaseVideo(n); n.remove(); });
    liveNode = null;
  }
  function close() {
    if (!active) return;
    disposeAll(); active.hidden = true; active = null; current = -1; gesture = null;
    $('overview').inert = false; $('info-toggle').inert = false; headerNav.inert = false;
    $('info-toggle').setAttribute('aria-expanded', 'false');
    Object.assign(document.body.style, {position:'', top:'', width:''});
    window.scrollTo(0,scrollY); returnFocus?.focus({preventScroll:true});
    syncVideos();
  }
  // The Nanase player fits the control bar to the visible video frame.
  function createVideoNode(media) {
    const node = document.createElement('div');
    node.className = 'modal-media modal-video';

    const wrap = document.createElement('div');
    wrap.className = 'gm-video-wrap';
    wrap.style.setProperty('--ar', media.dataW / media.dataH);

    const video = document.createElement('video');
    video.playsInline = true;
    video.muted = true;
    video.preload = 'auto';
    video.draggable = false;
    if (media.thumb) video.poster = media.thumb;

    const controls = document.createElement('div');
    controls.className = 'sv-controls';
    controls.innerHTML = `
      <div class="sv-progress">
        <div class="sv-progress__bar"></div>
        <input type="range" min="0" max="0" step="0.1" value="0" aria-label="Video progress" disabled>
      </div>
      <div class="sv-nav">
        <button type="button" class="sv-btn sv-btn--play">PLAY</button>
        <span class="sv-nav__right">
          <button type="button" class="sv-btn sv-btn--sound">SOUND ON</button>
          <button type="button" class="sv-btn sv-btn--fs">FULL</button>
        </span>
      </div>`;

    wrap.append(video, controls);
    node.append(wrap);
    bindVideoControls(video, controls);
    video.addEventListener('loadedmetadata', () => {
      if (node === liveNode && !document.hidden) video.play().catch(() => {});
    }, { once: true });
    video.src = media.src;
    return node;
  }

  function bindVideoControls(video, controls) {
    const progress = controls.querySelector('input');
    const bar = controls.querySelector('.sv-progress__bar');
    const play = controls.querySelector('.sv-btn--play');
    const sound = controls.querySelector('.sv-btn--sound');
    const fullscreen = controls.querySelector('.sv-btn--fs');

    function updateProgress() {
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;
      progress.disabled = false;
      progress.max = duration;
      progress.value = video.currentTime;
      bar.style.width = `${video.currentTime / duration * 100}%`;
    }

    video.addEventListener('durationchange', updateProgress);
    video.addEventListener('timeupdate', updateProgress);
    progress.addEventListener('input', () => { video.currentTime = progress.valueAsNumber; });
    video.addEventListener('play', () => { play.textContent = 'PAUSE'; });
    video.addEventListener('pause', () => { play.textContent = 'PLAY'; });
    play.addEventListener('click', () => {
      if (video.paused) video.play().catch(() => {});
      else video.pause();
    });
    video.addEventListener('volumechange', () => {
      sound.textContent = video.muted ? 'SOUND ON' : 'SOUND OFF';
    });
    sound.addEventListener('click', () => {
      video.muted = !video.muted;
      if (!video.muted && video.paused) video.play().catch(() => {});
    });
    fullscreen.addEventListener('click', () => {
      if (video.requestFullscreen) video.requestFullscreen().catch(() => {});
      else video.webkitEnterFullscreen?.();
    });

    let hideTimer;
    function showControls() {
      clearTimeout(hideTimer);
      controls.classList.add('is-visible');
      hideTimer = setTimeout(() => controls.classList.remove('is-visible'), 2000);
    }
    video.addEventListener('click', event => {
      if ((fine() && event.pointerType !== 'touch') || transitioning) return;
      if (controls.classList.contains('is-visible')) {
        clearTimeout(hideTimer);
        controls.classList.remove('is-visible');
      } else showControls();
    });
    controls.addEventListener('pointerdown', () => clearTimeout(hideTimer));
    controls.addEventListener('pointerup', showControls);
    controls.addEventListener('pointercancel', showControls);
    video.addEventListener('emptied', () => clearTimeout(hideTimer));
  }

  function createNode(index) {
    const { project, media } = sequence[index];
    if (media.type === 'video') return createVideoNode(media);
    const image = document.createElement('img');
    image.className = 'modal-media';
    image.draggable = false;
    image.alt = media.alt || project.title;
    image.src = media.full;
    image.decoding = 'async';
    return image;
  }
  // Initial display (modal/first open): no previous node, so no slide - just place it.
  function settle(index) {
    disposeAll(); current = index;
    const node = createNode(index);
    stage.append(node); liveNode = node;
    caption($('modal-caption'), index);
    preloadNeighbors(index);
  }
  // Committed next/prev transition: outgoing and incoming coexist in `.stage` (both
  // absolutely positioned, see overview.css) and slide simultaneously in the same
  // horizontal direction - outgoing exits the side incoming enters from the opposite
  // side, so they read as one continuous strip rather than a cross-fade. direction:
  // +1 = Next (outgoing exits left, incoming enters from the right), -1 = Previous
  // (mirrored). Pure transform, no opacity, so the movement itself reads as the effect.
  function slide(nextIndex, direction) {
    if (transitioning) return false;
    const outgoing = liveNode;
    if (outgoing) {
      outgoing.querySelector('video')?.pause();
      if (outgoing.contains(document.activeElement)) $('modal-close').focus({ preventScroll: true });
      outgoing.inert = true;
    }
    const incoming = createNode(nextIndex);
    stage.append(incoming);
    current = nextIndex; liveNode = incoming;
    caption($('modal-caption'), nextIndex);
    preloadNeighbors(nextIndex);
    if (reduced()) { if (outgoing) { releaseVideo(outgoing); outgoing.remove(); } return true; }
    transitioning = true;
    incoming.style.willChange = 'transform';
    if (outgoing) outgoing.style.willChange = 'transform';
    // Continue from wherever a released swipe left the outgoing node (its inline
    // translateX from the drag), rather than resetting to 0 and losing the gesture's motion.
    const fromOut = outgoing ? (outgoing.style.transform || 'translateX(0%)') : null;
    const inAnim = incoming.animate(
      [{transform:`translateX(${direction * 100}%)`}, {transform:'translateX(0%)'}],
      {duration:SLIDE_MS, easing:SLIDE_EASING, fill:'forwards'}
    );
    const outAnim = outgoing ? outgoing.animate(
      [{transform:fromOut}, {transform:`translateX(${-direction * 100}%)`}],
      {duration:SLIDE_MS, easing:SLIDE_EASING, fill:'forwards'}
    ) : null;
    const animations = [inAnim, outAnim].filter(Boolean);
    activeAnimations = animations;
    Promise.all(animations.map(a => a.finished.catch(() => {}))).then(() => {
      if (activeAnimations !== animations) return;
      if (outgoing) { releaseVideo(outgoing); outgoing.remove(); }
      incoming.style.willChange = ''; incoming.style.transform = '';
      activeAnimations.forEach(a => a.cancel()); activeAnimations = [];
      transitioning = false;
    });
    return true;
  }
  // Shared next/prev step for keyboard, wheel and swipe: loops across the whole
  // portfolio-data.js sequence (all projects back-to-back), wrapping at the very
  // first/last media item rather than stopping or looping per-project. Locked out
  // entirely while a transition is already playing (see `transitioning`).
  function step(direction) {
    if (transitioning || current < 0) return false;
    let next = current + direction;
    if (next >= sequence.length) next = 0; else if (next < 0) next = sequence.length - 1;
    return slide(next, direction);
  }
  // Safari/WebKit resolves :focus-visible on a script-focused element as true even when
  // the interaction that triggered it was a mouse click on a different element (Chromium/
  // Firefox correctly infer the pointer origin and keep it false). So the visible ring on
  // an initial pointer-triggered open has to be suppressed explicitly, not left to :focus-visible.
  function focusInitial(el, viaKeyboard) {
    el.classList.toggle('no-ring', !viaKeyboard);
    el.focus({preventScroll:true});
  }
  function openModal(index, viaKeyboard = false) {
    lock(modal); wheelSum = 0; wheelLast = 0; wheelCooldown = 0;
    settle(index); focusInitial($('modal-close'), viaKeyboard);
  }
  $('modal-close').addEventListener('click', close);
  // Background-click close. .modal-media is position:absolute;inset:0 - its own box
  // always equals the full .stage rect, by design: the two-node slide transition
  // (see slide() above) needs outgoing/incoming to occupy that exact same box so
  // their translateX animations cross over each other correctly. That means a click
  // anywhere in .stage - including the letterboxed margin object-fit:contain leaves
  // around a portrait/landscape image - lands on the <img>/<video> itself; e.target
  // is never `modal` or `stage` there, so an identity check alone can't tell "real
  // pixels" from "empty margin inside the same box." inContentRect() answers that
  // from the element's own live geometry (getBoundingClientRect + natural size), not
  // any fixed/hardcoded margin - it's what object-fit:contain itself computes
  // internally to place the image, just re-derived here so JS can test a point
  // against it. A click on modal-brand/modal-footer/modal-close is never even IMG or
  // VIDEO, so this block doesn't touch their existing behavior at all.
  function inContentRect(el, x, y) {
    const rect = el.getBoundingClientRect();
    const naturalW = el.naturalWidth;
    const naturalH = el.naturalHeight;
    if (!naturalW || !naturalH) return true; // size not known yet - treat as content, don't close under it
    const renderedW = Math.min(rect.width, rect.height * (naturalW / naturalH));
    const renderedH = renderedW * (naturalH / naturalW);
    const left = rect.left + (rect.width - renderedW) / 2, top = rect.top + (rect.height - renderedH) / 2;
    return x >= left && x <= left + renderedW && y >= top && y <= top + renderedH;
  }
  modal.addEventListener('click', e => {
    if (e.target === modal || e.target === stage || e.target.classList.contains('modal-video')) {
      close();
      return;
    }
    if (e.target.tagName === 'IMG' && !inContentRect(e.target, e.clientX, e.clientY)) close();
  });
  $('info-toggle').addEventListener('click', event => {
    lock(info);
    $('info-toggle').setAttribute('aria-expanded', 'true');
    focusInitial($('info-close'), event.detail === 0);
  });
  $('info-close').addEventListener('click', close);
  info.addEventListener('click', event => {
    if (event.target === info) close();
  });
  document.addEventListener('visibilitychange', syncVideos);
  document.addEventListener('keydown', e => {
    if (!active) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (active === modal && !e.target.closest('.sv-controls') && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      // All four keys drive the same horizontal slide - Up/Left = Previous, Down/Right = Next.
      e.preventDefault();
      if (!e.repeat) { const d = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : -1; step(d); }
    }
    if (e.key === 'Tab') {
      const focusable = [...active.querySelectorAll('button, a[href], input:not(:disabled)')
        .filter(el => !el.closest('[inert]'))];
      focusable.forEach(el => el.classList.remove('no-ring'));
      const first = focusable[0], last = focusable.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  modal.addEventListener('wheel', e => {
    e.preventDefault(); const now = performance.now(), idle = now-wheelLast; wheelLast = now;
    // Require both a cooldown and an idle gap: one step per inertial wheel burst.
    if (now < wheelCooldown || (wheelCooldown && idle < 180)) return;
    if (idle > 180) { wheelSum = 0; wheelCooldown = 0; }
    const delta = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1);
    wheelSum += delta;
    if (Math.abs(wheelSum) >= 60) {
      const d = Math.sign(wheelSum); step(d); wheelSum = 0; wheelCooldown = now+450;
    }
  }, {passive:false});
  stage.addEventListener('pointerdown', e => {
    // A transition already owns the two current nodes; a fresh drag can only
    // start once it has settled back down to a single liveNode.
    if (e.pointerType === 'mouse' || !e.isPrimary || transitioning) return;
    if (e.target.closest('.sv-controls')) return;
    gesture = {id:e.pointerId, x:e.clientX, y:e.clientY, dx:0};
    e.target.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', e => {
    if (!gesture || gesture.id !== e.pointerId) return;
    gesture.dx = e.clientX - gesture.x;
    if (liveNode) liveNode.style.transform = `translateX(${gesture.dx}px)`;
  });
  function endGesture(e, cancelled = false) {
    if (!gesture || gesture.id !== e.pointerId) return;
    const {dx,y} = gesture; gesture = null;
    // Left swipe (dx<0) = Next (+1); right swipe (dx>0) = Previous (-1).
    const d = dx < 0 ? 1 : -1;
    if (!cancelled && Math.abs(dx) > Math.max(40,stage.clientWidth*.12) && Math.abs(dx) > Math.abs(e.clientY-y) && step(d)) return;
    if (liveNode) liveNode.style.transform = '';
  }
  stage.addEventListener('pointerup', e => endGesture(e));
  stage.addEventListener('pointercancel', e => endGesture(e,true));
})();
