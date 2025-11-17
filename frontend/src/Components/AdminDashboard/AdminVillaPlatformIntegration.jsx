import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Modal,
  Form,
  Alert,
  Spinner
} from "react-bootstrap";
import {
  FaPlus,
  FaSync,
  FaTrash,
  FaEdit,
  FaAirbnb,
  FaHotel,
  FaHome,
  FaCheck,
  FaTimes,
  FaCog
} from "react-icons/fa";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

const AdminVillaPlatformIntegration = () => {
  const navigate = useNavigate();
  const [villas, setVillas] = useState([]);
  const [owners, setOwners] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [alert, setAlert] = useState(null);

  // Form state - simplified to only use saved credentials
  const [formData, setFormData] = useState({
    villaId: "",
    ownerId: "",
    platform: "",
    credentialId: "",
    autoSync: true
  });

  const [savedCredentials, setSavedCredentials] = useState([]);
  const [loadingCredentials, setLoadingCredentials] = useState(false);

  const platformTypes = {
    airbnb: {
      name: "Airbnb",
      icon: <FaAirbnb className="text-danger" />,
      color: "#FF5A5F"
    },
    booking_com: {
      name: "Booking.com",
      icon: <FaHotel className="text-primary" />,
      color: "#003580"
    },
    vrbo: {
      name: "VRBO/Expedia",
      icon: <FaHome className="text-info" />,
      color: "#2B6CB0"
    },
    expedia: {
      name: "Expedia",
      icon: <FaHome className="text-warning" />,
      color: "#FFC72C"
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch villas, owners, and integrations
      const [villasRes, ownersRes, integrationsRes] = await Promise.all([
        API.get("/v1/villas", config),
        API.get("/owners", config),
        API.get("/admin/villa-integrations", config)
      ]);

      setVillas(villasRes.data.data || villasRes.data || []);
      setOwners(ownersRes.data.data || ownersRes.data || []);
      setIntegrations(integrationsRes.data.data || integrationsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      showAlert("danger", "Failed to load data: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleShowAddModal = () => {
    setFormData({
      villaId: "",
      ownerId: "",
      platform: "",
      credentialId: "",
      autoSync: true
    });
    setSavedCredentials([]);
    setShowAddModal(true);
  };

  const handlePlatformChange = async (platform) => {
    setFormData({
      ...formData,
      platform,
      credentialId: ""
    });

    // Always fetch saved credentials for the selected platform
    if (platform) {
      setLoadingCredentials(true);
      try {
        const token = localStorage.getItem("authToken");
        const response = await API.get(`/admin/platform-credentials/platform/${platform}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSavedCredentials(response.data.data || []);
      } catch (error) {
        console.error("Error fetching saved credentials:", error);
        setSavedCredentials([]);
      } finally {
        setLoadingCredentials(false);
      }
    } else {
      setSavedCredentials([]);
    }
  };

  const handleCredentialSelect = (credentialId) => {
    setFormData({
      ...formData,
      credentialId
    });
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.villaId || !formData.platform) {
        showAlert("warning", "Please select both villa and platform");
        return;
      }

      if (!formData.credentialId) {
        showAlert("warning", "Please select a saved credential");
        return;
      }

      const token = localStorage.getItem("authToken");
      const response = await API.post(
        "/admin/villa-integrations",
        {
          villaId: formData.villaId,
          ownerId: formData.ownerId,
          platform: formData.platform,
          credentialId: formData.credentialId,
          autoSync: formData.autoSync
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showAlert("success", "Platform integration added successfully!");
        setShowAddModal(false);
        fetchData();
      }
    } catch (error) {
      console.error("Error adding integration:", error);
      showAlert("danger", error.response?.data?.message || "Failed to add integration");
    }
  };

  const handleDelete = async (integrationId) => {
    if (!window.confirm("Are you sure you want to remove this integration?")) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      await API.delete(`/admin/villa-integrations/${integrationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showAlert("success", "Integration removed successfully!");
      fetchData();
    } catch (error) {
      console.error("Error deleting integration:", error);
      showAlert("danger", "Failed to remove integration");
    }
  };

  const handleSync = async (integrationId) => {
    try {
      const token = localStorage.getItem("authToken");
      showAlert("info", "Starting sync...");

      await API.post(
        `/admin/villa-integrations/${integrationId}/sync`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showAlert("success", "Sync completed successfully!");
      fetchData();
    } catch (error) {
      console.error("Error syncing:", error);
      showAlert("danger", "Sync failed: " + (error.response?.data?.message || error.message));
    }
  };

  const getVillaName = (villaId) => {
    const villa = villas.find(v => v._id === villaId);
    return villa?.name || villa?.villaName || "Unknown Villa";
  };

  const getOwnerName = (ownerId) => {
    const owner = owners.find(o => o._id === ownerId || o.id === ownerId);
    return owner?.name || owner?.ownerName || "Unknown Owner";
  };

  const getPlatformBadge = (platform) => {
    const config = platformTypes[platform];
    if (!config) return <Badge bg="secondary">{platform}</Badge>;

    return (
      <Badge bg="light" text="dark" className="d-flex align-items-center gap-1">
        {config.icon} {config.name}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: "success", icon: <FaCheck /> },
      inactive: { bg: "secondary", icon: <FaTimes /> },
      error: { bg: "danger", icon: <FaTimes /> },
      pending: { bg: "warning", icon: null }
    };

    const config = statusConfig[status] || statusConfig.inactive;

    return (
      <Badge bg={config.bg}>
        {config.icon} {status?.toUpperCase()}
      </Badge>
    );
  };

  const renderAddModal = () => (
    <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add Villa Integration</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {alert && alert.type === "warning" && (
          <Alert variant={alert.type} dismissible onClose={() => setAlert(null)}>
            {alert.message}
          </Alert>
        )}

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Villa *</Form.Label>
            <Form.Select
              value={formData.villaId}
              onChange={(e) => {
                const villa = villas.find(v => v._id === e.target.value);
                setFormData({
                  ...formData,
                  villaId: e.target.value,
                  ownerId: villa?.ownerId || villa?.owner || ""
                });
              }}
            >
              <option value="">Select Villa</option>
              {villas.map((villa) => (
                <option key={villa._id} value={villa._id}>
                  {villa.name || villa.villaName} - {getOwnerName(villa.ownerId || villa.owner)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Platform *</Form.Label>
            <Form.Select
              value={formData.platform}
              onChange={(e) => handlePlatformChange(e.target.value)}
            >
              <option value="">Select Platform</option>
              {Object.entries(platformTypes).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {formData.platform && (
            <>
              {loadingCredentials ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" />
                  <span className="ms-2">Loading saved credentials...</span>
                </div>
              ) : savedCredentials.length > 0 ? (
                <Form.Group className="mb-3">
                  <Form.Label>Credentials *</Form.Label>
                  <Form.Select
                    value={formData.credentialId}
                    onChange={(e) => handleCredentialSelect(e.target.value)}
                  >
                    <option value="">Select Saved Credentials</option>
                    {savedCredentials.map((cred) => (
                      <option key={cred._id} value={cred._id}>
                        {cred.credentialName} {cred.description && `- ${cred.description}`}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    These credentials are securely stored and managed in Settings.
                  </Form.Text>
                </Form.Group>
              ) : (
                <Alert variant="warning">
                  <Alert.Heading className="h6">
                    <FaCog className="me-2" />
                    No credentials found for {platformTypes[formData.platform].name}
                  </Alert.Heading>
                  <p className="mb-2">
                    Please add credentials in Settings &rarr; Platform Credentials first.
                  </p>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => navigate("/admin-setting")}
                  >
                    <FaCog className="me-2" />
                    Go to Settings
                  </Button>
                </Alert>
              )}

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="auto-sync"
                  label="Enable Auto-sync"
                  checked={formData.autoSync}
                  onChange={(e) => setFormData({ ...formData, autoSync: e.target.checked })}
                />
                <Form.Text className="text-muted">
                  Automatically sync bookings from this platform daily
                </Form.Text>
              </Form.Group>
            </>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowAddModal(false)}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!formData.credentialId}
        >
          Add Integration
        </Button>
      </Modal.Footer>
    </Modal>
  );

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-3">Loading villa integrations...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <h2>Villa Platform Integrations</h2>
          <p className="text-muted">Manage API integrations for each villa</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={handleShowAddModal}>
            <FaPlus className="me-2" />
            Add Integration
          </Button>
        </Col>
      </Row>

      {alert && (
        <Alert variant={alert.type} dismissible onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      <Card>
        <Card.Body>
          {integrations.length === 0 ? (
            <div className="text-center py-5">
              <h5>No integrations found</h5>
              <p className="text-muted">Click "Add Integration" to connect a villa to a platform</p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Villa</th>
                  <th>Owner</th>
                  <th>Platform</th>
                  <th>Status</th>
                  <th>Last Sync</th>
                  <th>Bookings Synced</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {integrations.map((integration) => (
                  <tr key={integration._id}>
                    <td>{getVillaName(integration.villaId)}</td>
                    <td>{getOwnerName(integration.ownerId)}</td>
                    <td>{getPlatformBadge(integration.platform)}</td>
                    <td>{getStatusBadge(integration.status)}</td>
                    <td>
                      {integration.lastSync
                        ? new Date(integration.lastSync).toLocaleString()
                        : "Never"}
                    </td>
                    <td>{integration.totalBookingsSynced || 0}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                        onClick={() => handleSync(integration._id)}
                      >
                        <FaSync /> Sync
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(integration._id)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {renderAddModal()}
    </Container>
  );
};

export default AdminVillaPlatformIntegration;
