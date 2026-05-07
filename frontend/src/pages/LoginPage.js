import { useState } from "react";
import { useLang } from "../LanguageContext";

function LoginPage({ authForm, onAuthFormChange, onSubmit, onNavigate }) {
  const { t } = useLang();
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="auth-wrapper">

      {/* LEFT SIDE INFO */}
      <div className="auth-left">
        <div className="auth-brand">
          <span className="auth-brand-icon">🌾</span>

          <div>
            <strong>Smart Agriculture</strong>
            <small>Advisory System</small>
          </div>
        </div>

        <h2 className="auth-left-title">
          {t("welcomeBack") || "Welcome Back!"}
        </h2>

        <p className="auth-left-desc">
          {t("loginDesc") ||
            "Login to access your farm profile, crop recommendations, and advisory history."}
        </p>

        <div className="auth-features">
          <div>🌱 {t("feature1") || "AI crop recommendations"}</div>
          <div>🌦 {t("feature2") || "Live weather advice"}</div>
          <div>🐛 {t("feature3") || "Pest detection"}</div>
          <div>📊 {t("feature4") || "History tracking"}</div>
        </div>
      </div>

      {/* RIGHT SIDE FORM */}
      <div className="auth-right">
        <div className="auth-card">

          {/* HEADER */}
          <div className="auth-card-header">
            <h3>🔑 {t("login")}</h3>
          </div>

          {/* FORM */}
          <form onSubmit={onSubmit} className="auth-form">

            {/* EMAIL */}
            <div className="auth-field">
              <label>{t("email")}</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉️</span>

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={authForm.email}
                  onChange={(e) =>
                    onAuthFormChange({
                      ...authForm,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="auth-field">
              <label>{t("password")}</label>

              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>

                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={authForm.password}
                  onChange={(e) =>
                    onAuthFormChange({
                      ...authForm,
                      password: e.target.value,
                    })
                  }
                  required
                />

                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* SUBMIT */}
            <button type="submit" className="auth-submit-btn">
              🔑 {t("loginBtn") || "Login"}
            </button>
          </form>

          {/* REGISTER LINK (ONLY NAVIGATION - NO EXTRA PAGE CLUTTER) */}
          <p className="auth-switch-text">
            {t("noAccount") || "Don't have an account?"}{" "}
            <button
              type="button"
              className="auth-switch-btn"
              onClick={() => onNavigate("register")}
            >
              {t("register")}
            </button>
          </p>

          {/* BACK HOME */}
          <p className="auth-back">
            <button
              type="button"
              className="auth-switch-btn"
              onClick={() => onNavigate("home")}
            >
              ← {t("backHome") || "Back to Home"}
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}

export default LoginPage;