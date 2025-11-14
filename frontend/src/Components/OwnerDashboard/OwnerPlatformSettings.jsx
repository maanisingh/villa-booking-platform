import React, { useState, useEffect } from "react";
import { Card, Button, Form, Badge, Alert, Modal, Tab, Tabs, Spinner, Table } from "react-bootstrap";
import { FaAirbnb, FaHotel, FaHome, FaSync, FaCheck, FaTimes, FaPlus, FaTrash, FaCog, FaEnvelope } from "react-icons/fa";
import axios from "axios";

const OwnerPlatformSettings = () => {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailConfig, setEmailConfig] = useState(null);
  const [syncHistory, setSyncHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("integrations");
  const [alert, setAlert] = useState(null);

  // Platform connection form data
  const [connectionForm, setConnectionForm] = useState({
    platform: "",
    credentials: {},
    syncFrequency: 2,
    autoSync: true
  });

  // Email configuration form data
  const [emailForm, setEmailForm] = useState({
    provider: "custom",
    smtpHost: "",
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "",
    fromName: "Villa Booking Platform"
  });

  useEffect(() => {
    fetchPlatforms();
    fetchEmailConfig();
    fetchSyncHistory();
  }, []);

  const fetchPlatforms = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("/api/platforms", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlatforms(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch platforms:", error);
      showAlert("danger", "Failed to fetch platform integrations");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailConfig = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("/api/email/config", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmailConfig(res.data.data);
    } catch (error) {
      console.error("Failed to fetch email config:", error);
    }
  };

  const fetchSyncHistory = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("/api/sync/history?limit=10", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSyncHistory(res.data.data?.logs || []);
    } catch (error) {
      console.error("Failed to fetch sync history:", error);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleSync = async (platform) => {
    setSyncing(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.post(
        `/api/platforms/${platform}/sync`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const result = res.data.data;
      showAlert(
        "success",
        `Synced ${result.newBookings} new bookings, updated ${result.updatedBookings}`
      );

      fetchPlatforms();
      fetchSyncHistory();
    } catch (error) {
      console.error("Sync failed:", error);
      showAlert("danger", `Sync failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.post(
        "/api/platforms/sync-all",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const summary = res.data.data;
      showAlert(
        "success",
        `Synced all platforms: ${summary.totalNewBookings} new, ${summary.totalUpdatedBookings} updated`
      );

      fetchPlatforms();
      fetchSyncHistory();
    } catch (error) {
      console.error("Sync all failed:", error);
      showAlert("danger", `Sync failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleConnect = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.post(
        "/api/platforms/connect",
        connectionForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showAlert("success", `Successfully connected to ${connectionForm.platform}`);
      setShowConnectModal(false);
      fetchPlatforms();

      // Reset form
      setConnectionForm({
        platform: "",
        credentials: {},
        syncFrequency: 2,
        autoSync: true
      });
    } catch (error) {
      console.error("Connection failed:", error);
      showAlert("danger", `Connection failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDisconnect = async (platformId, platformName) => {
    if (!window.confirm(`Are you sure you want to disconnect from ${platformName}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`/api/platforms/${platformId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showAlert("success", `Disconnected from ${platformName}`);
      fetchPlatforms();
    } catch (error) {
      console.error("Disconnect failed:", error);
      showAlert("danger", `Failed to disconnect: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEmailConfig = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.post(
        "/api/email/configure",
        emailForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showAlert("success", "Email configuration saved successfully");
      setShowEmailModal(false);
      fetchEmailConfig();
    } catch (error) {
      console.error("Email config failed:", error);
      showAlert("danger", `Configuration failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleTestEmail = async () => {
    const testEmail = window.prompt("Enter email address to send test email:");
    if (!testEmail) return;

    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        "/api/email/test",
        { toEmail: testEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showAlert("success", `Test email sent to ${testEmail}`);
    } catch (error) {
      console.error("Test email failed:", error);
      showAlert("danger", `Test failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case "airbnb":
        return <FaAirbnb className="text-danger" size={24} />;
      case "booking_com":
        return <FaHotel className="text-primary" size={24} />;
      case "vrbo":
        return <FaHome className="text-info" size={24} />;
      default:
        return <FaCog size={24} />;
    }
  };

  const getPlatformDisplayName = (platform) => {
    switch (platform) {
      case "airbnb":
        return "Airbnb";
      case "booking_com":
        return "Booking.com";
      case "vrbo":
        return "VRBO";
      default:
        return platform;
    }
  };

  const renderPlatformCard = (platform) => {
    const isConnected = platforms.some(p => p.platform === platform);
    const connection = platforms.find(p => p.platform === platform);

    return (
      <Card className="mb-3" key={platform}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              {getPlatformIcon(platform)}
              <div className="ms-3">
                <h5 className="mb-0">{getPlatformDisplayName(platform)}</h5>
                {isConnected ? (
                  <div>
                    <Badge bg="success" className="me-2">Connected</Badge>
                    {connection.autoSync && <Badge bg="info">Auto-sync enabled</Badge>}
                    {connection.lastSync && (
                      <small className="text-muted d-block">
                        Last sync: {new Date(connection.lastSync).toLocaleString()}
                      </small>
                    )}
                  </div>
                ) : (
                  <small className="text-muted">Not connected</small>
                )}
              </div>
            </div>
            <div>
              {isConnected ? (
                <>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="me-2"
                    onClick={() => handleSync(platform)}
                    disabled={syncing}
                  >
                    {syncing ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <>
                        <FaSync className="me-1" /> Sync Now
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => handleDisconnect(connection._id, getPlatformDisplayName(platform))}
                  >
                    <FaTrash className="me-1" /> Disconnect
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setConnectionForm({ ...connectionForm, platform });
                    setShowConnectModal(true);
                  }}
                >
                  <FaPlus className="me-1" /> Connect
                </Button>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  };

  const renderCredentialsForm = () => {
    const platform = connectionForm.platform;
    if (!platform) return null;

    switch (platform) {
      case "airbnb":
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label>API Key</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Airbnb API Key"
                onChange={(e) => setConnectionForm({
                  ...connectionForm,
                  credentials: { ...connectionForm.credentials, apiKey: e.target.value }
                })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>API Secret</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter Airbnb API Secret"
                onChange={(e) => setConnectionForm({
                  ...connectionForm,
                  credentials: { ...connectionForm.credentials, apiSecret: e.target.value }
                })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Access Token</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Access Token"
                onChange={(e) => setConnectionForm({
                  ...connectionForm,
                  credentials: { ...connectionForm.credentials, accessToken: e.target.value }
                })}
              />
            </Form.Group>
          </>
        );

      case "booking_com":
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Partner ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Booking.com Partner ID"
                onChange={(e) => setConnectionForm({
                  ...connectionForm,
                  credentials: { ...connectionForm.credentials, partnerId: e.target.value }
                })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>API Key</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter Booking.com API Key"
                onChange={(e) => setConnectionForm({
                  ...connectionForm,
                  credentials: { ...connectionForm.credentials, apiKey: e.target.value }
                })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Hotel ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Hotel/Property ID"
                onChange={(e) => setConnectionForm({
                  ...connectionForm,
                  credentials: { ...connectionForm.credentials, hotelId: e.target.value }
                })}
              />
            </Form.Group>
          </>
        );

      case "vrbo":
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label>API Key</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter VRBO API Key"
                onChange={(e) => setConnectionForm({
                  ...connectionForm,
                  credentials: { ...connectionForm.credentials, apiKey: e.target.value }
                })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Partner ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter VRBO Partner ID"
                onChange={(e) => setConnectionForm({
                  ...connectionForm,
                  credentials: { ...connectionForm.credentials, partnerId: e.target.value }
                })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Access Token</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Access Token"
                onChange={(e) => setConnectionForm({
                  ...connectionForm,
                  credentials: { ...connectionForm.credentials, accessToken: e.target.value }
                })}
              />
            </Form.Group>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="owner-platform-settings p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Platform Settings</h2>
        {platforms.length > 0 && (
          <Button variant="primary" onClick={handleSyncAll} disabled={syncing}>
            <FaSync className="me-2" />
            Sync All Platforms
          </Button>
        )}
      </div>

      {alert && (
        <Alert variant={alert.type} dismissible onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        <Tab eventKey="integrations" title="Platform Integrations">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p>Loading integrations...</p>
            </div>
          ) : (
            <>
              {renderPlatformCard("airbnb")}
              {renderPlatformCard("booking_com")}
              {renderPlatformCard("vrbo")}
            </>
          )}
        </Tab>

        <Tab eventKey="email" title="Email Configuration">
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5><FaEnvelope className="me-2" />Email Settings</h5>
                {emailConfig ? (
                  <div>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="me-2"
                      onClick={handleTestEmail}
                    >
                      Test Email
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        setEmailForm({
                          ...emailForm,
                          smtpHost: emailConfig.smtpHost || "",
                          smtpPort: emailConfig.smtpPort || 587,
                          smtpUser: emailConfig.smtpUser || "",
                          fromEmail: emailConfig.fromEmail || "",
                          fromName: emailConfig.fromName || ""
                        });
                        setShowEmailModal(true);
                      }}
                    >
                      <FaCog className="me-1" /> Configure
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setShowEmailModal(true)}
                  >
                    <FaPlus className="me-1" /> Setup Email
                  </Button>
                )}
              </div>

              {emailConfig ? (
                <div>
                  <Badge bg={emailConfig.isActive ? "success" : "secondary"} className="mb-2">
                    {emailConfig.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <p><strong>Provider:</strong> {emailConfig.provider}</p>
                  <p><strong>SMTP Host:</strong> {emailConfig.smtpHost}</p>
                  <p><strong>From Email:</strong> {emailConfig.fromEmail}</p>
                </div>
              ) : (
                <Alert variant="info">
                  No email configuration found. Setup email to receive notifications.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="history" title="Sync History">
          {syncHistory.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Platform</th>
                  <th>Status</th>
                  <th>New</th>
                  <th>Updated</th>
                  <th>Errors</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {syncHistory.map((log, index) => (
                  <tr key={index}>
                    <td>{getPlatformDisplayName(log.platform)}</td>
                    <td>
                      <Badge bg={log.status === "success" ? "success" : "danger"}>
                        {log.status}
                      </Badge>
                    </td>
                    <td>{log.newBookings || 0}</td>
                    <td>{log.updatedBookings || 0}</td>
                    <td>{log.errorCount || 0}</td>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant="info">No sync history available</Alert>
          )}
        </Tab>
      </Tabs>

      {/* Connect Platform Modal */}
      <Modal show={showConnectModal} onHide={() => setShowConnectModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Connect to {getPlatformDisplayName(connectionForm.platform)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {renderCredentialsForm()}

            <Form.Group className="mb-3">
              <Form.Label>Sync Frequency (hours)</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max="24"
                value={connectionForm.syncFrequency}
                onChange={(e) => setConnectionForm({
                  ...connectionForm,
                  syncFrequency: parseInt(e.target.value)
                })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                label="Enable automatic sync"
                checked={connectionForm.autoSync}
                onChange={(e) => setConnectionForm({
                  ...connectionForm,
                  autoSync: e.target.checked
                })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConnectModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConnect}>
            Connect
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Email Configuration Modal */}
      <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Email Configuration</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Email Provider</Form.Label>
              <Form.Select
                value={emailForm.provider}
                onChange={(e) => {
                  const provider = e.target.value;
                  setEmailForm({ ...emailForm, provider });

                  // Auto-fill for known providers
                  if (provider === "gmail") {
                    setEmailForm({
                      ...emailForm,
                      provider,
                      smtpHost: "smtp.gmail.com",
                      smtpPort: 587,
                      smtpSecure: false
                    });
                  } else if (provider === "outlook") {
                    setEmailForm({
                      ...emailForm,
                      provider,
                      smtpHost: "smtp-mail.outlook.com",
                      smtpPort: 587,
                      smtpSecure: false
                    });
                  }
                }}
              >
                <option value="custom">Custom SMTP</option>
                <option value="gmail">Gmail</option>
                <option value="outlook">Outlook</option>
                <option value="yahoo">Yahoo</option>
                <option value="sendgrid">SendGrid</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>SMTP Host</Form.Label>
              <Form.Control
                type="text"
                placeholder="smtp.example.com"
                value={emailForm.smtpHost}
                onChange={(e) => setEmailForm({ ...emailForm, smtpHost: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>SMTP Port</Form.Label>
              <Form.Control
                type="number"
                placeholder="587"
                value={emailForm.smtpPort}
                onChange={(e) => setEmailForm({ ...emailForm, smtpPort: parseInt(e.target.value) })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>SMTP Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="your-email@example.com"
                value={emailForm.smtpUser}
                onChange={(e) => setEmailForm({ ...emailForm, smtpUser: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>SMTP Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password or app-specific password"
                value={emailForm.smtpPassword}
                onChange={(e) => setEmailForm({ ...emailForm, smtpPassword: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>From Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="noreply@example.com"
                value={emailForm.fromEmail}
                onChange={(e) => setEmailForm({ ...emailForm, fromEmail: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>From Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Villa Booking Platform"
                value={emailForm.fromName}
                onChange={(e) => setEmailForm({ ...emailForm, fromName: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                label="Use secure connection (TLS/SSL)"
                checked={emailForm.smtpSecure}
                onChange={(e) => setEmailForm({ ...emailForm, smtpSecure: e.target.checked })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEmailModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEmailConfig}>
            Save Configuration
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OwnerPlatformSettings;