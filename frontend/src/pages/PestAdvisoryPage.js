import { useEffect, useState } from "react";

const CROPS = ["Maize", "Tomato", "Beans", "Rice", "Wheat", "Potato", "Cabbage", "Mango"];
const API = "http://localhost:5000/api";

const RISK = {
  High:   { badge: "risk-badge risk-high",   alert: "pest-alert pest-alert-high" },
  Medium: { badge: "risk-badge risk-medium", alert: "pest-alert pest-alert-medium" },
  Low:    { badge: "risk-badge risk-low",    alert: "pest-alert pest-alert-low" },
};

const STATUS_CLS = {
  open:     "adv-badge adv-pending",
  treated:  "adv-badge adv-completed",
  resolved: "risk-badge risk-low",
};

function SymptomChecker({ user }) {
  const [crop, setCrop] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleDiagnose(e) {
    e.preventDefault();
    setLoading(true); setResult(null); setSaved(false); setError(""); setSubmitted(true);
    try {
      const res = await fetch(API + "/pests/diagnose", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ crop, symptoms }) });
      const data = await res.json();
      if (data && data.problem) setResult(data); else setResult(null);
    } catch { setError("Could not connect to backend. Make sure the server is running."); }
    finally { setLoading(false); }
  }

  async function handleSave() {
    try {
      await fetch(API + "/pests/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ crop, symptoms, pestName: result?.problem || "Unknown", treatment: result?.advice || "", userId: user?.id || null, status: "open" }) });
      setSaved(true);
    } catch {}
  }

  return (
    <div className="pest-checker">
      <form className="pest-checker-form" onSubmit={handleDiagnose}>
        <label>Crop Name (type any crop)
          <input type="text" value={crop} onChange={(e) => setCrop(e.target.value)} placeholder="e.g. Banana, Sugarcane, Onion, Maize..." list="crop-list" required />
          <datalist id="crop-list">{CROPS.map((c) => <option key={c} value={c} />)}</datalist>
        </label>
        <label>Describe Symptoms
          <textarea placeholder="e.g. yellowing leaves, holes in leaves..." value={symptoms} onChange={(e) => setSymptoms(e.target.value)} rows={4} required />
        </label>
        <button type="submit" disabled={loading}>{loading ? "Diagnosing..." : "Identify Pest"}</button>
      </form>
      {error && <p className="notice error">{error}</p>}
      {submitted && !loading && !result && !error && <div className="pest-empty"><p>No matching pest found.</p></div>}
      {result && (
        <div className="pest-result">
          <div className="pest-result-header">
            <div>
              <span className="pest-crop-label">{result.crop}</span>
              <h3>{result.problem}</h3>
              {result.source === "ai" && <span className="risk-badge risk-medium" style={{fontSize:"11px",marginTop:"4px",display:"inline-block"}}>AI Generated</span>}
            </div>
            <span className={RISK[result.riskLevel]?.badge || "risk-badge risk-low"}>{result.riskLevel} Risk</span>
          </div>
          <div className="pest-result-grid">
            <div className="pest-result-block"><strong>Symptoms</strong><p>{result.symptoms}</p></div>
            <div className="pest-result-block"><strong>General Advice</strong><p>{result.advice}</p></div>
            <div className="pest-result-block pest-organic"><strong>Organic Treatment</strong><p>{Array.isArray(result.organicTreatment)?result.organicTreatment.join(" "):result.organicTreatment||"None listed."}</p></div>
            <div className="pest-result-block pest-chemical"><strong>Chemical Treatment</strong><p>{Array.isArray(result.chemicalTreatment)?result.chemicalTreatment.join(" "):result.chemicalTreatment||"None listed."}</p></div>
            <div className="pest-result-block pest-prevention" style={{gridColumn:"1 / -1"}}><strong>Prevention Tips</strong><p>{Array.isArray(result.prevention)?result.prevention.join(" "):result.prevention||"None listed."}</p></div>
          </div>
          {!saved ? <button className="secondary-button" onClick={handleSave}>Save to My Reports</button> : <p className="notice success">Saved.</p>}
        </div>
      )}
    </div>
  );
}

