import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Badge,
  Tabs,
  Tab,
  InputGroup,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faCog,
  faServer,
  faCheckCircle,
  faPaperPlane,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import API from "../../services/api";

const theme = {
  primary: "#157feb",
  heading: "#157feb",
  background: "#f4f6f8",
  text: "#1e2a38",
  border: "#e5e7eb",
};

const AdminEmailSettings = () => {
  const [activeTab, setActiveTab] = useState("smtp");
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [emailConfig, setEmailConfig] = useState(null);
  const [alert, setAlert] = useState(null);

  const [formData, setFormData] = useState({
    provider: "custom",
    smtpHost: "",
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "",
    fromName: "Villa Booking Platform",
    notificationSettings: {
      newBooking: true,
      bookingCancellation: true,
      syncErrors: true,
      dailySummary: false,
    },
  });

  const [testEmail, setTestEmail] = useState("");

  const providerPresets = {
    gmail: {
      name: "Gmail",
      smtpHost: "smtp.gmail.com",
      smtpPort: 587,
      smtpSecure: false,
      info: "Use an App Password for Gmail. Go to Google Account Settings > Security > 2-Step Verification > App Passwords",
    },
    outlook: {
      name: "Outlook/Hotmail",
      smtpHost: "smtp-mail.outlook.com",
      smtpPort: 587,
      smtpSecure: false,
      info: "Use your Outlook/Hotmail email and password",
    },
    sendgrid: {
      name: "SendGrid",
      smtpHost: "smtp.sendgrid.net",
      smtpPort: 587,
      smtpSecure: false,
      info: "Use 'apikey' as username and your SendGrid API key as password",
    },
    custom: {
      name: "Custom SMTP",
      info: "Enter your SMTP server details manually",
    },
  };

  useEffect(() => {
    fetchEmailConfig();
  }, []);

  const fetchEmailConfig = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await API.get("/api/email/config", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success && res.data.data) {
        setEmailConfig(res.data.data);
        setFormData({
          ...formData,
          ...res.data.data,
          smtpPassword: "", // Don't populate password for security
          notificationSettings: {
            ...formData.notificationSettings,
            ...res.data.data.notificationSettings,
          },
        });
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        showAlert("danger", "Failed to load email configuration");
      }
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleProviderChange = (provider) => {
    const preset = providerPresets[provider];
    if (preset && provider !== "custom") {
      setFormData({
        ...formData,
        provider,
        smtpHost: preset.smtpHost,
        smtpPort: preset.smtpPort,
        smtpSecure: preset.smtpSecure,
      });
    } else {
      setFormData({ ...formData, provider });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");

      if (!formData.smtpHost || !formData.smtpUser || !formData.fromEmail) {
        throw new Error("Please fill in all required fields");
      }

      if (!emailConfig && !formData.smtpPassword) {
        throw new Error("Password is required for new configuration");
      }

      const response = await API.post("/api/email/configure", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        showAlert("success", "Email configuration saved successfully!");
        fetchEmailConfig();
      }
    } catch (error) {
      showAlert("danger", error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      showAlert("danger", "Please enter a test email address");
      return;
    }

    setTesting(true);

    try {
      const token = localStorage.getItem("authToken");
      const response = await API.post(
        "/api/email/test",
        { toEmail: testEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showAlert("success", `Test email sent successfully to ${testEmail}!`);
      }
    } catch (error) {
      showAlert(
        "danger",
        `Test failed: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setTesting(false);
    }
  };

  const renderQuickSetup = () => (
    <Row className="mb-4">
      <Col>
        <h5 style={{ color: theme.text }}>Quick Setup - Choose a Provider</h5>
        <p className="text-muted">
          Select a popular email provider to auto-fill SMTP settings
        </p>
        <Row className="g-3">
          {Object.entries(providerPresets).map(([key, preset]) => (
            <Col md={3} key={key}>
              <Card
                className="text-center h-100"
                style={{
                  border: `2px solid ${
                    formData.provider === key ? theme.primary : theme.border
                  }`,
                  cursor: "pointer",
                }}
                onClick={() => handleProviderChange(key)}
              >
                <Card.Body>
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    size="2x"
                    style={{
                      color:
                        formData.provider === key ? theme.primary : theme.text,
                    }}
                  />
                  <h6 className="mt-2">{preset.name}</h6>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        {providerPresets[formData.provider]?.info && (
          <Alert variant="info" className="mt-3">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            {providerPresets[formData.provider].info}
          </Alert>
        )}
      </Col>
    </Row>
  );

  return (
    <div
      style={{
        background: theme.background,
        minHeight: "100%",
        padding: "20px",
      }}
    >
      {/* Header */}
      <Row className="mb-4 align-items-center">
        <Col>
          <h1 style={{ color: theme.heading, fontWeight: "bold" }}>
            Email Settings
          </h1>
          <p className="text-muted">
            Configure system-wide email settings and SMTP server for sending
            notifications
          </p>
        </Col>
        <Col xs="auto">
          {emailConfig && (
            <Badge
              bg={emailConfig.isActive ? "success" : "secondary"}
              style={{ fontSize: "1rem", padding: "8px 12px" }}
            >
              <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
              {emailConfig.isActive ? "Active" : "Inactive"}
            </Badge>
          )}
        </Col>
      </Row>

      {alert && (
        <Alert
          variant={alert.type}
          dismissible
          onClose={() => setAlert(null)}
        >
          {alert.message}
        </Alert>
      )}

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
        fill
      >
        {/* SMTP Configuration Tab */}
        <Tab
          eventKey="smtp"
          title={
            <span>
              <FontAwesomeIcon icon={faServer} className="me-2" />
              SMTP Configuration
            </span>
          }
        >
          <Form onSubmit={handleSubmit}>
            {renderQuickSetup()}

            <Card style={{ border: `1px solid ${theme.border}` }}>
              <Card.Header style={{ background: "white" }}>
                <h5 style={{ color: theme.text }}>SMTP Server Details</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>SMTP Host *</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="smtp.example.com"
                        value={formData.smtpHost}
                        onChange={(e) =>
                          setFormData({ ...formData, smtpHost: e.target.value })
                        }
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>SMTP Port *</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="587"
                        value={formData.smtpPort}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            smtpPort: parseInt(e.target.value),
                          })
                        }
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        SMTP Username *
                        {formData.provider === "sendgrid" && (
                          <Badge bg="info" className="ms-2">
                            Use 'apikey'
                          </Badge>
                        )}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder={
                          formData.provider === "sendgrid"
                            ? "apikey"
                            : "your-email@example.com"
                        }
                        value={formData.smtpUser}
                        onChange={(e) =>
                          setFormData({ ...formData, smtpUser: e.target.value })
                        }
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        SMTP Password {emailConfig ? "" : "*"}
                        {formData.provider === "gmail" && (
                          <Badge bg="warning" className="ms-2">
                            App Password
                          </Badge>
                        )}
                      </Form.Label>
                      <Form.Control
                        type="password"
                        placeholder={
                          emailConfig
                            ? "Leave blank to keep current"
                            : "Enter password"
                        }
                        value={formData.smtpPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            smtpPassword: e.target.value,
                          })
                        }
                        required={!emailConfig}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>From Email Address *</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="noreply@example.com"
                        value={formData.fromEmail}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            fromEmail: e.target.value,
                          })
                        }
                        required
                      />
                      <Form.Text className="text-muted">
                        Recipients will see this as the sender
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>From Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Villa Booking Platform"
                        value={formData.fromName}
                        onChange={(e) =>
                          setFormData({ ...formData, fromName: e.target.value })
                        }
                      />
                      <Form.Text className="text-muted">
                        Display name for the sender
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="smtp-secure"
                    label="Use secure connection (TLS/SSL)"
                    checked={formData.smtpSecure}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        smtpSecure: e.target.checked,
                      })
                    }
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            {emailConfig && (
              <Card
                style={{ border: `1px solid ${theme.border}` }}
                className="mt-3"
              >
                <Card.Header style={{ background: "white" }}>
                  <h5 style={{ color: theme.text }}>Test Email Configuration</h5>
                </Card.Header>
                <Card.Body>
                  <Row className="align-items-end">
                    <Col md={8}>
                      <Form.Group>
                        <Form.Label>Test Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Enter email address to send test email"
                          value={testEmail}
                          onChange={(e) => setTestEmail(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Button
                        variant="outline-primary"
                        onClick={handleTestEmail}
                        disabled={testing || !testEmail}
                        className="w-100"
                      >
                        <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                        {testing ? "Sending..." : "Send Test Email"}
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}

            <div className="d-flex justify-content-end mt-3">
              <Button
                type="submit"
                style={{ background: theme.primary, border: "none" }}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                {loading ? "Saving..." : "Save Configuration"}
              </Button>
            </div>
          </Form>
        </Tab>

        {/* Notification Settings Tab */}
        <Tab
          eventKey="notifications"
          title={
            <span>
              <FontAwesomeIcon icon={faCog} className="me-2" />
              Notification Preferences
            </span>
          }
        >
          <Card style={{ border: `1px solid ${theme.border}` }}>
            <Card.Header style={{ background: "white" }}>
              <h5 style={{ color: theme.text }}>
                Email Notification Preferences
              </h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">
                Configure which events should trigger email notifications
              </p>

              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="notif-new-booking"
                  label={
                    <>
                      <strong>New Booking Notifications</strong>
                      <br />
                      <small className="text-muted">
                        Send email when a new booking is created
                      </small>
                    </>
                  }
                  checked={formData.notificationSettings.newBooking}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notificationSettings: {
                        ...formData.notificationSettings,
                        newBooking: e.target.checked,
                      },
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="notif-cancellation"
                  label={
                    <>
                      <strong>Booking Cancellation Notifications</strong>
                      <br />
                      <small className="text-muted">
                        Send email when a booking is cancelled
                      </small>
                    </>
                  }
                  checked={formData.notificationSettings.bookingCancellation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notificationSettings: {
                        ...formData.notificationSettings,
                        bookingCancellation: e.target.checked,
                      },
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="notif-sync-errors"
                  label={
                    <>
                      <strong>Sync Error Notifications</strong>
                      <br />
                      <small className="text-muted">
                        Send email when platform sync fails
                      </small>
                    </>
                  }
                  checked={formData.notificationSettings.syncErrors}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notificationSettings: {
                        ...formData.notificationSettings,
                        syncErrors: e.target.checked,
                      },
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="notif-daily-summary"
                  label={
                    <>
                      <strong>Daily Summary Emails</strong>
                      <br />
                      <small className="text-muted">
                        Send daily booking summary to administrators
                      </small>
                    </>
                  }
                  checked={formData.notificationSettings.dailySummary}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notificationSettings: {
                        ...formData.notificationSettings,
                        dailySummary: e.target.checked,
                      },
                    })
                  }
                />
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button
                  style={{ background: theme.primary, border: "none" }}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  {loading ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default AdminEmailSettings;
