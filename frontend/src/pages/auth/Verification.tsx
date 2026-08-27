import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  sendEmailOTP,
  verifyEmailOTP,
} from "../../api/auth";
import "./Verification.css";

function Verification() {
  const navigate = useNavigate();

  const [emailOtp, setEmailOtp] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailError, setEmailError] = useState("");

  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [countdown]);

  function formatCountdown(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  }

  async function handleSendEmailOTP() {
    setEmailError("");
    setEmailMessage("");
    setSending(true);

    try {
      const result = await sendEmailOTP();

      setEmailMessage(result.message);
      setCountdown(60);
    } catch (error) {
      setEmailError(
        error instanceof Error
          ? error.message
          : "Unable to send verification email.",
      );
    } finally {
      setSending(false);
    }
  }

  async function handleVerifyEmailOTP() {
    setEmailError("");
    setEmailMessage("");

    if (!/^\d{6}$/.test(emailOtp)) {
      setEmailError("Please enter the 6-digit OTP.");
      return;
    }

    setVerifying(true);

    try {
      const result = await verifyEmailOTP(emailOtp);

      setEmailVerified(true);
      setEmailMessage(result.message);
      setEmailOtp("");
    } catch (error) {
      setEmailError(
        error instanceof Error
          ? error.message
          : "Email verification failed.",
      );
    } finally {
      setVerifying(false);
    }
  }

  function handleContinue() {
    navigate("/farmer/dashboard");
  }

  return (
    <main className="verification-page">
      <section className="verification-container">

        <div className="verification-brand">
          <div className="verification-logo">🌱</div>
          <h1>AgriNerve</h1>
          <p>Secure farmer account verification</p>
        </div>

        <div className="verification-card">

          <div className="verification-header">
            <h2>Verify your account</h2>
            <p>
              Verify your email address to continue
              securely to your farmer dashboard.
            </p>
          </div>

          <div className="verification-section">

            <div className="verification-title">
              <div>
                <h3>Email verification</h3>
                <p>
                  We'll send a 6-digit verification code
                  to your registered email address.
                </p>
              </div>

              {emailVerified && (
                <span className="verified-badge">
                  ✓ Verified
                </span>
              )}
            </div>

            {!emailVerified && (
              <>
                <button
                  type="button"
                  className="otp-send-button"
                  onClick={handleSendEmailOTP}
                  disabled={sending || countdown > 0}
                >
                  {sending
                    ? "Sending..."
                    : countdown > 0
                      ? `Resend in ${formatCountdown(countdown)}`
                      : "Send Email OTP"}
                </button>

                <div className="otp-input-row">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={emailOtp}
                    onChange={(event) =>
                      setEmailOtp(
                        event.target.value.replace(/\D/g, ""),
                      )
                    }
                    disabled={verifying}
                  />

                  <button
                    type="button"
                    className="verify-button"
                    onClick={handleVerifyEmailOTP}
                    disabled={verifying || emailOtp.length !== 6}
                  >
                    {verifying ? "Verifying..." : "Verify"}
                  </button>
                </div>
              </>
            )}

            {emailMessage && (
              <div className="otp-message success">
                {emailMessage}
              </div>
            )}

            {emailError && (
              <div className="otp-message error">
                {emailError}
              </div>
            )}

          </div>

          <div className="verification-info">
            <span>🔒</span>
            <p>
              Your verification code expires after 10 minutes.
              Never share your OTP with anyone.
            </p>
          </div>

          <button
            type="button"
            className="continue-button"
            disabled={!emailVerified}
            onClick={handleContinue}
          >
            Continue to Farmer Dashboard
          </button>

        </div>

      </section>
    </main>
  );
}

export default Verification;
