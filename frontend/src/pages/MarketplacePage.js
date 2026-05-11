import { useEffect, useState } from "react";
import { useLang } from "../LanguageContext";

const API = "http://localhost:5000/api";
const CATEGORIES = ["all","Grain","Vegetable","Fruit","Legume","Root Crop","Cash Crop","Other"];
const UNITS = ["kg","quintal","ton","piece","liter","bundle"];

// Crop emoji map
const CROP_EMOJI = {
  maize:"🌽", corn:"🌽", tomato:"🍅", onion:"🧅", potato:"🥔", wheat:"🌾",
  teff:"🌾", rice:"🍚", sorghum:"🌾", barley:"🌾", beans:"🫘", lentils:"🫘",
  chickpea:"🫘", coffee:"☕", banana:"🍌", mango:"🥭", cabbage:"🥬",
  sugarcane:"🎋", cotton:"🌿", sesame:"🌿", sunflower:"🌻", default:"🌱"
};
function cropEmoji(name) {
  const k = (name||"").toLowerCase();
  return Object.entries(CROP_EMOJI).find(([key]) => k.includes(key))?.[1] || CROP_EMOJI.default;
}
function stars(n) { return "⭐".repeat(Math.round(n||0)) + "☆".repeat(5-Math.round(n||0)); }

