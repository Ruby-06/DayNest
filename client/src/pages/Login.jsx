import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { api } from "../App.jsx";
import DayNestLogo from "../components/DayNestLogo.jsx";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    const trimmedEmail = form.email.trim();
    if (!trimmedEmail) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errs.email = "Please enter a valid email address";
    }

    if (!form.password) {
      errs.password = "Password is required";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (loading) return;

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", {
        email: form.email.trim(),
        password: form.password
      });
      localStorage.setItem("daynest_token", data.token);
      localStorage.setItem("daynest_user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("storage"));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="YOUR PERSONAL SPACE"
      title="Welcome back"
      subtitle="Your everyday memories are waiting."
    >
      <form onSubmit={submit} className="auth-form" noValidate>
        {error && (
          <div className="auth-error-banner" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="auth-field-group">
          <label htmlFor="login-email">Email</label>
          <div className={`auth-input-wrapper ${fieldErrors.email ? "has-error" : ""}`}>
            <Mail className="auth-field-icon" size={18} />
            <input
              id="login-email"
              type="email"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: "" });
              }}
              placeholder="Enter your email"
              autoComplete="email"
              disabled={loading}
              required
            />
          </div>
          {fieldErrors.email && <span className="auth-field-error">{fieldErrors.email}</span>}
        </div>

        <div className="auth-field-group">
          <div className="auth-label-row">
            <label htmlFor="login-password">Password</label>
          </div>
          <div className={`auth-input-wrapper ${fieldErrors.password ? "has-error" : ""}`}>
            <Lock className="auth-field-icon" size={18} />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
                if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: "" });
              }}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
              required
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {fieldErrors.password && <span className="auth-field-error">{fieldErrors.password}</span>}
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={18} className="auth-spinner" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Enter DayNest</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <p className="auth-switch-text">
          New here? <Link to="/register" className="auth-link">Create your space</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="auth-page">
      <div className="auth-glass glass">
        <div className="auth-logo-header">
          <DayNestLogo size="large" />
        </div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}


