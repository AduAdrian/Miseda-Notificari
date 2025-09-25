import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';
import './CreateNotification.css';

const CreateNotification = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!formData.title.trim() || !formData.message.trim()) {
      setMessage('Title and message are required');
      setLoading(false);
      return;
    }

    try {
  await axios.post(`${API_URL}/notifications`, formData);
      setMessage('Notification created successfully!');
      setFormData({
        title: '',
        message: '',
        type: 'info'
      });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating notification');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="create-notification-page">
      <div className="container">
        <div className="form-container">
          <div className="form-header">
            <h1>Create New Notification</h1>
            <p>Send a notification to yourself or others</p>
          </div>

          {message && (
            <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="notification-form">
            <div className="form-group">
              <label htmlFor="title">
                <span className="label-text">Title</span>
                <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter notification title"
                required
                disabled={loading}
                maxLength="200"
              />
              <small className="char-count">{formData.title.length}/200</small>
            </div>

            <div className="form-group">
              <label htmlFor="type">
                <span className="label-text">Type</span>
              </label>
              <div className="type-selector">
                {['info', 'success', 'warning', 'error'].map((type) => (
                  <label key={type} className="type-option">
                    <input
                      type="radio"
                      name="type"
                      value={type}
                      checked={formData.type === type}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <span className="type-label">
                      <span className="type-icon">{getTypeIcon(type)}</span>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message">
                <span className="label-text">Message</span>
                <span className="required">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Enter your notification message here..."
                required
                disabled={loading}
                rows="6"
                maxLength="1000"
              />
              <small className="char-count">{formData.message.length}/1000</small>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => setFormData({ title: '', message: '', type: 'info' })}
                className="clear-button"
                disabled={loading}
              >
                Clear Form
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={loading || !formData.title.trim() || !formData.message.trim()}
              >
                {loading ? 'Creating...' : 'Create Notification'}
              </button>
            </div>
          </form>

          <div className="preview-section">
            <h3>Preview</h3>
            <div className={`notification-preview ${formData.type}`}>
              <div className="preview-header">
                <span className="preview-icon">{getTypeIcon(formData.type)}</span>
                <h4>{formData.title || 'Notification Title'}</h4>
                <span className="preview-date">Now</span>
              </div>
              <p className="preview-message">
                {formData.message || 'Your notification message will appear here...'}
              </p>
              <p className="preview-sender">From: {user?.username}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNotification;