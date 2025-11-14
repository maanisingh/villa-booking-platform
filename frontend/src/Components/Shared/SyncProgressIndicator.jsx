import React from "react";
import { Badge, Spinner, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaSync, FaCheck, FaTimes, FaClock, FaExclamationTriangle } from "react-icons/fa";

const SyncProgressIndicator = ({
  status = "idle",
  lastSync = null,
  platform = null,
  newBookings = 0,
  updatedBookings = 0,
  errors = 0,
  className = "",
  showDetails = true
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case "syncing":
        return <Spinner animation="border" size="sm" className="me-1" />;
      case "success":
        return <FaCheck className="me-1" />;
      case "failed":
        return <FaTimes className="me-1" />;
      case "partial":
        return <FaExclamationTriangle className="me-1" />;
      case "scheduled":
        return <FaClock className="me-1" />;
      default:
        return <FaSync className="me-1" />;
    }
  };

  const getStatusVariant = () => {
    switch (status) {
      case "syncing":
        return "primary";
      case "success":
        return "success";
      case "failed":
        return "danger";
      case "partial":
        return "warning";
      case "scheduled":
        return "info";
      default:
        return "secondary";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "syncing":
        return "Syncing...";
      case "success":
        return "Synced";
      case "failed":
        return "Sync Failed";
      case "partial":
        return "Partial Sync";
      case "scheduled":
        return "Scheduled";
      case "idle":
        return "Not Synced";
      default:
        return "Unknown";
    }
  };

  const formatLastSync = () => {
    if (!lastSync) return "Never";

    const date = new Date(lastSync);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
  };

  const renderTooltipContent = () => (
    <div>
      {platform && <div><strong>Platform:</strong> {platform}</div>}
      <div><strong>Status:</strong> {getStatusText()}</div>
      <div><strong>Last Sync:</strong> {formatLastSync()}</div>
      {showDetails && status === "success" && (
        <>
          {newBookings > 0 && <div><strong>New Bookings:</strong> {newBookings}</div>}
          {updatedBookings > 0 && <div><strong>Updated:</strong> {updatedBookings}</div>}
        </>
      )}
      {errors > 0 && <div className="text-warning"><strong>Errors:</strong> {errors}</div>}
    </div>
  );

  const badge = (
    <Badge
      bg={getStatusVariant()}
      className={`d-inline-flex align-items-center ${className}`}
      style={{ cursor: "help" }}
    >
      {getStatusIcon()}
      {getStatusText()}
    </Badge>
  );

  if (!showDetails) {
    return badge;
  }

  return (
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip id={`sync-tooltip-${platform || 'general'}`}>
          {renderTooltipContent()}
        </Tooltip>
      }
    >
      {badge}
    </OverlayTrigger>
  );
};

// Compact version for inline use
export const SyncStatusBadge = ({ syncedFrom, lastSyncTime, autoSynced }) => {
  if (!syncedFrom) return null;

  const platformDisplayName = {
    airbnb: "Airbnb",
    booking_com: "Booking.com",
    vrbo: "VRBO"
  }[syncedFrom] || syncedFrom;

  return (
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip>
          <div>
            <strong>Source:</strong> {platformDisplayName}
            <br />
            {lastSyncTime && (
              <>
                <strong>Synced:</strong> {new Date(lastSyncTime).toLocaleString()}
                <br />
              </>
            )}
            <strong>Type:</strong> {autoSynced ? "Auto-sync" : "Manual"}
          </div>
        </Tooltip>
      }
    >
      <Badge
        bg="info"
        className="ms-2"
        style={{ cursor: "help", fontSize: "0.75rem" }}
      >
        <FaSync className="me-1" style={{ fontSize: "0.7rem" }} />
        {platformDisplayName}
      </Badge>
    </OverlayTrigger>
  );
};

// Loading indicator for sync operations
export const SyncLoadingIndicator = ({ text = "Syncing bookings..." }) => (
  <div className="d-flex align-items-center justify-content-center py-3">
    <Spinner animation="border" variant="primary" className="me-2" />
    <span>{text}</span>
  </div>
);

// Sync result summary
export const SyncResultSummary = ({ result }) => {
  if (!result) return null;

  const hasNewBookings = result.newBookings > 0;
  const hasUpdatedBookings = result.updatedBookings > 0;
  const hasErrors = result.errorCount > 0;

  return (
    <div className="sync-result-summary">
      {(hasNewBookings || hasUpdatedBookings) && (
        <div className="text-success mb-2">
          <FaCheck className="me-1" />
          Successfully synced
          {hasNewBookings && ` ${result.newBookings} new`}
          {hasNewBookings && hasUpdatedBookings && " and"}
          {hasUpdatedBookings && ` ${result.updatedBookings} updated`}
          {" booking(s)"}
        </div>
      )}

      {!hasNewBookings && !hasUpdatedBookings && !hasErrors && (
        <div className="text-muted">
          <FaCheck className="me-1" />
          Everything is up to date
        </div>
      )}

      {hasErrors && (
        <div className="text-warning">
          <FaExclamationTriangle className="me-1" />
          {result.errorCount} error(s) occurred during sync
        </div>
      )}

      {result.duration && (
        <small className="text-muted d-block mt-1">
          Completed in {(result.duration / 1000).toFixed(1)} seconds
        </small>
      )}
    </div>
  );
};

export default SyncProgressIndicator;