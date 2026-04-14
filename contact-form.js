(function () {
  var form = document.getElementById("contact-form");
  if (!form) {
    return;
  }

  var feedback = document.getElementById("contact-form-feedback");
  var submitButton = form.querySelector('button[type="submit"]');
  var config = window.BLB_CONTACT_FORM_CONFIG || {};
  var recipientEmail = (config.recipientEmail || "").trim();
  var subject = (config.subject || "").trim() || "New contact message";
  var configured =
    recipientEmail && recipientEmail.indexOf("REPLACE_WITH_YOUR_EMAIL") === -1;

  var setFeedback = function (text, kind) {
    if (!feedback) {
      return;
    }

    feedback.hidden = false;
    feedback.textContent = text;
    feedback.classList.remove("form-feedback-error", "form-feedback-success");
    feedback.classList.add(kind === "error" ? "form-feedback-error" : "form-feedback-success");
  };

  var hideFeedback = function () {
    if (!feedback) {
      return;
    }

    feedback.hidden = true;
    feedback.textContent = "";
    feedback.classList.remove("form-feedback-error", "form-feedback-success");
  };

  var readFieldValue = function (selector) {
    var field = form.querySelector(selector);
    if (!field) {
      return "";
    }

    return (field.value || "").trim();
  };

  hideFeedback();

  if (!configured) {
    setFeedback(
      "Contact form is not configured yet. Please call or email us directly for now.",
      "error"
    );
    if (submitButton) {
      submitButton.disabled = true;
    }
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    hideFeedback();

    var name = readFieldValue("#contact-name");
    var email = readFieldValue("#contact-email").toLowerCase();
    var message = readFieldValue("#contact-message");

    if (!name || !email || !message) {
      setFeedback("Please complete name, email, and message before sending.", "error");
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
    }

    var formData = new FormData(form);
    formData.set("name", name);
    formData.set("email", email);
    formData.set("message", message);
    formData.set("_replyto", email);
    formData.set("_subject", subject);
    formData.set("_template", "table");
    formData.set("_url", window.location.href);

    fetch("https://formsubmit.co/ajax/" + encodeURIComponent(recipientEmail), {
      method: "POST",
      headers: {
        Accept: "application/json"
      },
      body: formData
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("request-failed");
        }

        return response.json();
      })
      .then(function () {
        form.reset();
        setFeedback("Thanks, your message has been sent. We will get back to you soon.", "success");
      })
      .catch(function () {
        setFeedback(
          "Sorry, we could not send your message right now. Please try again or email us directly.",
          "error"
        );
      })
      .finally(function () {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  });
})();
