import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { FaAirbnb, FaHotel, FaHome } from "react-icons/fa";
import axios from "axios";

const PlatformConnectionModal = ({ show, onHide, platform, onSuccess }) => {
  const [credentials, setCredentials] = useState({});
  const [syncFrequency, setSyncFrequency] = useState(2);
  const [autoSync, setAutoSync] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPlatformIcon = () => {
    switch (platform) {
      case "airbnb":
        return <FaAirbnb className="text-danger" size={24} />;
      case "booking_com":
        return <FaHotel className="text-primary" size={24} />;
      case "vrbo":
        return <FaHome className="text-info" size={24} />;
      default:
        return null;
    }
  };

  const getPlatformDisplayName = () => {
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

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        "/api/platforms/connect",
        {
          platform,
          credentials,
          syncFrequency,
          autoSync
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        onSuccess(response.data.data);
        handleClose();
      } else {
        setError(response.data.message || "Connection failed");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to connect to platform");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCredentials({});
    setSyncFrequency(2);
    setAutoSync(true);
    setError(null);
    onHide();
  };

  const renderCredentialsForm = () => {
    switch (platform) {
      case "airbnb":
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label>API Key *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your Airbnb API Key"
                value={credentials.apiKey || ""}
                onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
                required
              />
              <Form.Text className="text-muted">
                Get this from your Airbnb Partner Dashboard
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>API Secret *</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your Airbnb API Secret"
                value={credentials.apiSecret || ""}
                onChange={(e) => setCredentials({ ...credentials, apiSecret: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Access Token *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your Access Token"
                value={credentials.accessToken || ""}
                onChange={(e) => setCredentials({ ...credentials, accessToken: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Refresh Token</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your Refresh Token (optional)"
                value={credentials.refreshToken || ""}
                onChange={(e) => setCredentials({ ...credentials, refreshToken: e.target.value })}
              />
            </Form.Group>
          </>
        );

      case "booking_com":
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Partner ID *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your Booking.com Partner ID"
                value={credentials.partnerId || ""}
                onChange={(e) => setCredentials({ ...credentials, partnerId: e.target.value })}
                required
              />
              <Form.Text className="text-muted">
                Found in your Booking.com Partner Hub
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>API Key *</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your Booking.com API Key"
                value={credentials.apiKey || ""}
                onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Hotel/Property ID *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your Property ID"
                value={credentials.hotelId || ""}
                onChange={(e) => setCredentials({ ...credentials, hotelId: e.target.value })}
                required
              />
              <Form.Text className="text-muted">
                Your property's unique identifier on Booking.com
              </Form.Text>
            </Form.Group>
          </>
        );

      case "vrbo":
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label>API Key *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your VRBO API Key"
                value={credentials.apiKey || ""}
                onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
                required
              />
              <Form.Text className="text-muted">
                Get this from your VRBO Owner Dashboard
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>API Secret *</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your VRBO API Secret"
                value={credentials.apiSecret || ""}
                onChange={(e) => setCredentials({ ...credentials, apiSecret: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Partner ID *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your VRBO Partner ID"
                value={credentials.partnerId || ""}
                onChange={(e) => setCredentials({ ...credentials, partnerId: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Access Token</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your Access Token"
                value={credentials.accessToken || ""}
                onChange={(e) => setCredentials({ ...credentials, accessToken: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Refresh Token</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your Refresh Token (optional)"
                value={credentials.refreshToken || ""}
                onChange={(e) => setCredentials({ ...credentials, refreshToken: e.target.value })}
              />
            </Form.Group>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          {getPlatformIcon()}
          <span className="ms-2">Connect to {getPlatformDisplayName()}</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Form>
          {renderCredentialsForm()}

          <hr />

          <h5>Sync Settings</h5>

          <Form.Group className="mb-3">
            <Form.Label>Sync Frequency</Form.Label>
            <Form.Select
              value={syncFrequency}
              onChange={(e) => setSyncFrequency(parseInt(e.target.value))}
            >
              <option value={1}>Every hour</option>
              <option value={2}>Every 2 hours</option>
              <option value={4}>Every 4 hours</option>
              <option value={6}>Every 6 hours</option>
              <option value={12}>Every 12 hours</option>
              <option value={24}>Once daily</option>
            </Form.Select>
            <Form.Text className="text-muted">
              How often should we sync bookings from {getPlatformDisplayName()}?
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="auto-sync-switch"
              label="Enable automatic synchronization"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
            />
            <Form.Text className="text-muted">
              Automatically sync bookings based on the frequency above
            </Form.Text>
          </Form.Group>
        </Form>

        <Alert variant="info" className="mt-3">
          <strong>Note:</strong> Your credentials are encrypted and securely stored.
          We never share your credentials with third parties.
        </Alert>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleConnect} disabled={loading}>
          {loading ? "Connecting..." : "Connect"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PlatformConnectionModal;