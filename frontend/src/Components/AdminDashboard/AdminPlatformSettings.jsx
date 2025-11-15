import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Tab,
  Tabs,
  Alert,
  Spinner,
  Modal,
  Form
} from "react-bootstrap";
import {
  FaSync,
  FaUsers,
  FaAirbnb,
  FaHotel,
  FaHome,
  FaCog,
  FaChartLine,
  FaExclamationTriangle,
  FaCheck,
  FaEnvelope
} from "react-icons/fa";
import API from "../../services/api";
import EmailConfigForm from "../Shared/EmailConfigForm";

const AdminPlatformSettings = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalOwners: 0,
    totalIntegrations: 0,
    activeIntegrations: 0,
    totalSyncs: 0,
    totalBookingsSynced: 0
  });
  const [ownerIntegrations, setOwnerIntegrations] = useState([]);
  const [syncLogs, setSyncLogs] = useState([]);
  const [emailConfig, setEmailConfig] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      // Fetch admin statistics (would need admin-specific endpoints)
      // For now, using mock data
      setStats({
        totalOwners: 25,
        totalIntegrations: 18,
        activeIntegrations: 15,
        totalSyncs: 1250,
        totalBookingsSynced: 3420
      });

      // Mock owner integrations data
      setOwnerIntegrations([
        {
          ownerId: "owner1",
          ownerName: "John Doe",
          ownerEmail: "john@example.com",
          integrations: [
            { platform: "airbnb", status: "active", lastSync: new Date(), bookings: 45 },
            { platform: "booking_com", status: "active", lastSync: new Date(), bookings: 32 }
          ]
        },
        {
          ownerId: "owner2",
          ownerName: "Jane Smith",
          ownerEmail: "jane@example.com",
          integrations: [
            { platform: "vrbo", status: "active", lastSync: new Date(), bookings: 28 }
          ]
        }
      ]);

      // Mock sync logs
      setSyncLogs([
        {
          id: "log1",
          ownerName: "John Doe",
          platform: "airbnb",
          status: "success",
          newBookings: 3,
          updatedBookings: 2,
          timestamp: new Date()
        },
        {
          id: "log2",
          ownerName: "Jane Smith",
          platform: "vrbo",
          status: "failed",
          error: "Authentication failed",
          timestamp: new Date(Date.now() - 3600000)
        }
      ]);

      // Fetch email config
      fetchEmailConfig();
    } catch (error) {
      console.error("Error fetching overview data:", error);
      showAlert("danger", "Failed to load platform data");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailConfig = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await API.get("/api/email/config", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmailConfig(res.data.data);
    } catch (error) {
      console.error("Failed to fetch email config:", error);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleManualSyncAll = async () => {
    if (!window.confirm("This will sync all active integrations. Continue?")) {
      return;
    }

    try {
      showAlert("info", "Starting sync for all active integrations...");
      // Would call admin endpoint to trigger sync for all users
      // await API.post("/api/admin/sync-all");
      showAlert("success", "Sync initiated for all active integrations");
    } catch (error) {
      showAlert("danger", "Failed to initiate sync");
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case "airbnb":
        return <FaAirbnb className="text-danger" />;
      case "booking_com":
        return <FaHotel className="text-primary" />;
      case "vrbo":
        return <FaHome className="text-info" />;
      default:
        return <FaCog />;
    }
  };

  const renderOverviewTab = () => (
    <Row>
      <Col md={3} className="mb-3">
        <Card className="text-center">
          <Card.Body>
            <FaUsers size={32} className="text-primary mb-2" />
            <h3>{stats.totalOwners}</h3>
            <p className="text-muted mb-0">Total Owners</p>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3} className="mb-3">
        <Card className="text-center">
          <Card.Body>
            <FaCog size={32} className="text-info mb-2" />
            <h3>{stats.activeIntegrations}</h3>
            <p className="text-muted mb-0">Active Integrations</p>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3} className="mb-3">
        <Card className="text-center">
          <Card.Body>
            <FaSync size={32} className="text-success mb-2" />
            <h3>{stats.totalSyncs}</h3>
            <p className="text-muted mb-0">Total Syncs</p>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3} className="mb-3">
        <Card className="text-center">
          <Card.Body>
            <FaChartLine size={32} className="text-warning mb-2" />
            <h3>{stats.totalBookingsSynced}</h3>
            <p className="text-muted mb-0">Bookings Synced</p>
          </Card.Body>
        </Card>
      </Col>

      <Col xs={12}>
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Platform Distribution</h5>
            <Button
              size="sm"
              variant="primary"
              onClick={handleManualSyncAll}
            >
              <FaSync className="me-1" />
              Sync All Platforms
            </Button>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <div className="d-flex align-items-center mb-2">
                  <FaAirbnb className="text-danger me-2" size={24} />
                  <div>
                    <strong>Airbnb</strong>
                    <div className="text-muted">8 active integrations</div>
                  </div>
                </div>
              </Col>
              <Col md={4}>
                <div className="d-flex align-items-center mb-2">
                  <FaHotel className="text-primary me-2" size={24} />
                  <div>
                    <strong>Booking.com</strong>
                    <div className="text-muted">5 active integrations</div>
                  </div>
                </div>
              </Col>
              <Col md={4}>
                <div className="d-flex align-items-center mb-2">
                  <FaHome className="text-info me-2" size={24} />
                  <div>
                    <strong>VRBO</strong>
                    <div className="text-muted">2 active integrations</div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  const renderOwnersTab = () => (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Owner Integrations</h5>
      </Card.Header>
      <Card.Body>
        <Table responsive hover>
          <thead>
            <tr>
              <th>Owner</th>
              <th>Email</th>
              <th>Platforms</th>
              <th>Total Bookings</th>
              <th>Last Sync</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ownerIntegrations.map((owner) => (
              <tr key={owner.ownerId}>
                <td>{owner.ownerName}</td>
                <td>{owner.ownerEmail}</td>
                <td>
                  {owner.integrations.map((integration) => (
                    <Badge
                      key={integration.platform}
                      bg={integration.status === "active" ? "success" : "secondary"}
                      className="me-1"
                    >
                      {getPlatformIcon(integration.platform)}
                      <span className="ms-1">
                        {integration.platform.replace("_", " ")}
                      </span>
                    </Badge>
                  ))}
                </td>
                <td>
                  {owner.integrations.reduce((sum, i) => sum + i.bookings, 0)}
                </td>
                <td>
                  {owner.integrations[0]?.lastSync
                    ? new Date(owner.integrations[0].lastSync).toLocaleString()
                    : "Never"}
                </td>
                <td>
                  <Button size="sm" variant="outline-primary">
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );

  const renderSyncLogsTab = () => (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Recent Sync Activity</h5>
      </Card.Header>
      <Card.Body>
        <Table responsive hover>
          <thead>
            <tr>
              <th>Time</th>
              <th>Owner</th>
              <th>Platform</th>
              <th>Status</th>
              <th>New/Updated</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {syncLogs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.ownerName}</td>
                <td>
                  {getPlatformIcon(log.platform)}
                  <span className="ms-1">{log.platform}</span>
                </td>
                <td>
                  <Badge bg={log.status === "success" ? "success" : "danger"}>
                    {log.status === "success" ? (
                      <><FaCheck className="me-1" />Success</>
                    ) : (
                      <><FaExclamationTriangle className="me-1" />Failed</>
                    )}
                  </Badge>
                </td>
                <td>
                  {log.status === "success" ? (
                    <>
                      {log.newBookings} new / {log.updatedBookings} updated
                    </>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  {log.error && (
                    <small className="text-danger">{log.error}</small>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );

  const renderEmailTab = () => (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <FaEnvelope className="me-2" />
          System Email Configuration
        </h5>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowEmailModal(true)}
        >
          {emailConfig ? "Edit Configuration" : "Configure Email"}
        </Button>
      </Card.Header>
      <Card.Body>
        {emailConfig ? (
          <div>
            <Row>
              <Col md={6}>
                <p><strong>Provider:</strong> {emailConfig.provider}</p>
                <p><strong>SMTP Host:</strong> {emailConfig.smtpHost}</p>
                <p><strong>SMTP Port:</strong> {emailConfig.smtpPort}</p>
              </Col>
              <Col md={6}>
                <p><strong>From Email:</strong> {emailConfig.fromEmail}</p>
                <p><strong>From Name:</strong> {emailConfig.fromName}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <Badge bg={emailConfig.isActive ? "success" : "secondary"}>
                    {emailConfig.isActive ? "Active" : "Inactive"}
                  </Badge>
                </p>
              </Col>
            </Row>

            <hr />

            <h6>Notification Settings</h6>
            <Row>
              <Col md={6}>
                <Form.Check
                  type="switch"
                  label="New booking notifications"
                  checked={emailConfig.notificationSettings?.newBooking}
                  disabled
                />
                <Form.Check
                  type="switch"
                  label="Cancellation notifications"
                  checked={emailConfig.notificationSettings?.bookingCancellation}
                  disabled
                />
              </Col>
              <Col md={6}>
                <Form.Check
                  type="switch"
                  label="Sync error notifications"
                  checked={emailConfig.notificationSettings?.syncErrors}
                  disabled
                />
                <Form.Check
                  type="switch"
                  label="Daily summary emails"
                  checked={emailConfig.notificationSettings?.dailySummary}
                  disabled
                />
              </Col>
            </Row>
          </div>
        ) : (
          <Alert variant="info">
            No email configuration found. Click "Configure Email" to set up email notifications.
          </Alert>
        )}
      </Card.Body>
    </Card>
  );

  return (
    <Container fluid className="admin-platform-settings p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Platform Integration Management</h2>
        <Badge bg="info" pill>
          Admin View
        </Badge>
      </div>

      {alert && (
        <Alert variant={alert.type} dismissible onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p>Loading platform data...</p>
        </div>
      ) : (
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-3"
        >
          <Tab eventKey="overview" title="Overview">
            {renderOverviewTab()}
          </Tab>
          <Tab eventKey="owners" title="Owner Integrations">
            {renderOwnersTab()}
          </Tab>
          <Tab eventKey="logs" title="Sync Logs">
            {renderSyncLogsTab()}
          </Tab>
          <Tab eventKey="email" title="Email Settings">
            {renderEmailTab()}
          </Tab>
        </Tabs>
      )}

      {/* Email Configuration Modal */}
      <Modal
        show={showEmailModal}
        onHide={() => setShowEmailModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>System Email Configuration</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <EmailConfigForm
            initialConfig={emailConfig}
            onSuccess={(config) => {
              setEmailConfig(config);
              setShowEmailModal(false);
              showAlert("success", "Email configuration saved successfully");
            }}
            onCancel={() => setShowEmailModal(false)}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminPlatformSettings;