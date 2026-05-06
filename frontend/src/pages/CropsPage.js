function CropsPage({ crops }) {
  return (
    <section className="panel">
      <h2>Crop Information</h2>
      <div className="crop-grid">
        {crops.map((crop) => (
          <article className="crop-card" key={crop._id}>
            <h3>{crop.name}</h3>
            <p>{crop.description}</p>
            <dl>
              <dt>Soil</dt><dd>{crop.soilTypes?.join(", ")}</dd>
              <dt>Season</dt><dd>{crop.seasons?.join(", ")}</dd>
              <dt>Water</dt><dd>{crop.waterRequirement}</dd>
              <dt>Harvest</dt><dd>{crop.harvestPeriod || "Not specified"}</dd>
            </dl>
            <p><strong>Fertilizer:</strong> {crop.fertilizerAdvice || "Not specified"}</p>
            <p><strong>Pests:</strong> {crop.pestAdvice || "Not specified"}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default CropsPage;
