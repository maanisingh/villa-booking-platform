import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, ListGroup, Badge, Spinner } from "react-bootstrap";
import { FaAirbnb, FaHotel, FaHome, FaCheck, FaTimes, FaExclamationTriangle } from "react-icons/fa";
import API from "../../services/api";

const PublishVillaModal = ({ show, onHide, villa, onSuccess }) => {
  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [publishedPlatforms, setPublishedPlatforms] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show && villa) {
      fetchPublishingStatus();
    }
  }, [show, villa]);

  const fetchPublishingStatus = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");

      // Get publishing status for the villa
      const statusRes = await API.get(
        `/api/publishing/villas/${villa._id}/publishing-status`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const status = statusRes.data.data;
      setAvailablePlatforms(status.availablePlatforms || []);
      setPublishedPlatforms(status.publishedPlatforms || []);
    } catch (error) {
      console.error("Failed to fetch publishing status:", error);
      setError("Failed to load platform information");
    } finally {
      setLoading(false);
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
        return null;
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

  const isPublished = (platform) => {
    return publishedPlatforms.some(p => p.platform === platform);
  };

  const togglePlatform = (platform) => {
    if (isPublished(platform)) return; // Can't select already published platforms

    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  const handlePublish = async () => {
    if (selectedPlatforms.length === 0) {
      setError("Please select at least one platform to publish to");
      return;
    }

    setPublishing(true);
    setError(null);
    setResults(null);

    try {
      const token = localStorage.getItem("authToken");

      const response = await API.post(
        `/api/publishing/villas/${villa._id}/publish-multiple`,
        { platforms: selectedPlatforms },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResults(response.data.data);

      if (response.data.data.successful.length > 0) {
        // Refresh publishing status
        await fetchPublishingStatus();
        setSelectedPlatforms([]);

        if (onSuccess) {
          onSuccess(response.data.data);
        }
      }
    } catch (error) {
      console.error("Publishing failed:", error);
      setError(error.response?.data?.message || "Failed to publish villa");
    } finally {
      setPublishing(false);
    }
  };

  const handleClose = () => {
    setSelectedPlatforms([]);
    setResults(null);
    setError(null);
    onHide();
  };

  const renderPlatformItem = (platform) => {
    const published = isPublished(platform);
    const selected = selectedPlatforms.includes(platform);
    const publishedInfo = publishedPlatforms.find(p => p.platform === platform);

    return (
      <ListGroup.Item
        key={platform}
        className={`d-flex justify-content-between align-items-center ${
          published ? 'list-group-item-success' : selected ? 'list-group-item-primary' : ''
        }`}
        style={{ cursor: published ? 'default' : 'pointer' }}
        onClick={() => !published && togglePlatform(platform)}
      >
        <div className="d-flex align-items-center">
          {getPlatformIcon(platform)}
          <span className="ms-2">{getPlatformDisplayName(platform)}</span>
        </div>

        <div>
          {published ? (
            <div>
              <Badge bg="success">
                <FaCheck className="me-1" />
                Published
              </Badge>
              {publishedInfo?.url && (
                <a
                  href={publishedInfo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ms-2 btn btn-sm btn-outline-primary"
                  onClick={(e) => e.stopPropagation()}
                >
                  View
                </a>
              )}
            </div>
          ) : (
            <Form.Check
              type="checkbox"
              checked={selected}
              onChange={() => {}}
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      </ListGroup.Item>
    );
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          Publish Villa: {villa?.name}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {results && (
          <Alert variant={results.successful.length > 0 ? "success" : "warning"}>
            <h6>Publishing Results:</h6>

            {results.successful.length > 0 && (
              <div className="mb-2">
                <strong>Successfully published to:</strong>
                <ul className="mb-0">
                  {results.successful.map(p => (
                    <li key={p.platform}>
                      {getPlatformDisplayName(p.platform)}
                      {p.url && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ms-2"
                        >
                          (View listing)
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {results.failed.length > 0 && (
              <div>
                <strong>Failed to publish to:</strong>
                <ul className="mb-0">
                  {results.failed.map(p => (
                    <li key={p.platform}>
                      {getPlatformDisplayName(p.platform)}: {p.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" />
            <p className="mt-2">Loading platform information...</p>
          </div>
        ) : (
          <>
            {availablePlatforms.length === 0 ? (
              <Alert variant="warning">
                <FaExclamationTriangle className="me-2" />
                No platforms are connected. Please connect to platforms first in Platform Settings.
              </Alert>
            ) : (
              <>
                <p>Select the platforms where you want to publish this villa:</p>

                <ListGroup>
                  {availablePlatforms.map(platform => renderPlatformItem(platform))}
                </ListGroup>

                {selectedPlatforms.length > 0 && (
                  <Alert variant="info" className="mt-3">
                    <strong>Selected platforms:</strong> {selectedPlatforms.length}
                    <br />
                    The villa will be published to: {selectedPlatforms.map(p => getPlatformDisplayName(p)).join(", ")}
                  </Alert>
                )}
              </>
            )}

            <div className="mt-3">
              <h6>Villa Details to be Published:</h6>
              <ul>
                <li><strong>Name:</strong> {villa?.name}</li>
                <li><strong>Type:</strong> {villa?.type} Bedroom Villa</li>
                <li><strong>Price:</strong> ${villa?.price}/night</li>
                <li><strong>Location:</strong> {villa?.location}</li>
              </ul>
            </div>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={publishing}>
          {results ? "Close" : "Cancel"}
        </Button>
        {!results && availablePlatforms.length > 0 && (
          <Button
            variant="primary"
            onClick={handlePublish}
            disabled={publishing || selectedPlatforms.length === 0 || loading}
          >
            {publishing ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Publishing...
              </>
            ) : (
              `Publish to ${selectedPlatforms.length} Platform(s)`
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default PublishVillaModal;