function AboutPage() {
  return (
    <section className="about-page">
      <div className="panel about-hero">
        <p className="eyebrow">About The Project</p>
        <h2>Smart Agriculture Advisory System</h2>
        <p>
          This graduate project is a MERN-based decision support system that helps farmers choose
          suitable crops and access agricultural advice using farm conditions such as soil type,
          season, rainfall, temperature, and irrigation availability.
        </p>
      </div>

      <div className="about-grid">
        <article className="panel">
          <h3>Problem</h3>
          <p>
            Many farmers lack timely digital guidance when choosing crops, identifying pests,
            or planning production based on seasonal and soil conditions.
          </p>
        </article>
        <article className="panel">
          <h3>Objective</h3>
          <p>
            To build a web system that provides crop recommendations, farmer profile management,
            crop information, pest advisory, and recommendation history.
          </p>
        </article>
        <article className="panel">
          <h3>Technology</h3>
          <p>
            React handles the frontend, Node.js and Express provide APIs, and MongoDB stores users,
            farm profiles, crop records, and recommendations.
          </p>
        </article>
      </div>
    </section>
  );
}

export default AboutPage;
