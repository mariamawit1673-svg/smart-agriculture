import AuthPanel from "../components/AuthPanel";

function AuthPage({
  authMode,
  authForm,
  onNavigate,
  onAuthFormChange,
  onSubmit,
}) {
  const isLogin = authMode === "login";

  return (
    <section className="auth-page">
      <div>
        <p className="eyebrow">Account Access</p>
        <h1>{isLogin ? "Login to your advisory workspace" : "Create your agriculture account"}</h1>
        <p>
          {isLogin
            ? "Access your saved farm profile, recommendation history, and advisory dashboard."
            : "Create a farmer or admin account to start using the agriculture advisory system."}
        </p>
        <button onClick={() => onNavigate(isLogin ? "register" : "login")}>
          {isLogin ? "Create New Account" : "Go To Login"}
        </button>
      </div>
      <AuthPanel
        authMode={authMode}
        authForm={authForm}
        onAuthFormChange={onAuthFormChange}
        onSubmit={onSubmit}
      />
    </section>
  );
}

export default AuthPage;
