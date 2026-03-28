(function () {
  var STORAGE_KEYS = {
    username: "blb_admin_username",
    passwordHash: "blb_admin_password_hash",
    session: "blb_admin_session",
    bookings: "blb_bookings"
  };

  var PATHS = {
    login: "admin-portal.html",
    console: "admin-console.html"
  };

  var DEFAULT_ADMIN = {
    username: "admin",
    password: "password"
  };

  var isLoggedIn = function () {
    return window.sessionStorage.getItem(STORAGE_KEYS.session) === "active";
  };

  var setLoggedIn = function (active) {
    if (active) {
      window.sessionStorage.setItem(STORAGE_KEYS.session, "active");
      return;
    }

    window.sessionStorage.removeItem(STORAGE_KEYS.session);
  };

  var createFallbackHash = function (value) {
    try {
      return "fallback-" + window.btoa(unescape(encodeURIComponent(value)));
    } catch (error) {
      return "fallback-" + value;
    }
  };

  var hashPassword = function (value) {
    if (!window.crypto || !window.crypto.subtle || !window.TextEncoder) {
      return Promise.resolve(createFallbackHash(value));
    }

    var buffer = new window.TextEncoder().encode(value);
    return window.crypto.subtle.digest("SHA-256", buffer).then(function (hashBuffer) {
      var bytes = Array.prototype.slice.call(new Uint8Array(hashBuffer));
      return bytes
        .map(function (byte) {
          return byte.toString(16).padStart(2, "0");
        })
        .join("");
    });
  };

  var saveCredentials = function (username, passwordHash) {
    window.localStorage.setItem(STORAGE_KEYS.username, username);
    window.localStorage.setItem(STORAGE_KEYS.passwordHash, passwordHash);
  };

  var ensureDefaultCredentials = function () {
    var storedUsername = window.localStorage.getItem(STORAGE_KEYS.username);
    var storedHash = window.localStorage.getItem(STORAGE_KEYS.passwordHash);

    if (storedUsername && storedHash) {
      return Promise.resolve();
    }

    return hashPassword(DEFAULT_ADMIN.password).then(function (passwordHash) {
      saveCredentials(DEFAULT_ADMIN.username, passwordHash);
    });
  };

  var getStoredBookings = function () {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEYS.bookings);
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
    window.localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(bookings));
  };

  var formatDate = function (isoDate) {
    if (!isoDate) {
      return "Unknown";
    }

    var parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) {
      return "Unknown";
    }

    return parsed.toLocaleString("en-NZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  };

  var formatService = function (serviceValue) {
    if (!serviceValue) {
      return "Not set";
    }

    return serviceValue
      .split("-")
      .map(function (part) {
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join(" ");
  };

  var setFeedback = function (target, text, kind) {
    if (!target) {
      return;
    }

    target.hidden = false;
    target.textContent = text;
    target.classList.remove("admin-alert-error", "admin-alert-success");

    if (kind === "error") {
      target.classList.add("admin-alert-error");
      return;
    }

    target.classList.add("admin-alert-success");
  };

  var initLoginPage = function () {
    var form = document.getElementById("admin-auth-form");
    if (!form) {
      return;
    }

    if (isLoggedIn()) {
      window.location.replace(PATHS.console);
      return;
    }

    var modeCopy = document.getElementById("auth-mode-copy");
    var submitButton = document.getElementById("auth-submit-button");
    var feedback = document.getElementById("auth-feedback");

    modeCopy.textContent = "Enter your admin details to continue.";
    submitButton.textContent = "Sign in";

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      feedback.hidden = true;

      var usernameField = document.getElementById("admin-username");
      var passwordField = document.getElementById("admin-password");
      var username = usernameField.value.trim();
      var password = passwordField.value;

      if (!username || !password) {
        setFeedback(feedback, "Please enter both username and password.", "error");
        return;
      }

      if (password.length < 8) {
        setFeedback(feedback, "Please use at least 8 characters for the password.", "error");
        return;
      }

      hashPassword(password)
        .then(function (passwordHash) {
          var storedUsername = window.localStorage.getItem(STORAGE_KEYS.username);
          var storedHash = window.localStorage.getItem(STORAGE_KEYS.passwordHash);

          if (username !== storedUsername || passwordHash !== storedHash) {
            setFeedback(feedback, "Login details were not correct. Try again.", "error");
            return;
          }

          setLoggedIn(true);
          window.location.replace(PATHS.console);
        })
        .catch(function () {
          setFeedback(feedback, "Could not process login right now. Please try again.", "error");
        });
    });
  };

  var initConsolePage = function () {
    var body = document.body;
    if (!body || body.getAttribute("data-admin-page") !== "console") {
      return;
    }

    if (!isLoggedIn()) {
      window.location.replace(PATHS.login);
      return;
    }

    var usernameTarget = document.getElementById("admin-username-label");
    var bookingCountTarget = document.getElementById("booking-count");
    var tableBody = document.getElementById("booking-table-body");
    var clearButton = document.getElementById("clear-bookings");
    var refreshButton = document.getElementById("refresh-bookings");
    var logoutButton = document.getElementById("admin-logout");
    var credentialsForm = document.getElementById("admin-credentials-form");
    var credentialsFeedback = document.getElementById("credentials-feedback");
    var newUsernameField = document.getElementById("new-admin-username");

    var storedUsername = window.localStorage.getItem(STORAGE_KEYS.username) || "Admin";
    usernameTarget.textContent = storedUsername;
    if (newUsernameField) {
      newUsernameField.value = storedUsername;
    }

    var renderBookings = function () {
      var bookings = getStoredBookings();
      bookingCountTarget.textContent =
        bookings.length === 1
          ? "1 request saved in this browser."
          : bookings.length + " requests saved in this browser.";

      tableBody.innerHTML = "";

      if (!bookings.length) {
        var emptyRow = document.createElement("tr");
        var emptyCell = document.createElement("td");
        emptyCell.colSpan = 7;
        emptyCell.textContent = "No booking requests saved yet.";
        emptyRow.appendChild(emptyCell);
        tableBody.appendChild(emptyRow);
        return;
      }

      bookings.forEach(function (booking) {
        var row = document.createElement("tr");

        var dateCell = document.createElement("td");
        dateCell.textContent = formatDate(booking.submittedAt);
        row.appendChild(dateCell);

        var nameCell = document.createElement("td");
        nameCell.textContent = booking.name || "Unknown";
        row.appendChild(nameCell);

        var contactCell = document.createElement("td");
        var contactText = (booking.email || "No email") + " | " + (booking.phone || "No phone");
        contactCell.textContent = contactText;
        row.appendChild(contactCell);

        var serviceCell = document.createElement("td");
        serviceCell.textContent = formatService(booking.service);
        row.appendChild(serviceCell);

        var notesCell = document.createElement("td");
        notesCell.textContent = booking.notes || "-";
        row.appendChild(notesCell);

        var statusCell = document.createElement("td");
        var statusPill = document.createElement("span");
        var isComplete = booking.status === "complete";
        statusPill.className = isComplete ? "status-pill status-pill-complete" : "status-pill status-pill-new";
        statusPill.textContent = isComplete ? "Complete" : "New";
        statusCell.appendChild(statusPill);
        row.appendChild(statusCell);

        var actionCell = document.createElement("td");
        var actionWrap = document.createElement("div");
        actionWrap.className = "admin-row-actions";

        var toggleButton = document.createElement("button");
        toggleButton.type = "button";
        toggleButton.className = "btn btn-secondary btn-small";
        toggleButton.textContent = isComplete ? "Mark New" : "Mark Complete";
        toggleButton.setAttribute("data-action", "toggle-status");
        toggleButton.setAttribute("data-id", booking.id || "");
        actionWrap.appendChild(toggleButton);

        var deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-secondary btn-small";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute("data-action", "delete");
        deleteButton.setAttribute("data-id", booking.id || "");
        actionWrap.appendChild(deleteButton);

        actionCell.appendChild(actionWrap);
        row.appendChild(actionCell);

        tableBody.appendChild(row);
      });
    };

    tableBody.addEventListener("click", function (event) {
      var target = event.target;
      if (!target || !target.matches("button[data-action][data-id]")) {
        return;
      }

      var action = target.getAttribute("data-action");
      var id = target.getAttribute("data-id");
      if (!id) {
        return;
      }

      var bookings = getStoredBookings();
      var index = bookings.findIndex(function (booking) {
        return booking.id === id;
      });

      if (index === -1) {
        return;
      }

      if (action === "delete") {
        bookings.splice(index, 1);
        saveBookings(bookings);
        renderBookings();
        return;
      }

      if (action === "toggle-status") {
        bookings[index].status = bookings[index].status === "complete" ? "new" : "complete";
        saveBookings(bookings);
        renderBookings();
      }
    });

    clearButton.addEventListener("click", function () {
      var approved = window.confirm("Delete all saved booking requests from this browser?");
      if (!approved) {
        return;
      }

      saveBookings([]);
      renderBookings();
    });

    refreshButton.addEventListener("click", function () {
      renderBookings();
    });

    logoutButton.addEventListener("click", function () {
      setLoggedIn(false);
      window.location.replace(PATHS.login);
    });

    credentialsForm.addEventListener("submit", function (event) {
      event.preventDefault();
      credentialsFeedback.hidden = true;

      var usernameField = document.getElementById("new-admin-username");
      var passwordField = document.getElementById("new-admin-password");
      var confirmField = document.getElementById("new-admin-password-confirm");

      var newUsername = usernameField.value.trim();
      var newPassword = passwordField.value;
      var confirmPassword = confirmField.value;

      if (!newUsername || !newPassword || !confirmPassword) {
        setFeedback(credentialsFeedback, "Please complete all fields.", "error");
        return;
      }

      if (newPassword.length < 8) {
        setFeedback(credentialsFeedback, "Use at least 8 characters for the new password.", "error");
        return;
      }

      if (newPassword !== confirmPassword) {
        setFeedback(credentialsFeedback, "New passwords do not match.", "error");
        return;
      }

      hashPassword(newPassword)
        .then(function (passwordHash) {
          saveCredentials(newUsername, passwordHash);
          usernameTarget.textContent = newUsername;
          credentialsForm.reset();
          setFeedback(credentialsFeedback, "Login details updated.", "success");
        })
        .catch(function () {
          setFeedback(credentialsFeedback, "Unable to update login details right now.", "error");
        });
    });

    renderBookings();
  };

  document.addEventListener("DOMContentLoaded", function () {
    ensureDefaultCredentials().then(function () {
      var page = document.body ? document.body.getAttribute("data-admin-page") : "";

      if (page === "login") {
        initLoginPage();
      }

      if (page === "console") {
        initConsolePage();
      }
    });
  });
})();
