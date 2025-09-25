import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import './NotificationList.css';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, read, unread

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
  const response = await axios.get(`${API_URL}/notifications`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
  await axios.put(`${API_URL}/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
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

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'read') return notification.is_read;
    if (filter === 'unread') return !notification.is_read;
    return true;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="notification-list-page">
      <div className="container">
        <div className="page-header">
          <h1>All Notifications</h1>
          <div className="filter-controls">
            <button 
              className={filter === 'all' ? 'active' : ''} 
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </button>
            <button 
              className={filter === 'unread' ? 'active' : ''} 
              onClick={() => setFilter('unread')}
            >
              Unread ({notifications.filter(n => !n.is_read).length})
            </button>
            <button 
              className={filter === 'read' ? 'active' : ''} 
              onClick={() => setFilter('read')}
            >
              Read ({notifications.filter(n => n.is_read).length})
            </button>
          </div>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <h3>No notifications found</h3>
            <p>
              {filter === 'all' 
                ? "You don't have any notifications yet." 
                : `No ${filter} notifications found.`
              }
            </p>
          </div>
        ) : (
          <div className="notifications-grid">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`notification-card ${!notification.is_read ? 'unread' : ''}`}
              >
                <div className="notification-header">
                  <div className="type-and-title">
                    <span className="notification-type">
                      {getNotificationTypeIcon(notification.type)}
                    </span>
                    <h3>{notification.title}</h3>
                  </div>
                  <div className="notification-meta">
                    <span className="notification-date">
                      {new Date(notification.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {!notification.is_read && (
                      <span className="unread-indicator">New</span>
                    )}
                  </div>
                </div>
                
                <p className="notification-message">{notification.message}</p>
                
                {notification.sender_name && (
                  <p className="notification-sender">
                    <strong>From:</strong> {notification.sender_name}
                  </p>
                )}
                
                <div className="notification-actions">
                  <span className={`type-badge ${notification.type}`}>
                    {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                  </span>
                  {!notification.is_read && (
                    <button 
                      onClick={() => markAsRead(notification.id)}
                      className="mark-read-btn"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;