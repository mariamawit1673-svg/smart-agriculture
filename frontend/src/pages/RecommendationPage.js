import SelectField from "../components/SelectField";
import { rainfallOptions, seasonOptions, soilOptions, temperatureOptions } from "../constants";

function RecommendationPage({
  form,
  latestRecommendation,
  onFormChange,
  onSubmit,
}) {
  return (
    <section className="recommendation-layout">
      <div className="panel recommendation-intro">
        <p className="eyebrow">Decision Support</p>
        <h2>Crop Recommendation</h2>
        <p>
          Enter the farm conditions below. The system compares soil, season, rainfall,
          temperature, and irrigation availability against stored crop knowledge.
        </p>
      </div>
      <div className="panel">
      <form onSubmit={onSubmit} className="form-grid">
        <SelectField label="Soil type" value={form.soilType} onChange={(value) => onFormChange({ ...form, soilType: value })} options={soilOptions} />
        <SelectField label="Season" value={form.season} onChange={(value) => onFormChange({ ...form, season: value })} options={seasonOptions} />
        <SelectField label="Rainfall" value={form.rainfall} onChange={(value) => onFormChange({ ...form, rainfall: value })} options={rainfallOptions} />
        <SelectField label="Temperature" value={form.temperature} onChange={(value) => onFormChange({ ...form, temperature: value })} options={temperatureOptions} />
        <label>
          Location
          <input value={form.location} onChange={(event) => onFormChange({ ...form, location: event.target.value })} />
        </label>
        <label className="checkbox-label">
          <input type="checkbox" checked={form.irrigationAvailable} onChange={(event) => onFormChange({ ...form, irrigationAvailable: event.target.checked })} />
          Irrigation available
        </label>
        <button type="submit">Get Recommendation</button>
      </form>
      </div>

      {latestRecommendation && (
        <div className="result-box recommendation-result">
          <h3>Recommended crops</h3>
          <p>{latestRecommendation.recommendedCrops.join(", ")}</p>
          <h3>Advice</h3>
          <ul>
            {latestRecommendation.advice.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      )}
    </section>
  );
}

export default RecommendationPage;
