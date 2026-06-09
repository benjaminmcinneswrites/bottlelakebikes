(function () {
  var section = document.querySelector(".reviews-section");

  if (!section) {
    return;
  }

  var toggle = section.querySelector("[data-reviews-toggle]");
  var label = section.querySelector("[data-reviews-toggle-label]");
  var extraReviews = Array.prototype.slice.call(section.querySelectorAll("[data-review-extra]"));

  if (!toggle || extraReviews.length === 0) {
    return;
  }

  function setExpanded(isExpanded) {
    section.classList.toggle("is-expanded", isExpanded);
    toggle.setAttribute("aria-expanded", String(isExpanded));

    extraReviews.forEach(function (review) {
      review.hidden = !isExpanded;
    });

    if (label) {
      label.textContent = isExpanded ? "Show fewer reviews" : "See more reviews";
    }
  }

  setExpanded(false);

  toggle.addEventListener("click", function () {
    setExpanded(toggle.getAttribute("aria-expanded") !== "true");
  });
})();
