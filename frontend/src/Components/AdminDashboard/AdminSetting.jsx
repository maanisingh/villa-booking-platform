import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Form,
  Tabs,
  Tab,
  InputGroup,
  FormControl,
  Image,
  Table,
  Badge,
  Modal,
  Alert,
  Spinner,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faGlobe,
  faLock,
  faBuilding,
  faLink,
  faKey,
  faPlus,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import {
  FaAirbnb,
  FaHotel,
  FaHome,
} from "react-icons/fa";
import axios from "axios";

const theme = {
  primary: "#157feb",
  heading: "#157feb",
  background: "#f4f6f8",
  text: "#1e2a38",
  border: "#e5e7eb",
};

const AdminSetting = () => {
  const [activeTab, setActiveTab] = useState("branding");
  const [subdomain, setSubdomain] = useState("owners");
  const [logoPreview, setLogoPreview] = useState(null);
  const [sslEnabled, setSslEnabled] = useState(true);

  // Platform Credentials state
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [editingCredential, setEditingCredential] = useState(null);
  const [alert, setAlert] = useState(null);
  const [credentialForm, setCredentialForm] = useState({
    platform: "",
    credentialName: "",
    description: "",
    credentials: {}
  });

  const platformTypes = {
    airbnb: {
      name: "Airbnb",
      icon: <FaAirbnb className="text-danger" />,
      color: "#FF5A5F",
      fields: [
        { name: "clientId", label: "Client ID", type: "text", required: true },
        { name: "clientSecret", label: "Client Secret", type: "password", required: true },
        { name: "apiKey", label: "API Key", type: "text", required: false }
      ]
    },
    booking_com: {
      name: "Booking.com",
      icon: <FaHotel className="text-primary" />,
      color: "#003580",
      fields: [
        { name: "hotelId", label: "Hotel ID", type: "text", required: true },
        { name: "apiKey", label: "API Key", type: "password", required: true },
        { name: "partnerId", label: "Partner ID", type: "text", required: false }
      ]
    },
    vrbo: {
      name: "VRBO",
      icon: <FaHome className="text-info" />,
      color: "#2B6CB0",
      fields: [
        { name: "propertyId", label: "Property ID", type: "text", required: true },
        { name: "apiKey", label: "API Key", type: "password", required: true },
        { name: "apiSecret", label: "API Secret", type: "password", required: false }
      ]
    },
    expedia: {
      name: "Expedia",
      icon: <FaHome className="text-warning" />,
      color: "#FFC72C",
      fields: [
        { name: "propertyId", label: "Property ID", type: "text", required: true },
        { name: "username", label: "Username", type: "text", required: true },
        { name: "password", label: "Password", type: "password", required: true },
        { name: "apiKey", label: "API Key", type: "password", required: false }
      ]
    }
  };

  // ✅ Load saved logo from localStorage on first render
  useEffect(() => {
    const savedLogo = localStorage.getItem("savedLogo");
    if (savedLogo) {
      setLogoPreview(savedLogo);
    }
  }, []);

  // Fetch platform credentials when Platform Credentials tab is active
  useEffect(() => {
    if (activeTab === "credentials") {
      fetchCredentials();
    }
  }, [activeTab]);

  const fetchCredentials = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get("/api/admin/platform-credentials", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCredentials(response.data.data || []);
    } catch (error) {
      console.error("Error fetching credentials:", error);
      showAlert("danger", "Failed to load platform credentials");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleShowAddCredential = () => {
    setEditingCredential(null);
    setCredentialForm({
      platform: "",
      credentialName: "",
      description: "",
      credentials: {}
    });
    setShowCredentialModal(true);
  };

  const handleShowEditCredential = (credential) => {
    setEditingCredential(credential);
    setCredentialForm({
      platform: credential.platform,
      credentialName: credential.credentialName,
      description: credential.description || "",
      credentials: {} // Don't load existing credentials for security
    });
    setShowCredentialModal(true);
  };

  const handlePlatformChange = (platform) => {
    setCredentialForm({
      ...credentialForm,
      platform,
      credentials: {}
    });
  };

  const handleCredentialFieldChange = (field, value) => {
    setCredentialForm({
      ...credentialForm,
      credentials: {
        ...credentialForm.credentials,
        [field]: value
      }
    });
  };

  const handleSaveCredential = async () => {
    try {
      if (!credentialForm.platform || !credentialForm.credentialName) {
        showAlert("warning", "Please provide platform and credential name");
        return;
      }

      // Validate required fields
      if (credentialForm.platform && platformTypes[credentialForm.platform]) {
        const platform = platformTypes[credentialForm.platform];
        const requiredFields = platform.fields.filter(f => f.required);
        const missingFields = requiredFields.filter(f => !credentialForm.credentials[f.name]);

        if (missingFields.length > 0 && !editingCredential) {
          showAlert("warning", `Please fill in all required fields: ${missingFields.map(f => f.label).join(", ")}`);
          return;
        }
      }

      const token = localStorage.getItem("authToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingCredential) {
        // Update existing credential
        const updateData = {
          credentialName: credentialForm.credentialName,
          description: credentialForm.description
        };

        // Only include credentials if any were entered
        if (Object.keys(credentialForm.credentials).length > 0) {
          updateData.credentials = credentialForm.credentials;
        }

        await axios.put(
          `/api/admin/platform-credentials/${editingCredential._id}`,
          updateData,
          config
        );
        showAlert("success", "Credentials updated successfully!");
      } else {
        // Create new credential
        await axios.post(
          "/api/admin/platform-credentials",
          credentialForm,
          config
        );
        showAlert("success", "Credentials added successfully!");
      }

      setShowCredentialModal(false);
      fetchCredentials();
    } catch (error) {
      console.error("Error saving credential:", error);
      showAlert("danger", error.response?.data?.message || "Failed to save credentials");
    }
  };

  const handleDeleteCredential = async (credentialId, credentialName) => {
    if (!window.confirm(`Are you sure you want to delete "${credentialName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`/api/admin/platform-credentials/${credentialId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showAlert("success", "Credentials deleted successfully!");
      fetchCredentials();
    } catch (error) {
      console.error("Error deleting credential:", error);
      showAlert("danger", "Failed to delete credentials");
    }
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

  // ✅ Convert file to Base64
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  // ✅ Handle logo selection
  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await getBase64(file);
      setLogoPreview(base64);
    }
  };

  // ✅ Save logo permanently in localStorage
  const handleSaveLogo = () => {
    if (logoPreview) {
      localStorage.setItem("savedLogo", logoPreview);
      alert("✅ Logo saved permanently!");
    } else {
      alert("Please select a logo first!");
    }
  };

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
          <h1 style={{ color: theme.heading, fontWeight: "bold" }}>Settings</h1>
          <p className="text-muted">
            Manage your property management system settings.
          </p>
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
        fill
      >
        {/* ========== Branding Tab ========== */}
        <Tab
          eventKey="branding"
          title={
            <span>
              <FontAwesomeIcon icon={faBuilding} className="me-2" /> Branding
            </span>
          }
        >
          <Card style={{ border: `1px solid ${theme.border}` }}>
            <Card.Header style={{ background: "white" }}>
              <h5 style={{ color: theme.text }}>Branding & Logo</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                {/* Left - Logo Preview */}
                <Col md={4} className="text-center">
                  <Card
                    className="p-3 d-flex flex-column align-items-center justify-content-center"
                    style={{
                      border: `2px dashed ${theme.border}`,
                      minHeight: "250px",
                    }}
                  >
                    {logoPreview ? (
                      <Image
                        src={logoPreview}
                        fluid
                        rounded
                        style={{ maxHeight: "150px" }}
                      />
                    ) : (
                      <Image
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
                        roundedCircle
                        style={{ width: "150px", height: "150px" }}
                        alt="Default Avatar"
                      />
                    )}
                    <small className="text-muted mt-3">
                      Allowed *.jpeg, *.jpg, *.png, *.gif
                    </small>
                    <small className="text-muted">Max size of 3 MB</small>
                  </Card>
                </Col>

                {/* Right - Upload and Save */}
                <Col md={8}>
                  <Form.Group controlId="formFile" className="mb-3">
                    <Form.Label>Upload Logo</Form.Label>
                    <Form.Control type="file" onChange={handleLogoChange} />
                  </Form.Group>
                  <p className="text-muted small">
                    This logo will appear on login screens and headers for both
                    Admin & Owner panels.
                  </p>
                  <Button
                    style={{ background: theme.primary, border: "none" }}
                    className="mt-3"
                    onClick={handleSaveLogo}
                  >
                    <FontAwesomeIcon icon={faUpload} className="me-2" />
                    Save Logo
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>

        {/* ========== Domain & SSL Tab ========== */}
        <Tab
          eventKey="domain"
          title={
            <span>
              <FontAwesomeIcon icon={faGlobe} className="me-2" /> Domain & SSL
            </span>
          }
        >
          {/* Subdomain */}
          <Card style={{ border: `1px solid ${theme.border}` }} className="mb-4">
            <Card.Header style={{ background: "white" }}>
              <h5 style={{ color: theme.text }}>Subdomain</h5>
            </Card.Header>
            <Card.Body>
              <p>Set up the subdomain for your owner portal.</p>
              <Form.Label>Owner Portal URL</Form.Label>
              <InputGroup className="mb-3">
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faLink} />
                </InputGroup.Text>
                <FormControl
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  placeholder="owners"
                />
                <InputGroup.Text>.mywebsite.com</InputGroup.Text>
              </InputGroup>
              <Button
                style={{ background: theme.primary, border: "none" }}
                onClick={() => alert(`Subdomain saved: ${subdomain}`)}
              >
                Save Subdomain
              </Button>
            </Card.Body>
          </Card>

          {/* SSL */}
          <Card style={{ border: `1px solid ${theme.border}` }}>
            <Card.Header style={{ background: "white" }}>
              <h5 style={{ color: theme.text }}>Security</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group as={Row} className="align-items-center">
                <Col sm={9}>
                  <Form.Label className="mb-0">
                    <FontAwesomeIcon
                      icon={faLock}
                      className="me-2"
                      style={{
                        color: sslEnabled ? theme.primary : theme.text,
                      }}
                    />
                    <strong>Enable SSL (Recommended)</strong>
                    <p className="text-muted small mb-0">
                      Ensures your connection to the owner portal is secure
                      (HTTPS).
                    </p>
                  </Form.Label>
                </Col>
                <Col sm={3} className="d-flex justify-content-end">
                  <Form.Check
                    type="switch"
                    id="ssl-switch"
                    checked={sslEnabled}
                    onChange={() => setSslEnabled(!sslEnabled)}
                  />
                </Col>
              </Form.Group>
            </Card.Body>
          </Card>
        </Tab>

        {/* ========== Platform Credentials Tab ========== */}
        <Tab
          eventKey="credentials"
          title={
            <span>
              <FontAwesomeIcon icon={faKey} className="me-2" /> Platform Credentials
            </span>
          }
        >
          <Card style={{ border: `1px solid ${theme.border}` }}>
            <Card.Header style={{ background: "white" }}>
              <Row className="align-items-center">
                <Col>
                  <h5 style={{ color: theme.text, marginBottom: 0 }}>Platform API Credentials</h5>
                  <p className="text-muted small mb-0">
                    Store platform credentials once, reuse them across multiple villas
                  </p>
                </Col>
                <Col xs="auto">
                  <Button
                    style={{ background: theme.primary, border: "none" }}
                    size="sm"
                    onClick={handleShowAddCredential}
                  >
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Add Credentials
                  </Button>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              {alert && (
                <Alert variant={alert.type} dismissible onClose={() => setAlert(null)}>
                  {alert.message}
                </Alert>
              )}

              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" />
                  <p className="mt-3">Loading credentials...</p>
                </div>
              ) : credentials.length === 0 ? (
                <div className="text-center py-5">
                  <FontAwesomeIcon icon={faKey} size="3x" className="text-muted mb-3" />
                  <h5>No Platform Credentials</h5>
                  <p className="text-muted">Click "Add Credentials" to store API credentials for reuse</p>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Platform</th>
                      <th>Credential Name</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {credentials.map((cred) => (
                      <tr key={cred._id}>
                        <td>{getPlatformBadge(cred.platform)}</td>
                        <td><strong>{cred.credentialName}</strong></td>
                        <td>{cred.description || "-"}</td>
                        <td>
                          {cred.isActive ? (
                            <Badge bg="success">Active</Badge>
                          ) : (
                            <Badge bg="secondary">Inactive</Badge>
                          )}
                        </td>
                        <td>{new Date(cred.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            className="me-2"
                            onClick={() => handleShowEditCredential(cred)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDeleteCredential(cred._id, cred.credentialName)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Platform Credentials Modal */}
      <Modal show={showCredentialModal} onHide={() => setShowCredentialModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCredential ? "Edit Platform Credentials" : "Add Platform Credentials"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Platform *</Form.Label>
              <Form.Select
                value={credentialForm.platform}
                onChange={(e) => handlePlatformChange(e.target.value)}
                disabled={!!editingCredential}
              >
                <option value="">Choose a platform...</option>
                {Object.entries(platformTypes).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Credential Name *</Form.Label>
              <Form.Control
                type="text"
                value={credentialForm.credentialName}
                onChange={(e) => setCredentialForm({ ...credentialForm, credentialName: e.target.value })}
                placeholder="e.g., Main Airbnb Account, Backup Booking.com"
              />
              <Form.Text className="text-muted">
                A friendly name to identify these credentials
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={credentialForm.description}
                onChange={(e) => setCredentialForm({ ...credentialForm, description: e.target.value })}
                placeholder="Optional notes about these credentials"
              />
            </Form.Group>

            {credentialForm.platform && platformTypes[credentialForm.platform] && (
              <>
                <hr />
                <h6 className="mb-3">Platform Credentials</h6>
                {editingCredential && (
                  <Alert variant="info">
                    Leave fields empty to keep existing values. Only fill in fields you want to update.
                  </Alert>
                )}
                {platformTypes[credentialForm.platform].fields.map((field) => (
                  <Form.Group key={field.name} className="mb-3">
                    <Form.Label>
                      {field.label} {field.required && !editingCredential && <span className="text-danger">*</span>}
                    </Form.Label>
                    <Form.Control
                      type={field.type}
                      value={credentialForm.credentials[field.name] || ""}
                      onChange={(e) => handleCredentialFieldChange(field.name, e.target.value)}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  </Form.Group>
                ))}
              </>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCredentialModal(false)}>
            Cancel
          </Button>
          <Button
            style={{ background: theme.primary, border: "none" }}
            onClick={handleSaveCredential}
          >
            {editingCredential ? "Update Credentials" : "Add Credentials"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminSetting;
