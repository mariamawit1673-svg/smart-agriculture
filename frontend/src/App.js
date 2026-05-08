import { useCallback, useEffect, useMemo, useState } from "react";

import NotificationCenter from "./components/NotificationCenter";
import Sidebar from "./components/Sidebar";
import StatsGrid from "./components/StatsGrid";

import { API_BASE, emptyCrop, emptyProfile, emptyRecommendation } from "./constants";

import AboutPage from "./pages/AboutPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CropsPage from "./pages/CropsPage";
import DashboardPage from "./pages/DashboardPage";
import HistoryPage from "./pages/HistoryPage";
import LandingPage from "./pages/LandingPage";
import PestAdvisoryPage from "./pages/PestAdvisoryPage";
import ProfilePage from "./pages/ProfilePage";
import RecommendationPage from "./pages/RecommendationPage";
import MarketplacePage from "./pages/MarketplacePage";

import "./App.css";

function App() {
  // ---------------- STATE ----------------
  const getRoute = () => window.location.hash.replace("#/", "") || "home";
  const [activePage, setActivePage] = useState(getRoute);
  const [authMode, setAuthMode] = useState("login");

  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "farmer",
  });

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(emptyProfile);
  const [recommendationForm, setRecommendationForm] = useState(emptyRecommendation);
  const [latestRecommendation, setLatestRecommendation] = useState(null);
  const [history, setHistory] = useState([]);
  const [crops, setCrops] = useState([]);
  const [cropForm, setCropForm] = useState(emptyCrop);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState([]);

  // ---------------- ROUTING ----------------
  const isAuthPage = activePage === "login" || activePage === "register";
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (activePage === "login" || activePage === "register") {
      setAuthMode(activePage);
    }
  }, [activePage]);

  const stats = useMemo(
    () => ({
      crops: new Set(crops.map((c) => c.name)).size,
      history: history.length,
      soilTypes: new Set(crops.flatMap((c) => c.soilTypes || [])).size,
    }),
    [crops, history]
  );

  // ---------------- NOTIFICATIONS ----------------
  const addNotification = useCallback((type, title, msg) => {
    const id = Date.now().toString();
    setNotifications((prev) => [
      { id, type, title, message: msg },
      ...prev,
    ].slice(0, 4));
  }, []);

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // ---------------- API ----------------
  const api = useCallback(async (path, options = {}) => {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  }, []);

  // ---------------- LOAD DATA ----------------
  const loadCrops = useCallback(async () => {
    try {
      setCrops(await api("/crops"));
    } catch (err) {
      setError(err.message);
    }
  }, [api]);

  useEffect(() => {
    loadCrops();
  }, [loadCrops]);

  // ---------------- ROUTE ----------------
  useEffect(() => {
    const onHash = () => setActivePage(getRoute());
    window.addEventListener("hashchange", onHash);
    onHash();
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // ---------------- NAVIGATION ----------------
  const navigate = (page) => {
    window.location.hash = page === "home" ? "#/" : `#/${page}`;
  };

  // ---------------- AUTH ----------------
  async function handleAuth(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const path = authMode === "login" ? "/auth/login" : "/auth/register";
      const body = authMode === "login"
        ? { email: authForm.email, password: authForm.password }
        : authForm;
      const data = await api(path, {
        method: "POST",
        body: JSON.stringify(body),
      });

      setUser(data.user);
      setMessage(data.message);
      addNotification("success", authMode === "login" ? "Login successful" : "Account created", data.message);
      navigate("dashboard");
    } catch (err) {
      setError(err.message);
      addNotification("error", "Action failed", err.message);
    }
  }

  // ---------------- RECOMMENDATION ----------------
  async function getRecommendation(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const data = await api("/recommend", {
        method: "POST",
        body: JSON.stringify({ ...recommendationForm, userId: user?.id }),
      });
      setLatestRecommendation(data);
      setMessage(data.message);
      addNotification("success", "Recommendation ready", data.recommendedCrops?.join(", ") || "");
      if (user?.id) {
        try { setHistory(await api(`/history/${user.id}`)); } catch { /* silent */ }
      }
    } catch (err) {
      setError(err.message);
      addNotification("error", "Failed", err.message);
    }
  }

  // ---------------- RENDER PAGES ----------------
  const renderPage = () => {
    if (activePage === "login") {
      return (
        <LoginPage
          authForm={authForm}
          onAuthFormChange={setAuthForm}
          onSubmit={handleAuth}
          onNavigate={navigate}
        />
      );
    }

    if (activePage === "register") {
      return (
        <RegisterPage
          authForm={authForm}
          onAuthFormChange={setAuthForm}
          onSubmit={handleAuth}
          onNavigate={navigate}
        />
      );
    }

    if (activePage === "dashboard") {
      return (
        <DashboardPage
          user={user}
          profile={profile}
          history={history}
          crops={crops}
          onNavigate={navigate}
        />
      );
    }

    if (activePage === "pest") return <PestAdvisoryPage user={user} />;
    if (activePage === "about") return <AboutPage />;
    if (activePage === "profile")
      return <ProfilePage profile={profile} onProfileChange={setProfile} />;
    if (activePage === "history") return <HistoryPage history={history} />;
    if (activePage === "crops") return <CropsPage crops={crops} />;
    if (activePage === "market") return <MarketplacePage user={user} />;

    if (activePage === "admin") {
      return (
        <AdminPage
          isAdmin={isAdmin}
          crops={crops}
          cropForm={cropForm}
          onCropFormChange={setCropForm}
        />
      );
    }

    return (
      <RecommendationPage
        form={recommendationForm}
        latestRecommendation={latestRecommendation}
        onFormChange={setRecommendationForm}
        onSubmit={getRecommendation}
      />
    );
  };

  // ---------------- HOME ----------------
  if (activePage === "home") {
    return <LandingPage onEnterApp={navigate} />;
  }

  // ---------------- MAIN UI ----------------
  return (
    <main className="app-workspace">

      {/* SIDEBAR */}
      <Sidebar
        activePage={activePage}
        user={user}
        onNavigate={navigate}
        onLogout={() => setUser(null)}
      />

      {/* MAIN AREA */}
      <section className="workspace-main">

        {/* NOTIFICATIONS */}
        <NotificationCenter
          notifications={notifications}
          onDismiss={dismissNotification}
        />

        {/* STATS */}
        {!isAuthPage && <StatsGrid stats={stats} />}

        {/* PAGE */}
        <div className="page-container">
          {message && <div className="notice success">{message}</div>}
          {error && <div className="notice error">{error}</div>}

          {renderPage()}
        </div>

      </section>
    </main>
  );
}

export default App;