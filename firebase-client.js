(function () {
  var config = window.BLB_FIREBASE_CONFIG || null;
  var paths = window.BLB_FIRESTORE_PATHS || {};
  var bannerDocPath = paths.bannerDoc || "site/banner";

  var isConfigReady = function (value) {
    if (!value) {
      return false;
    }

    var required = ["apiKey", "authDomain", "projectId", "appId"];
    return required.every(function (key) {
      var field = (value[key] || "").trim();
      return field && field.indexOf("REPLACE_ME") === -1;
    });
  };

  if (!isConfigReady(config)) {
    window.blbFirebase = {
      configured: false,
      reason: "missing-config"
    };
    return;
  }

  if (!window.firebase || typeof window.firebase.initializeApp !== "function") {
    window.blbFirebase = {
      configured: false,
      reason: "sdk-not-loaded"
    };
    return;
  }

  try {
    if (!window.firebase.apps.length) {
      window.firebase.initializeApp(config);
    }

    var db = null;
    if (window.firebase.firestore && typeof window.firebase.firestore === "function") {
      db = window.firebase.firestore();
    }

    var auth = null;
    if (window.firebase.auth && typeof window.firebase.auth === "function") {
      auth = window.firebase.auth();
    }

    window.blbFirebase = {
      configured: true,
      db: db,
      auth: auth,
      bannerDoc: db ? db.doc(bannerDocPath) : null,
      serverTimestamp:
        window.firebase.firestore &&
        window.firebase.firestore.FieldValue &&
        typeof window.firebase.firestore.FieldValue.serverTimestamp === "function"
          ? window.firebase.firestore.FieldValue.serverTimestamp
          : function () {
              return new Date().toISOString();
            }
    };
  } catch (error) {
    window.blbFirebase = {
      configured: false,
      reason: "init-error",
      error: error
    };
  }
})();
