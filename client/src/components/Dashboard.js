import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../config';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalNotifications: 0,
    unreadNotifications: 0,
    recentNotifications: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
  const response = await axios.get(`${API_URL}/notifications`);
      const notifications = response.data;
      
      setStats({
        totalNotifications: notifications.length,
        unreadNotifications: notifications.filter(n => !n.is_read).length,
        recentNotifications: notifications.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
  await axios.put(`${API_URL}/notifications/${notificationId}/read`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationTypeIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="welcome-section">
          <h1>Welcome back, {user?.username}! 👋</h1>
          <p>Here's what's happening with your notifications</p>
        </div>

        <div className="stats-grid">
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
              <h3>{stats.unreadNotifications}</h3>
              <p>Unread Notifications</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👤</div>
            <div className="stat-content">
              <h3>Active</h3>
              <p>Account Status</p>
            </div>
          </div>
        </div>

        <div className="recent-section">
          <h2>Recent Notifications</h2>
          {stats.recentNotifications.length === 0 ? (
            <div className="empty-state">
              <p>No notifications yet. Create your first notification!</p>
            </div>
          ) : (
            <div className="notifications-list">
              {stats.recentNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                >
                  <div className="notification-header">
                    <span className="notification-type">
                      {getNotificationTypeIcon(notification.type)}
                    </span>
                    <h4>{notification.title}</h4>
                    <span className="notification-date">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  {notification.sender_name && (
                    <p className="notification-sender">From: {notification.sender_name}</p>
                  )}
                  {!notification.is_read && (
                    <button 
                      onClick={() => markAsRead(notification.id)}
                      className="mark-read-btn"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;