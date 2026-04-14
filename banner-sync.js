(function () {
  var parseDateValue = function (value) {
    if (!value) {
      return null;
    }

    if (typeof value.toDate === "function") {
      return value.toDate();
    }

    if (typeof value === "string") {
      var parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    if (typeof value === "object" && typeof value.seconds === "number") {
      var fromSeconds = new Date(value.seconds * 1000);
      return Number.isNaN(fromSeconds.getTime()) ? null : fromSeconds;
    }

    return null;
  };

  var isWithinWindow = function (startAt, endAt) {
    var now = new Date();
    var start = parseDateValue(startAt);
    var end = parseDateValue(endAt);

    if (start && now < start) {
      return false;
    }

    if (end && now > end) {
      return false;
    }

    return true;
  };

  var applyBannerState = function (announcement, titleNode, messageNode, data, defaults) {
    if (!announcement || !titleNode || !messageNode) {
      return;
    }

    var next = data || {};
    var enabled = typeof next.enabled === "boolean" ? next.enabled : true;
    var activeByTime = isWithinWindow(next.startAt, next.endAt);

    announcement.hidden = !(enabled && activeByTime);

    var nextTitle = (next.title || "").trim() || defaults.title;
    var nextMessage = (next.message || "").trim() || defaults.message;

    titleNode.textContent = nextTitle;
    messageNode.textContent = nextMessage;
  };

  var setBannerState = function (announcement, state) {
    if (!announcement) {
      return;
    }

    announcement.setAttribute("data-banner-state", state);
  };

  document.addEventListener("DOMContentLoaded", function () {
    var announcement = document.querySelector(".site-announcement");
    if (!announcement) {
      return;
    }

    var titleNode = announcement.querySelector("[data-banner-title]");
    var messageNode = announcement.querySelector("[data-banner-message]");
    if (!titleNode || !messageNode) {
      return;
    }

    var defaults = {
      title: (titleNode.textContent || "").trim(),
      message: (messageNode.textContent || "").trim()
    };
    var resolved = false;
    var finish = function () {
      if (resolved) {
        return;
      }

      resolved = true;
      setBannerState(announcement, "ready");
    };

    setBannerState(announcement, "loading");

    var fallbackTimer = window.setTimeout(function () {
      applyBannerState(announcement, titleNode, messageNode, null, defaults);
      finish();
    }, 2500);

    if (!window.blbFirebase || !window.blbFirebase.configured || !window.blbFirebase.bannerDoc) {
      applyBannerState(announcement, titleNode, messageNode, null, defaults);
      window.clearTimeout(fallbackTimer);
      finish();
      return;
    }

    window.blbFirebase.bannerDoc.onSnapshot(
      function (snapshot) {
        if (!snapshot || !snapshot.exists) {
          applyBannerState(announcement, titleNode, messageNode, null, defaults);
          window.clearTimeout(fallbackTimer);
          finish();
          return;
        }

        applyBannerState(announcement, titleNode, messageNode, snapshot.data(), defaults);
        window.clearTimeout(fallbackTimer);
        finish();
      },
      function () {
        applyBannerState(announcement, titleNode, messageNode, null, defaults);
        window.clearTimeout(fallbackTimer);
        finish();
      }
    );
  });
})();
