(function () {
  var GOOGLE_ADS_ID = "AW-18093930778";
  var BOOKING_START_LABEL = "VhOVCMKw0qUcEJry7bND";
  var BOOKING_START_SELECTOR = "[data-google-ads-conversion='booking-start']";

  var isConfigured = function () {
    return (
      GOOGLE_ADS_ID.indexOf("XXXXXXXXXX") === -1 &&
      BOOKING_START_LABEL.indexOf("REPLACE_WITH") === -1
    );
  };

  var loadGoogleTag = function () {
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GOOGLE_ADS_ID);
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function () {
        window.dataLayer.push(arguments);
      };

    window.gtag("js", new Date());
    window.gtag("config", GOOGLE_ADS_ID);
  };

  var trackBookingStart = function () {
    if (!isConfigured() || typeof window.gtag !== "function") {
      return;
    }

    window.gtag("event", "conversion", {
      send_to: GOOGLE_ADS_ID + "/" + BOOKING_START_LABEL,
      value: 1.0,
      currency: "NZD",
    });
  };

  document.addEventListener("click", function (event) {
    var target = event.target;

    if (!(target instanceof Element) || !target.closest(BOOKING_START_SELECTOR)) {
      return;
    }

    trackBookingStart();
  });

  if (isConfigured()) {
    loadGoogleTag();
  }
})();
