import { useLang } from "../LanguageContext";

function Sidebar({ activePage, user, onNavigate, onLogout }) {
  const { t, lang, setLang } = useLang();

  const pages = [
    { id: "dashboard", label: t("dashboard") },
    { id: "recommend", label: t("recommendation") },
    { id: "pest", label: t("pestAdvisory") },
    { id: "market", label: " Marketplace" },
    { id: "profile", label: t("profile") },
    { id: "history", label: t("history") },
    { id: "crops", label: t("crops") },
    { id: "about", label: t("about") },
  ];

  return (
    <aside className="static-sidebar">
      <div className="brand-block" onClick={() => onNavigate("home")} style={{ cursor: "pointer" }} title="Go to Home">
        <span>SA</span>
        <div>
          <strong>Smart Agriculture</strong>
          <small>Advisory System</small>
        </div>
      </div>

      {/* Language switcher in sidebar */}
      <div className="sidebar-lang">
        <button className={lang === "en" ? "lang-btn active" : "lang-btn"} onClick={() => setLang("en")}>EN</button>
        <button className={lang === "am" ? "lang-btn active" : "lang-btn"} onClick={() => setLang("am")}>አማ</button>
        <button className={lang === "om" ? "lang-btn active" : "lang-btn"} onClick={() => setLang("om")}>OM</button>
      </div>

      <nav className="side-nav">
        <button className={activePage === "home" ? "active" : ""} onClick={() => onNavigate("home")}>🏠 Home</button>

        {pages.map((page) => (
          <button
            key={page.id}
            className={activePage === page.id ? "active" : ""}
            onClick={() => onNavigate(page.id)}
          >
            {page.label}
          </button>
        ))}

        {user?.role === "admin" && (
          <button className={activePage === "admin" ? "active" : ""} onClick={() => onNavigate("admin")}>{t("admin")}</button>
        )}

        {user && (
          <button onClick={onLogout}>{t("logout")}</button>
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;
