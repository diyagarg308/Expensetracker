import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../components/common/Input";
import { useApp } from "../context/useApp";
import { sound } from "../utils/sound";

export function Register() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    termsAccepted: false
  });

  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score; // 0 to 4
  };

  const pwdScore = getPasswordStrength(formData.password);
  const pwdStrengthLabel =
    pwdScore <= 1 ? "Weak" : pwdScore === 2 || pwdScore === 3 ? "Medium" : "Strong (Recommended)";
  const pwdStrengthClass =
    pwdScore <= 1 ? "strength-weak" : pwdScore <= 3 ? "strength-medium" : "strength-strong";

  // Form Validation Strategy
  const errors = {};
  if (!formData.fullName.trim()) {
    errors.fullName = "Full name is required.";
  } else if (formData.fullName.trim().length < 3) {
    errors.fullName = "Name must be at least 3 characters.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email) {
    errors.email = "Email address is required.";
  } else if (!emailRegex.test(formData.email)) {
    errors.email = "Please enter a valid email format (e.g. name@domain.com).";
  }

  if (!formData.password) {
    errors.password = "Password is required.";
  } else if (formData.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = "Confirm password is required.";
  } else if (formData.confirmPassword !== formData.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (!formData.termsAccepted) {
    errors.termsAccepted = "You must agree to the academic terms & conditions.";
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
      termsAccepted: true
    });

    if (Object.keys(errors).length > 0) {
      sound.playHit();
      addToast("Please correct the form validation errors.", "warning");
      return;
    }

    setIsSubmitting(true);
    sound.playLevelUp();

    // Persist registered user into localStorage for login compatibility
    const users = JSON.parse(localStorage.getItem("expenseIQ_users") || "{}");
    users[formData.email] = {
      password: formData.password,
      fullName: formData.fullName,
      role: formData.role
    };
    localStorage.setItem("expenseIQ_users", JSON.stringify(users));

    setTimeout(() => {
      setIsSubmitting(false);
      addToast(`Account created for ${formData.fullName}! Please sign in.`);
      navigate("/login");
    }, 600);
  };

  return (
    <div className="registration-page">
      <div className="registration-card">
        <div className="registration-header">
          <div className="reg-badge">25CSE0203 MINI PROJECT</div>
          <h1>Student & Member Registration</h1>
          <p>Multi-step validation, password entropy analysis, and credential provisioning.</p>
        </div>

        <form onSubmit={handleSubmit} className="registration-form" noValidate>
          <Input
            label="FULL NAME"
            name="fullName"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.fullName}
            touched={touched.fullName}
            icon="👤"
            required
          />

          <Input
            label="EMAIL ADDRESS"
            type="email"
            name="email"
            placeholder="student@university.edu"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            touched={touched.email}
            icon="✉️"
            required
          />

          <div className="form-row-grid">
            <div className="password-with-strength">
              <Input
                label="PASSWORD"
                type="password"
                name="password"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.password}
                touched={touched.password}
                icon="🔒"
                required
              />

              {formData.password && (
                <div className="strength-meter-box">
                  <div className="strength-header">
                    <span>Entropy Level:</span>
                    <strong className={pwdStrengthClass}>{pwdStrengthLabel}</strong>
                  </div>
                  <div className="strength-track">
                    <div
                      className={`strength-bar ${pwdStrengthClass}`}
                      style={{ width: `${(pwdScore / 4) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <Input
              label="CONFIRM PASSWORD"
              type="password"
              name="confirmPassword"
              placeholder="••••••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.confirmPassword}
              touched={touched.confirmPassword}
              icon="🔑"
              required
            />
          </div>

          <div className="reusable-input-group">
            <label className="reusable-label" htmlFor="role">
              ACADEMIC / GUILD ROLE
            </label>
            <div className="input-field-wrapper">
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="reusable-input"
              >
                <option value="student">🎓 Engineering Student (25CSE0203)</option>
                <option value="developer">💻 Front End Engineer</option>
                <option value="guild_master">👑 Treasury Commander</option>
                <option value="auditor">📊 Financial Auditor</option>
              </select>
            </div>
          </div>

          <div className="terms-checkbox-group">
            <label className="checkbox-label-container">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <span>
                I agree to the University Honor Code & Front End Engineering-II evaluation criteria.
              </span>
            </label>
            {touched.termsAccepted && errors.termsAccepted && (
              <span className="field-error-message">⚠ {errors.termsAccepted}</span>
            )}
          </div>

          <button type="submit" className="registration-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Validating & Provisioning..." : "Complete Registration →"}
          </button>
        </form>

        <div className="reg-card-footer">
          <p>
            Already have an active account?{" "}
            <Link to="/login" className="reg-login-link">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}