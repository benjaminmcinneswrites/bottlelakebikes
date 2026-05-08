/* =========================================
   Bottle Lake Bikes - Motion Enhancements
   Lightweight section reveal using IntersectionObserver
   ========================================= */
(function () {
  var root = document.documentElement;
  root.classList.add("js-enhanced");

  var nodes = document.querySelectorAll(".hero, .page-hero, main .section, .brand-card, .site-footer");
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

    var isBrandCard = element.classList.contains("brand-card");
    var delayStep = isBrandCard ? 35 : 45;
    var delayLimit = isBrandCard ? 175 : 135;
    var delay = Math.min((index % 6) * delayStep, delayLimit);
    element.style.setProperty("--reveal-delay", delay + "ms");
  });

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
