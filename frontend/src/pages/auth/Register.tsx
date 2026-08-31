import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerFarmer } from "../../api/auth";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    village: "",
    district: "",
    state: "Andhra Pradesh",
    consent: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.consent) {
      setError(
        "Please read and accept the data-use notice before registering.",
      );
      return;
    }

    setLoading(true);

    try {
      const user = await registerFarmer(formData);

      setSuccess(
        `Account created successfully. Farmer ID: ${user.id}`,
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="register-page">
      <section className="register-container">

        <div className="register-brand">
          <div className="register-logo"></div>

          <h1>AgriNerve</h1>

          <p>
            Agricultural Decision Intelligence
          </p>
        </div>

        <div className="register-card">

          <div className="register-header">
            <h2>Create your farmer account</h2>

            <p>
              Join AgriNerve to receive agricultural
              intelligence designed for your farm.
            </p>
          </div>

          {error && (
            <div className="register-message error">
              {error}
            </div>
          )}

          {success && (
            <div className="register-message success">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="register-section">
              <h3>Personal information</h3>

              <div className="form-group">
                <label htmlFor="full_name">
                  Full name
                </label>

                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">

                <div className="form-group">
                  <label htmlFor="phone">
                    Mobile number
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    Email address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="farmer@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>

              <div className="form-group">
                <label htmlFor="password">
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={8}
                  required
                />

                <small>
                  Minimum 8 characters.
                </small>
              </div>
            </div>

            <div className="register-section">
              <h3>Location</h3>

              <div className="form-row">

                <div className="form-group">
                  <label htmlFor="village">
                    Village
                  </label>

                  <input
                    id="village"
                    name="village"
                    type="text"
                    placeholder="Enter village"
                    value={formData.village}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="district">
                    District
                  </label>

                  <input
                    id="district"
                    name="district"
                    type="text"
                    placeholder="Enter district"
                    value={formData.district}
                    onChange={handleChange}
                  />
                </div>

              </div>

              <div className="form-group">
                <label htmlFor="state">
                  State
                </label>

                <input
                  id="state"
                  name="state"
                  type="text"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="privacy-box">
              <h3>Why we collect your information</h3>

              <p>
                AgriNerve uses your contact and agricultural
                information to provide personalized crop,
                weather, market, disease and water-management
                recommendations.
              </p>

              <p>
                Your information is stored securely and used
                to provide and improve AgriNerve services.
              </p>

              <button
                type="button"
                className="privacy-link"
              >
                View Privacy & Data Use Notice
              </button>
            </div>

            <label className="consent-row">
              <input
                type="checkbox"
                name="consent"
                checked={formData.consent}
                onChange={handleChange}
              />

              <span>
                I have read and understood the Privacy &
                Data Use Notice and agree to the collection
                and use of my information for AgriNerve
                services.
              </span>
            </label>

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Create Farmer Account"}
            </button>

          </form>

          <p className="register-login">
            Already have an account?{" "}
            <Link to="/login">
              Sign in
            </Link>
          </p>

        </div>

        <p className="register-footer">
          Empowering better agricultural decisions
        </p>

      </section>
    </main>
  );
}

export default Register;

