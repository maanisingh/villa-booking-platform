import React, { useState, useEffect } from "react";
import API from "../../services/api";

const PlatformIntegration = () => {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [credentials, setCredentials] = useState({});
  const [testingConnection, setTestingConnection] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const platformTypes = [
    {
      value: "airbnb",
      label: "Airbnb",
      fields: [
        { name: "clientId", label: "Client ID", type: "text" },
        { name: "clientSecret", label: "Client Secret", type: "password" },
      ],
    },
    {
      value: "booking",
      label: "Booking.com",
      fields: [
        { name: "hotelId", label: "Hotel ID", type: "text" },
        { name: "apiKey", label: "API Key", type: "password" },
      ],
    },
    {
      value: "vrbo",
      label: "VRBO/Expedia",
      fields: [
        { name: "propertyId", label: "Property ID", type: "text" },
        { name: "apiKey", label: "API Key", type: "password" },
      ],
    },
  ];

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await API.get("/api/platforms", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setPlatforms(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching platforms:", error);
      setError("Failed to load platform integrations");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlatform = () => {
    setShowAddModal(true);
    setError("");
    setSuccess("");
  };

  const handlePlatformSelect = (platformType) => {
    setSelectedPlatform(platformType);
    const platform = platformTypes.find((p) => p.value === platformType);
    const initialCredentials = {};
    platform.fields.forEach((field) => {
      initialCredentials[field.name] = "";
    });
    setCredentials(initialCredentials);
  };

  const handleCredentialChange = (field, value) => {
    setCredentials((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTestConnection = async () => {
    if (!selectedPlatform) {
      setError("Please select a platform");
      return;
    }

    setTestingConnection(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("authToken");
      const response = await API.post(
        "/api/platforms/test-connection",
        {
          platform: selectedPlatform,
          credentials: credentials,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSuccess("Connection test successful!");
      } else {
        setError(response.data.message || "Connection test failed");
      }
    } catch (error) {
      console.error("Test connection error:", error);
      setError(
        error.response?.data?.message ||
          "Connection test failed. Please check your credentials."
      );
    } finally {
      setTestingConnection(false);
    }
  };

  const handleConnectPlatform = async () => {
    if (!selectedPlatform) {
      setError("Please select a platform");
      return;
    }

    const platform = platformTypes.find((p) => p.value === selectedPlatform);
    const missingFields = platform.fields.filter(
      (field) => !credentials[field.name]
    );

    if (missingFields.length > 0) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("authToken");
      const response = await API.post(
        "/api/platforms/connect",
        {
          platform: selectedPlatform,
          credentials: credentials,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSuccess("Platform connected successfully!");
        setTimeout(() => {
          setShowAddModal(false);
          fetchPlatforms();
          resetForm();
        }, 1500);
      } else {
        setError(response.data.message || "Failed to connect platform");
      }
    } catch (error) {
      console.error("Connect platform error:", error);
      setError(
        error.response?.data?.message ||
          "Failed to connect platform. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (platformId) => {
    if (!confirm("Are you sure you want to disconnect this platform?")) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await API.delete(`/api/platforms/${platformId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSuccess("Platform disconnected successfully!");
        fetchPlatforms();
      }
    } catch (error) {
      console.error("Disconnect error:", error);
      setError("Failed to disconnect platform");
    }
  };

  const resetForm = () => {
    setSelectedPlatform("");
    setCredentials({});
    setError("");
    setSuccess("");
  };

  const getPlatformIcon = (platformName) => {
    const icons = {
      airbnb: "🏠",
      booking: "🛏️",
      vrbo: "🏡",
    };
    return icons[platformName] || "🔗";
  };

  const getPlatformStatus = (status) => {
    const statusColors = {
      active: { bg: "rgba(34, 197, 94, 0.1)", color: "#4ADE80" },
      inactive: { bg: "rgba(239, 68, 68, 0.1)", color: "#FCA5A5" },
      pending: { bg: "rgba(234, 179, 8, 0.1)", color: "#FDE047" },
    };
    return statusColors[status] || statusColors.inactive;
  };

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
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: "700",
                color: "#A5B4FC",
                marginBottom: "8px",
              }}
            >
              Platform Integration
            </h1>
            <p style={{ color: "#94A3B8", fontSize: "0.95rem" }}>
              Connect and manage your property listing platforms
            </p>
          </div>
          <button
            onClick={handleAddPlatform}
            style={{
              backgroundColor: "#6366F1",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "10px",
              padding: "12px 24px",
              fontSize: "0.95rem",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            + Add Platform
          </button>
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

        {/* Platform List */}
        {loading && !showAddModal ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#94A3B8" }}>
            Loading platforms...
          </div>
        ) : platforms.length === 0 ? (
          <div
            style={{
              backgroundColor: "#1e293b",
              borderRadius: "16px",
              padding: "60px 20px",
              textAlign: "center",
              border: "1px solid rgba(148, 163, 184, 0.2)",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔗</div>
            <h3 style={{ color: "#E2E8F0", marginBottom: "8px" }}>
              No Platforms Connected
            </h3>
            <p style={{ color: "#94A3B8", marginBottom: "20px" }}>
              Connect your first platform to start syncing bookings
            </p>
            <button
              onClick={handleAddPlatform}
              style={{
                backgroundColor: "#6366F1",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "10px",
                padding: "10px 20px",
                fontSize: "0.9rem",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Add Platform
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {platforms.map((platform) => {
              const statusStyle = getPlatformStatus(platform.status);
              return (
                <div
                  key={platform._id}
                  style={{
                    backgroundColor: "#1e293b",
                    borderRadius: "16px",
                    padding: "20px",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "2rem",
                        marginRight: "12px",
                      }}
                    >
                      {getPlatformIcon(platform.platform)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: "600",
                          color: "#E2E8F0",
                          marginBottom: "4px",
                          textTransform: "capitalize",
                        }}
                      >
                        {platform.platform}
                      </h3>
                      <div
                        style={{
                          display: "inline-block",
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          textTransform: "uppercase",
                        }}
                      >
                        {platform.status}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      color: "#94A3B8",
                      fontSize: "0.85rem",
                      marginBottom: "16px",
                    }}
                  >
                    <div>
                      Connected:{" "}
                      {new Date(platform.createdAt).toLocaleDateString()}
                    </div>
                    {platform.lastSync && (
                      <div>
                        Last Sync:{" "}
                        {new Date(platform.lastSync).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDisconnect(platform._id)}
                    style={{
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      color: "#FCA5A5",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      borderRadius: "8px",
                      padding: "8px 16px",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Platform Modal */}
        {showAddModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px",
            }}
            onClick={() => setShowAddModal(false)}
          >
            <div
              style={{
                backgroundColor: "#1e293b",
                borderRadius: "16px",
                padding: "30px",
                maxWidth: "500px",
                width: "100%",
                border: "1px solid rgba(148, 163, 184, 0.2)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "#A5B4FC",
                  marginBottom: "20px",
                }}
              >
                Connect Platform
              </h2>

              {error && (
                <div
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#FCA5A5",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    marginBottom: "16px",
                    fontSize: "0.9rem",
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
                    padding: "10px 14px",
                    marginBottom: "16px",
                    fontSize: "0.9rem",
                  }}
                >
                  {success}
                </div>
              )}

              {/* Platform Selection */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    color: "#E2E8F0",
                    fontSize: "0.9rem",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Select Platform
                </label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => handlePlatformSelect(e.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: "rgba(30, 42, 66, 0.7)",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    color: "#E2E8F0",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "0.95rem",
                  }}
                >
                  <option value="">Choose a platform...</option>
                  {platformTypes.map((platform) => (
                    <option key={platform.value} value={platform.value}>
                      {platform.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Credentials Fields */}
              {selectedPlatform && (
                <>
                  {platformTypes
                    .find((p) => p.value === selectedPlatform)
                    ?.fields.map((field) => (
                      <div key={field.name} style={{ marginBottom: "16px" }}>
                        <label
                          style={{
                            display: "block",
                            color: "#E2E8F0",
                            fontSize: "0.9rem",
                            marginBottom: "8px",
                          }}
                        >
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          value={credentials[field.name] || ""}
                          onChange={(e) =>
                            handleCredentialChange(field.name, e.target.value)
                          }
                          style={{
                            width: "100%",
                            backgroundColor: "rgba(30, 42, 66, 0.7)",
                            border: "1px solid rgba(148, 163, 184, 0.2)",
                            color: "#E2E8F0",
                            borderRadius: "10px",
                            padding: "10px 14px",
                            fontSize: "0.95rem",
                          }}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                      </div>
                    ))}

                  {/* Test Connection Button */}
                  <button
                    onClick={handleTestConnection}
                    disabled={testingConnection}
                    style={{
                      width: "100%",
                      backgroundColor: "rgba(165, 180, 252, 0.15)",
                      color: "#A5B4FC",
                      border: "1px solid rgba(165, 180, 252, 0.3)",
                      borderRadius: "10px",
                      padding: "10px",
                      fontSize: "0.95rem",
                      fontWeight: "600",
                      cursor: testingConnection ? "not-allowed" : "pointer",
                      marginBottom: "12px",
                    }}
                  >
                    {testingConnection ? "Testing..." : "Test Connection"}
                  </button>
                </>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(148, 163, 184, 0.1)",
                    color: "#94A3B8",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    borderRadius: "10px",
                    padding: "10px",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConnectPlatform}
                  disabled={!selectedPlatform || loading}
                  style={{
                    flex: 1,
                    backgroundColor: selectedPlatform
                      ? "#6366F1"
                      : "rgba(99, 102, 241, 0.3)",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "10px",
                    padding: "10px",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    cursor: selectedPlatform ? "pointer" : "not-allowed",
                  }}
                >
                  {loading ? "Connecting..." : "Connect"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformIntegration;
