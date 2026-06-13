const heroImages = [
  "slide/01.webp",
  "slide/02.webp",
  "slide/03.webp",
  "slide/04.webp",
  "slide/05.webp",
  "slide/06.webp",
  "slide/07.webp",
  "slide/08.webp",
  "slide/09.webp",
  "slide/10.webp",
  "slide/11.webp",
  "slide/12.webp"
];

const heroSlide = document.querySelector(".hero-slide");
let currentHeroIndex = 0;

setInterval(() => {
  currentHeroIndex = (currentHeroIndex + 1) % heroImages.length;
  heroSlide.src = heroImages[currentHeroIndex];
}, 800);

document.querySelectorAll('img').forEach(img => {
  img.addEventListener('contextmenu', e => {
    e.preventDefault();
  });

  img.setAttribute('draggable', 'false');
});







const topbar = document.querySelector('.topbar');
const biography = document.querySelector('.biography');

window.addEventListener('scroll', () => {
  if (!topbar || !biography || window.innerWidth > 768) return;

  const bioTop = biography.getBoundingClientRect().top;

  if (bioTop < 80) {
    topbar.classList.add('topbar-hidden');
  } else {
    topbar.classList.remove('topbar-hidden');
  }
});