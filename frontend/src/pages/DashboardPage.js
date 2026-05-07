import { useState } from "react";
import WeatherWidget from "../components/WeatherWidget";
import { API_BASE } from "../constants";

function DashboardPage({ user, profile, history, crops, onNavigate }) {
  const [weatherRec, setWeatherRec] = useState(null);
  const [recLoading, setRecLoading] = useState(false);

  async function handleWeatherReady(weatherData) {
    const f = weatherData.farming;
    setRecLoading(true);
    try {
      const res = await fetch(`${API_BASE}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soilType: f.soilHint,
          season: f.season,
          rainfall: f.rainfall,
          temperature: f.temperature,
          location: weatherData.location,
          irrigationAvailable: false,
          userId: user?.id,
        }),
      });
      const data = await res.json();
      setWeatherRec({ crops: data.recommendedCrops, advice: data.advice, location: weatherData.location });
    } catch { /* silent */ }
    finally { setRecLoading(false); }
  }
  const recentRecommendation = history[0];
  const soilTypes = new Set(crops.flatMap((crop) => crop.soilTypes || [])).size;
  const profileFields = [
    profile.location,
    profile.farmSize,
    profile.soilType,
    profile.preferredCrops,
  ];
  const completedProfileFields = profileFields.filter(Boolean).length + (profile.irrigationAvailable ? 1 : 0);
  const profileScore = Math.round((completedProfileFields / 5) * 100);
  const soilMatchedCrops = crops.filter((crop) => crop.soilTypes?.includes(profile.soilType));
  const rainyMatches = soilMatchedCrops.filter((crop) => crop.seasons?.includes("rainy")).length;
  const dryMatches = soilMatchedCrops.filter((crop) => crop.seasons?.includes("dry")).length;
  const cropFrequency = history
    .flatMap((item) => item.recommendedCrops || [])
    .reduce((acc, crop) => ({ ...acc, [crop]: (acc[crop] || 0) + 1 }), {});
  const topCrops = Object.entries(cropFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const nextAction = !user
    ? "Login or create an account to save profile and recommendation history."
    : profileScore < 80
      ? "Complete your farmer profile to improve advisory accuracy."
      : history.length === 0
        ? "Generate your first crop recommendation."
        : "Review pest advisory before planting the recommended crops.";

  return (
    <section className="dashboard-page">
      <div className="panel dashboard-hero">
        <div>
          <p className="eyebrow">System Overview</p>
          <h2>{user ? `Welcome, ${user.name}` : "Welcome to the advisory dashboard"}</h2>
          <p>
            View farm information, crop records, recommendation activity, and quick actions from one place.
          </p>
        </div>
        <button onClick={() => onNavigate("recommend")}>New Recommendation</button>
      </div>

      <div className="kpi-grid">
        <article>
          <span>{crops.length}</span>
          <p>Crop records</p>
        </article>
        <article>
          <span>{soilTypes}</span>
          <p>Soil categories</p>
        </article>
        <article>
          <span>{history.length}</span>
          <p>Saved recommendations</p>
        </article>
        <article>
          <span>{profile.irrigationAvailable ? "Yes" : "No"}</span>
          <p>Irrigation available</p>
        </article>
      </div>

      <div className="insight-grid">
        <article className="panel insight-card">
          <h3>Profile Completeness</h3>
          <strong>{profileScore}%</strong>
          <div className="progress-track">
            <span style={{ width: `${profileScore}%` }} />
          </div>
          <p>{profileScore >= 80 ? "Profile is ready for better recommendations." : "Add more farm information to improve recommendation quality."}</p>
        </article>

        <article className="panel insight-card">
          <h3>Soil Suitability</h3>
          <strong>{soilMatchedCrops.length}</strong>
          <p>Crops in the database match your saved soil type: <b>{profile.soilType || "not selected"}</b>.</p>
          <div className="mini-bars">
            <div><span>Rainy</span><strong>{rainyMatches}</strong></div>
            <div><span>Dry</span><strong>{dryMatches}</strong></div>
          </div>
        </article>

        <article className="panel insight-card next-action">
          <h3>Recommended Next Action</h3>
          <p>{nextAction}</p>
          <button onClick={() => onNavigate(profileScore < 80 ? "profile" : "recommend")}>
            Continue
          </button>
        </article>
      </div>

      <div className="dashboard-grid">
        <article className="panel">
          <h3>Farmer Profile</h3>
          <p><strong>Location:</strong> {profile.location || "Not saved"}</p>
          <p><strong>Soil:</strong> {profile.soilType || "Not saved"}</p>
          <p><strong>Farm size:</strong> {profile.farmSize || "Not saved"}</p>
          <button className="secondary-button" onClick={() => onNavigate("profile")}>Manage Profile</button>
        </article>

        <article className="panel">
          <h3>Latest Recommendation</h3>
          {recentRecommendation ? (
            <>
              <p><strong>Crops:</strong> {recentRecommendation.recommendedCrops.join(", ")}</p>
              <p><strong>Condition:</strong> {recentRecommendation.soilType} soil, {recentRecommendation.season} season</p>
            </>
          ) : (
            <p>No recommendation history yet.</p>
          )}
          <button className="secondary-button" onClick={() => onNavigate("history")}>View History</button>
        </article>

        <article className="panel">
          <h3>Crop Knowledge</h3>
          <p><strong>Total crop records:</strong> {crops.length}</p>
          <p>Crop data contains soil, season, water, fertilizer, pest, and harvest advice.</p>
          <button className="secondary-button" onClick={() => onNavigate("crops")}>Open Crop Info</button>
        </article>
      </div>

      <div className="panel dashboard-analysis">
        <h3>Recommendation Analysis</h3>
        {topCrops.length > 0 ? (
          <div className="analysis-list">
            {topCrops.map(([crop, count]) => (
              <div key={crop}>
                <span>{crop}</span>
                <div className="progress-track">
                  <span style={{ width: `${Math.min(count * 25, 100)}%` }} />
                </div>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        ) : (
          <p>No recommendation history yet. Generate recommendations to see crop trends here.</p>
        )}
      </div>

      <div className="panel project-roadmap">
        <h3>Project Modules</h3>
        <div>
          <span>Authentication</span>
          <span>Farmer Profile</span>
          <span>Crop Recommendation</span>
          <span>Pest Advisory</span>
          <span>History Tracking</span>
          <span>Admin Crop Data</span>
        </div>
      </div>

      {/* ── Weather + Auto Recommendation ── */}
      <div className="weather-section">
        <div className="panel weather-panel">
          <WeatherWidget onWeatherReady={handleWeatherReady} />
        </div>

        <div className="panel weather-rec-panel">
          <p className="eyebrow">Auto Recommendation</p>
          <h3>Crops for Current Weather</h3>
          {recLoading && <p className="weather-loading">Analyzing weather conditions...</p>}
          {!recLoading && !weatherRec && (
            <p style={{ color: "var(--text-muted, #888)" }}>
              Weather data will automatically recommend crops for your location.
            </p>
          )}
          {!recLoading && weatherRec && (
            <div>
              <p style={{ marginBottom: "8px" }}>
                Based on weather in <strong>{weatherRec.location}</strong>:
              </p>
              <div className="weather-crop-tags">
                {weatherRec.crops.slice(0, 6).map((c) => (
                  <span key={c} className="weather-crop-tag">{c}</span>
                ))}
              </div>
              {weatherRec.advice?.slice(0, 2).map((a, i) => (
                <p key={i} style={{ fontSize: "13px", marginTop: "8px", color: "var(--text-muted, #666)" }}>{a}</p>
              ))}
              <button
                className="secondary-button"
                style={{ marginTop: "12px" }}
                onClick={() => onNavigate("recommend")}
              >
                Refine Recommendation
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;
