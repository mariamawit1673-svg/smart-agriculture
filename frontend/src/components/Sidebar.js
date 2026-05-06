const pages = [
  { id: "dashboard", label: "Dashboard" },
  { id: "recommend", label: "Recommendation" },
  { id: "pest", label: "Pest Advisory" },
  { id: "about", label: "About" },
];

function Sidebar({ activePage, user, onNavigate, onLogout }) {
  return (
    <aside className="static-sidebar">

      {/* BRAND */}
      <div className="brand-block">
        <span>SA</span>
        <div>
          <strong>Smart Agriculture</strong>
          <small>Advisory System</small>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="side-nav">

        <button
          className={activePage === "home" ? "active" : ""}
          onClick={() => onNavigate("home")}
        >
          Home
        </button>

        <button
          className={activePage === "login" ? "active" : ""}
          onClick={() => onNavigate("login")}
        >
          Login
        </button>

        <button
          className={activePage === "register" ? "active" : ""}
          onClick={() => onNavigate("register")}
        >
          Register
        </button>

        {pages.map((page) => (
          <button
            key={page.id}
            className={activePage === page.id ? "active" : ""}
            onClick={() => onNavigate(page.id)}
          >
            {page.label}
          </button>
        ))}
      </nav>

      {/* PROJECT NOTE */}

    </aside>
  );
}

export default Sidebar;