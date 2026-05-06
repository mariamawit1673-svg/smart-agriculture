function LandingPage({ onEnterApp }) {
  return (
    <main className="landing-page">
      
      {/* HERO SECTION */}
      <section className="landing-hero">
        <nav className="landing-nav">
          <strong>Smart Agriculture Advisory System</strong>
          <div className="landing-nav-actions">
            <button onClick={() => onEnterApp("login")}>Login</button>
            <button onClick={() => onEnterApp("register")}>Register</button>
          </div>
        </nav>

        <div className="hero-content">
          <p className="eyebrow">Crop intelligence for better farm decisions</p>
          <h1>Smart Agriculture Advisory System</h1>
          <p className="hero-copy">
            A web-based platform that helps farmers choose suitable crops, save farm profiles,
            manage crop knowledge, and track previous recommendations.
          </p>

          <div className="hero-metrics">
            <div><strong>8+</strong><span>Crop records</span></div>
            <div><strong>5</strong><span>Decision factors</span></div>
          
          </div>

          <div className="hero-actions">
            <button onClick={() => onEnterApp("login")}>Get Started</button>
         
            <a href="#overview"></a>
          </div>
        </div>
      </section>

      {/* OVERVIEW */}
      <section className="landing-overview" id="overview">
        <div>
          <span>01</span>
          <h2>Farmer Profiles</h2>
          <p>Store location, soil type, farm size, preferred crops, and irrigation availability.</p>
          <button onClick={() => onEnterApp("login")}>Open Dashboard</button>
        </div>

        <div>
          <span>02</span>
          <h2>Crop Recommendation</h2>
          <p>Recommend crops using soil type, season, rainfall, temperature, and farm conditions.</p>
          <button onClick={() => onEnterApp("login")}>Open Recommendation</button>
        </div>

        <div>
          <span>03</span>
          <h2>Admin Knowledge Base</h2>
          <p>Manage crop data, fertilizer advice, pest guidance, and harvest information.</p>
          <button onClick={() => onEnterApp("login")}>Open Pest Advisory</button>
        </div>
      </section>

      {/* IMPACT SECTION */}
      <section className="landing-impact">
        <h2>Why this system matters</h2>
        <p>
          Many farmers lack access to timely and accurate agricultural advice.
          This system helps improve crop selection, reduce farming risks,
          and increase productivity using simple digital tools.
        </p>
      </section>

      {/* USER ROLES */}
      <section className="landing-roles">
        <h2>Who can use the system?</h2>
        <ul>
          <li> Farmers – get crop recommendations and track history</li>
          <li> Admins – manage crop knowledge and advisory data</li>
          <li> Buyers (optional) – view available crops for purchase</li>
        </ul>
      </section>

      {/* FEATURES */}
      <section className="landing-features">
        <h2>Key Features</h2>
        <ul>
          <li>✔ Crop recommendation engine</li>
          <li>✔ Farm profile management</li>
          <li>✔ Advisory history tracking</li>
          <li>✔ Pest and fertilizer guidance</li>
        </ul>
      </section>

      {/* MARKETPLACE PREVIEW */}
      <section className="landing-market">
        <h2>Market Access</h2>
        <p>
          Farmers can list crops for sale and buyers can browse available products,
          improving market connection and accessibility.
        </p>
      </section>

      {/* DETAIL */}
      <section className="landing-detail">
        <div>
          <p className="eyebrow">Graduate project scope</p>
          <h2>Built with React, Node.js, Express, and MongoDB</h2>
          <p>
            The system is designed as a practical decision-support tool for smallholder farmers,
            extension workers, and agriculture offices that need fast crop and advisory guidance.
          </p>
        </div>

        <div className="detail-grid">
          <article>
            <strong>Authentication</strong>
            <p>Secure farmer and admin login system.</p>
          </article>
          <article>
            <strong>Decision Support</strong>
            <p>Rule-based recommendations for crop selection.</p>
          </article>
          <article>
            <strong>History Tracking</strong>
            <p>Saved recommendations for future reference.</p>
          </article>
          <article>
            <strong>Crop Advisory</strong>
            <p>Includes fertilizer, pest, and harvest guidance.</p>
          </article>
        </div>
      </section>

      {/* PROCESS */}
      <section className="landing-process">
        <div>
          <p className="eyebrow">How it works</p>
          <h2>From farm condition to actionable advice</h2>
        </div>

        <ol>
          <li>
            <strong>Create profile</strong>
            <span>Save location, farm size, soil type, and irrigation status.</span>
          </li>
          <li>
            <strong>Enter conditions</strong>
            <span>Choose season, rainfall, temperature, and soil details.</span>
          </li>
          <li>
            <strong>Get recommendation</strong>
            <span>Receive suitable crops with fertilizer and pest guidance.</span>
          </li>
          <li>
            <strong>Track history</strong>
            <span>Review previous recommendations.</span>
          </li>
        </ol>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <p>© 2026 Smart Agriculture Advisory System</p>
        <p>Developed by [mariamawit bogale]</p>
      </footer>

    </main>
  );
}

export default LandingPage;