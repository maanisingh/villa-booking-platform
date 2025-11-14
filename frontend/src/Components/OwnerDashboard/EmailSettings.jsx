import React, { useState, useEffect } from "react";
import axios from "axios";

const EmailSettings = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    smtpHost: "",
    smtpPort: "",
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "",
    fromName: "",
  });

  const [notifications, setNotifications] = useState({
    bookingConfirmation: true,
    bookingCancellation: true,
    bookingModification: true,
    paymentReceived: true,
    guestMessages: true,
  });

  const predefinedProviders = [
    {
      name: "Gmail",
      host: "smtp.gmail.com",
      port: "587",
      secure: false,
    },
    {
      name: "Outlook/Hotmail",
      host: "smtp-mail.outlook.com",
      port: "587",
      secure: false,
    },
    {
      name: "Yahoo",
      host: "smtp.mail.yahoo.com",
      port: "587",
      secure: false,
    },
    {
      name: "SendGrid",
      host: "smtp.sendgrid.net",
      port: "587",
      secure: false,
    },
  ];

  useEffect(() => {
    fetchEmailConfig();
  }, []);

  const fetchEmailConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.get("/api/email/config", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success && response.data.data) {
        const emailConfig = response.data.data;
        setConfig(emailConfig);
        setFormData({
          smtpHost: emailConfig.smtpHost || "",
          smtpPort: emailConfig.smtpPort || "",
          smtpUser: emailConfig.smtpUser || "",
          smtpPassword: "", // Don't populate password for security
          fromEmail: emailConfig.fromEmail || "",
          fromName: emailConfig.fromName || "",
        });
        setNotifications(emailConfig.notifications || notifications);
      }
    } catch (error) {
      console.error("Error fetching email config:", error);
      if (error.response?.status !== 404) {
        setError("Failed to load email configuration");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleNotificationChange = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleProviderSelect = (provider) => {
    setFormData((prev) => ({
      ...prev,
      smtpHost: provider.host,
      smtpPort: provider.port.toString(),
    }));
    setSuccess(`${provider.name} settings loaded. Please enter your credentials.`);
  };

  const validateForm = () => {
    if (!formData.smtpHost || !formData.smtpPort || !formData.smtpUser) {
      setError("SMTP Host, Port, and User are required");
      return false;
    }

    if (!formData.fromEmail) {
      setError("From Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.fromEmail)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSaveConfig = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("authToken");
      const payload = {
        ...formData,
        notifications: notifications,
      };

      // Only include password if it's been changed
      if (!formData.smtpPassword && config) {
        delete payload.smtpPassword;
      }

      const response = await axios.post("/api/email/configure", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSuccess("Email configuration saved successfully!");
        fetchEmailConfig();
      } else {
        setError(response.data.message || "Failed to save configuration");
      }
    } catch (error) {
      console.error("Save config error:", error);
      setError(
        error.response?.data?.message ||
          "Failed to save configuration. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!validateForm()) {
      return;
    }

    setTesting(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post("/api/email/test", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSuccess("Test email sent successfully! Check your inbox.");
      } else {
        setError(response.data.message || "Failed to send test email");
      }
    } catch (error) {
      console.error("Test email error:", error);
      setError(
        error.response?.data?.message ||
          "Failed to send test email. Please check your settings."
      );
    } finally {
      setTesting(false);
    }
  };

  const handleToggleEnabled = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const endpoint = config?.enabled ? "/api/email/disable" : "/api/email/enable";

      const response = await axios.post(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSuccess(
          `Email notifications ${config?.enabled ? "disabled" : "enabled"} successfully!`
        );
        fetchEmailConfig();
      }
    } catch (error) {
      console.error("Toggle enabled error:", error);
      setError("Failed to update email status");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "30px",
          minHeight: "100vh",
          backgroundColor: "#0f172a",
          color: "#E2E8F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "#94A3B8", fontSize: "1.1rem" }}>
          Loading email settings...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "30px",
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "#E2E8F0",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "30px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: "700",
                color: "#A5B4FC",
              }}
            >
              Email Settings
            </h1>
            {config && (
              <button
                onClick={handleToggleEnabled}
                style={{
                  backgroundColor: config.enabled
                    ? "rgba(239, 68, 68, 0.1)"
                    : "rgba(34, 197, 94, 0.1)",
                  color: config.enabled ? "#FCA5A5" : "#4ADE80",
                  border: `1px solid ${
                    config.enabled
                      ? "rgba(239, 68, 68, 0.3)"
                      : "rgba(34, 197, 94, 0.3)"
                  }`,
                  borderRadius: "10px",
                  padding: "8px 16px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                {config.enabled ? "Disable" : "Enable"} Notifications
              </button>
            )}
          </div>
          <p style={{ color: "#94A3B8", fontSize: "0.95rem" }}>
            Configure SMTP settings and email notifications
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#FCA5A5",
              borderRadius: "10px",
              padding: "12px 16px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              color: "#4ADE80",
              borderRadius: "10px",
              padding: "12px 16px",
              marginBottom: "20px",
            }}
          >
            {success}
          </div>
        )}

        {/* Quick Setup - Predefined Providers */}
        <div
          style={{
            backgroundColor: "#1e293b",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "20px",
            border: "1px solid rgba(148, 163, 184, 0.2)",
          }}
        >
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: "600",
              color: "#E2E8F0",
              marginBottom: "16px",
            }}
          >
            Quick Setup
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "12px",
            }}
          >
            {predefinedProviders.map((provider) => (
              <button
                key={provider.name}
                onClick={() => handleProviderSelect(provider)}
                style={{
                  backgroundColor: "rgba(165, 180, 252, 0.1)",
                  color: "#A5B4FC",
                  border: "1px solid rgba(165, 180, 252, 0.3)",
                  borderRadius: "10px",
                  padding: "12px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                {provider.name}
              </button>
            ))}
          </div>
        </div>

        {/* SMTP Configuration */}
        <div
          style={{
            backgroundColor: "#1e293b",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "20px",
            border: "1px solid rgba(148, 163, 184, 0.2)",
          }}
        >
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: "600",
              color: "#E2E8F0",
              marginBottom: "20px",
            }}
          >
            SMTP Configuration
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  color: "#E2E8F0",
                  fontSize: "0.9rem",
                  marginBottom: "8px",
                }}
              >
                SMTP Host *
              </label>
              <input
                type="text"
                name="smtpHost"
                value={formData.smtpHost}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  backgroundColor: "rgba(30, 42, 66, 0.7)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  color: "#E2E8F0",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  fontSize: "0.95rem",
                }}
                placeholder="smtp.gmail.com"
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  color: "#E2E8F0",
                  fontSize: "0.9rem",
                  marginBottom: "8px",
                }}
              >
                SMTP Port *
              </label>
              <input
                type="text"
                name="smtpPort"
                value={formData.smtpPort}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  backgroundColor: "rgba(30, 42, 66, 0.7)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  color: "#E2E8F0",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  fontSize: "0.95rem",
                }}
                placeholder="587"
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  color: "#E2E8F0",
                  fontSize: "0.9rem",
                  marginBottom: "8px",
                }}
              >
                SMTP User *
              </label>
              <input
                type="text"
                name="smtpUser"
                value={formData.smtpUser}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  backgroundColor: "rgba(30, 42, 66, 0.7)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  color: "#E2E8F0",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  fontSize: "0.95rem",
                }}
                placeholder="your-email@gmail.com"
              />
            </div>

            <div className="position-relative">
              <label
                style={{
                  display: "block",
                  color: "#E2E8F0",
                  fontSize: "0.9rem",
                  marginBottom: "8px",
                }}
              >
                SMTP Password {config ? "(leave blank to keep current)" : "*"}
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="smtpPassword"
                value={formData.smtpPassword}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  backgroundColor: "rgba(30, 42, 66, 0.7)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  color: "#E2E8F0",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  fontSize: "0.95rem",
                  paddingRight: "40px",
                }}
                placeholder={config ? "Enter new password" : "Your password"}
              />
              <span
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "42px",
                  cursor: "pointer",
                  color: "#94A3B8",
                }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </span>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  color: "#E2E8F0",
                  fontSize: "0.9rem",
                  marginBottom: "8px",
                }}
              >
                From Email *
              </label>
              <input
                type="email"
                name="fromEmail"
                value={formData.fromEmail}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  backgroundColor: "rgba(30, 42, 66, 0.7)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  color: "#E2E8F0",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  fontSize: "0.95rem",
                }}
                placeholder="noreply@yourdomain.com"
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  color: "#E2E8F0",
                  fontSize: "0.9rem",
                  marginBottom: "8px",
                }}
              >
                From Name
              </label>
              <input
                type="text"
                name="fromName"
                value={formData.fromName}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  backgroundColor: "rgba(30, 42, 66, 0.7)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  color: "#E2E8F0",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  fontSize: "0.95rem",
                }}
                placeholder="Your Villa"
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <button
              onClick={handleTestEmail}
              disabled={testing}
              style={{
                flex: 1,
                backgroundColor: "rgba(165, 180, 252, 0.15)",
                color: "#A5B4FC",
                border: "1px solid rgba(165, 180, 252, 0.3)",
                borderRadius: "10px",
                padding: "10px",
                fontSize: "0.95rem",
                fontWeight: "600",
                cursor: testing ? "not-allowed" : "pointer",
              }}
            >
              {testing ? "Sending Test..." : "Send Test Email"}
            </button>
            <button
              onClick={handleSaveConfig}
              disabled={saving}
              style={{
                flex: 1,
                backgroundColor: "#6366F1",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "10px",
                padding: "10px",
                fontSize: "0.95rem",
                fontWeight: "600",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </div>

        {/* Notification Preferences */}
        <div
          style={{
            backgroundColor: "#1e293b",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid rgba(148, 163, 184, 0.2)",
          }}
        >
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: "600",
              color: "#E2E8F0",
              marginBottom: "20px",
            }}
          >
            Notification Preferences
          </h3>

          <div style={{ display: "grid", gap: "12px" }}>
            {Object.entries(notifications).map(([key, value]) => (
              <label
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  padding: "12px",
                  backgroundColor: "rgba(30, 42, 66, 0.5)",
                  borderRadius: "10px",
                  border: "1px solid rgba(148, 163, 184, 0.1)",
                }}
              >
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => handleNotificationChange(key)}
                  style={{
                    marginRight: "12px",
                    width: "18px",
                    height: "18px",
                    cursor: "pointer",
                  }}
                />
                <span style={{ color: "#E2E8F0", fontSize: "0.95rem" }}>
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSettings;
