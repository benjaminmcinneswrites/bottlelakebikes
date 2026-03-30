/* =========================================
   Bottle Lake Bikes - Mobile Navigation
   ========================================= */
(function () {
  var initMobileNav = function () {
    var nav = document.querySelector(".site-nav");
    var toggle = document.querySelector(".nav-toggle");

    if (!nav || !toggle) {
      return;
    }

    document.body.classList.add("js-nav-ready");

    var mobileQuery = null;
    if (window.matchMedia) {
      mobileQuery = window.matchMedia("(max-width: 720px)");
    }

    var isMobile = function () {
      if (mobileQuery) {
        return mobileQuery.matches;
      }
      return window.innerWidth <= 720;
    };

    var setExpanded = function (expanded) {
      toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
      nav.classList.toggle("is-open", expanded);
    };

    setExpanded(false);

    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      setExpanded(!expanded);
    });

    nav.addEventListener("click", function (event) {
      if (!isMobile()) {
        return;
      }

      var target = event.target;
      if (target && target.tagName === "A") {
        setExpanded(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") {
        return;
      }

      if (toggle.getAttribute("aria-expanded") !== "true") {
        return;
      }

      setExpanded(false);
      toggle.focus();
    });

    if (mobileQuery) {
      var handleViewportChange = function (event) {
        if (!event.matches) {
          setExpanded(false);
        }
      };

      if (typeof mobileQuery.addEventListener === "function") {
        mobileQuery.addEventListener("change", handleViewportChange);
      } else if (typeof mobileQuery.addListener === "function") {
        mobileQuery.addListener(handleViewportChange);
      }
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMobileNav);
    return;
  }

  initMobileNav();
})();
