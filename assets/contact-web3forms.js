(function () {
  var form = document.getElementById("web3-contact-form");
  if (!form || !window.fetch) {
    return;
  }

  var feedback = document.getElementById("contact-form-feedback");
  var submitButton = form.querySelector('button[type="submit"]');
  var endpoint = "https://api.web3forms.com/submit";

  function setFeedback(message, type) {
    if (!feedback) {
      return;
    }

    feedback.hidden = false;
    feedback.textContent = message;
    feedback.classList.remove("form-feedback-error", "form-feedback-success");
    feedback.classList.add(type === "success" ? "form-feedback-success" : "form-feedback-error");
  }

  function clearFeedback() {
    if (!feedback) {
      return;
    }

    feedback.hidden = true;
    feedback.textContent = "";
    feedback.classList.remove("form-feedback-error", "form-feedback-success");
  }

  function getFieldValue(selector) {
    var field = form.querySelector(selector);
    return field ? (field.value || "").trim() : "";
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    clearFeedback();

    if (!form.checkValidity()) {
      form.reportValidity();
      setFeedback("Please complete name, email, and message before sending.", "error");
      return;
    }

    if (form.elements.botcheck && form.elements.botcheck.checked) {
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
    }

    var formData = new FormData(form);
    var email = getFieldValue("#contact-email").toLowerCase();
    formData.set("replyto", email);
    formData.set("page_url", window.location.href);

    var payload = {};
    formData.forEach(function (value, key) {
      payload[key] = value;
    });

    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        return response.json().catch(function () {
          return {};
        }).then(function (data) {
          if (!response.ok || data.success === false) {
            throw new Error(data.message || "request-failed");
          }
          return data;
        });
      })
      .then(function () {
        form.reset();
        setFeedback("Thanks, your message has been sent. We will get back to you soon.", "success");
      })
      .catch(function () {
        setFeedback("Sorry, we could not send your message right now. Please try again or email us directly.", "error");
      })
      .finally(function () {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  }, true);
}());
