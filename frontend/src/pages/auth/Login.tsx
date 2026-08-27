import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../api/auth";
import "./Login.css";

const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

interface CurrentUser {
  id: number;
  email: string;
  role: string;
  email_verified?: boolean;
  mobile_verified?: boolean;
}

async function getCurrentUser(
  accessToken: string,
): Promise<CurrentUser> {
  const response = await fetch(
    `${API_BASE_URL}/auth/me`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Unable to load your account.");
  }

  return response.json();
}

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      // 1. Login
      const result = await loginUser(
        email,
        password,
      );

      // 2. Save JWT
      localStorage.setItem(
        "agrinerve_access_token",
        result.access_token,
      );

      // 3. Get current user's verification status
      const user = await getCurrentUser(
        result.access_token,
      );

      // 4. Route based on verification status
      if (user.role === "farmer") {
        if (user.email_verified === true) {
          navigate("/farmer/dashboard");
        } else {
          navigate("/verification");
        }
      } else if (user.role === "officer") {
        navigate("/officer/dashboard");
      } else {
        navigate("/farmer/dashboard");
      }

    } catch (err) {
      localStorage.removeItem(
        "agrinerve_access_token",
      );

      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-container">

        <div className="login-brand">
          <div className="brand-icon">??</div>

          <h1>AgriNerve</h1>

          <p>
            Agricultural Decision Intelligence
          </p>
        </div>

        <div className="login-card">

          <h2>Welcome back</h2>

          <p className="login-subtitle">
            Sign in to continue to your agricultural dashboard.
          </p>

          {error && (
            <div
              style={{
                marginBottom: "16px",
                padding: "12px",
                borderRadius: "8px",
                background: "#fff1f1",
                color: "#b42318",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />
            </div>

            <div
              style={{
                textAlign: "right",
                marginBottom: "16px",
              }}
            >
              <Link
                to="/forgot-password"
                style={{
                  color: "#397a32",
                  fontSize: "14px",
                  textDecoration: "none",
                }}
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>

          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: "20px",
              color: "#667085",
            }}
          >
            New to AgriNerve?{" "}

            <Link
              to="/register"
              style={{
                color: "#397a32",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Create a farmer account
            </Link>
          </p>

        </div>

        <p className="login-footer">
          Empowering better agricultural decisions
        </p>

      </section>
    </main>
  );
}

export default Login;