export default function MarketplacePage({ user }) {
  const { t } = useLang();
  const [tab, setTab] = useState(0);
  const [products, setProducts] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:"", price:"", quantity:"", unit:"kg", category:"Grain", description:"", imageUrl:"", farmerName: user?.name||"", phone:"", location:"" });
  const [priceSuggest, setPriceSuggest] = useState(null);
  const [msg, setMsg] = useState("");
  const [detail, setDetail] = useState(null);
  const [orderForm, setOrderForm] = useState(null);
  const [reviewForm, setReviewForm] = useState(null);

  function loadProducts() {
    setLoading(true);
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (category !== "all") p.set("category", category);
    fetch(`${API}/market?${p}`).then(r=>r.json()).then(d=>setProducts(Array.isArray(d)?d:[])).catch(()=>setProducts([])).finally(()=>setLoading(false));
  }
  function loadMyProducts() {
    if (!user?.id) return;
    fetch(`${API}/market?userId=${user.id}`).then(r=>r.json()).then(d=>setMyProducts(Array.isArray(d)?d:[])).catch(()=>{});
  }
  function loadOrders() {
    if (!user?.id) return;
    fetch(`${API}/market/orders?buyerId=${user.id}`).then(r=>r.json()).then(d=>setOrders(Array.isArray(d)?d:[])).catch(()=>{});
  }
  function loadPrices() {
    fetch(`${API}/market/prices`).then(r=>r.json()).then(d=>setPrices(d||{})).catch(()=>{});
  }

  useEffect(() => { loadProducts(); loadPrices(); }, [category]);
  useEffect(() => { if (tab===1) loadMyProducts(); if (tab===2) loadOrders(); }, [tab]);

  async function fetchPriceSuggest(name) {
    if (!name) return;
    try {
      const r = await fetch(`${API}/market/suggest-price?name=${encodeURIComponent(name)}&season=rainy`);
      const d = await r.json();
      setPriceSuggest(d);
    } catch { setPriceSuggest(null); }
  }

  async function handleSubmit(e) {
    e.preventDefault(); setMsg("");
    try {
      const res = await fetch(`${API}/market`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({...form, userId: user?.id||null, price: Number(form.price)}) });
      const data = await res.json();
      if (data.success) { setMsg("✅ Product listed!"); setShowForm(false); setForm({name:"",price:"",quantity:"",unit:"kg",category:"Grain",description:"",imageUrl:"",farmerName:user?.name||"",phone:"",location:""}); setPriceSuggest(null); loadProducts(); loadMyProducts(); }
      else setMsg("❌ " + (data.error||"Failed"));
    } catch { setMsg("❌ Server error"); }
  }

  async function handleDelete(id) {
    if (!window.confirm("Remove this listing?")) return;
    await fetch(`${API}/market/${id}`, { method:"DELETE" });
    loadMyProducts(); loadProducts();
  }

  async function handleOrder(e) {
    e.preventDefault(); setMsg("");
    const p = orderForm.product;
    const qty = Number(orderForm.qty);
    try {
      const res = await fetch(`${API}/market/orders`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ productId: p._id, productName: p.name, farmerName: p.farmerName, farmerPhone: p.phone, buyerName: orderForm.buyerName, buyerPhone: orderForm.buyerPhone, buyerLocation: orderForm.buyerLocation||"", quantity: qty, unit: p.unit, totalPrice: qty * p.price, buyerId: user?.id||null }) });
      const data = await res.json();
      if (data.success) { setMsg("✅ Order placed! Farmer will contact you."); setOrderForm(null); loadOrders(); }
      else setMsg("❌ " + (data.error||"Failed"));
    } catch { setMsg("❌ Server error"); }
  }

  async function handleReview(e) {
    e.preventDefault();
    const { productId, buyerName, rating, comment } = reviewForm;
    await fetch(`${API}/market/${productId}/review`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ buyerName, rating: Number(rating), comment }) });
    setReviewForm(null); loadProducts();
  }

  return (
    <section className="panel market-page">
      <div className="market-header">
        <div>
          <p className="eyebrow">🛒 Agricultural Market</p>
          <h2>{t("marketplace")}</h2>
          <p>{t("marketDesc")}</p>
        </div>
      {user && <button className="market-add-btn" onClick={() => setShowForm(!showForm)}>{showForm ? t("cancelBtn") : t("listProduct")}</button>}
      </div>

      {msg && <p className={msg.startsWith("✅") ? "notice success" : "notice error"} style={{marginBottom:"12px"}}>{msg}</p>}

      {/* Tabs */}
      <div className="pest-tabs" style={{marginBottom:"18px"}}>
        {[t("browse"), t("myListings"), t("myOrders"), t("marketPrices")].map((tabLabel,i) => <button key={i} className={tab===i?"pest-tab active":"pest-tab"} onClick={()=>setTab(i)}>{tabLabel}</button>)}
      </div>
<div className="pest-tabs" style={{ marginBottom: "18px" }}>
  {[t("browse"),t("myListings"),t("myOrders"),t("marketPrices")].map((tabLabel, i) => (
    <button
      key={tabLabel}
      className={tab === i ? "pest-tab active" : "pest-tab"}
      onClick={() => setTab(i)}
    >
      {tabLabel}
    </button>
  ))}
</div>
      {/* ── ADD PRODUCT FORM ── */}
      {showForm && (
        <div className="market-form-card panel" style={{marginBottom:"20px"}}>
          <h3>📦 {t("listProduct")}</h3>
          <form onSubmit={handleSubmit} className="market-form">
            <div className="market-form-row">
              <label>{t("productName")} *<input value={form.name} onChange={e=>{setForm({...form,name:e.target.value}); fetchPriceSuggest(e.target.value);}} placeholder="e.g. Maize, Tomato" required /></label>
              <label>{t("categoryLabel")}<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{CATEGORIES.filter(c=>c!=="all").map(c=><option key={c}>{c}</option>)}</select></label>
            </div>
            {priceSuggest?.suggested && (
              <div className="price-suggest-box">
                💡 Suggested price: <strong>ETB {priceSuggest.suggested}/kg</strong> — Market range: ETB {priceSuggest.low}–{priceSuggest.high} | {priceSuggest.note}
              </div>
            )}
            <div className="market-form-row">
              <label>{t("priceETB")} *<input type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="e.g. 50" required /></label>
              <label>{t("quantityLabel")} *<input value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} placeholder="e.g. 100" required /></label>
              <label>{t("unitLabel")}<select value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})}>{UNITS.map(u=><option key={u}>{u}</option>)}</select></label>
            </div>
            <div className="market-form-row">
              <label>{t("farmerNameLabel")} *<input value={form.farmerName} onChange={e=>setForm({...form,farmerName:e.target.value})} required /></label>
              <label>{t("phoneLabel")} *<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+251 9XX XXX XXXX" required /></label>
              <label>{t("locationLabel")}<input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="e.g. Addis Ababa" /></label>
            </div>
            <div className="market-form-row">
              <label>{t("imageUrl")}<input value={form.imageUrl} onChange={e=>setForm({...form,imageUrl:e.target.value})} placeholder="https://..." /></label>
              <label>{t("descriptionLabel")}<input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Optional details" /></label>
            </div>
            <button type="submit" className="auth-submit-btn">{t("listBtn")}</button>
          </form>
        </div>
      )}

      {/* ── BROWSE TAB ── */}
      {tab===0 && (
        <>
          <div className="market-filters">
            <div style={{display:"flex",gap:"8px"}}>
              <input className="market-search" placeholder={t("searchPlaceholder")} value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&loadProducts()} />
              <button className="market-add-btn" style={{whiteSpace:"nowrap"}} onClick={loadProducts}>{t("searchBtn")}</button>
            </div>
            <div className="market-cats">{CATEGORIES.map(c=><button key={c} className={category===c?"market-cat active":"market-cat"} onClick={()=>setCategory(c)}>{c==="all"?"All":c}</button>)}</div>
          </div>
          {loading && <p className="pest-loading">Loading products...</p>}
          {!loading && products.length===0 && <div className="pest-empty"><p>{t("noProducts")} {user ? "" : t("loginToList")}</p></div>}
          {!loading && products.length>0 && (
            <div className="market-grid">
              {products.map(p=>(
                <article className="market-card" key={p._id}>
                  <div className="market-card-img">
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.name} onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="flex";}} /> : null}
                    <div className="market-card-emoji" style={{display: p.imageUrl?"none":"flex"}}>{cropEmoji(p.name)}</div>
                  </div>
                  <div className="market-card-cat">{p.category}</div>
                  <h3 className="market-card-name">{p.name}</h3>
                  <div className="market-card-price"><span className="market-price">ETB {p.price}</span><span className="market-qty">/{p.quantity} {p.unit}</span></div>
                  {p.avgRating>0 && <div className="market-rating">{stars(p.avgRating)} <span>({p.reviews?.length||0})</span></div>}
                  {p.description && <p className="market-card-desc">{p.description}</p>}
                  <div className="market-card-info">
                    <span>👨‍🌾 {p.farmerName}</span>
                    {p.location && <span>📍 {p.location}</span>}
                    {p.totalOrders>0 && <span>📦 {p.totalOrders} {t("ordersCount")}</span>}
                  </div>
                  <div className="market-card-actions">
                    <button className="market-contact-btn" onClick={()=>setDetail(p)}>{t("contactBtn")}</button>
                    <button className="market-order-btn" onClick={()=>setOrderForm({product:p, buyerName:user?.name||"", buyerPhone:"", buyerLocation:"", qty:1})}>{t("orderBtn")}</button>
                    <button className="market-review-btn" onClick={()=>setReviewForm({productId:p._id, buyerName:user?.name||"", rating:5, comment:""})}>{t("rateBtn")}</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── MY LISTINGS TAB ── */}
      {tab===1 && (
        <div>
          {!user && <p className="pest-empty">{t("loginToOrder")}</p>}
          {user && myProducts.length===0 && <div className="pest-empty"><p>{t("noListings")}</p></div>}
          {user && myProducts.length>0 && (
            <div className="market-grid">
              {myProducts.map(p=>(
                <article className="market-card" key={p._id}>
                  <div className="market-card-emoji">{cropEmoji(p.name)}</div>
                  <div className="market-card-cat">{p.category}</div>
                  <h3 className="market-card-name">{p.name}</h3>
                  <div className="market-card-price"><span className="market-price">ETB {p.price}</span><span className="market-qty">/{p.quantity} {p.unit}</span></div>
                  {p.avgRating>0 && <div className="market-rating">{stars(p.avgRating)} ({p.reviews?.length||0} reviews)</div>}
                  <div className="market-card-info"><span>📦 {p.totalOrders||0} orders</span><span>📍 {p.location||"-"}</span></div>
                  <div className="market-card-actions" style={{marginTop:"8px"}}>
                    <button className="market-contact-btn" onClick={()=>setDetail(p)}>📞 Contact</button>
                    <button className="market-order-btn" onClick={()=>setOrderForm({product:p, buyerName:user?.name||"", buyerPhone:"", buyerLocation:"", qty:1})}>🛒 Order</button>
                    <button className="market-review-btn" onClick={()=>setReviewForm({productId:p._id, buyerName:user?.name||"", rating:5, comment:""})}>⭐ Rate</button>
                  </div>
                  <button className="market-delete-btn" style={{marginTop:"8px",width:"100%"}} onClick={()=>handleDelete(p._id)}>{t("removeBtn")}</button>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MY ORDERS TAB ── */}
      {tab===2 && (
        <div>
          {!user && <p className="pest-empty">{t("loginToOrder")}</p>}
          {user && orders.length===0 && <div className="pest-empty"><p>{t("noOrdersYet")}</p></div>}
          {user && orders.length>0 && (
            <div className="adv-table-wrap">
              <table className="adv-table">
                <thead><tr><th>Date</th><th>Product</th><th>Qty</th><th>Total</th><th>Farmer</th><th>Status</th></tr></thead>
                <tbody>
                  {orders.map(o=>(
                    <tr key={o._id}>
                      <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td><strong>{o.productName}</strong></td>
                      <td>{o.quantity} {o.unit}</td>
                      <td>ETB {o.totalPrice}</td>
                      <td>{o.farmerName}<br/><small>{o.farmerPhone}</small></td>
                      <td><span className={`adv-badge ${o.status==="delivered"?"adv-completed":o.status==="cancelled"?"risk-badge risk-high":"adv-pending"}`}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── MARKET PRICES TAB ── */}
      {tab===3 && (
        <div>
          <p style={{marginBottom:"14px",color:"#666",fontSize:"14px"}}>📊 {t("refPrices")}</p>
          <div className="prices-grid">
            {Object.entries(prices).map(([crop, p])=>(
              <div className="price-card" key={crop}>
                <div className="price-card-emoji">{cropEmoji(crop)}</div>
                <div className="price-card-name">{crop}</div>
                <div className="price-card-range">
                  <span className="price-low">ETB {p.low}</span>
                  <span className="price-avg">ETB {p.avg}</span>
                  <span className="price-high">ETB {p.high}</span>
                </div>
                <div className="price-card-labels"><span>{t("low")||"Low"}</span><span>{t("avg")||"Avg"}</span><span>{t("high")||"High"}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CONTACT MODAL ── */}
      {detail && (
        <div className="pest-modal-overlay" onClick={()=>setDetail(null)}>
          <div className="pest-modal" onClick={e=>e.stopPropagation()}>
            <h3>{t("contactFarmer")}</h3>
            <p><strong>Product:</strong> {detail.name}</p>
            <p><strong>Price:</strong> ETB {detail.price} / {detail.quantity} {detail.unit}</p>
            <p><strong>Farmer:</strong> {detail.farmerName}</p>
            <p><strong>Phone:</strong> <a href={`tel:${detail.phone}`} style={{color:"#2e7d32",fontWeight:700}}>{detail.phone}</a></p>
            {detail.location && <p><strong>Location:</strong> {detail.location}</p>}
            {detail.description && <p><strong>Details:</strong> {detail.description}</p>}
            <div style={{display:"flex",gap:"8px",marginTop:"12px"}}>
              <a href={`tel:${detail.phone}`} className="market-contact-btn" style={{textDecoration:"none",textAlign:"center",padding:"10px"}}>{t("callBtn")}</a>
              <a href={`https://wa.me/${detail.phone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" className="market-order-btn" style={{textDecoration:"none",textAlign:"center",padding:"10px"}}>{t("whatsappBtn")}</a>
            </div>
            <button onClick={()=>setDetail(null)} style={{marginTop:"10px"}}>Close</button>
          </div>
        </div>
      )}

      {/* ── ORDER MODAL ── */}
      {orderForm && (
        <div className="pest-modal-overlay" onClick={()=>setOrderForm(null)}>
          <div className="pest-modal" onClick={e=>e.stopPropagation()}>
            <h3>{t("placeOrder")} — {orderForm.product.name}</h3>
            <p>{t("priceETB")}: ETB {orderForm.product.price} / {orderForm.product.unit}</p>
            <form onSubmit={handleOrder} className="auth-form" style={{marginTop:"12px"}}>
              <label>{t("buyerName")} *<input value={orderForm.buyerName} onChange={e=>setOrderForm({...orderForm,buyerName:e.target.value})} required /></label>
              <label>{t("buyerPhone")} *<input value={orderForm.buyerPhone} onChange={e=>setOrderForm({...orderForm,buyerPhone:e.target.value})} placeholder="+251..." required /></label>
              <label>{t("buyerLocation")}<input value={orderForm.buyerLocation} onChange={e=>setOrderForm({...orderForm,buyerLocation:e.target.value})} /></label>
              <label>{t("quantityLabel")} ({orderForm.product.unit}) *<input type="number" min="1" value={orderForm.qty} onChange={e=>setOrderForm({...orderForm,qty:e.target.value})} required /></label>
              <div className="price-suggest-box">{t("totalLabel")}: ETB {(Number(orderForm.qty)||0) * orderForm.product.price}</div>
              <button type="submit" className="auth-submit-btn">{t("confirmOrder")}</button>
            </form>
            <button onClick={()=>setOrderForm(null)} style={{marginTop:"8px"}}>{t("cancelOrder")}</button>
          </div>
        </div>
      )}

      {/* ── REVIEW MODAL ── */}
      {reviewForm && (
        <div className="pest-modal-overlay" onClick={()=>setReviewForm(null)}>
          <div className="pest-modal" onClick={e=>e.stopPropagation()}>
            <h3>{t("rateProduct")}</h3>
            <form onSubmit={handleReview} className="auth-form" style={{marginTop:"12px"}}>
              <label>{t("buyerName")}<input value={reviewForm.buyerName} onChange={e=>setReviewForm({...reviewForm,buyerName:e.target.value})} /></label>
              <label>Rating (1-5) *
                <select value={reviewForm.rating} onChange={e=>setReviewForm({...reviewForm,rating:e.target.value})}>
                  {[5,4,3,2,1].map(n=><option key={n} value={n}>{stars(n)} {n}</option>)}
                </select>
              </label>
              <label>Comment<input value={reviewForm.comment} onChange={e=>setReviewForm({...reviewForm,comment:e.target.value})} placeholder="Optional feedback" /></label>
              <button type="submit" className="auth-submit-btn">{t("submitReview")}</button>
            </form>
            <button onClick={()=>setReviewForm(null)} style={{marginTop:"8px"}}>Cancel</button>
          </div>
        </div>
      )}
    </section>
  );
}
