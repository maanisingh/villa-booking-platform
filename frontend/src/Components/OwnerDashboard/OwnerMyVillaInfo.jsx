import React, { useState, useEffect } from "react";
import { Container, Form, Button, Alert, Card, Nav, Row, Col, Table, Badge, Modal } from "react-bootstrap";
import API from "../../services/api";
import { FaHome, FaConciergeBell, FaEdit, FaMapMarkerAlt, FaDollarSign } from "react-icons/fa";

const OwnerMyVillaInfo = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [villas, setVillas] = useState([]);
  const [selectedVilla, setSelectedVilla] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [ownerId, setOwnerId] = useState(null);

  // 🟢 LIST: Amenity Options
  const allAmenitiesOptions = [
    "Wifi", "Swimming Pool", "Air Conditioning", "TV",
    "Free Parking", "Kitchen", "Gym", "Hot Water",
    "24/7 Security", "Balcony", "Garden", "Pet Friendly"
  ];

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    price: "",
    amenities: [],
  });

  // === 1. FETCH ALL OWNER'S VILLAS ===
  useEffect(() => {
    const fetchVillas = async () => {
      try {
        // Get owner ID from localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const currentOwnerId = userData._id || userData.id;
        setOwnerId(currentOwnerId);

        const url = `/api/v1/villas/my-villa/${currentOwnerId}`;
        const response = await API.get(url);

        if (response.data.success) {
          setVillas(response.data.villas);
        } else {
          setError("No villas found for your account.");
        }
      } catch (err) {
        console.error(err);
        if (err.response && err.response.status === 404) {
          setError("No villas assigned to your account.");
        } else {
          setError("Failed to load villa details.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchVillas();
  }, []);

  // === 2. OPEN EDIT MODAL ===
  const handleEditVilla = (villa) => {
    setSelectedVilla(villa);
    setFormData({
      name: villa.name || "",
      location: villa.location || "",
      description: villa.description || "",
      price: villa.price || "",
      amenities: villa.amenities || [],
    });
    setShowEditModal(true);
    setActiveTab("general");
  };

  // === 3. SAVE VILLA UPDATES ===
  const handleSave = async () => {
    if (!selectedVilla || !ownerId) {
      alert("Error: No villa selected or owner not identified.");
      return;
    }

    try {
      const url = `/api/v1/villas/my-villa/${selectedVilla._id}`;
      const response = await API.put(url, {
        ...formData,
        ownerId: ownerId // Include ownerId for permission check
      });

      setSuccess("Villa updated successfully! 🎉");

      // Show platform sync results
      if (response.data.platformSync) {
        const syncResults = response.data.platformSync;
        if (syncResults.success && syncResults.success.length > 0) {
          setSuccess(prev => `${prev}\n✅ Synced to: ${syncResults.success.map(s => s.platform).join(', ')}`);
        }
        if (syncResults.failed && syncResults.failed.length > 0) {
          console.warn('Platform sync failures:', syncResults.failed);
        }
      }

      // Update villas list
      setVillas(villas.map(v => v._id === selectedVilla._id ? response.data.villa : v));

      setTimeout(() => {
        setSuccess("");
        setShowEditModal(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      alert("Update Failed! " + (err.response?.data?.message || err.message));
    }
  };

  // === 4. AMENITIES CHECKBOX LOGIC ===
  const handleAmenityToggle = (amenity) => {
    const currentIndex = formData.amenities.indexOf(amenity);
    const newAmenities = [...formData.amenities];

    if (currentIndex === -1) {
      newAmenities.push(amenity);
    } else {
      newAmenities.splice(currentIndex, 1);
    }

    setFormData({ ...formData, amenities: newAmenities });
  };

  if (loading) return <div className="p-5">Loading Villa Information...</div>;

  return (
    <div className="p-4" style={{ backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <Container>
        <h2 className="mb-4 text-primary fw-bold">My Villas</h2>

        {success && <Alert variant="success">{success}</Alert>}
        {error && <Alert variant="warning">{error}</Alert>}

        {/* VILLAS LIST */}
        {villas.length > 0 ? (
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">My Villa Properties ({villas.length})</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Villa Name</th>
                    <th>Location</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Amenities</th>
                    <th>Published To</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {villas.map((villa) => (
                    <tr key={villa._id}>
                      <td>
                        <strong>{villa.name}</strong>
                      </td>
                      <td>
                        <FaMapMarkerAlt className="text-danger me-1" />
                        {villa.location}
                      </td>
                      <td>
                        <FaDollarSign className="text-success" />
                        {villa.price}
                      </td>
                      <td>
                        <Badge bg={villa.status === 'Assigned' ? 'success' : 'warning'}>
                          {villa.status}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg="info" className="me-1">
                          {villa.amenities?.length || 0} Amenities
                        </Badge>
                      </td>
                      <td>
                        {villa.publishedPlatforms?.length > 0 ? (
                          villa.publishedPlatforms.map((platform) => (
                            <Badge bg="success" key={platform} className="me-1">
                              {platform}
                            </Badge>
                          ))
                        ) : (
                          <Badge bg="secondary">Not Published</Badge>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleEditVilla(villa)}
                        >
                          <FaEdit className="me-1" /> Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        ) : (
          <Alert variant="info">
            No villas are currently assigned to your account. Please contact the administrator.
          </Alert>
        )}

        {/* EDIT MODAL */}
        <Modal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>
              <FaHome className="me-2" />
              Edit Villa: {selectedVilla?.name}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {success && <Alert variant="success">{success}</Alert>}

            <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
              <Nav.Item>
                <Nav.Link eventKey="general">
                  <FaHome className="me-2" />General Info
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="amenities">
                  <FaConciergeBell className="me-2" />Amenities
                </Nav.Link>
              </Nav.Item>
            </Nav>

            {/* GENERAL TAB */}
            {activeTab === "general" && (
              <Form>
                <Row className="g-3">
                  <Col md={12}>
                    <Form.Label>Villa Name</Form.Label>
                    <Form.Control
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </Col>
                  <Col md={12}>
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Price</Form.Label>
                    <Form.Control
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </Col>
                  <Col md={12}>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </Col>
                  {selectedVilla?.publishedPlatforms?.length > 0 && (
                    <Col md={12}>
                      <Alert variant="info" className="mb-0">
                        <strong>Note:</strong> This villa is published to{' '}
                        <strong>{selectedVilla.publishedPlatforms.join(', ')}</strong>.
                        Changes will be automatically synced to these platforms.
                      </Alert>
                    </Col>
                  )}
                </Row>
              </Form>
            )}

            {/* AMENITIES TAB */}
            {activeTab === "amenities" && (
              <div>
                <h5 className="mb-3">Select Amenities</h5>
                <Row>
                  {allAmenitiesOptions.map((item) => (
                    <Col md={4} sm={6} key={item} className="mb-3">
                      <div
                        className="p-2 border rounded"
                        style={{
                          backgroundColor: formData.amenities.includes(item) ? '#e3f2fd' : 'white',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => handleAmenityToggle(item)}
                      >
                        <Form.Check
                          type="checkbox"
                          label={item}
                          checked={formData.amenities.includes(item)}
                          onChange={() => {}}
                          style={{ pointerEvents: 'none' }}
                        />
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default OwnerMyVillaInfo;
