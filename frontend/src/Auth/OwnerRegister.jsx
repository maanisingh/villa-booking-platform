import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const OwnerRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    address: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error when user types
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError("Name, email, and password are required");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "/api/owners",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
          assignedVilla: formData.address,
          status: "Pending",
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        alert("Registration successful! Please login with your credentials.");
        navigate("/");
      } else {
        setError(response.data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration Error:", error);

      if (error.response) {
        setError(
          error.response.data.message ||
            `Registration failed: ${error.response.statusText}`
        );
      } else if (error.request) {
        setError("Server not responding. Please check your backend connection.");
      } else {
        setError("Something went wrong. Please try again later.");
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
        padding: "20px",
      }}
    >
      <div
        className="card shadow p-4"
        style={{
          width: "100%",
          maxWidth: "520px",
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
            Owner Registration
          </h2>
          <p
            style={{
              color: "#94A3B8",
              fontSize: "0.95rem",
              marginTop: "6px",
            }}
          >
            Create your owner account
          </p>
        </div>

        {error && (
          <div
            className="alert alert-danger"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#FCA5A5",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "0.9rem",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-3">
            <label
              className="form-label"
              style={{ color: "#E2E8F0", fontSize: "0.9rem" }}
            >
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              className="form-control"
              style={{
                backgroundColor: "rgba(30, 42, 66, 0.7)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                color: "#E2E8F0",
                borderRadius: "10px",
                padding: "10px 14px",
                fontSize: "0.95rem",
              }}
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label
              className="form-label"
              style={{ color: "#E2E8F0", fontSize: "0.9rem" }}
            >
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              className="form-control"
              style={{
                backgroundColor: "rgba(30, 42, 66, 0.7)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                color: "#E2E8F0",
                borderRadius: "10px",
                padding: "10px 14px",
                fontSize: "0.95rem",
              }}
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
            />
          </div>

          {/* Phone Number */}
          <div className="mb-3">
            <label
              className="form-label"
              style={{ color: "#E2E8F0", fontSize: "0.9rem" }}
            >
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              className="form-control"
              style={{
                backgroundColor: "rgba(30, 42, 66, 0.7)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                color: "#E2E8F0",
                borderRadius: "10px",
                padding: "10px 14px",
                fontSize: "0.95rem",
              }}
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+1 234 567 8900"
            />
          </div>

          {/* Address */}
          <div className="mb-3">
            <label
              className="form-label"
              style={{ color: "#E2E8F0", fontSize: "0.9rem" }}
            >
              Address
            </label>
            <textarea
              name="address"
              className="form-control"
              style={{
                backgroundColor: "rgba(30, 42, 66, 0.7)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                color: "#E2E8F0",
                borderRadius: "10px",
                padding: "10px 14px",
                fontSize: "0.95rem",
                resize: "vertical",
                minHeight: "60px",
              }}
              value={formData.address}
              onChange={handleChange}
              placeholder="Your address"
            />
          </div>

          {/* Password */}
          <div className="mb-3 position-relative">
            <label
              className="form-label"
              style={{ color: "#E2E8F0", fontSize: "0.9rem" }}
            >
              Password *
            </label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-control"
                style={{
                  backgroundColor: "rgba(30, 42, 66, 0.7)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  color: "#E2E8F0",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  fontSize: "0.95rem",
                }}
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
              <span
                className="position-absolute top-50 end-0 translate-middle-y pe-3"
                style={{ cursor: "pointer", color: "#94A3B8", zIndex: 10 }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <i className="bi bi-eye-slash-fill"></i>
                ) : (
                  <i className="bi bi-eye-fill"></i>
                )}
              </span>
            </div>
            <small style={{ color: "#94A3B8", fontSize: "0.8rem" }}>
              Must be at least 6 characters
            </small>
          </div>

          {/* Confirm Password */}
          <div className="mb-4 position-relative">
            <label
              className="form-label"
              style={{ color: "#E2E8F0", fontSize: "0.9rem" }}
            >
              Confirm Password *
            </label>
            <div className="input-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className="form-control"
                style={{
                  backgroundColor: "rgba(30, 42, 66, 0.7)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  color: "#E2E8F0",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  fontSize: "0.95rem",
                }}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
              <span
                className="position-absolute top-50 end-0 translate-middle-y pe-3"
                style={{ cursor: "pointer", color: "#94A3B8", zIndex: 10 }}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <i className="bi bi-eye-slash-fill"></i>
                ) : (
                  <i className="bi bi-eye-fill"></i>
                )}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="d-grid gap-2 mb-3">
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
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              className="btn btn-link p-0"
              style={{ color: "#94A3B8", fontSize: "0.9rem" }}
              onClick={() => navigate("/")}
            >
              Already have an account? Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OwnerRegister;
