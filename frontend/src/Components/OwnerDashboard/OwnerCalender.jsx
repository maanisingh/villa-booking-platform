import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
  FormControl,
  Modal,
  Nav,
  Table,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSyncAlt,
  faLink,
  faCheckCircle,
  faDollarSign,
  faUser,
  faTrash,
  faEdit,
  faCalendarAlt,
  faListUl,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);
const API_URL = "/api/bookings";

// --- Theme ---
const theme = {
  primary: "#157feb",
  heading: "#157feb",
  background: "#f4f6f8",
  text: "#1e2a38",
  border: "#e5e7eb",
  booking: "#157feb",
  blocked: "#6B7280",
};

// --- Event Style ---
const eventStyleGetter = (event) => {
  let backgroundColor = theme.booking;
  if (event.resource === "blocked") backgroundColor = theme.blocked;
  return {
    style: {
      backgroundColor,
      borderColor: backgroundColor,
      borderRadius: "5px",
      color: "white",
    },
  };
};

const OwnerCalendar = () => {
  const [view, setView] = useState("calendar"); // "calendar" | "list"
  const [bookings, setBookings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [guestName, setGuestName] = useState("");
  const [fare, setFare] = useState("");

  // ✅ New for day-click modal
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayBookings, setDayBookings] = useState([]);

  // ✅ Fetch Bookings
  const fetchBookings = async () => {
    try {
      const res = await axios.get(API_URL);
      const data = res.data.data || res.data;
      const formatted = data.map((b) => ({
        ...b,
        id: b._id,
        title: `Booking: ${b.guestName}`,
        start: new Date(b.startDate),
        end: new Date(b.endDate),
        resource: "booking",
        fare: b.totalFare,
      }));
      setBookings(formatted);
    } catch (error) {
      console.error("❌ Error fetching bookings:", error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // ✅ Add Booking
  const handleSaveBooking = async () => {
    if (!guestName || !fare || !selectedSlot) {
      alert("Please fill in all details.");
      return;
    }
    const payload = {
      ownerId: "672f3b7f93d2e5a1c246b1f0", // replace with logged-in owner ID
      villaId: null,
      guestName,
      totalFare: Number(fare),
      startDate: selectedSlot.start,
      endDate: selectedSlot.end,
      bookingSource: "Manual",
      status: "Confirmed",
    };
    try {
      const res = await axios.post(API_URL, payload);
      const added = res.data.data;
      const newBooking = {
        id: added._id,
        title: `Booking: ${added.guestName}`,
        start: new Date(added.startDate),
        end: new Date(added.endDate),
        resource: "booking",
        fare: added.totalFare,
      };
      setBookings([...bookings, newBooking]);
      setShowModal(false);
      alert("✅ Booking added successfully!");
    } catch (error) {
      console.error("❌ Error adding booking:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to add booking");
    }
  };

  // ✅ Update Booking
  const handleUpdateBooking = async () => {
    if (!selectedBooking) return;
    const payload = {
      ownerId: selectedBooking.ownerId,
      villaId: selectedBooking.villaId,
      guestName,
      totalFare: Number(fare),
      startDate: selectedBooking.start,
      endDate: selectedBooking.end,
      bookingSource: selectedBooking.bookingSource || "Manual",
      status: "Confirmed",
    };
    try {
      const res = await axios.put(`${API_URL}/${selectedBooking.id}`, payload);
      const updated = res.data.data || res.data;
      setBookings((prev) =>
        prev.map((b) =>
          b.id === updated._id
            ? {
                ...b,
                title: `Booking: ${updated.guestName}`,
                fare: updated.totalFare,
                start: new Date(updated.startDate),
                end: new Date(updated.endDate),
              }
            : b
        )
      );
      setShowEditModal(false);
      alert("✅ Booking updated successfully!");
    } catch (error) {
      console.error("❌ Error updating booking:", error);
      alert(error.response?.data?.message || "Update failed");
    }
  };

  // ✅ Delete Booking
  const handleDeleteBooking = async (booking) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    try {
      await axios.delete(`${API_URL}/${booking.id}`);
      setBookings(bookings.filter((b) => b.id !== booking.id));
      alert("🗑️ Booking deleted successfully!");
    } catch (error) {
      console.error("❌ Error deleting booking:", error);
    }
  };

  // ✅ Click on Day to view bookings
  const handleDayClick = (slotInfo) => {
    const clickedDate = moment(slotInfo.start).startOf("day");
    const filtered = bookings.filter(
      (b) =>
        moment(b.start).isSame(clickedDate, "day") ||
        (moment(b.start).isBefore(clickedDate, "day") &&
          moment(b.end).isAfter(clickedDate, "day"))
    );
    setSelectedDay(clickedDate);
    setDayBookings(filtered);
    setShowDayModal(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedBooking(event);
    setGuestName(event.title.replace("Booking: ", ""));
    setFare(event.fare);
    setShowEditModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setShowEditModal(false);
    setShowDayModal(false);
    setSelectedSlot(null);
    setSelectedBooking(null);
  };

  // ✅ Generate ICS-style list
  const generateDayList = () => {
    const allDays = [];
    bookings.forEach((b) => {
      let start = moment(b.start);
      const end = moment(b.end);
      while (start.isBefore(end) || start.isSame(end, "day")) {
        allDays.push({
          date: start.clone(),
          guest: b.guestName,
          status: b.status,
          totalFare: b.totalFare,
        });
        start.add(1, "day");
      }
    });
    return allDays.sort((a, b) => b.date - a.date); // reverse order (latest first)
  };

  return (
    <div style={{ background: theme.background, minHeight: "100%", padding: "20px" }}>
      {/* ===== HEADER ===== */}
      <Row className="mb-4 align-items-center">
        <Col>
          <h1 style={{ color: theme.heading, fontWeight: "bold" }}>My Calendar</h1>
          <p className="text-muted">View, add, edit, and sync your villa bookings.</p>
        </Col>
        <Col xs="auto">
          <Nav variant="pills" activeKey={view} onSelect={(v) => setView(v)}>
            <Nav.Item>
              <Nav.Link eventKey="calendar">
                <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                Calendar
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="list">
                <FontAwesomeIcon icon={faListUl} className="me-2" />
                List
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>
      </Row>

      {/* ===== Calendar View ===== */}
      {view === "calendar" ? (
        <Card style={{ border: `1px solid ${theme.border}` }}>
          <Card.Body>
            <div style={{ height: "700px" }}>
              <Calendar
                localizer={localizer}
                events={bookings}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                eventPropGetter={eventStyleGetter}
                selectable
                onSelectSlot={handleDayClick}
                onSelectEvent={handleSelectEvent}
              />
            </div>
          </Card.Body>
        </Card>
      ) : (
        // ===== List View =====
        <Card style={{ border: `1px solid ${theme.border}`, background: "#0b0b0f" }}>
          <Card.Header style={{ color: "#fff", background: "#141418" }}>
            <strong>Day-by-Day Booking List</strong>
          </Card.Header>
          <Card.Body style={{ maxHeight: "700px", overflowY: "auto" }}>
            {generateDayList().length === 0 ? (
              <div className="text-center text-muted py-5">No bookings found</div>
            ) : (
              generateDayList().map((d, i) => (
                <div
                  key={i}
                  style={{
                    border: "1px solid #3b82f6",
                    borderRadius: "10px",
                    padding: "10px",
                    marginBottom: "10px",
                    color: "#3b82f6",
                    background: "#0b0b0f",
                  }}
                >
                  <div style={{ fontWeight: "bold", color: "#fff" }}>
                    {d.date.format("MMM DD, YYYY")}
                  </div>
                  <div style={{ fontSize: "14px", color: "#9ca3af" }}>
                    Reserved by: <strong>{d.guest || "Unknown Guest"}</strong> — ₹
                    {d.totalFare} ({d.status})
                  </div>
                </div>
              ))
            )}
          </Card.Body>
        </Card>
      )}

      {/* ✅ Day Details Modal */}
      <Modal show={showDayModal} onHide={handleModalClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title style={{ color: theme.heading }}>
            {selectedDay
              ? `Bookings on ${selectedDay.format("DD MMM YYYY")}`
              : "Bookings"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {dayBookings.length === 0 ? (
            <div className="text-center py-4">
              <h6 className="text-muted mb-0">No reservations for this date.</h6>
            </div>
          ) : (
            <Table bordered hover responsive>
              <thead style={{ background: theme.primary, color: "white" }}>
                <tr>
                  <th>#</th>
                  <th>Guest Name</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Total Fare (₹)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[...dayBookings]
                  .reverse() // latest first
                  .map((b, i) => (
                    <tr key={b.id}>
                      <td>{i + 1}</td>
                      <td>
                        <strong style={{ color: theme.primary }}>
                          {b.guestName || "Unnamed Guest"}
                        </strong>
                      </td>
                      <td>{moment(b.start).format("DD MMM YYYY")}</td>
                      <td>{moment(b.end).format("DD MMM YYYY")}</td>
                      <td>{b.fare ? b.fare.toLocaleString() : "—"}</td>
                      <td>
                        <span
                          className={`badge ${
                            b.status === "Confirmed"
                              ? "bg-success"
                              : b.status === "Pending"
                              ? "bg-warning text-dark"
                              : "bg-secondary"
                          }`}
                        >
                          {b.status || "Reserved"}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default OwnerCalendar;
