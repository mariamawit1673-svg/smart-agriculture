import { useCallback, useEffect, useMemo, useState } from "react";
import NotificationCenter from "./components/NotificationCenter";
import Sidebar from "./components/Sidebar";
import StatsGrid from "./components/StatsGrid";
import { API_BASE, emptyCrop, emptyProfile, emptyRecommendation } from "./constants";
import AboutPage from "./pages/AboutPage";
import AdminPage from "./pages/AdminPage";
import AuthPage from "./pages/AuthPage";
import CropsPage from "./pages/CropsPage";
import DashboardPage from "./pages/DashboardPage";
import HistoryPage from "./pages/HistoryPage";
import LandingPage from "./pages/LandingPage";
import PestAdvisoryPage from "./pages/PestAdvisoryPage";
import ProfilePage from "./pages/ProfilePage";
import RecommendationPage from "./pages/RecommendationPage";
import "./App.css";

function App() {
  const getRoute = () => window.location.hash.replace("#/", "") || "home";
  const [activePage, setActivePage] = useState(getRoute);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
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

  const isAdmin = user?.role === "admin";
  const isAuthPage = activePage === "login" || activePage === "register";
  const pageTitles = {
    dashboard: "Dashboard",
    recommend: "Crop Recommendation",
    pest: "Pest Advisory",
    about: "About",
    profile: "Farmer Profile",
    history: "Recommendation History",
    crops: "Crop Information",
    admin: "Crop Management",
    login: "Login",
    register: "Register",
  };

  const stats = useMemo(() => ({
    crops: new Set(crops.map((crop) => crop.name)).size,
    history: history.length,
    soilTypes: new Set(crops.flatMap((crop) => crop.soilTypes || [])).size,
  }), [crops, history]);

  const addNotification = useCallback((type, title, notificationMessage, duration = 4500) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    setNotifications((current) => [
      { id, type, title, message: notificationMessage, duration },
      ...current,
    ].slice(0, 4));
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  }, []);

  const api = useCallback(async (path, options = {}) => {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(response.ok ? "Invalid response from server" : `Server error ${response.status}`);
    }

    if (!response.ok) {
      throw new Error(data.message || data.error || "Request failed");
    }

    return data;
  }, []);

  const showError = useCallback((err) => {
    const errorMessage = err.message === "Failed to fetch"
      ? "Backend is not running. Start it with: npm.cmd run backend"
      : err.message;

    setMessage("");
    setError(errorMessage);
    addNotification("error", "Action failed", errorMessage, 6500);
  }, [addNotification]);

  const loadCrops = useCallback(async () => {
    try {
      setCrops(await api("/crops"));
    } catch (err) {
      showError(err);
    }
  }, [api, showError]);

  const loadHistory = useCallback(async (userId) => {
    try {
      setHistory(await api(`/history/${userId}`));
    } catch (err) {
      showError(err);
    }
  }, [api, showError]);

  const loadProfile = useCallback(async (userId) => {
    try {
      const data = await api(`/profiles/${userId}`);

      if (!data) {
        return;
      }

      const savedProfile = {
        location: data.location || "",
        farmSize: data.farmSize || "",
        soilType: data.soilType || "loam",
        preferredCrops: data.preferredCrops || "",
        irrigationAvailable: Boolean(data.irrigationAvailable),
      };

      setProfile(savedProfile);
      setRecommendationForm((current) => ({
        ...current,
        soilType: savedProfile.soilType,
        location: savedProfile.location,
        irrigationAvailable: savedProfile.irrigationAvailable,
      }));
    } catch (err) {
      showError(err);
    }
  }, [api, showError]);

  useEffect(() => {
    loadCrops();
  }, [loadCrops]);

  useEffect(() => {
    function handleHashChange() {
      setActivePage(getRoute());
    }

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadProfile(user.id);
      loadHistory(user.id);
    }
  }, [user, loadProfile, loadHistory]);

  useEffect(() => {
    if (activePage === "login" || activePage === "register") {
      setAuthMode(activePage);
    }
  }, [activePage]);

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
      showError(err);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!user) {
      const loginMessage = "Please login before saving a farm profile.";
      setError(loginMessage);
      addNotification("info", "Login required", loginMessage);
      return;
    }

    try {
      await api("/profiles", {
        method: "POST",
        body: JSON.stringify({ ...profile, userId: user.id }),
      });
      setMessage("Farm profile saved successfully.");
      addNotification("success", "Profile saved", "Farm profile saved successfully.");
    } catch (err) {
      showError(err);
    }
  }

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
      addNotification("success", "Recommendation ready", data.recommendedCrops.join(", "));

      if (user?.id) {
        loadHistory(user.id);
      }
    } catch (err) {
      showError(err);
    }
  }

  async function addCrop(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await api("/crops", {
        method: "POST",
        body: JSON.stringify({
          ...cropForm,
          soilTypes: cropForm.soilTypes.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean),
          seasons: cropForm.seasons.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean),
        }),
      });

      setCropForm(emptyCrop);
      setMessage("Crop added successfully.");
      addNotification("success", "Crop added", "New crop record added successfully.");
      loadCrops();
    } catch (err) {
      showError(err);
    }
  }

  async function deleteCrop(id) {
    setError("");
    setMessage("");

    try {
      await api(`/crops/${id}`, { method: "DELETE" });
      setMessage("Crop deleted successfully.");
      addNotification("success", "Crop deleted", "Crop record deleted successfully.");
      loadCrops();
    } catch (err) {
      showError(err);
    }
  }

  function navigate(page) {
    window.location.hash = page === "home" ? "#/" : `#/${page}`;
  }

  function renderPage() {
    if (activePage === "login" || activePage === "register") {
      return (
        <AuthPage
          authMode={authMode}
          authForm={authForm}
          onNavigate={navigate}
          onAuthFormChange={setAuthForm}
          onSubmit={handleAuth}
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

    if (activePage === "pest") {
      return <PestAdvisoryPage user={user} />;
    }

    if (activePage === "about") {
      return <AboutPage />;
    }

    if (activePage === "profile") {
      return <ProfilePage profile={profile} onProfileChange={setProfile} onSubmit={saveProfile} />;
    }

    if (activePage === "history") {
      return <HistoryPage history={history} />;
    }

    if (activePage === "crops") {
      return <CropsPage crops={crops} />;
    }

    if (activePage === "admin") {
      return (
        <AdminPage
          isAdmin={isAdmin}
          crops={crops}
          cropForm={cropForm}
          onCropFormChange={setCropForm}
          onAddCrop={addCrop}
          onDeleteCrop={deleteCrop}
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
  }

  if (activePage === "home") {
    return <LandingPage onEnterApp={navigate} />;
  }

  return (
    <main className="app-workspace">
      <Sidebar
        activePage={activePage}
        user={user}
        onNavigate={navigate}
        onLogout={() => {
          setUser(null);
          addNotification("info", "Logged out", "You have been logged out.");
        }}
      />

      <section className="workspace-main">
        <section className="page-container">
          {(message || error) && (
            <div className={error ? "notice error" : "notice success"}>
              {error || message}
            </div>
          )}

          {!isAuthPage && <StatsGrid stats={stats} />}
          {renderPage()}
        </section>
      </section>
      <NotificationCenter notifications={notifications} onDismiss={dismissNotification} />
    </main>
  );
}

export default App;
