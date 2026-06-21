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
 const selectedWorksIntro = document.querySelector('.selected-works-intro');
 window.addEventListener('scroll', () => {
  if (!topbar || !biography || window.innerWidth > 768) return;

  const bioTop = biography.getBoundingClientRect().top;

  if (bioTop < 80) {
  topbar.classList.add('topbar-hidden');

  if (selectedWorksIntro) {
    selectedWorksIntro.classList.add('selected-works-hidden');
  }

} else {
  topbar.classList.remove('topbar-hidden');

  if (selectedWorksIntro) {
    selectedWorksIntro.classList.remove('selected-works-hidden');
  }
}

});


document.querySelectorAll(".featured-project").forEach((section) => {
  const featuredTrack = section.querySelector(".featured-thumbs-track");
  const featuredPrev = section.querySelector(".featured-prev");
  const featuredNext = section.querySelector(".featured-next");

  if (!featuredTrack || !featuredPrev || !featuredNext) return;

  let featuredItems = Array.from(featuredTrack.querySelectorAll("img"));

  featuredItems.forEach((item) => {
    const clone = item.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    featuredTrack.appendChild(clone);
  });

  featuredItems = Array.from(featuredTrack.querySelectorAll("img"));

  let featuredIndex = 0;
  let featuredIsMoving = false;

  function updateFeaturedSlider() {
    const item = featuredItems[0];
    const gap = parseFloat(getComputedStyle(featuredTrack).gap) || 0;
    const itemWidth = item.getBoundingClientRect().width;
    const moveX = featuredIndex * (itemWidth + gap);

    featuredTrack.style.transform = `translateX(-${moveX}px)`;
  }

  featuredNext.addEventListener("click", () => {
    if (featuredIsMoving) return;
    featuredIsMoving = true;

    const originalLength = featuredItems.length / 2;

    featuredIndex++;
    updateFeaturedSlider();

    setTimeout(() => {
      if (featuredIndex >= originalLength) {
        featuredTrack.style.transition = "none";
        featuredIndex = 0;
        updateFeaturedSlider();

        requestAnimationFrame(() => {
          featuredTrack.style.transition = "";
        });
      }

      featuredIsMoving = false;
    }, 600);
  });

  featuredPrev.addEventListener("click", () => {
    if (featuredIsMoving) return;
    featuredIsMoving = true;

    const originalLength = featuredItems.length / 2;

    if (featuredIndex <= 0) {
      featuredTrack.style.transition = "none";
      featuredIndex = originalLength;
      updateFeaturedSlider();

      requestAnimationFrame(() => {
        featuredTrack.style.transition = "";
        featuredIndex--;
        updateFeaturedSlider();
      });
    } else {
      featuredIndex--;
      updateFeaturedSlider();
    }

    setTimeout(() => {
      featuredIsMoving = false;
    }, 600);
  });

let thumbTouchStartX = 0;
let thumbTouchEndX = 0;

featuredTrack.addEventListener("touchstart", (event) => {
  if (window.innerWidth > 900) return;

  thumbTouchStartX = event.changedTouches[0].clientX;
}, { passive: true });

featuredTrack.addEventListener("touchend", (event) => {
  if (window.innerWidth > 900) return;

  thumbTouchEndX = event.changedTouches[0].clientX;

  const swipeDistance = thumbTouchEndX - thumbTouchStartX;

  if (Math.abs(swipeDistance) < 28) return;

  if (swipeDistance < 0) {
    featuredNext.click();
  } else {
    featuredPrev.click();
  }
}, { passive: true });


});











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
  section.querySelectorAll("[data-featured-index]")
);

const images = [];

imageItems.forEach((item) => {
  const index = Number(item.dataset.featuredIndex);
  const img = item.tagName === "IMG" ? item : item.querySelector("img");

  if (!img) return;

  images[index] = img.src;
});

section.querySelectorAll("[data-featured-index]").forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();
    openFeaturedLightbox(images, Number(item.dataset.featuredIndex));
  });
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