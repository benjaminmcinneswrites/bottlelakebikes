document.documentElement.classList.add("js");

const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");
const heroImages = document.querySelectorAll(".home-hero-media img, .page-hero-animated .page-hero-image img");
const logoTrack = document.querySelector("[data-logo-track]");
const logoGroup = document.querySelector("[data-logo-group]");

if (logoTrack && logoGroup) {
  const duplicateLogos = logoGroup.cloneNode(true);
  duplicateLogos.removeAttribute("data-logo-group");
  duplicateLogos.setAttribute("aria-hidden", "true");
  logoTrack.append(duplicateLogos);
}

heroImages.forEach((heroImage) => {
  const revealHero = () => heroImage.classList.add("is-loaded");
  if (heroImage.complete) revealHero();
  else heroImage.addEventListener("load", revealHero, { once: true });
});

function setNav(open) {
  document.body.classList.toggle("nav-open", open);
  if (navToggle) navToggle.setAttribute("aria-expanded", String(open));
  if (mobileNav) mobileNav.setAttribute("aria-hidden", String(!open));
}

if (navToggle && mobileNav) {
  navToggle.addEventListener("click", () => {
    setNav(navToggle.getAttribute("aria-expanded") !== "true");
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setNav(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setNav(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) setNav(false);
  });
}

function updateHeader() {
  if (header) header.classList.toggle("is-scrolled", window.scrollY > 24);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const revealItems = document.querySelectorAll(".reveal");
try {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min((index % 4) * 70, 210)}ms`;
    revealObserver.observe(item);
  });
  document.documentElement.classList.add("reveals-ready");
  // Establish the hidden styles before the first observer callback, including on fast loads.
  document.documentElement.getBoundingClientRect();
} catch {
  document.documentElement.classList.remove("reveals-ready");
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

document.querySelectorAll(".faq-item").forEach((item) => {
  const summary = item.querySelector("summary");
  const answer = item.querySelector(".faq-answer");
  if (!summary || !answer || !answer.animate) return;

  // Keep the existing answer padding inside a container that can reach zero height.
  const panel = document.createElement("div");
  answer.before(panel);
  panel.append(answer);
  let animation = null;
  let expanded = item.open;

  const animateAnswer = (open) => {
    const startHeight = item.open ? panel.getBoundingClientRect().height : 0;
    const startOpacity = item.open ? getComputedStyle(panel).opacity : 0;
    if (animation) {
      animation.oncancel = null;
      animation.cancel();
    }

    expanded = open;
    item.open = true;
    item.classList.toggle("is-closing", !open);
    summary.setAttribute("aria-expanded", String(open));
    panel.style.overflow = "hidden";

    const currentAnimation = panel.animate({
      height: [`${startHeight}px`, `${open ? answer.getBoundingClientRect().height : 0}px`],
      opacity: [startOpacity, open ? 1 : 0]
    }, { duration: 300, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" });
    animation = currentAnimation;

    const finish = () => {
      if (animation !== currentAnimation) return;
      item.open = open;
      item.classList.remove("is-closing");
      panel.style.overflow = "";
      animation = null;
      currentAnimation.oncancel = null;
      currentAnimation.cancel();
    };
    currentAnimation.onfinish = finish;
    currentAnimation.oncancel = finish;
  };

  summary.addEventListener("click", (event) => {
    event.preventDefault();
    animateAnswer(!expanded);
  });

  item.addEventListener("toggle", () => {
    if (animation) return;
    expanded = item.open;
    summary.setAttribute("aria-expanded", String(expanded));
  });

  // Remeasure wrapping or dynamically resized content without leaving a fixed height.
  if ("ResizeObserver" in window) {
    new ResizeObserver(() => {
      if (animation) animateAnswer(expanded);
    }).observe(answer);
  }
});

const reviewPanels = Array.from(document.querySelectorAll("[data-review-panel]"));
const reviewStatus = document.querySelector("[data-review-status]");
const previousReview = document.querySelector("[data-review-prev]");
const nextReview = document.querySelector("[data-review-next]");
let reviewIndex = 0;

function showReview(index) {
  if (!reviewPanels.length) return;
  reviewIndex = (index + reviewPanels.length) % reviewPanels.length;
  reviewPanels.forEach((panel, panelIndex) => {
    const active = panelIndex === reviewIndex;
    panel.classList.toggle("is-active", active);
    panel.hidden = !active;
  });
  if (reviewStatus) reviewStatus.textContent = `${reviewIndex + 1} / ${reviewPanels.length}`;
}

if (reviewPanels.length) {
  showReview(0);
  previousReview?.addEventListener("click", () => showReview(reviewIndex - 1));
  nextReview?.addEventListener("click", () => showReview(reviewIndex + 1));
}

document.querySelectorAll(".brand-group").forEach((group) => {
  const summary = group.querySelector("summary");
  let animation = null;

  if (!summary) return;

  const clearAnimationStyles = (finishedAnimation = null) => {
    if (finishedAnimation && animation !== finishedAnimation) return;
    group.style.height = "";
    group.style.overflow = "";
    group.classList.remove("is-closing", "is-animating");
    animation = null;
  };

  summary.addEventListener("click", (event) => {
    event.preventDefault();
    if (animation) {
      animation.oncancel = null;
      animation.cancel();
      clearAnimationStyles();
    }

    const startHeight = group.offsetHeight;
    group.classList.add("is-animating");
    group.style.overflow = "hidden";

    if (group.open) {
      const endHeight = summary.offsetHeight;
      const closeDuration = Math.min(700, Math.max(320, (startHeight - endHeight) * 0.55));
      group.classList.add("is-closing");
      const closingAnimation = group.animate(
        { height: [`${startHeight}px`, `${endHeight}px`] },
        { duration: closeDuration, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
      );
      animation = closingAnimation;
      closingAnimation.onfinish = () => {
        if (animation !== closingAnimation) return;
        group.open = false;
        clearAnimationStyles(closingAnimation);
      };
      closingAnimation.oncancel = () => clearAnimationStyles(closingAnimation);
    } else {
      group.open = true;
      const endHeight = group.scrollHeight;
      const openDuration = Math.min(950, Math.max(440, (endHeight - startHeight) * 0.8));
      const openingAnimation = group.animate(
        { height: [`${startHeight}px`, `${endHeight}px`] },
        { duration: openDuration, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
      );
      animation = openingAnimation;
      openingAnimation.onfinish = () => clearAnimationStyles(openingAnimation);
      openingAnimation.oncancel = () => clearAnimationStyles(openingAnimation);
    }
  });
});

document.querySelectorAll("[data-year]").forEach((item) => {
  item.textContent = new Date().getFullYear();
});