function PestLibrary() {
  const [pests, setPests] = useState([]);
  const [cropInput, setCropInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(API + "/pests").then((r) => r.json()).then((d) => setPests(Array.isArray(d)?d:[])).catch(()=>setPests([])).finally(()=>setLoading(false));
  }, []);

  async function handleAISearch(e) {
    e.preventDefault();
    if (!cropInput.trim()) return;
    setLoading(true); setAiMode(true);
    try {
      const res = await fetch(API + "/pests-ai/library?crop=" + encodeURIComponent(cropInput));
      const data = await res.json();
      setPests(Array.isArray(data)?data:[]);
    } catch { setPests([]); }
    finally { setLoading(false); }
  }

  function handleReset() {
    setAiMode(false); setCropInput(""); setLoading(true);
    fetch(API + "/pests").then((r) => r.json()).then((d) => setPests(Array.isArray(d)?d:[])).catch(()=>setPests([])).finally(()=>setLoading(false));
  }

  return (
    <div>
      <form className="pest-checker-form" onSubmit={handleAISearch} style={{marginBottom:"18px"}}>
        <label>Search pests for any crop (AI-powered)
          <input type="text" value={cropInput} onChange={(e) => setCropInput(e.target.value)} placeholder="Type any crop e.g. Banana, Sugarcane..." list="lib-crop-list" />
          <datalist id="lib-crop-list">{CROPS.map((c) => <option key={c} value={c} />)}</datalist>
        </label>
        <div style={{display:"flex",gap:"10px"}}>
          <button type="submit" disabled={loading||!cropInput.trim()}>{loading&&aiMode?"Loading AI data...":"Search with AI"}</button>
          {aiMode && <button type="button" className="secondary-button" onClick={handleReset}>Reset to Default</button>}
        </div>
      </form>
      {aiMode && <div className="pest-alert pest-alert-low" style={{marginBottom:"14px"}}>Showing AI-generated pest data for: <strong>{cropInput}</strong></div>}
      {loading && <p className="pest-loading">Loading...</p>}
      {!loading && pests.length === 0 && <div className="pest-empty"><p>No pests found.</p></div>}
      {!loading && pests.length > 0 && (
        <div className="pest-grid">
          {pests.map((pest) => (
            <article className="pest-card" key={pest._id}>
              <div className="pest-card-img-placeholder">🌿</div>
              <div className="pest-card-body">
                <div className="pest-card-top">
                  <span className="pest-crop-label">{pest.crop}</span>
                  <span className={RISK[pest.riskLevel]?.badge||"risk-badge risk-low"}>{pest.riskLevel}</span>
                </div>
                <h3 className="pest-card-title">{pest.problem}</h3>
                <p className="pest-card-text">{pest.symptoms}</p>
                {pest.source==="ai"&&<span className="risk-badge risk-medium" style={{fontSize:"11px",marginBottom:"8px",display:"inline-block"}}>AI</span>}
                <div className="pest-card-actions">
                  <button className="secondary-button" onClick={()=>setDetail(pest)}>View Details</button>
                  <button onClick={()=>setDetail(pest)}>Get Treatment</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {detail && (
        <div className="pest-modal-overlay" onClick={()=>setDetail(null)}>
          <div className="pest-modal" onClick={(e)=>e.stopPropagation()}>
            <div className="pest-modal-header">
              <div><span className="pest-crop-label">{detail.crop}</span><h3>{detail.problem}</h3></div>
              <span className={RISK[detail.riskLevel]?.badge||"risk-badge risk-low"}>{detail.riskLevel} Risk</span>
            </div>
            <p><strong>Symptoms:</strong> {detail.symptoms}</p>
            <p><strong>Advice:</strong> {detail.advice}</p>
            {detail.organicTreatment&&<p><strong>Organic:</strong> {detail.organicTreatment}</p>}
            {detail.chemicalTreatment&&<p><strong>Chemical:</strong> {detail.chemicalTreatment}</p>}
            {detail.prevention&&<p><strong>Prevention:</strong> {detail.prevention}</p>}
            <button onClick={()=>setDetail(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MyReports({ user }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  function fetchReports() {
    setLoading(true);
    const params = user?.id ? "?userId=" + user.id : "";
    fetch(API + "/pests/reports" + params).then((r)=>r.json()).then((d)=>setReports(Array.isArray(d)?d:[])).catch(()=>setReports([])).finally(()=>setLoading(false));
  }

  useEffect(()=>{ fetchReports(); }, []);

  async function updateStatus(id, status) {
    try {
      await fetch(API + "/pests/reports/" + id + "/status", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      fetchReports();
    } catch {}
  }

  return (
    <div>
      {loading && <p className="pest-loading">Loading reports...</p>}
      {!loading && reports.length === 0 && <div className="pest-empty"><p>No pest reports yet. Use the Symptom Checker tab to diagnose and save a report.</p></div>}
      {!loading && reports.length > 0 && (
        <div className="adv-table-wrap">
          <table className="adv-table">
            <thead><tr><th>Date</th><th>Crop</th><th>Pest</th><th>Symptoms</th><th>Status</th><th>Update</th></tr></thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r._id}>
                  <td className="adv-date">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td><strong>{r.crop}</strong></td>
                  <td>{r.pestName||"-"}</td>
                  <td className="adv-advice-cell">{r.symptoms}</td>
                  <td><span className={STATUS_CLS[r.status]||"adv-badge adv-pending"}>{r.status}</span></td>
                  <td><select className="adv-status-select" value={r.status} onChange={(e)=>updateStatus(r._id,e.target.value)}><option value="open">Open</option><option value="treated">Treated</option><option value="resolved">Resolved</option></select></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const TABS = ["Symptom Checker", "Pest Library", "My Reports"];

function PestAdvisoryPage({ user }) {
  const [tab, setTab] = useState(0);
  return (
    <section className="panel">
      <p className="eyebrow">Plant Health</p>
      <h2>Pest Advisory</h2>
      <p className="page-intro">Type any crop to get AI-powered pest identification, library search, and treatment advice.</p>
      <div className="pest-tabs">
        {TABS.map((t, i) => <button key={t} className={tab===i?"pest-tab active":"pest-tab"} onClick={()=>setTab(i)}>{t}</button>)}
      </div>
      {tab === 0 && <SymptomChecker user={user} />}
      {tab === 1 && <PestLibrary />}
      {tab === 2 && <MyReports user={user} />}
    </section>
  );
}

export default PestAdvisoryPage;