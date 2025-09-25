import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalNotifications: 0,
    unreadCount: 0,
    joinDate: ''
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileResponse = await axios.get(`${API_URL}/profile`);
        setProfile(profileResponse.data);

        const notificationsResponse = await axios.get(`${API_URL}/notifications`);
        const notifications = notificationsResponse.data;

        setStats({
          totalNotifications: notifications.length,
          unreadCount: notifications.filter((n) => !n.is_read).length,
          joinDate: profileResponse.data.created_at
        });
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="error-container">
        <h2>Error loading profile</h2>
        <p>Unable to load your profile information.</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar">
            <span className="avatar-text">
              {profile.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="profile-info">
            <h1>{profile.username}</h1>
            <p className="email">{profile.email}</p>
            <p className="join-date">Member since {formatDate(stats.joinDate)}</p>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-icon">📧</div>
            <div className="stat-content">
              <h3>{stats.totalNotifications}</h3>
              <p>Total Notifications</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔔</div>
            <div className="stat-content">
              <h3>{stats.unreadCount}</h3>
              <p>Unread Notifications</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h3>Active</h3>
              <p>Account Status</p>
            </div>
          </div>
        </div>

        <div className="profile-details">
          <div className="details-card">
            <h2>Account Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Username</label>
                <span>{profile.username}</span>
              </div>
              <div className="info-item">
                <label>Email Address</label>
                <span>{profile.email}</span>
              </div>
              <div className="info-item">
                <label>User ID</label>
                <span>#{profile.id}</span>
              </div>
              <div className="info-item">
                <label>Account Created</label>
                <span>{formatDate(profile.created_at)}</span>
              </div>
              <div className="info-item">
                <label>Last Updated</label>
                <span>{formatDate(profile.updated_at || profile.created_at)}</span>
              </div>
              <div className="info-item">
                <label>Account Type</label>
                <span>Standard User</span>
              </div>
            </div>
          </div>

          <div className="activity-card">
            <h2>Recent Activity</h2>
            <div className="activity-summary">
              <div className="activity-item">
                <span className="activity-icon">📊</span>
                <div className="activity-details">
                  <h4>Notification Statistics</h4>
                  <p>You have {stats.totalNotifications} total notifications with {stats.unreadCount} unread</p>
                </div>
              </div>
              <div className="activity-item">
                <span className="activity-icon">🎯</span>
                <div className="activity-details">
                  <h4>Account Status</h4>
                  <p>Your account is active and in good standing</p>
                </div>
              </div>
              <div className="activity-item">
                <span className="activity-icon">🔐</span>
                <div className="activity-details">
                  <h4>Security</h4>
                  <p>Account secured with encrypted password</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="action-button primary">
            <span className="button-icon">✏️</span>
            Edit Profile
          </button>
          <button className="action-button secondary">
            <span className="button-icon">🔒</span>
            Change Password
          </button>
          <button className="action-button secondary">
            <span className="button-icon">⚙️</span>
            Notification Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;