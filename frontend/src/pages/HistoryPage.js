function HistoryPage({ history }) {
  return (
    <section className="panel">
      <h2>Recommendation History</h2>
      <div className="list-grid">
        {history.length === 0 && <p>No saved recommendations yet. Login and request advice to build history.</p>}
        {history.map((item) => (
          <article className="record" key={item._id}>
            <strong>{item.recommendedCrops.join(", ")}</strong>
            <p>{item.soilType} soil, {item.season} season, {item.location || "no location"}</p>
            <small>{new Date(item.createdAt).toLocaleString()}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

export default HistoryPage;
