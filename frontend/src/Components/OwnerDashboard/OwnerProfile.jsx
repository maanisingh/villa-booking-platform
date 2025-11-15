import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Form,
  Image,
  Alert,
  Spinner,
  Tabs,
  Tab,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock, faCamera } from "@fortawesome/free-solid-svg-icons";
import API from "../../services/api";

const API_BASE = "/api"; // ✅ Make sure backend is running on port 9000

const theme = {
  primary: "#157feb",
  heading: "#157feb",
  background: "#f4f6f8",
  text: "#1e2a38",
  border: "#e5e7eb",
};

const OwnerProfile = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Profile State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI State
  const [message, setMessage] = useState(null);
  const [variant, setVariant] = useState("success");
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // ✅ Get Token from LocalStorage
  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("ownerToken") ||
      localStorage.getItem("authToken")
    );
  };

  // ✅ Check login state
  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
    if (!token) {
      setVariant("danger");
      setMessage("Please log in first.");
    }
  }, []);

  // ✅ Fetch Owner Profile
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = getToken();

        const res = await API.get(`${API_BASE}/owner/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const owner = res.data?.data;
        setName(owner?.name || "");
        setEmail(owner?.email || "");
        setPhone(owner?.phoneNumber || "");
        setAvatarPreview(owner?.image ? `${API_BASE.replace("/api", "")}${owner.image}` : "");
        setMessage(null);
      } catch (error) {
        console.error("❌ Fetch Profile Error:", error);
        handleApiError(error, "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isLoggedIn]);

  // ✅ Error Handler
  const handleApiError = (error, defaultMsg) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        setVariant("danger");
        setMessage("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("ownerToken");
        localStorage.removeItem("authToken");
        setTimeout(() => (window.location.href = "/login"), 2000);
      } else {
        setVariant("danger");
        setMessage(data?.message || defaultMsg);
      }
    } else {
      setVariant("danger");
      setMessage(defaultMsg);
    }
  };

  // ✅ Avatar Preview
  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setAvatarPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  // ✅ Update Profile
  const handleUpdateProfile = async () => {
    const token = getToken();
    if (!token) return setMessage("Please log in first.");

    if (!name.trim()) {
      setVariant("danger");
      setMessage("Name is required.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phoneNumber", phone);
      if (avatarFile) formData.append("image", avatarFile);

      const res = await API.put(`${API_BASE}/owner/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setVariant("success");
      setMessage(res.data?.message || "Profile updated successfully!");
    } catch (error) {
      console.error("❌ Update Profile Error:", error);
      handleApiError(error, "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Change Password
  const handleChangePassword = async () => {
    const token = getToken();
    if (!token) return setMessage("Please log in first.");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setVariant("danger");
      setMessage("Please fill in all fields.");
      return;
    }

    if (newPassword.length < 6) {
      setVariant("danger");
      setMessage("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setVariant("danger");
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await API.put(
        `${API_BASE}/owner/change-password`,
        { currentPassword, newPassword, confirmPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setVariant("success");
      setMessage(res.data?.message || "Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("❌ Change Password Error:", error);
      handleApiError(error, "Failed to change password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div style={{ background: theme.background, minHeight: "100vh", padding: "20px" }}>
      <h3 style={{ color: theme.heading, fontWeight: "bold" }}>Account</h3>
      <p className="text-muted mb-4">Manage your personal information and password.</p>

      {message && (
        <Alert variant={variant} onClose={() => setMessage(null)} dismissible>
          {message}
        </Alert>
      )}

      {!isLoggedIn ? (
        <Card className="text-center py-5">
          <Card.Body>
            <h4>Please log in to view your profile</h4>
            <Button
              variant="primary"
              className="mt-3"
              onClick={() => (window.location.href = "/login")}
            >
              Go to Login
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
          {/* === General Tab === */}
          <Tab
            eventKey="general"
            title={
              <span>
                <FontAwesomeIcon icon={faUser} className="me-2" /> General
              </span>
            }
          >
            <Card className="mb-4" style={{ border: `1px solid ${theme.border}` }}>
              <Card.Header style={{ background: "white" }}>
                <h5 style={{ color: theme.text }}>General Settings</h5>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" />
                  </div>
                ) : (
                  <Row>
                    <Col md={4} className="text-center">
                      <Image
                        src={
                          avatarPreview ||
                          "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                        }
                        roundedCircle
                        style={{
                          width: "150px",
                          height: "150px",
                          objectFit: "cover",
                          border: "2px solid #ccc",
                        }}
                        alt="Owner"
                      />
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="mt-3"
                        style={{ borderColor: theme.primary, color: theme.primary }}
                        onClick={() => document.getElementById("avatarUpload").click()}
                      >
                        <FontAwesomeIcon icon={faCamera} className="me-2" />
                        Change Photo
                      </Button>
                      <Form.Control
                        type="file"
                        id="avatarUpload"
                        hidden
                        onChange={handleAvatarChange}
                      />
                    </Col>

                    <Col md={8}>
                      <Form>
                        <Form.Group className="mb-3">
                          <Form.Label>Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Email Address</Form.Label>
                          <Form.Control type="email" value={email} disabled />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Phone Number</Form.Label>
                          <Form.Control
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </Form.Group>

                        <div className="text-end">
                          <Button
                            style={{ background: theme.primary, border: "none" }}
                            onClick={handleUpdateProfile}
                            disabled={loading}
                          >
                            {loading ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              "Save General Info"
                            )}
                          </Button>
                        </div>
                      </Form>
                    </Col>
                  </Row>
                )}
              </Card.Body>
            </Card>
          </Tab>

          {/* === Security Tab === */}
          <Tab
            eventKey="security"
            title={
              <span>
                <FontAwesomeIcon icon={faLock} className="me-2" /> Security
              </span>
            }
          >
            <Card style={{ border: `1px solid ${theme.border}` }}>
              <Card.Header style={{ background: "white" }}>
                <h5 style={{ color: theme.text }}>Change Password</h5>
              </Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Current Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Form.Text className="text-muted">
                      Must be at least 6 characters long.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Confirm New Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </Form.Group>

                  <div className="text-end">
                    <Button
                      style={{ background: theme.primary, border: "none" }}
                      onClick={handleChangePassword}
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      )}
    </div>
  );
};

export default OwnerProfile;
