import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Badge } from "react-bootstrap";
import { getAdminDashboardData } from "../../services/dashboardService";

const AdminDashboard = () => {
  // State for API Data
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [villas, setVillas] = useState([]);
  const [loading, setLoading] = useState(true);

  // API Call
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getAdminDashboardData();
        if (result.success) {
          setStats(result.data);
          setBookings(result.data.recentBookings);
          setVillas(result.data.villasList);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAlert = (msg) => alert(msg);

  if (loading) return <h3 className="text-center mt-5">Loading Dashboard Please Wait... ⏳</h3>;

  return (
    <Container fluid className="py-4 bg-light min-vh-100">
      <h2 className="text-center fw-bold text-primary mb-5">🏡 Admin Dashboard</h2>

      {/* Summary Cards (API DATA CONNECTED) */}
      <Row className="g-4 mb-5">
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body className="text-center">
              <Card.Title>Total Bookings</Card.Title>
              <h3 className="text-dark fw-bold">{stats?.bookingStats?.totalBookings || 0}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body className="text-center">
              <Card.Title>Confirmed</Card.Title>
              <h3 className="text-success fw-bold">{stats?.bookingStats?.confirmedBookings || 0}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body className="text-center">
              <Card.Title>Pending</Card.Title>
              <h3 className="text-warning fw-bold">{stats?.bookingStats?.pendingBookings || 0}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body className="text-center">
              <Card.Title>Revenue</Card.Title>
              {/* Revenue Backend se aa raha hai */}
              <h3 className="text-info fw-bold">${stats?.bookingStats?.totalRevenue || 0}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bookings Table (API DATA) */}
      <Card className="shadow-sm border-0 mb-5">
        <Card.Header className="bg-primary text-white fw-semibold">📅 Recent Bookings</Card.Header>
        <Card.Body>
          <Table hover responsive className="align-middle">
            <thead className="table-light">
              <tr>
                <th>Villa</th>
                <th>Guest Name</th> {/* Changed from Customer */}
                <th>Price</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((b) => (
                  <tr key={b._id}>
                    {/* Backend me 'villa' ek object hai, isliye villa.name likha */}
                    <td>{b.villa?.name || "Unknown Villa"}</td> 
                    <td>{b.guestName}</td>
                    <td>${b.price}</td>
                    <td>{new Date(b.checkIn).toLocaleDateString()}</td>
                    <td>{new Date(b.checkOut).toLocaleDateString()}</td>
                    <td>
                      <Badge
                        bg={
                          b.status === "Confirmed"
                            ? "success"
                            : b.status === "Pending"
                            ? "warning"
                            : "secondary"
                        }
                      >
                        {b.status}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleAlert(Viewing `${b.guestName}`)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">No Bookings Found</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Villas Section (API DATA) */}
      <Card className="shadow-sm border-0 mb-5">
        <Card.Header className="bg-primary text-white fw-semibold">🏠 Villas Overview</Card.Header>
        <Card.Body>
          <Row className="g-4 mb-4">
            <Col md={3}>
              <Card className="text-center border-0 bg-light shadow-sm">
                <Card.Body>
                  <Card.Title>Total Villas</Card.Title>
                  <h4>{stats?.villaStats?.totalVillas || 0}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center border-0 bg-light shadow-sm">
                <Card.Body>
                  <Card.Title>Available</Card.Title>
                  <h4 className="text-success">{stats?.villaStats?.availableVillas || 0}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center border-0 bg-light shadow-sm">
                <Card.Body>
                  <Card.Title>Occupied</Card.Title>
                  <h4 className="text-danger">{stats?.villaStats?.occupiedVillas || 0}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center border-0 bg-light shadow-sm">
                <Card.Body>
                  <Card.Title>Occupancy Rate</Card.Title>
                  <h4 className="text-warning">{stats?.villaStats?.occupancyRate || 0}%</h4>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Table hover responsive className="align-middle">
            <thead className="table-light">
              <tr>
                <th>Villa Name</th>
                <th>Location</th>
                <th>Status</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {villas.length > 0 ? (
                villas.map((v) => (
                  <tr key={v._id}>
                    <td>{v.name}</td>
                    <td>{v.location}</td>
                    <td>
                      <Badge bg={v.status === "Booked" ? "info" : "success"}>{v.status}</Badge>
                    </td>
                    <td>${v.price}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleAlert(Editing `${v.name}`)}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">No Villas Found</td>
                </tr>
              )}
            </tbody>
          </Table>

          <div className="d-flex gap-3 mt-3">
            <Button variant="primary" onClick={() => handleAlert("Add New Villa Feature coming soon!")}>
              Add New Villa
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminDashboard;