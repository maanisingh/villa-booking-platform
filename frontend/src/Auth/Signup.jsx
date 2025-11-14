// src/pages/Signup.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    }

    setIsLoading(true);
    setPasswordMismatch(false);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", email);
      navigate("/user/dashboard");
    } catch (error) {
      console.error("Signup failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Common input style
  const inputStyle = {
    backgroundColor: "rgba(30, 42, 66, 0.7)",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    color: "#E2E8F0",
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "0.95rem",
    width: "100%",
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div
        className="card shadow p-4"
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#1e293b",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
        }}
      >
        <div className="text-center mb-4">
          <h2
            style={{
              fontWeight: "700",
              color: "#A5B4FC",
              fontSize: "2rem",
              letterSpacing: "-0.5px",
            }}
          >
            School Management
          </h2>
          <p style={{ color: "#94A3B8", fontSize: "0.95rem", marginTop: "6px" }}>
            Create your account
          </p>
        </div>

        <form onSubmit={handleSignup}>
          {/* First Name */}
          <div className="mb-3 position-relative">
            <label className="form-label" style={{ color: "#E2E8F0", fontSize: "0.9rem" }}>
              First Name
            </label>
            <div className="position-relative">
              <i
                className="bi bi-person position-absolute"
                style={{
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94A3B8",
                  pointerEvents: "none",
                }}
              ></i>
              <input
                type="text"
                style={{
                  ...inputStyle,
                  paddingLeft: "40px",
                }}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="Enter first name"
              />
            </div>
          </div>

          {/* Last Name */}
          <div className="mb-3 position-relative">
            <label className="form-label" style={{ color: "#E2E8F0", fontSize: "0.9rem" }}>
              Last Name
            </label>
            <div className="position-relative">
              <i
                className="bi bi-person-fill position-absolute"
                style={{
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94A3B8",
                  pointerEvents: "none",
                }}
              ></i>
              <input
                type="text"
                style={{
                  ...inputStyle,
                  paddingLeft: "40px",
                }}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="Enter last name"
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-3 position-relative">
            <label className="form-label" style={{ color: "#E2E8F0", fontSize: "0.9rem" }}>
              Email Address
            </label>
            <div className="position-relative">
              <i
                className="bi bi-envelope position-absolute"
                style={{
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94A3B8",
                  pointerEvents: "none",
                }}
              ></i>
              <input
                type="email"
                style={{
                  ...inputStyle,
                  paddingLeft: "40px",
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-3 position-relative">
            <label className="form-label" style={{ color: "#E2E8F0", fontSize: "0.9rem" }}>
              Password
            </label>
            <div className="position-relative">
              <i
                className="bi bi-lock position-absolute"
                style={{
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94A3B8",
                  pointerEvents: "none",
                }}
              ></i>
              <input
                type={showPassword ? "text" : "password"}
                style={{
                  ...inputStyle,
                  paddingLeft: "40px",
                  paddingRight: "40px",
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="3"
                placeholder="••••••••"
              />
              <i
                className={`bi ${showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"} position-absolute`}
                style={{
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#94A3B8",
                }}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-3 position-relative">
            <label className="form-label" style={{ color: "#E2E8F0", fontSize: "0.9rem" }}>
              Confirm Password
            </label>
            <div className="position-relative">
              <i
                className="bi bi-shield-lock position-absolute"
                style={{
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94A3B8",
                  pointerEvents: "none",
                }}
              ></i>
              <input
                type={showPassword ? "text" : "password"}
                style={{
                  ...inputStyle,
                  paddingLeft: "40px",
                }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
          </div>

          {passwordMismatch && (
            <p className="text-danger mb-3" style={{ fontSize: "0.85rem", textAlign: "center" }}>
              Passwords do not match
            </p>
          )}

          {/* Signup Button */}
          <div className="d-grid gap-2 mb-4">
            <button
              type="submit"
              className="btn"
              disabled={isLoading}
              style={{
                backgroundColor: "#6366F1",
                color: "#FFFFFF",
                borderRadius: "10px",
                padding: "10px",
                fontSize: "1rem",
                fontWeight: "600",
                border: "none",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                    style={{ width: "1rem", height: "1rem" }}
                  ></span>
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </div>

          <div className="text-center">
            <span style={{ color: "#94A3B8", fontSize: "0.9rem" }}>
              Already have an account?{" "}
            </span>
            <Link
              to="/"
              className="text-decoration-none"
              style={{ color: "#A5B4FC", fontWeight: "600" }}
            >
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;