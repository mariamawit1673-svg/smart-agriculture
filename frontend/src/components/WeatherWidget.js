import { useEffect, useState } from "react";
import { API_BASE } from "../constants";

export default function WeatherWidget({ onWeatherReady }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cityInput, setCityInput] = useState("");

  // Auto-detect on mount
  useEffect(() => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => { setLoading(false); setError("Location access denied. Enter a city manually."); }
      );
    }
  }, []);

  async function fetchWeather(lat, lon, city) {
    setLoading(true);
    setError("");
    try {
      const params = city
        ? `city=${encodeURIComponent(city)}`
        : `lat=${lat}&lon=${lon}`;
      const res = await fetch(`${API_BASE}/weather?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setWeather(data);
      if (onWeatherReady) onWeatherReady(data);
    } catch (err) {
      setError("Could not fetch weather. Check backend or city name.");
    } finally {
      setLoading(false);
    }
  }

  function handleCitySearch(e) {
    e.preventDefault();
    if (cityInput.trim()) fetchWeather(null, null, cityInput.trim());
  }

  const f = weather?.farming;

  return (
    <div className="weather-widget">
      <div className="weather-widget-header">
        <span className="eyebrow">Live Weather</span>
        <form onSubmit={handleCitySearch} className="weather-city-form">
          <input
            type="text"
            placeholder="Enter city..."
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
          />
          <button type="submit" disabled={loading}>Go</button>
        </form>
      </div>

      {loading && <p className="weather-loading">Detecting location...</p>}
      {error && <p className="weather-error">{error}</p>}

      {weather && !loading && (
        <div className="weather-body">
          <div className="weather-main">
            {weather.icon && (
              <img
                src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                alt={weather.description}
                className="weather-icon"
              />
            )}
            <div>
              <h3 className="weather-temp">{weather.temp}°C</h3>
              <p className="weather-location">{weather.location}{weather.country ? `, ${weather.country}` : ""}</p>
              <p className="weather-desc">{weather.description}</p>
            </div>
          </div>

          <div className="weather-details">
            <span>💧 Humidity: {weather.humidity}%</span>
            <span>🌡 Feels like: {weather.feelsLike}°C</span>
            <span>💨 Wind: {weather.windSpeed} m/s</span>
          </div>

          <div className="weather-farming">
            <p className="weather-farming-title">Farming Conditions Detected</p>
            <div className="weather-farming-tags">
              <span className="wtag">🌱 Season: <b>{f.season}</b></span>
              <span className="wtag">🌡 Temp: <b>{f.temperature}</b></span>
              <span className="wtag">🌧 Rainfall: <b>{f.rainfall}</b></span>
              <span className="wtag">🪱 Soil hint: <b>{f.soilHint}</b></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
