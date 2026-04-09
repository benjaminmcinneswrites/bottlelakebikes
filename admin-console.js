(function () {
  var PATHS = {
    login: "admin-portal.html",
    console: "admin-console.html"
  };

  var hasFirebaseAuth = function () {
    return (
      window.blbFirebase &&
      window.blbFirebase.configured &&
      window.blbFirebase.auth &&
      window.blbFirebase.bannerDoc
    );
  };

  var setFeedback = function (target, text, kind) {
    if (!target) {
      return;
    }

    target.hidden = false;
    target.textContent = text;
    target.classList.remove("admin-alert-error", "admin-alert-success");
    target.classList.add(kind === "error" ? "admin-alert-error" : "admin-alert-success");
  };

  var hideFeedback = function (target) {
    if (!target) {
      return;
    }

    target.hidden = true;
    target.textContent = "";
    target.classList.remove("admin-alert-error", "admin-alert-success");
  };

  var disableForm = function (form) {
    if (!form) {
      return;
    }

    Array.prototype.forEach.call(form.elements, function (field) {
      field.disabled = true;
    });
  };

  var parseDateValue = function (value) {
    if (!value) {
      return null;
    }

    if (typeof value.toDate === "function") {
      return value.toDate();
    }

    var parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  var toInputDateTime = function (value) {
    var parsed = parseDateValue(value);
    if (!parsed) {
      return "";
    }

    var local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };

  var toIsoString = function (value) {
    if (!value) {
      return null;
    }

    var parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed.toISOString();
  };

  var formatDate = function (value) {
    var parsed = parseDateValue(value);
    if (!parsed) {
      return "Not set";
    }

    return parsed.toLocaleString("en-NZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  };

  var initLoginPage = function () {
    var form = document.getElementById("admin-auth-form");
    if (!form) {
      return;
    }

    var modeCopy = document.getElementById("auth-mode-copy");
    var submitButton = document.getElementById("auth-submit-button");
    var feedback = document.getElementById("auth-feedback");

    hideFeedback(feedback);

    if (!hasFirebaseAuth()) {
      modeCopy.textContent = "Firebase setup is required before staff can sign in.";
      setFeedback(
        feedback,
        "Add your Firebase values to firebase-config.js, then refresh this page.",
        "error"
      );
      disableForm(form);
      return;
    }

    modeCopy.textContent = "Sign in with your staff email and password.";

    window.blbFirebase.auth.onAuthStateChanged(function (user) {
      if (user) {
        window.location.replace(PATHS.console);
      }
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      hideFeedback(feedback);

      var emailField = document.getElementById("admin-email");
      var passwordField = document.getElementById("admin-password");
      var email = (emailField.value || "").trim();
      var password = passwordField.value || "";

      if (!email || !password) {
        setFeedback(feedback, "Please enter both email and password.", "error");
        return;
      }

      submitButton.disabled = true;

      window.blbFirebase.auth
        .signInWithEmailAndPassword(email, password)
        .then(function () {
          window.location.replace(PATHS.console);
        })
        .catch(function () {
          setFeedback(feedback, "Sign-in failed. Check email/password and try again.", "error");
        })
        .finally(function () {
          submitButton.disabled = false;
        });
    });
  };

  var initConsolePage = function () {
    var page = document.body ? document.body.getAttribute("data-admin-page") : "";
    if (page !== "console") {
      return;
    }

    var usernameTarget = document.getElementById("admin-username-label");
    var logoutButton = document.getElementById("admin-logout");
    var bannerForm = document.getElementById("banner-form");
    var bannerTitle = document.getElementById("banner-title");
    var bannerMessage = document.getElementById("banner-message");
    var bannerEnabled = document.getElementById("banner-enabled");
    var bannerStart = document.getElementById("banner-start");
    var bannerEnd = document.getElementById("banner-end");
    var bannerResetSchedule = document.getElementById("banner-reset-schedule");
    var bannerFeedback = document.getElementById("banner-feedback");
    var bannerLastUpdated = document.getElementById("banner-last-updated");

    if (!hasFirebaseAuth()) {
      usernameTarget.textContent = "Setup required";
      setFeedback(
        bannerFeedback,
        "Firebase setup is incomplete. Update firebase-config.js first.",
        "error"
      );
      disableForm(bannerForm);
      if (logoutButton) {
        logoutButton.disabled = true;
      }
      return;
    }

    var docRef = window.blbFirebase.bannerDoc;
    var saveButton = bannerForm ? bannerForm.querySelector('button[type="submit"]') : null;
    var started = false;

    var renderMeta = function (data) {
      if (!bannerLastUpdated) {
        return;
      }

      if (!data || !data.updatedAt) {
        bannerLastUpdated.textContent = "Last updated: not set yet.";
        return;
      }

      var by = data.updatedBy ? " by " + data.updatedBy : "";
      bannerLastUpdated.textContent = "Last updated: " + formatDate(data.updatedAt) + by + ".";
    };

    var loadBannerSettings = function () {
      docRef
        .get()
        .then(function (snapshot) {
          if (!snapshot.exists) {
            renderMeta(null);
            return;
          }

          var data = snapshot.data() || {};
          bannerTitle.value = data.title || bannerTitle.value;
          bannerMessage.value = data.message || bannerMessage.value;
          bannerEnabled.checked = typeof data.enabled === "boolean" ? data.enabled : true;
          bannerStart.value = toInputDateTime(data.startAt);
          bannerEnd.value = toInputDateTime(data.endAt);
          renderMeta(data);
        })
        .catch(function () {
          setFeedback(
            bannerFeedback,
            "Could not load current banner settings. You can still try saving new values.",
            "error"
          );
        });
    };

    var wireEvents = function (user) {
      if (started) {
        return;
      }
      started = true;

      hideFeedback(bannerFeedback);
      usernameTarget.textContent = user.email || "Staff";

      loadBannerSettings();

      if (bannerResetSchedule) {
        bannerResetSchedule.addEventListener("click", function () {
          bannerStart.value = "";
          bannerEnd.value = "";
        });
      }

      if (logoutButton) {
        logoutButton.addEventListener("click", function () {
          window.blbFirebase.auth.signOut().finally(function () {
            window.location.replace(PATHS.login);
          });
        });
      }

      bannerForm.addEventListener("submit", function (event) {
        event.preventDefault();
        hideFeedback(bannerFeedback);

        var title = (bannerTitle.value || "").trim();
        var message = (bannerMessage.value || "").trim();
        var startAt = toIsoString(bannerStart.value);
        var endAt = toIsoString(bannerEnd.value);

        if (!title || !message) {
          setFeedback(bannerFeedback, "Title and message are required.", "error");
          return;
        }

        if (startAt && endAt && new Date(startAt) > new Date(endAt)) {
          setFeedback(bannerFeedback, "End date/time must be after start date/time.", "error");
          return;
        }

        if (saveButton) {
          saveButton.disabled = true;
        }

        docRef
          .set(
            {
              title: title,
              message: message,
              enabled: !!bannerEnabled.checked,
              startAt: startAt,
              endAt: endAt,
              updatedAt: window.blbFirebase.serverTimestamp(),
              updatedBy: user.email || "staff"
            },
            { merge: true }
          )
          .then(function () {
            setFeedback(bannerFeedback, "Banner updated successfully.", "success");
            renderMeta({
              updatedAt: new Date().toISOString(),
              updatedBy: user.email || "staff"
            });
          })
          .catch(function () {
            setFeedback(bannerFeedback, "Could not save banner right now. Please try again.", "error");
          })
          .finally(function () {
            if (saveButton) {
              saveButton.disabled = false;
            }
          });
      });
    };

    window.blbFirebase.auth.onAuthStateChanged(function (user) {
      if (!user) {
        window.location.replace(PATHS.login);
        return;
      }

      wireEvents(user);
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    var page = document.body ? document.body.getAttribute("data-admin-page") : "";

    if (page === "login") {
      initLoginPage();
      return;
    }

    if (page === "console") {
      initConsolePage();
    }
  });
})();
