import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Row, Col, Card, Badge } from "react-bootstrap";
import { FaEnvelope, FaCheck, FaTimes, FaCog, FaInfoCircle } from "react-icons/fa";
import API from "../../services/api";

const EmailConfigForm = ({ onSuccess, onCancel, initialConfig = null }) => {
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
      dailySummary: false
    }
  });

  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [testEmail, setTestEmail] = useState("");

  const providerPresets = {
    gmail: {
      smtpHost: "smtp.gmail.com",
      smtpPort: 587,
      smtpSecure: false,
      info: "Use an App Password for Gmail. Go to Google Account Settings > Security > 2-Step Verification > App Passwords"
    },
    outlook: {
      smtpHost: "smtp-mail.outlook.com",
      smtpPort: 587,
      smtpSecure: false,
      info: "Use your Outlook/Hotmail email and password"
    },
    yahoo: {
      smtpHost: "smtp.mail.yahoo.com",
      smtpPort: 587,
      smtpSecure: false,
      info: "Use an App Password for Yahoo. Go to Account Security > Generate App Password"
    },
    sendgrid: {
      smtpHost: "smtp.sendgrid.net",
      smtpPort: 587,
      smtpSecure: false,
      info: "Use 'apikey' as username and your SendGrid API key as password"
    },
    mailgun: {
      smtpHost: "smtp.mailgun.org",
      smtpPort: 587,
      smtpSecure: false,
      info: "Use your Mailgun SMTP credentials from your domain settings"
    },
    custom: {
      info: "Enter your SMTP server details manually"
    }
  };

  useEffect(() => {
    if (initialConfig) {
      setFormData({
        ...formData,
        ...initialConfig,
        smtpPassword: "", // Don't populate password
        notificationSettings: {
          ...formData.notificationSettings,
          ...initialConfig.notificationSettings
        }
      });
    }
  }, [initialConfig]);

  const handleProviderChange = (provider) => {
    const preset = providerPresets[provider];
    if (preset && provider !== "custom") {
      setFormData({
        ...formData,
        provider,
        smtpHost: preset.smtpHost,
        smtpPort: preset.smtpPort,
        smtpSecure: preset.smtpSecure
      });
    } else {
      setFormData({ ...formData, provider });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("authToken");

      // Validate required fields
      if (!formData.smtpHost || !formData.smtpUser || !formData.fromEmail) {
        throw new Error("Please fill in all required fields");
      }

      // Only require password for new configurations or if changing it
      if (!initialConfig && !formData.smtpPassword) {
        throw new Error("Password is required for new configuration");
      }

      const response = await API.post(
        "/api/email/configure",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess("Email configuration saved successfully!");
        if (onSuccess) {
          onSuccess(response.data.data);
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      setError("Please enter a test email address");
      return;
    }

    setTesting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("authToken");
      const response = await API.post(
        "/api/email/test",
        { toEmail: testEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess(`Test email sent successfully to ${testEmail}!`);
      }
    } catch (error) {
      setError(`Test failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="email-config-form">
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <FaTimes className="me-2" />
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          <FaCheck className="me-2" />
          {success}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Card className="mb-3">
          <Card.Header>
            <h5 className="mb-0">
              <FaEnvelope className="me-2" />
              Email Provider Settings
            </h5>
          </Card.Header>
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Label>Email Provider</Form.Label>
              <Form.Select
                value={formData.provider}
                onChange={(e) => handleProviderChange(e.target.value)}
              >
                <option value="custom">Custom SMTP Server</option>
                <option value="gmail">Gmail</option>
                <option value="outlook">Outlook/Hotmail</option>
                <option value="yahoo">Yahoo Mail</option>
                <option value="sendgrid">SendGrid</option>
                <option value="mailgun">Mailgun</option>
              </Form.Select>
            </Form.Group>

            {providerPresets[formData.provider]?.info && (
              <Alert variant="info" className="mb-3">
                <FaInfoCircle className="me-2" />
                {providerPresets[formData.provider].info}
              </Alert>
            )}

            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>SMTP Host *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="smtp.example.com"
                    value={formData.smtpHost}
                    onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, smtpPort: parseInt(e.target.value) })}
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
                      <Badge bg="info" className="ms-2">Use 'apikey'</Badge>
                    )}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={formData.provider === "sendgrid" ? "apikey" : "your-email@example.com"}
                    value={formData.smtpUser}
                    onChange={(e) => setFormData({ ...formData, smtpUser: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    SMTP Password {initialConfig ? "" : "*"}
                    {formData.provider === "gmail" && (
                      <Badge bg="warning" className="ms-2">App Password</Badge>
                    )}
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder={initialConfig ? "Leave blank to keep current" : "Enter password"}
                    value={formData.smtpPassword}
                    onChange={(e) => setFormData({ ...formData, smtpPassword: e.target.value })}
                    required={!initialConfig}
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
                    onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, smtpSecure: e.target.checked })}
              />
            </Form.Group>
          </Card.Body>
        </Card>

        <Card className="mb-3">
          <Card.Header>
            <h5 className="mb-0">
              <FaCog className="me-2" />
              Notification Preferences
            </h5>
          </Card.Header>
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="notif-new-booking"
                label="Send email for new bookings"
                checked={formData.notificationSettings.newBooking}
                onChange={(e) => setFormData({
                  ...formData,
                  notificationSettings: {
                    ...formData.notificationSettings,
                    newBooking: e.target.checked
                  }
                })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="notif-cancellation"
                label="Send email for booking cancellations"
                checked={formData.notificationSettings.bookingCancellation}
                onChange={(e) => setFormData({
                  ...formData,
                  notificationSettings: {
                    ...formData.notificationSettings,
                    bookingCancellation: e.target.checked
                  }
                })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="notif-sync-errors"
                label="Send email for sync errors"
                checked={formData.notificationSettings.syncErrors}
                onChange={(e) => setFormData({
                  ...formData,
                  notificationSettings: {
                    ...formData.notificationSettings,
                    syncErrors: e.target.checked
                  }
                })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="notif-daily-summary"
                label="Send daily booking summary"
                checked={formData.notificationSettings.dailySummary}
                onChange={(e) => setFormData({
                  ...formData,
                  notificationSettings: {
                    ...formData.notificationSettings,
                    dailySummary: e.target.checked
                  }
                })}
              />
            </Form.Group>
          </Card.Body>
        </Card>

        {initialConfig && (
          <Card className="mb-3">
            <Card.Header>
              <h5 className="mb-0">Test Email Configuration</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={8}>
                  <Form.Control
                    type="email"
                    placeholder="Enter email address to send test email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </Col>
                <Col md={4}>
                  <Button
                    variant="outline-primary"
                    onClick={handleTestEmail}
                    disabled={testing || !testEmail}
                    className="w-100"
                  >
                    {testing ? "Sending..." : "Send Test Email"}
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        <div className="d-flex justify-content-end gap-2">
          {onCancel && (
            <Button variant="secondary" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          )}
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default EmailConfigForm;