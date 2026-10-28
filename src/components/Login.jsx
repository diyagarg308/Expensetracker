import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/useApp";
import { sound } from "../utils/sound";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login, theme, toggleTheme, addToast } = useApp();

  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const handleDemoLogin = () => {
    sound.playLevelUp();
    const demoEmail = "demo@expenseiq.com";
    localStorage.setItem("userEmail", demoEmail);
    localStorage.setItem("rememberMe", "true");

    const users = JSON.parse(localStorage.getItem("expenseIQ_users") || "{}");
    users[demoEmail] = { password: "password123" };
    localStorage.setItem("expenseIQ_users", JSON.stringify(users));

    login(demoEmail);
    navigate("/dashboard");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      sound.playHit();
      return;
    }

    const users = JSON.parse(localStorage.getItem("expenseIQ_users") || "{}");

    if (mode === "signin") {
      if (!users[email]) {
        setErrorMessage("Account does not exist. Click 'Register' or use 1-Click Demo.");
        sound.playHit();
        return;
      }
      if (users[email].password !== password) {
        setErrorMessage("Incorrect password. Please verify your credentials.");
        sound.playHit();
        return;
      }

      if (remember) {
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberMe");
      }

      sound.playLevelUp();
      login(email);
      navigate("/dashboard");
    } else {
      if (users[email]) {
        setErrorMessage("An account with this email already exists. Please sign in.");
        sound.playHit();
        return;
      }

      users[email] = { password };
      localStorage.setItem("expenseIQ_users", JSON.stringify(users));
      if (remember) localStorage.setItem("rememberMe", "true");

      sound.playLevelUp();
      login(email);
      navigate("/dashboard");
    }
  };

  return (
    <div className="login-page">
      <div className="login-ambient-glow"></div>

      <div className="login-card">
        {/* Header navigation */}
        <div className="login-top-bar">
          <Link to="/" className="back-btn">
            ← Back to Home
          </Link>
          <button className="login-theme-btn" onClick={toggleTheme}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>

        {/* Brand identity */}
        <div className="login-logo-header">
          <div className="login-brand-icon">₹</div>
          <span className="login-brand-name">ExpenseIQ</span>
        </div>

        <h1 className="login-title">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="login-subtitle">
          {mode === "signin"
            ? "Enter your credentials to access your financial command center."
            : "Start tracking expenses with private, intelligent financial tooling."}
        </p>

        {/* 1-Click Demo Shortcut for Presentations */}
        <div className="demo-highlight-box">
          <div className="demo-highlight-content">
            <span className="demo-badge">PRESENTER SHORTCUT</span>
            <p>Skip credentials with loaded sample dataset</p>
          </div>
          <button type="button" className="quick-demo-action-btn" onClick={handleDemoLogin}>
            ⚡ 1-Click Demo
          </button>
        </div>

        {/* Mode switcher tabs */}
        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab ${mode === "signin" ? "active" : ""}`}
            onClick={() => {
              setMode("signin");
              setErrorMessage("");
            }}
          >
            Sign In
          </button>
          <Link
            to="/register"
            className="login-tab text-center"
            onClick={() => sound.playCoin()}
          >
            Full Register Form 📝
          </Link>
        </div>

        {errorMessage && (
          <div className="login-error-banner">
            <span>⚠</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label>EMAIL ADDRESS</label>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <div className="password-label-row">
              <label>PASSWORD</label>
              {mode === "signin" && (
                <button
                  type="button"
                  className="forgot-link"
                  onClick={() => addToast("Password simulation sent to email!", "info")}
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="show-pwd-btn"
                onClick={() => setShowPassword(prev => !prev)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <div className="login-options-row">
            <label className="remember-checkbox-label">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Keep me signed in</span>
            </label>
          </div>

          <button className="login-submit-btn" type="submit">
            {mode === "signin" ? "Sign In to ExpenseIQ" : "Create New Account"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Need full form validation?{" "}
            <Link to="/register" className="toggle-mode-link">
              Open Registration Mini-Project →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;