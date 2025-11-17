import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Define role-based credentials & redirect paths
  const roleCredentials = {
    Admin: {
      redirect: "/admin-dashboard",
      api: "/admin/login",
    },
    Owner: {
      redirect: "/owner-dashboard",
      api: "/owner/login",
    },
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  // Auto-fill credentials for testing
  const fillAdminCredentials = () => {
    setSelectedRole("Admin");
    setEmail("admin@gmail.com");
    setPassword("admin123");
  };

  const fillOwnerCredentials = () => {
    setSelectedRole("Owner");
    setEmail("testowner@villa.com");
    setPassword("password123");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRole) {
      alert("Please select your role first.");
      return;
    }

    const { api, redirect } = roleCredentials[selectedRole];
    setLoading(true);

    try {
      const response = await API.post(
        api,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        // ✅ Save user info
        localStorage.setItem("userRole", selectedRole);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("authToken", response.data.token || "");

        // ✅ CRITICAL FIX: Save user object with ID for owner access
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));

          // Also save ownerId separately for easy access
          if (response.data.user.id) {
            localStorage.setItem("ownerId", response.data.user.id);
          }
        }

        // ✅ Navigate to dashboard
        navigate(redirect);
      } else {
        alert(response.data.message || "Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Login Error:", error);

      // Handle different types of errors clearly
      if (error.response) {
        // Server responded with a status other than 2xx
        alert(
          error.response.data.message ||
            `Login failed: ${error.response.statusText}`
        );
      } else if (error.request) {
        // No response from server
        alert("Server not responding. Please check your backend connection.");
      } else {
        // Other errors
        alert("Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
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
            Villa Booking Platform
          </h2>
          <p
            style={{
              color: "#94A3B8",
              fontSize: "0.95rem",
              marginTop: "6px",
            }}
          >
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Role Selector */}
          <div className="mb-4">
            <label
              className="form-label"
              style={{
                color: "#E2E8F0",
                fontSize: "0.9rem",
                marginBottom: "10px",
              }}
            >
              Select Your Role
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
              }}
            >
              {Object.keys(roleCredentials).map((role) => (
                <div
                  key={role}
                  onClick={() => handleRoleSelect(role)}
                  style={{
                    color:
                      selectedRole === role ? "#A5B4FC" : "#CBD5E1",
                    fontSize: "0.95rem",
                    fontWeight:
                      selectedRole === role ? "600" : "normal",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "color 0.2s",
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>●</span>
                  <span>{role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Email */}
          <div className="mb-3">
            <label
              className="form-label"
              style={{ color: "#E2E8F0", fontSize: "0.9rem" }}
            >
              Email Address
            </label>
            <input
              type="email"
              className="form-control"
              style={{
                backgroundColor: "rgba(30, 42, 66, 0.7)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                color: "#E2E8F0",
                borderRadius: "10px",
                padding: "10px 14px",
                fontSize: "0.95rem",
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div className="mb-4 position-relative">
            <label
              className="form-label"
              style={{ color: "#E2E8F0", fontSize: "0.9rem" }}
            >
              Password
            </label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                style={{
                  backgroundColor: "rgba(30, 42, 66, 0.7)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  color: "#E2E8F0",
                  borderRadius: "10px",
                  padding: "10px 14px 10px 14px",
                  fontSize: "0.95rem",
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
              <span
                className="position-absolute top-50 end-0 translate-middle-y pe-3"
                style={{ cursor: "pointer", color: "#94A3B8" }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <i className="bi bi-eye-slash-fill"></i>
                ) : (
                  <i className="bi bi-eye-fill"></i>
                )}
              </span>
            </div>
          </div>

          {/* Quick Login Buttons */}
          <div className="mb-3">
            <label
              className="form-label"
              style={{ color: "#94A3B8", fontSize: "0.85rem" }}
            >
              Quick Login (For Testing)
            </label>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm flex-fill"
                style={{
                  backgroundColor: "rgba(165, 180, 252, 0.15)",
                  color: "#A5B4FC",
                  borderRadius: "8px",
                  padding: "8px",
                  fontSize: "0.85rem",
                  border: "1px solid rgba(165, 180, 252, 0.3)",
                }}
                onClick={fillAdminCredentials}
              >
                Admin Login
              </button>
              <button
                type="button"
                className="btn btn-sm flex-fill"
                style={{
                  backgroundColor: "rgba(34, 197, 94, 0.15)",
                  color: "#4ADE80",
                  borderRadius: "8px",
                  padding: "8px",
                  fontSize: "0.85rem",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                }}
                onClick={fillOwnerCredentials}
              >
                Owner Login
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="d-grid gap-2 mb-4">
            <button
              type="submit"
              className="btn"
              style={{
                backgroundColor: "#6366F1",
                color: "#FFFFFF",
                borderRadius: "10px",
                padding: "10px",
                fontSize: "1rem",
                fontWeight: "600",
                border: "none",
              }}
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              className="btn btn-link p-0"
              style={{ color: "#94A3B8", fontSize: "0.9rem" }}
              onClick={() => navigate("/register")}
            >
              Don't have an account? Register as Owner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
