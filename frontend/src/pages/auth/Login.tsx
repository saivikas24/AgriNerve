function Login() {
  return (
    <main className="login-page">
      <section className="login-container">
        <div className="login-brand">
          <div className="brand-icon">🌱</div>

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

          <form>
            <div className="form-group">
              <label htmlFor="email">Email or phone</label>

              <input
                id="email"
                type="text"
                placeholder="Enter your email or phone"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" className="login-button">
              Sign in
            </button>
          </form>
        </div>

        <p className="login-footer">
          Empowering better agricultural decisions
        </p>
      </section>
    </main>
  );
}

export default Login;