(function () {
  var BOOKING_STORAGE_KEY = "blb_bookings";
  var form = document.getElementById("booking-request-form");

  if (!form) {
    return;
  }

  var feedback = document.createElement("p");
  feedback.className = "form-note";
  feedback.setAttribute("aria-live", "polite");
  form.appendChild(feedback);

  var getBookings = function () {
    try {
      var raw = window.localStorage.getItem(BOOKING_STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed;
    } catch (error) {
      return [];
    }
  };

  var saveBookings = function (bookings) {
    window.localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(bookings));
  };

  var readFieldValue = function (selector) {
    var field = form.querySelector(selector);
    if (!field) {
      return "";
    }

    return field.value.trim();
  };

  var readCheckedValues = function (selector) {
    return Array.prototype.map.call(form.querySelectorAll(selector), function (field) {
      return field.value;
    });
  };

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    try {
      var booking = {
        id: Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8),
        submittedAt: new Date().toISOString(),
        status: "new",
        name: readFieldValue("#name"),
        email: readFieldValue("#email"),
        phone: readFieldValue("#phone"),
        preferredContactMethod: readFieldValue("#preferred-contact-method"),
        bikeType: readFieldValue("#bike-type"),
        service: readFieldValue("#service-needed"),
        addOns: readCheckedValues('input[name="service-addons"]:checked'),
        notes: readFieldValue("#notes")
      };

      var existing = getBookings();
      existing.unshift(booking);
      saveBookings(existing);

      form.reset();
      feedback.textContent = "Thanks, your booking request has been saved and will be reviewed manually.";
    } catch (error) {
      feedback.textContent = "Sorry, something went wrong while saving this request. Please call or email us directly.";
    }
  });
})();
