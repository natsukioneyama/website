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
  "slide/12.webp",
  "slide/13.webp",
  "slide/14.webp"
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









 // ヘッダー非表示スクロール機能は .biography セクション削除に伴い廃止(2026-08)









const featuredLightbox = document.querySelector(".featured-lightbox");
const featuredLightboxImage = document.querySelector(".featured-lightbox-image");
const featuredLightboxClose = document.querySelector(".featured-lightbox-close");
const featuredLightboxPrev = document.querySelector(".featured-lightbox-prev");
const featuredLightboxNext = document.querySelector(".featured-lightbox-next");

let featuredImages = [];
let featuredLightboxIndex = 0;

function openFeaturedLightbox(images, index) {
  featuredImages = images;
  featuredLightboxIndex = index;

  featuredLightboxImage.src = featuredImages[featuredLightboxIndex];
  featuredLightbox.classList.add("is-open");
  featuredLightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeFeaturedLightbox() {
  featuredLightbox.classList.remove("is-open");
  featuredLightbox.setAttribute("aria-hidden", "true");
  featuredLightboxImage.src = "";
  document.body.style.overflow = "";
}

function showFeaturedImage(index) {
  if (index < 0) {
    featuredLightboxIndex = featuredImages.length - 1;
  } else if (index >= featuredImages.length) {
    featuredLightboxIndex = 0;
  } else {
    featuredLightboxIndex = index;
  }

  featuredLightboxImage.src = featuredImages[featuredLightboxIndex];
}

document.querySelectorAll(".featured-project").forEach((section) => {
 const imageItems = Array.from(
  section.querySelectorAll("[data-featured-index]:not([aria-hidden='true'])")
);

const images = [];

imageItems.forEach((item) => {
  const index = Number(item.dataset.featuredIndex);
  const img = item.tagName === "IMG" ? item : item.querySelector("img");

  if (!img) return;

  images[index] = img.src;
});

section.addEventListener("click", (event) => {
  const item = event.target.closest("[data-featured-index]");
  if (!item) return;

  event.preventDefault();
  openFeaturedLightbox(images, Number(item.dataset.featuredIndex));
});

});





featuredLightboxClose.addEventListener("click", closeFeaturedLightbox);

featuredLightboxPrev.addEventListener("click", () => {
  showFeaturedImage(featuredLightboxIndex - 1);
});

featuredLightboxNext.addEventListener("click", () => {
  showFeaturedImage(featuredLightboxIndex + 1);
});

let lightboxTouchStartX = 0;
let lightboxTouchEndX = 0;

featuredLightbox.addEventListener("touchstart", (event) => {
  lightboxTouchStartX = event.changedTouches[0].clientX;
}, { passive: true });

featuredLightbox.addEventListener("touchend", (event) => {
  lightboxTouchEndX = event.changedTouches[0].clientX;

  const swipeDistance = lightboxTouchEndX - lightboxTouchStartX;

  if (Math.abs(swipeDistance) < 50) return;

  if (swipeDistance < 0) {
    showFeaturedImage(featuredLightboxIndex + 1);
  } else {
    showFeaturedImage(featuredLightboxIndex - 1);
  }
}, { passive: true });



featuredLightbox.addEventListener("click", (event) => {
  if (event.target === featuredLightbox) {
    closeFeaturedLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (!featuredLightbox.classList.contains("is-open")) return;

  if (event.key === "Escape") {
    closeFeaturedLightbox();
  }

  if (event.key === "ArrowLeft") {
    showFeaturedImage(featuredLightboxIndex - 1);
  }

  if (event.key === "ArrowRight") {
    showFeaturedImage(featuredLightboxIndex + 1);
  }
});




const menuToggle = document.querySelector(".menu-toggle");
const siteMenu = document.querySelector(".site-menu");

if (menuToggle && siteMenu) {
  function openSiteMenu() {
    siteMenu.classList.add("is-open");
    siteMenu.setAttribute("aria-hidden", "false");
    menuToggle.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close menu");
    document.body.style.overflow = "hidden";
  }

  function closeSiteMenu() {
    siteMenu.classList.remove("is-open");
    siteMenu.setAttribute("aria-hidden", "true");
    menuToggle.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
  }

  menuToggle.addEventListener("click", () => {
    if (siteMenu.classList.contains("is-open")) {
      closeSiteMenu();
    } else {
      openSiteMenu();
    }
  });

  siteMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeSiteMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (!siteMenu.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      closeSiteMenu();
    }
  });
}