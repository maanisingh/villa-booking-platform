import React, { useState, useEffect, useMemo } from "react";
import API from "../../services/api";
import {
  Button,
  Table,
  Modal,
  Form,
  Badge,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import { FaEye, FaEdit, FaTimes, FaPlus } from "react-icons/fa";

const API_URL = "/api/users/bookings";
const VILLAS_API_URL = "/api/v1/villas";

const buttonStyles = {
  base: {
    background: "transparent",
    border: "1px solid",
    borderRadius: "6px",
    padding: "5px 10px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.2s",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
  },
  view: { borderColor: "#157feb", color: "#157feb" },
  edit: { borderColor: "#22c55e", color: "#22c55e" },
  delete: { borderColor: "#ef4444", color: "#ef4444" },
};

const OwnerMyBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [villas, setVillas] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const [newBooking, setNewBooking] = useState({
    villaId: "",
    guestName: "",
    totalFare: "",
    startDate: "",
    endDate: "",
    status: "Confirmed",
    syncToPlatforms: true, // NEW: Default true, but user can uncheck
  });

  // Fetch Owner's Villas
  const fetchOwnerVillas = async () => {
    try {
      const ownerId = localStorage.getItem("userId");
      if (!ownerId) {
        console.error("Owner ID not found in localStorage");
        return;
      }
      const res = await API.get(`${VILLAS_API_URL}/my-villa/${ownerId}`);
      if (res.data.success && res.data.villas) {
        setVillas(res.data.villas);
      }
    } catch (err) {
      console.error("Error fetching owner villas:", err);
      // Don't alert, just log the error
    }
  };

  // Fetch All Bookings
  const fetchBookings = async () => {
    try {
      const res = await API.get(API_URL);
      const data = res.data.data || [];
      const formatted = data.map((b, i) => ({
        ...b,
        readableId: b.readableId || `BK${String(i + 1).padStart(3, "0")}`,
      }));
      setBookings(formatted);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      alert("Failed to load bookings. Please check your backend.");
    }
  };

  useEffect(() => {
    fetchOwnerVillas();
    fetchBookings();
  }, []);

  // Validation
  const validateForm = (data) => {
    const errors = {};
    const name = data.guestName?.trim() || "";
    const villaId = data.villaId || "";
    const startDate = data.startDate || "";
    const endDate = data.endDate || "";
    const totalFare = Number(data.totalFare || 0);

    if (!name) errors.guestName = "Guest name is required.";
    if (!villaId) errors.villaId = "Please select a villa.";
    if (!startDate) errors.startDate = "Start date is required.";
    if (!endDate) errors.endDate = "End date is required.";
    if (startDate && endDate && endDate < startDate) errors.endDate = "End date must be after start date.";
    if (totalFare <= 0) errors.totalFare = "Total fare must be greater than 0.";

    return errors;
  };

  const resetForm = () => {
    setNewBooking({
      villaId: "",
      guestName: "",
      totalFare: "",
      startDate: "",
      endDate: "",
      status: "Confirmed",
      syncToPlatforms: true,
    });
    setFormErrors({});
  };

  // Add Booking
  const handleAddBooking = async () => {
    const errors = validateForm(newBooking);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const ownerId = localStorage.getItem("userId");
      const payload = {
        ...newBooking,
        ownerId,
        totalFare: Number(newBooking.totalFare),
        bookingSource: "Manual",
        syncToPlatforms: newBooking.syncToPlatforms,
      };
      const res = await API.post(API_URL, payload);
      const added = res.data.data;
      added.readableId = `BK${String(bookings.length + 1).padStart(3, "0")}`;
      setBookings((prev) => [...prev, added]);
      setShowAddModal(false);
      resetForm();

      // Show sync status if available
      const syncMessage = res.data.platformSync?.syncedPlatforms > 0
        ? `Booking added and synced to ${res.data.platformSync.syncedPlatforms} platform(s)!`
        : "Booking added successfully!";
      alert(syncMessage);
    } catch (err) {
      console.error("Error adding booking:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to add booking. Check console.");
    }
  };

  // Delete Booking
  const handleDeleteBooking = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    try {
      await API.delete(`${API_URL}/${id}`);
      setBookings((prev) => prev.filter((b) => b._id !== id));
      alert("🗑️ Booking deleted successfully.");
    } catch (err) {
      console.error("❌ Error deleting booking:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to delete booking. Check console.");
    }
  };

  // Edit Booking (open modal)
  const handleEditBooking = (booking) => {
    // normalize dates to YYYY-MM-DD for inputs
    const normalized = {
      ...booking,
      villaId: booking.villaId?._id || booking.villaId || "",
      startDate: booking.startDate ? booking.startDate.slice(0, 10) : "",
      endDate: booking.endDate ? booking.endDate.slice(0, 10) : "",
      syncToPlatforms: booking.syncToPlatforms !== undefined ? booking.syncToPlatforms : true,
    };
    setSelectedBooking(normalized);
    setShowEditModal(true);
    setFormErrors({});
  };

  // Update Booking
  const handleUpdateBooking = async () => {
    const errors = validateForm(selectedBooking || {});
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const ownerId = localStorage.getItem("userId");
      const payload = {
        ...selectedBooking,
        ownerId,
        totalFare: Number(selectedBooking.totalFare),
        syncToPlatforms: selectedBooking.syncToPlatforms,
      };
      const res = await API.put(`${API_URL}/${selectedBooking._id}`, payload);
      const updated = res.data.data;
      setBookings((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
      setShowEditModal(false);
      setFormErrors({});

      // Show sync status if available
      const syncMessage = res.data.platformSync?.syncedPlatforms > 0
        ? `Booking updated and synced to ${res.data.platformSync.syncedPlatforms} platform(s)!`
        : "Booking updated successfully!";
      alert(syncMessage);
    } catch (err) {
      console.error("Error updating booking:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to update booking.");
    }
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowViewModal(true);
  };

  // Stats
  const stats = useMemo(
    () => ({
      total: bookings.length,
      confirmed: bookings.filter((b) => b.status === "Confirmed").length,
      pending: bookings.filter((b) => b.status === "Pending").length,
      cancelled: bookings.filter((b) => b.status === "Cancelled").length,
    }),
    [bookings]
  );

  const StatusBadge = ({ status }) => {
    const colors = {
      Confirmed: "success",
      Pending: "warning",
      Cancelled: "danger",
    };
    return <Badge bg={colors[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <div style={{ backgroundColor: "#f4f6f8", padding: "20px", minHeight: "100vh" }}>
      {/* HEADER */}
      <Row className="align-items-center mb-4">
        <Col>
          <h2 style={{ color: "#157feb", fontWeight: "bold" }}>My Bookings</h2>
        </Col>
        <Col xs="auto">
          <Button
            variant="primary"
            style={{ backgroundColor: "#157feb", borderColor: "#157feb" }}
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus className="me-2" /> Add Booking
          </Button>
        </Col>
      </Row>

      {/* STATS */}
      <Row className="g-4 mb-4">
        {[
          { label: "Total", value: stats.total, color: "#157feb" },
          { label: "Confirmed", value: stats.confirmed, color: "#22c55e" },
          { label: "Pending", value: stats.pending, color: "#f59e0b" },
          { label: "Cancelled", value: stats.cancelled, color: "#ef4444" },
        ].map((item, i) => (
          <Col md={3} key={i}>
            <Card className="shadow-sm border-0 text-center">
              <Card.Body>
                <h3 style={{ color: item.color }}>{item.value}</h3>
                <p className="text-muted mb-0">{item.label}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* TABLE */}
      <Card className="shadow-sm border-0">
        <Card.Header
          style={{
            backgroundColor: "#157feb",
            color: "#fff",
            fontWeight: "600",
          }}
        >
          Recent Bookings
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead style={{ backgroundColor: "#f8fafc" }}>
                <tr>
                  <th>Booking ID</th>
                  <th>Guest Name</th>
                  <th>Villa</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Total Fare</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length > 0 ? (
                  bookings.map((b, i) => (
                    <tr key={b._id || i}>
                      <td>{b.readableId || `BK${String(i + 1).padStart(3, "0")}`}</td>
                      <td>{b.guestName}</td>
                      <td>{b.villaId?.name || b.villaName || "-"}</td>
                      <td>{b.startDate ? b.startDate.slice(0, 10) : "-"}</td>
                      <td>{b.endDate ? b.endDate.slice(0, 10) : "-"}</td>
                      <td>Rs. {b.totalFare || 0}</td>
                      <td>
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <Button
                            style={{ ...buttonStyles.base, ...buttonStyles.view }}
                            onClick={() => handleViewBooking(b)}
                          >
                            <FaEye />
                          </Button>
                          <Button
                            style={{ ...buttonStyles.base, ...buttonStyles.delete }}
                            onClick={() => handleDeleteBooking(b._id)}
                          >
                            <FaTimes />
                          </Button>
                          <Button
                            style={{ ...buttonStyles.base, ...buttonStyles.edit }}
                            onClick={() => handleEditBooking(b)}
                          >
                            <FaEdit />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-3 text-muted">
                      No bookings available
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* ADD / EDIT MODAL */}
      <Modal
        show={showAddModal || showEditModal}
        onHide={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          setFormErrors({});
        }}
        size="lg"
      >
        <Modal.Header closeButton style={{ backgroundColor: "#157feb", color: "#fff" }}>
          <Modal.Title>{showAddModal ? "Add Booking" : "Edit Booking"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              {/* Villa Dropdown */}
              <Col md={6}>
                <Form.Label>Villa *</Form.Label>
                <Form.Select
                  value={showAddModal ? newBooking.villaId : selectedBooking?.villaId || ""}
                  onChange={(e) =>
                    showAddModal
                      ? setNewBooking({ ...newBooking, villaId: e.target.value })
                      : setSelectedBooking({ ...selectedBooking, villaId: e.target.value })
                  }
                  isInvalid={!!formErrors.villaId}
                >
                  <option value="">Select Villa...</option>
                  {villas.map((villa) => (
                    <option key={villa._id} value={villa._id}>
                      {villa.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {formErrors.villaId}
                </Form.Control.Feedback>
              </Col>

              {/* Guest Name */}
              <Col md={6}>
                <Form.Label>Guest Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={showAddModal ? newBooking.guestName : selectedBooking?.guestName || ""}
                  onChange={(e) =>
                    showAddModal
                      ? setNewBooking({ ...newBooking, guestName: e.target.value })
                      : setSelectedBooking({ ...selectedBooking, guestName: e.target.value })
                  }
                  isInvalid={!!formErrors.guestName}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.guestName}
                </Form.Control.Feedback>
              </Col>

              {/* Dates */}
              <Col md={6}>
                <Form.Label>Start Date *</Form.Label>
                <Form.Control
                  type="date"
                  value={showAddModal ? newBooking.startDate : selectedBooking?.startDate || ""}
                  onChange={(e) =>
                    showAddModal
                      ? setNewBooking({ ...newBooking, startDate: e.target.value })
                      : setSelectedBooking({ ...selectedBooking, startDate: e.target.value })
                  }
                  isInvalid={!!formErrors.startDate}
                />
                <Form.Control.Feedback type="invalid">{formErrors.startDate}</Form.Control.Feedback>
              </Col>

              <Col md={6}>
                <Form.Label>End Date *</Form.Label>
                <Form.Control
                  type="date"
                  value={showAddModal ? newBooking.endDate : selectedBooking?.endDate || ""}
                  onChange={(e) =>
                    showAddModal
                      ? setNewBooking({ ...newBooking, endDate: e.target.value })
                      : setSelectedBooking({ ...selectedBooking, endDate: e.target.value })
                  }
                  isInvalid={!!formErrors.endDate}
                />
                <Form.Control.Feedback type="invalid">{formErrors.endDate}</Form.Control.Feedback>
              </Col>

              {/* Total Fare */}
              <Col md={6}>
                <Form.Label>Total Fare *</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={showAddModal ? newBooking.totalFare : selectedBooking?.totalFare || ""}
                  onChange={(e) =>
                    showAddModal
                      ? setNewBooking({ ...newBooking, totalFare: e.target.value })
                      : setSelectedBooking({ ...selectedBooking, totalFare: e.target.value })
                  }
                  isInvalid={!!formErrors.totalFare}
                />
                <Form.Control.Feedback type="invalid">{formErrors.totalFare}</Form.Control.Feedback>
              </Col>

              {/* Status */}
              <Col md={6}>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={showAddModal ? newBooking.status : selectedBooking?.status || "Confirmed"}
                  onChange={(e) =>
                    showAddModal
                      ? setNewBooking({ ...newBooking, status: e.target.value })
                      : setSelectedBooking({ ...selectedBooking, status: e.target.value })
                  }
                >
                  <option>Confirmed</option>
                  <option>Pending</option>
                  <option>Cancelled</option>
                </Form.Select>
              </Col>

              {/* Sync to Platforms Checkbox */}
              <Col md={12}>
                <Form.Group>
                  <Form.Check
                    type="checkbox"
                    label="Sync to connected platforms (Airbnb, Booking.com, etc.)"
                    checked={showAddModal ? newBooking.syncToPlatforms : selectedBooking?.syncToPlatforms || false}
                    onChange={(e) =>
                      showAddModal
                        ? setNewBooking({ ...newBooking, syncToPlatforms: e.target.checked })
                        : setSelectedBooking({ ...selectedBooking, syncToPlatforms: e.target.checked })
                    }
                  />
                  <Form.Text className="text-muted">
                    Uncheck if you don't want this booking to sync to external platforms
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowAddModal(false);
              setShowEditModal(false);
              setFormErrors({});
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            style={{ backgroundColor: "#157feb", borderColor: "#157feb" }}
            onClick={showAddModal ? handleAddBooking : handleUpdateBooking}
          >
            <FaPlus className="me-2" /> {showAddModal ? "Save" : "Update"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* VIEW Modal */}
      <Modal
        show={showViewModal}
        onHide={() => {
          setShowViewModal(false);
          setSelectedBooking(null);
        }}
        size="md"
      >
        <Modal.Header closeButton style={{ backgroundColor: "#157feb", color: "#fff" }}>
          <Modal.Title>Booking Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking ? (
            <div>
              <p><strong>Booking ID:</strong> {selectedBooking.readableId || selectedBooking._id}</p>
              <p><strong>Guest Name:</strong> {selectedBooking.guestName}</p>
              <p><strong>Villa:</strong> {selectedBooking.villaId?.name || selectedBooking.villaName || "-"}</p>
              <p><strong>Start Date:</strong> {selectedBooking.startDate ? selectedBooking.startDate.slice(0, 10) : "-"}</p>
              <p><strong>End Date:</strong> {selectedBooking.endDate ? selectedBooking.endDate.slice(0, 10) : "-"}</p>
              <p><strong>Total Fare:</strong> Rs. {selectedBooking.totalFare || 0}</p>
              <p><strong>Booking Source:</strong> {selectedBooking.bookingSource || "Manual"}</p>
              <p><strong>Status:</strong> <StatusBadge status={selectedBooking.status} /></p>
            </div>
          ) : (
            <p>No booking selected</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowViewModal(false);
              setSelectedBooking(null);
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OwnerMyBooking;
