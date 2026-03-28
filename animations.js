/* =========================================
   Bottle Lake Bikes - Motion Enhancements
   Lightweight section reveal using IntersectionObserver
   ========================================= */
(function () {
  var root = document.documentElement;
  root.classList.add("js-enhanced");

  var prefersReducedMotion = false;
  if (window.matchMedia) {
    prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  var nodes = document.querySelectorAll(".hero, .page-hero, main .section, .site-footer");
  if (!nodes.length) {
    return;
  }

  var revealElements = Array.prototype.slice.call(nodes);

  var revealElement = function (element) {
    if (element.classList.contains("is-visible")) {
      return;
    }

    window.requestAnimationFrame(function () {
      element.classList.add("is-visible");
    });
  };

  revealElements.forEach(function (element, index) {
    element.classList.add("reveal-on-scroll");

    var delay = Math.min((index % 4) * 45, 135);
    element.style.setProperty("--reveal-delay", delay + "ms");
  });

  if (prefersReducedMotion) {
    revealElements.forEach(function (element) {
      element.classList.add("is-visible");
    });
    return;
  }

  window.requestAnimationFrame(function () {
    root.classList.add("motion-ready");
  });

  if (!("IntersectionObserver" in window)) {
    revealElements.forEach(revealElement);
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        revealElement(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  revealElements.forEach(function (element) {
    observer.observe(element);
  });
})();
