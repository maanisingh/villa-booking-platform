import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PlatformIntegration.css';

/**
 * Platform Integration Dashboard Component
 *
 * Manages platform connections, sync operations, and integration settings
 */

const PlatformIntegrationDashboard = () => {
  const [integrations, setIntegrations] = useState([]);
  const [syncStats, setSyncStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState({});
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [credentials, setCredentials] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Platform configurations
  const platforms = {
    airbnb: {
      name: 'Airbnb',
      icon: '<à',
      color: '#FF5A5F',
      fields: ['apiKey', 'apiSecret', 'accessToken', 'refreshToken']
    },
    booking_com: {
      name: 'Booking.com',
      icon: '<è',
      color: '#003580',
      fields: ['partnerId', 'apiKey', 'hotelId']
    },
    vrbo: {
      name: 'VRBO',
      icon: '<Ö',
      color: '#2B6CB0',
      fields: ['apiKey', 'apiSecret', 'partnerId', 'accessToken', 'refreshToken']
    },
    expedia: {
      name: 'Expedia',
      icon: '',
      color: '#FFC72C',
      fields: ['username', 'password', 'hotelId', 'apiKey', 'secret']
    }
  };

  // API configuration
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');

  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  useEffect(() => {
    fetchIntegrations();
    fetchSyncStats();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/platforms');
      setIntegrations(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
      setError('Failed to load platform integrations');
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncStats = async () => {
    try {
      const response = await api.get('/api/sync/statistics');
      setSyncStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch sync statistics:', error);
    }
  };

  const handleConnect = async () => {
    if (!selectedPlatform) {
      setError('Please select a platform');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Test connection first
      const testResponse = await api.post('/api/platforms/test-connection', {
        platform: selectedPlatform,
        credentials
      });

      if (!testResponse.data.success) {
        setError('Invalid credentials. Please check and try again.');
        return;
      }

      // Connect platform
      const connectResponse = await api.post('/api/platforms/connect', {
        platform: selectedPlatform,
        credentials,
        syncFrequency: 2,
        autoSync: true
      });

      if (connectResponse.data.success) {
        setSuccess(`Successfully connected to ${platforms[selectedPlatform].name}`);
        setShowConnectModal(false);
        setCredentials({});
        setSelectedPlatform('');
        fetchIntegrations();
        fetchSyncStats();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to connect platform');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (integrationId, platformName) => {
    if (!window.confirm(`Are you sure you want to disconnect from ${platformName}?`)) {
      return;
    }

    try {
      const response = await api.delete(`/api/platforms/${integrationId}`);
      if (response.data.success) {
        setSuccess(`Disconnected from ${platformName}`);
        fetchIntegrations();
        fetchSyncStats();
      }
    } catch (error) {
      setError('Failed to disconnect platform');
    }
  };

  const handleSync = async (platform) => {
    try {
      setSyncing({ ...syncing, [platform]: true });
      const response = await api.post(`/api/platforms/${platform}/sync`);

      if (response.data.success) {
        const syncData = response.data.data;
        setSuccess(
          `Sync completed for ${platforms[platform].name}: ` +
          `${syncData.newBookings} new bookings, ${syncData.updatedBookings} updated`
        );
        fetchIntegrations();
        fetchSyncStats();
      }
    } catch (error) {
      setError(`Sync failed for ${platforms[platform].name}`);
    } finally {
      setSyncing({ ...syncing, [platform]: false });
    }
  };

  const handleSyncAll = async () => {
    try {
      setSyncing({ all: true });
      const response = await api.post('/api/platforms/sync-all');

      if (response.data.success) {
        const summary = response.data.data;
        setSuccess(
          `Sync completed: ${summary.successful} successful, ` +
          `${summary.totalNewBookings} new bookings, ` +
          `${summary.totalUpdatedBookings} updated`
        );
        fetchIntegrations();
        fetchSyncStats();
      }
    } catch (error) {
      setError('Failed to sync all platforms');
    } finally {
      setSyncing({ all: false });
    }
  };

  const getStatusBadge = (integration) => {
    if (integration.status === 'active') {
      return <span className="badge badge-success">Active</span>;
    } else if (integration.status === 'error') {
      return <span className="badge badge-danger">Error</span>;
    } else {
      return <span className="badge badge-secondary">Inactive</span>;
    }
  };

  const formatLastSync = (date) => {
    if (!date) return 'Never';
    const diff = Date.now() - new Date(date);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (hours > 24) {
      return `${Math.floor(hours / 24)} days ago`;
    } else if (hours > 0) {
      return `${hours} hours ago`;
    } else if (minutes > 0) {
      return `${minutes} minutes ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="platform-integration-dashboard">
      <div className="dashboard-header">
        <h1>Platform Integrations</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowConnectModal(true)}
        >
          + Connect New Platform
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="alert alert-success">
          {success}
          <button onClick={() => setSuccess('')} className="close-btn">×</button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
          <button onClick={() => setError('')} className="close-btn">×</button>
        </div>
      )}

      {/* Statistics Overview */}
      {syncStats && (
        <div className="stats-overview">
          <div className="stat-card">
            <h3>Active Integrations</h3>
            <div className="stat-value">{syncStats.activeIntegrations}</div>
          </div>
          <div className="stat-card">
            <h3>Total Bookings Synced</h3>
            <div className="stat-value">{syncStats.totalBookingsSynced}</div>
          </div>
          <div className="stat-card">
            <h3>Successful Syncs</h3>
            <div className="stat-value">
              {syncStats.successfulSyncs}/{syncStats.totalSyncs}
            </div>
          </div>
          <div className="stat-card">
            <h3>Sync All</h3>
            <button
              className="btn btn-sm btn-primary"
              onClick={handleSyncAll}
              disabled={syncing.all}
            >
              {syncing.all ? 'Syncing...' : 'Sync All Platforms'}
            </button>
          </div>
        </div>
      )}

      {/* Connected Platforms */}
      <div className="platforms-grid">
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : integrations.length === 0 ? (
          <div className="empty-state">
            <h3>No platforms connected</h3>
            <p>Connect your first platform to start syncing bookings</p>
          </div>
        ) : (
          integrations.map((integration) => (
            <div key={integration._id} className="platform-card">
              <div className="platform-header">
                <div className="platform-info">
                  <span className="platform-icon">
                    {platforms[integration.platform]?.icon}
                  </span>
                  <h3>{platforms[integration.platform]?.name}</h3>
                </div>
                {getStatusBadge(integration)}
              </div>

              <div className="platform-details">
                <div className="detail-row">
                  <span>Last Sync:</span>
                  <span>{formatLastSync(integration.lastSync)}</span>
                </div>
                <div className="detail-row">
                  <span>Auto Sync:</span>
                  <span>{integration.autoSync ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="detail-row">
                  <span>Total Bookings:</span>
                  <span>{integration.totalBookingsSynced || 0}</span>
                </div>
                {integration.lastSyncResult && (
                  <div className="detail-row">
                    <span>Last Sync Result:</span>
                    <span>
                      {integration.lastSyncResult.newBookings} new,{' '}
                      {integration.lastSyncResult.updatedBookings} updated
                    </span>
                  </div>
                )}
              </div>

              <div className="platform-actions">
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => handleSync(integration.platform)}
                  disabled={syncing[integration.platform]}
                >
                  {syncing[integration.platform] ? 'Syncing...' : 'Sync Now'}
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDisconnect(integration._id, platforms[integration.platform].name)}
                >
                  Disconnect
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Connect Platform Modal */}
      {showConnectModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Connect New Platform</h2>
              <button
                className="close-btn"
                onClick={() => setShowConnectModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Platform Selection */}
              <div className="platform-selector">
                {Object.entries(platforms).map(([key, platform]) => (
                  <button
                    key={key}
                    className={`platform-option ${selectedPlatform === key ? 'selected' : ''}`}
                    onClick={() => setSelectedPlatform(key)}
                    disabled={integrations.some(i => i.platform === key)}
                  >
                    <span className="platform-icon">{platform.icon}</span>
                    <span>{platform.name}</span>
                    {integrations.some(i => i.platform === key) && (
                      <span className="connected-badge">Connected</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Credential Fields */}
              {selectedPlatform && (
                <div className="credential-fields">
                  <h3>Enter {platforms[selectedPlatform].name} Credentials</h3>
                  {platforms[selectedPlatform].fields.map((field) => (
                    <div key={field} className="form-group">
                      <label>{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                      <input
                        type={field.includes('password') || field.includes('secret') ? 'password' : 'text'}
                        value={credentials[field] || ''}
                        onChange={(e) =>
                          setCredentials({
                            ...credentials,
                            [field]: e.target.value
                          })
                        }
                        placeholder={`Enter ${field}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowConnectModal(false);
                  setSelectedPlatform('');
                  setCredentials({});
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConnect}
                disabled={!selectedPlatform || loading}
              >
                {loading ? 'Connecting...' : 'Connect Platform'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformIntegrationDashboard;