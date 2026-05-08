import { useEffect, useState } from "react";
import SelectField from "../components/SelectField";
import { rainfallOptions, temperatureOptions, waterOptions } from "../constants";

const API = "http://localhost:5000/api";

function AdminPage({ isAdmin, crops, cropForm, onCropFormChange, onAddCrop, onDeleteCrop }) {
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, crops: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    loadAll();
  }, [isAdmin]);

  async function loadAll() {
    setLoading(true);
    try {
      const [u, p, o] = await Promise.all([
        fetch(`${API}/auth/users`).then(r => r.json()).catch(() => []),
        fetch(`${API}/market`).then(r => r.json()).catch(() => []),
        fetch(`${API}/market/orders`).then(r => r.json()).catch(() => []),
      ]);
      setUsers(Array.isArray(u) ? u : []);
      setProducts(Array.isArray(p) ? p : []);
      setOrders(Array.isArray(o) ? o : []);
      setStats({
        users: Array.isArray(u) ? u.length : 0,
        products: Array.isArray(p) ? p.length : 0,
        orders: Array.isArray(o) ? o.length : 0,
        crops: crops.length,
      });
    } catch { /* silent */ }
    setLoading(false);
  }

  async function deleteProduct(id) {
    if (!window.confirm("Remove this product?")) return;
    await fetch(`${API}/market/${id}`, { method: "DELETE" });
    loadAll();
  }

  if (!isAdmin) {
    return (
      <section className="panel">
        <h2>⚙️ Admin Panel</h2>
        <p style={{ color: "#e53935" }}>Access denied. Admin login required.</p>
      </section>
    );
  }

  const TABS = ["📊 Overview", "👥 Users", "🌾 Crops", "🛒 Products", "📦 Orders"];

  return (
    <section className="panel admin-page">
      <p className="eyebrow">System Control</p>
      <h2>⚙️ Admin Dashboard</h2>

      {/* Stats */}
      <div className="kpi-grid" style={{ marginBottom: "20px" }}>
        <article><span>{stats.users}</span><p>Total Users</p></article>
        <article><span>{stats.crops}</span><p>Crop Records</p></article>
        <article><span>{stats.products}</span><p>Market Products</p></article>
        <article><span>{stats.orders}</span><p>Total Orders</p></article>
      </div>

      {/* Tabs */}
      <div className="pest-tabs" style={{ marginBottom: "18px" }}>
        {TABS.map((tabLabel, i) => (
          <button key={i} className={tab === i ? "pest-tab active" : "pest-tab"} onClick={() => setTab(i)}>
            {tabLabel}
          </button>
        ))}
      </div>

      {loading && <p className="pest-loading">Loading...</p>}

      {/* ── OVERVIEW ── */}
      {tab === 0 && (
        <div className="admin-overview">
          <div className="panel insight-card">
            <h3>System Summary</h3>
            <p>👥 <strong>{stats.users}</strong> registered users</p>
            <p>🌾 <strong>{stats.crops}</strong> crop records in knowledge base</p>
            <p>🛒 <strong>{stats.products}</strong> products listed in marketplace</p>
            <p>📦 <strong>{stats.orders}</strong> orders placed</p>
            <p>🌍 Multi-language: English, Amharic, Afaan Oromo</p>
          </div>
          <div className="panel insight-card">
            <h3>Role Distribution</h3>
            {["farmer", "buyer", "admin"].map(role => {
              const count = users.filter(u => u.role === role).length;
              return (
                <div key={role} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #eee" }}>
                  <span>{role === "farmer" ? "🌾 Farmers" : role === "buyer" ? "🛒 Buyers" : "🛠 Admins"}</span>
                  <strong>{count}</strong>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── USERS ── */}
      {tab === 1 && (
        <div>
          <h3>👥 Registered Users ({users.length})</h3>
          {users.length === 0 && <p className="pest-empty">No users found.</p>}
          {users.length > 0 && (
            <div className="adv-table-wrap">
              <table className="adv-table">
                <thead><tr><th>Name</th><th>Email/Phone</th><th>Role</th><th>Joined</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email || u.phone || "-"}</td>
                      <td>
                        <span className={`adv-badge ${u.role === "admin" ? "risk-badge risk-high" : u.role === "buyer" ? "risk-badge risk-medium" : "adv-completed"}`}>
                          {u.role === "farmer" ? "🌾" : u.role === "buyer" ? "🛒" : "🛠"} {u.role}
                        </span>
                      </td>
                      <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── CROPS ── */}
      {tab === 2 && (
        <div>
          <h3>🌾 Crop Knowledge Base</h3>
          <form onSubmit={onAddCrop} className="form-grid" style={{ marginBottom: "20px" }}>
            <label>Crop name<input value={cropForm.name} onChange={e => onCropFormChange({ ...cropForm, name: e.target.value })} required /></label>
            <label>Soil types<input value={cropForm.soilTypes} onChange={e => onCropFormChange({ ...cropForm, soilTypes: e.target.value })} /></label>
            <label>Seasons<input value={cropForm.seasons} onChange={e => onCropFormChange({ ...cropForm, seasons: e.target.value })} /></label>
            <SelectField label="Rainfall" value={cropForm.rainfall} onChange={v => onCropFormChange({ ...cropForm, rainfall: v })} options={rainfallOptions} />
            <SelectField label="Temperature" value={cropForm.temperature} onChange={v => onCropFormChange({ ...cropForm, temperature: v })} options={temperatureOptions} />
            <SelectField label="Water requirement" value={cropForm.waterRequirement} onChange={v => onCropFormChange({ ...cropForm, waterRequirement: v })} options={waterOptions} />
            <label>Harvest period<input value={cropForm.harvestPeriod} onChange={e => onCropFormChange({ ...cropForm, harvestPeriod: e.target.value })} /></label>
            <label>Description<textarea value={cropForm.description} onChange={e => onCropFormChange({ ...cropForm, description: e.target.value })} /></label>
            <label>Fertilizer advice<textarea value={cropForm.fertilizerAdvice} onChange={e => onCropFormChange({ ...cropForm, fertilizerAdvice: e.target.value })} /></label>
            <label>Pest advice<textarea value={cropForm.pestAdvice} onChange={e => onCropFormChange({ ...cropForm, pestAdvice: e.target.value })} /></label>
            <button type="submit">+ Add Crop</button>
          </form>
          <div className="list-grid">
            {crops.map(crop => (
              <article className="record" key={crop._id}>
                <strong>{crop.name}</strong>
                <p>{crop.soilTypes} soil | {crop.seasons} season</p>
                <button className="market-delete-btn" onClick={() => onDeleteCrop(crop._id)}>🗑 Delete</button>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* ── PRODUCTS ── */}
      {tab === 3 && (
        <div>
          <h3>🛒 Marketplace Products ({products.length})</h3>
          {products.length === 0 && <p className="pest-empty">No products listed.</p>}
          {products.length > 0 && (
            <div className="adv-table-wrap">
              <table className="adv-table">
                <thead><tr><th>Product</th><th>Price</th><th>Farmer</th><th>Location</th><th>Orders</th><th>Action</th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id}>
                      <td><strong>{p.name}</strong><br /><small>{p.category}</small></td>
                      <td>ETB {p.price}/{p.unit}</td>
                      <td>{p.farmerName}<br /><small>{p.phone}</small></td>
                      <td>{p.location || "-"}</td>
                      <td>{p.totalOrders || 0}</td>
                      <td><button className="market-delete-btn" onClick={() => deleteProduct(p._id)}>🗑</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── ORDERS ── */}
      {tab === 4 && (
        <div>
          <h3>📦 All Orders ({orders.length})</h3>
          {orders.length === 0 && <p className="pest-empty">No orders yet.</p>}
          {orders.length > 0 && (
            <div className="adv-table-wrap">
              <table className="adv-table">
                <thead><tr><th>Date</th><th>Product</th><th>Buyer</th><th>Farmer</th><th>Qty</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id}>
                      <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td><strong>{o.productName}</strong></td>
                      <td>{o.buyerName}<br /><small>{o.buyerPhone}</small></td>
                      <td>{o.farmerName}<br /><small>{o.farmerPhone}</small></td>
                      <td>{o.quantity} {o.unit}</td>
                      <td>ETB {o.totalPrice}</td>
                      <td><span className={`adv-badge ${o.status === "delivered" ? "adv-completed" : o.status === "cancelled" ? "risk-badge risk-high" : "adv-pending"}`}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default AdminPage;
