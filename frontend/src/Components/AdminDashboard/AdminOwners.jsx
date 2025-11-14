import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  InputGroup,
  FormControl,
  Nav,
  Modal,
  Form,
  Spinner,
  Alert,
  Image,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faPencilAlt,
  faTrash,
  faSync,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

// 🎨 Theme Colors
const theme = {
  primary: "#157feb",
  heading: "#157feb",
  background: "#f4f6f8",
};

// 🏷️ Status Badge Colors
const getStatusBadge = (status) => {
  if (!status) return "secondary";
  switch (status.toLowerCase()) {
    case "active":
      return "success";
    case "pending":
      return "warning";
    case "banned":
      return "danger";
    default:
      return "secondary";
  }
};

// Country codes list
const countryCodes = [
  { code: "+1", country: "USA/Canada" },
  { code: "+44", country: "UK" },
  { code: "+91", country: "India" },
  { code: "+86", country: "China" },
  { code: "+81", country: "Japan" },
  { code: "+82", country: "South Korea" },
  { code: "+61", country: "Australia" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
  { code: "+34", country: "Spain" },
  { code: "+39", country: "Italy" },
  { code: "+7", country: "Russia" },
  { code: "+55", country: "Brazil" },
  { code: "+52", country: "Mexico" },
  { code: "+27", country: "South Africa" },
  { code: "+20", country: "Egypt" },
  { code: "+234", country: "Nigeria" },
  { code: "+31", country: "Netherlands" },
  { code: "+46", country: "Sweden" },
  { code: "+47", country: "Norway" },
  { code: "+358", country: "Finland" },
  { code: "+45", country: "Denmark" },
  { code: "+41", country: "Switzerland" },
  { code: "+43", country: "Austria" },
  { code: "+48", country: "Poland" },
  { code: "+420", country: "Czech Republic" },
  { code: "+351", country: "Portugal" },
  { code: "+30", country: "Greece" },
  { code: "+90", country: "Turkey" },
  { code: "+966", country: "Saudi Arabia" },
  { code: "+971", country: "UAE" },
  { code: "+968", country: "Oman" },
  { code: "+973", country: "Bahrain" },
  { code: "+974", country: "Qatar" },
  { code: "+965", country: "Kuwait" },
  { code: "+962", country: "Jordan" },
  { code: "+961", country: "Lebanon" },
  { code: "+963", country: "Syria" },
  { code: "+964", country: "Iraq" },
  { code: "+98", country: "Iran" },
  { code: "+93", country: "Afghanistan" },
  { code: "+92", country: "Pakistan" },
  { code: "+880", country: "Bangladesh" },
  { code: "+94", country: "Sri Lanka" },
  { code: "+977", country: "Nepal" },
  { code: "+975", country: "Bhutan" },
  { code: "+60", country: "Malaysia" },
  { code: "+65", country: "Singapore" },
  { code: "+62", country: "Indonesia" },
  { code: "+63", country: "Philippines" },
  { code: "+66", country: "Thailand" },
  { code: "+84", country: "Vietnam" },
  { code: "+855", country: "Cambodia" },
  { code: "+856", country: "Laos" },
  { code: "+95", country: "Myanmar" },
  { code: "+673", country: "Brunei" },
  { code: "+670", country: "East Timor" },
  { code: "+675", country: "Papua New Guinea" },
  { code: "+679", country: "Fiji" },
  { code: "+682", country: "Cook Islands" },
  { code: "+685", country: "Samoa" },
  { code: "+686", country: "Kiribati" },
  { code: "+687", country: "New Caledonia" },
  { code: "+688", country: "Tuvalu" },
  { code: "+689", country: "French Polynesia" },
  { code: "+690", country: "Tokelau" },
  { code: "+691", country: "Micronesia" },
  { code: "+692", country: "Marshall Islands" },
  { code: "+850", country: "North Korea" },
  { code: "+852", country: "Hong Kong" },
  { code: "+853", country: "Macau" },
  { code: "+855", country: "Cambodia" },
  { code: "+856", country: "Laos" },
  { code: "+880", country: "Bangladesh" },
  { code: "+886", country: "Taiwan" },
  { code: "+960", country: "Maldives" },
  { code: "+961", country: "Lebanon" },
  { code: "+962", country: "Jordan" },
  { code: "+963", country: "Syria" },
  { code: "+964", country: "Iraq" },
  { code: "+965", country: "Kuwait" },
  { code: "+966", country: "Saudi Arabia" },
  { code: "+967", country: "Yemen" },
  { code: "+968", country: "Oman" },
  { code: "+970", country: "Palestine" },
  { code: "+971", country: "UAE" },
  { code: "+972", country: "Israel" },
  { code: "+973", country: "Bahrain" },
  { code: "+974", country: "Qatar" },
  { code: "+975", country: "Bhutan" },
  { code: "+976", country: "Mongolia" },
  { code: "+977", country: "Nepal" },
  { code: "+992", country: "Tajikistan" },
  { code: "+993", country: "Turkmenistan" },
  { code: "+994", country: "Azerbaijan" },
  { code: "+995", country: "Georgia" },
  { code: "+996", country: "Kyrgyzstan" },
  { code: "+998", country: "Uzbekistan" },
];

// 🧩 Modal for Create/Edit Owner
const OwnerModal = ({ show, handleClose, isEditMode, ownerData, handleSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    countryCode: "+1", // Default country code
    phoneNumber: "",
    assignedVilla: "",
    status: "Pending",
    image: "",
  });

  useEffect(() => {
    if (ownerData) {
      // If ownerData exists, check if it has a countryCode or if phoneNumber already includes it
      if (ownerData.countryCode) {
        setFormData(ownerData);
      } else if (ownerData.phoneNumber && ownerData.phoneNumber.startsWith('+')) {
        // Try to extract country code from phone number if it's included
        const phoneParts = ownerData.phoneNumber.split(' ');
        if (phoneParts.length > 1) {
          setFormData({
            ...ownerData,
            countryCode: phoneParts[0],
            phoneNumber: phoneParts.slice(1).join(' ')
          });
        } else {
          // Fallback to default country code
          setFormData({
            ...ownerData,
            countryCode: "+1",
            phoneNumber: ownerData.phoneNumber.replace(/^\+\d+\s?/, '')
          });
        }
      } else {
        // Fallback to default country code
        setFormData({
          ...ownerData,
          countryCode: "+1"
        });
      }
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        countryCode: "+1", // Default country code
        phoneNumber: "",
        assignedVilla: "",
        status: "Pending",
        image: "",
      });
    }
  }, [ownerData]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Combine country code and phone number for submission
    const dataToSubmit = {
      ...formData,
      phoneNumber: `${formData.countryCode} ${formData.phoneNumber}`
    };
    handleSave(dataToSubmit);
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ color: theme.heading }}>
          {isEditMode ? "Edit Owner" : "Add Owner"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter owner name"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required={!isEditMode}
            />
            {isEditMode && (
              <Form.Text className="text-muted">
                Leave blank to keep existing password
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <InputGroup>
              <Form.Select
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                style={{ maxWidth: "120px" }}
              >
                {countryCodes.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.code}
                  </option>
                ))}
              </Form.Select>
              <Form.Control
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
              />
            </InputGroup>
            <Form.Text className="text-muted">
              Select country code and enter your phone number
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Assigned Villa</Form.Label>
            <Form.Control
              name="assignedVilla"
              value={formData.assignedVilla}
              onChange={handleChange}
              placeholder="Enter assigned villa"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Banned">Banned</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Profile Image URL</Form.Label>
            <Form.Control
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="Paste image URL (optional)"
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            style={{ background: theme.primary, border: "none" }}
            type="submit"
          >
            {isEditMode ? "Save Changes" : "Create Owner"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

// 📋 Main AdminOwners Component
const AdminOwners = () => {
  const [owners, setOwners] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentOwner, setCurrentOwner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const BASE_URL = "/api/owners";

  // Fetch All Owners
  const fetchOwners = async () => {
    setLoading(true);
    try {
      const res = await axios.get(BASE_URL);
      if (res.data.success) setOwners(res.data.data);
      else setMessage({ type: "danger", text: res.data.message });
    } catch (err) {
      setMessage({
        type: "danger",
        text: err.response?.data?.message || "Failed to load owners.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  // Create or Edit Owner
  const handleSave = async (formData) => {
    try {
      if (isEditMode) {
        await axios.put(`${BASE_URL}/${currentOwner._id}`, formData);
        setMessage({ type: "success", text: "Owner updated successfully." });
      } else {
        await axios.post(`${BASE_URL}/create`, formData);
        setMessage({ type: "success", text: "Owner added successfully." });
      }
      setShowModal(false);
      fetchOwners();
    } catch (err) {
      setMessage({
        type: "danger",
        text: err.response?.data?.message || "Something went wrong.",
      });
    }
  };

  // Delete Owner
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this owner?")) {
      try {
        await axios.delete(`${BASE_URL}/${id}`);
        setMessage({ type: "success", text: "Owner deleted successfully." });
        fetchOwners();
      } catch (err) {
        setMessage({
          type: "danger",
          text: err.response?.data?.message || "Failed to delete owner.",
        });
      }
    }
  };

  // Format phone number for display
  const formatPhoneNumber = (owner) => {
    if (!owner.phoneNumber) return "—";
    
    // If phone number already includes country code, format it properly
    if (owner.phoneNumber.startsWith('+')) {
      const parts = owner.phoneNumber.split(' ');
      if (parts.length > 1) {
        return `${parts[0]} ${parts.slice(1).join(' ')}`;
      } else {
        // If there's no space after country code, try to find a common split point
        const countryCode = owner.phoneNumber.substring(0, 3);
        const number = owner.phoneNumber.substring(3);
        return `${countryCode} ${number}`;
      }
    }
    
    // If phone number doesn't include country code, use default or try to extract from owner data
    if (owner.countryCode) {
      return `${owner.countryCode} ${owner.phoneNumber}`;
    }
    
    // Default case
    return `+1 ${owner.phoneNumber}`;
  };

  // Filter + Search
  const filteredOwners = owners.filter((owner) => {
    const statusMatch =
      activeTab === "All" || owner.status === activeTab;
    const searchMatch =
      owner.name.toLowerCase().includes(search.toLowerCase()) ||
      owner.email?.toLowerCase().includes(search.toLowerCase()) ||
      owner.phoneNumber?.includes(search);
    return statusMatch && searchMatch;
  });

  return (
    <div style={{ background: theme.background, minHeight: "100vh", padding: "20px" }}>
      {/* Header */}
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 style={{ color: theme.heading, fontWeight: "bold" }}>Owners Management</h2>
        </Col>
        <Col className="text-end">
          <Button
            variant="outline-primary"
            className="me-2"
            onClick={fetchOwners}
          >
            <FontAwesomeIcon icon={faSync} className="me-2" /> Refresh
          </Button>
          <Button
            style={{ background: theme.primary, border: "none" }}
            onClick={() => {
              setIsEditMode(false);
              setCurrentOwner(null);
              setShowModal(true);
            }}
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" /> Add Owner
          </Button>
        </Col>
      </Row>

      {message.text && (
        <Alert
          variant={message.type}
          onClose={() => setMessage({ type: "", text: "" })}
          dismissible
        >
          {message.text}
        </Alert>
      )}

      {/* Tabs & Search */}
      <Card className="mb-4">
        <Card.Header>
          <Nav
            variant="tabs"
            activeKey={activeTab}
            onSelect={(key) => setActiveTab(key)}
          >
            {["All", "Active", "Pending", "Banned"].map((status) => (
              <Nav.Item key={status}>
                <Nav.Link eventKey={status}>
                  {status}{" "}
                  {status === "All" && (
                    <Badge pill bg="secondary">
                      {owners.length}
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </Card.Header>
        <Card.Body>
          <InputGroup>
            <InputGroup.Text style={{ borderRight: "none", background: "white" }}>
              <FontAwesomeIcon icon={faSearch} style={{ color: theme.primary }} />
            </InputGroup.Text>
            <FormControl
              placeholder="Search by name, email, or phone number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ borderLeft: "none" }}
            />
          </InputGroup>
        </Card.Body>
      </Card>

      {/* Owners Table */}
      <Card>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Table responsive hover className="align-middle mb-0">
              <thead style={{ background: "#f8fafc" }}>
                <tr>
                  <th>Name</th>
                  <th>Phone Number</th>
                  <th>Assigned Villa</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOwners.length > 0 ? (
                  filteredOwners.map((owner) => (
                    <tr key={owner._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <Image
                            src={
                              owner.image ||
                              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                            }
                            roundedCircle
                            width="45"
                            height="45"
                            className="me-3"
                          />
                          <div>
                            <div
                              style={{
                                fontWeight: "600",
                                fontSize: "15px",
                                color: "#1e293b",
                              }}
                            >
                              {owner.name}
                            </div>
                            <div style={{ fontSize: "13px", color: "#64748b" }}>
                              {owner.email || "—"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{formatPhoneNumber(owner)}</td>
                      <td>{owner.assignedVilla}</td>
                      <td>
                        <Badge
                          bg={getStatusBadge(owner.status)}
                          text={getStatusBadge(owner.status) === "warning" ? "dark" : "light"}
                        >
                          {owner.status}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => {
                            setIsEditMode(true);
                            setCurrentOwner(owner);
                            setShowModal(true);
                          }}
                        >
                          <FontAwesomeIcon icon={faPencilAlt} /> Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(owner._id)}
                        >
                          <FontAwesomeIcon icon={faTrash} /> Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center p-4">
                      No owners found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <OwnerModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleSave={handleSave}
        isEditMode={isEditMode}
        ownerData={currentOwner}
      />
    </div>
  );
};

export default AdminOwners;