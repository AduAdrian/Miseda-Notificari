import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordData, setForgotPasswordData] = useState({
    contact: '',
    method: 'email' // 'email' or 'sms'
  });
  
  const { login } = useAuth();
  const navigate = useNavigate();

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

    // Validare câmp email/telefon
    if (!formData.emailOrPhone.trim()) {
      setMessage('Te rugăm să introduci email-ul sau numărul de telefon');
      setLoading(false);
      return;
    }

    if (!formData.password) {
      setMessage('Te rugăm să introduci parola');
      setLoading(false);
      return;
    }

    const result = await login(formData.emailOrPhone, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setMessage(result.message);
    }
    
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    if (!forgotPasswordData.contact) {
      setMessage('Te rugăm să introduci email-ul sau numărul de telefon');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://misedainspectsrl.ro'}/api/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailOrPhone: forgotPasswordData.contact
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Link-ul de resetare a fost trimis pe email');
        setShowForgotPassword(false);
        // Clear form
        setForgotPasswordData({
          contact: '',
          method: 'email'
        });
      } else {
        setMessage(data.message || 'Eroare la trimiterea link-ului de resetare');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setMessage('Eroare la conectarea la server. Încercați din nou mai târziu.');
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Conectare</h2>
        
        {message && (
          <div className={`message ${message.includes('succes') || message.includes('trimise') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {!showForgotPassword ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="emailOrPhone">Email sau număr telefon:</label>
              <input
                type="text"
                id="emailOrPhone"
                name="emailOrPhone"
                value={formData.emailOrPhone}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="exemplu@email.com sau 0721123456"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Parolă:</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Introduceți parola"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? '👁️‍🗨️' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Se conectează...' : 'Conectează-te'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="auth-form">
            <h3>Resetare parolă</h3>
            
            <div className="form-group">
              <label>Alege metoda de recuperare:</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    value="email"
                    checked={forgotPasswordData.method === 'email'}
                    onChange={(e) => setForgotPasswordData({...forgotPasswordData, method: e.target.value})}
                  />
                  📧 Email
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    value="sms"
                    checked={forgotPasswordData.method === 'sms'}
                    onChange={(e) => setForgotPasswordData({...forgotPasswordData, method: e.target.value})}
                  />
                  📱 SMS
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contact">
                {forgotPasswordData.method === 'email' ? 'Email:' : 'Număr telefon:'}
              </label>
              <input
                type={forgotPasswordData.method === 'email' ? 'email' : 'tel'}
                id="contact"
                value={forgotPasswordData.contact}
                onChange={(e) => setForgotPasswordData({...forgotPasswordData, contact: e.target.value})}
                required
                disabled={loading}
                placeholder={forgotPasswordData.method === 'email' ? 'exemplu@email.com' : '0721123456'}
              />
            </div>

            <div className="form-buttons">
              <button type="submit" disabled={loading} className="auth-button">
                {loading ? 'Se trimite...' : `Trimite ${forgotPasswordData.method === 'email' ? 'email' : 'SMS'}`}
              </button>
              <button 
                type="button" 
                onClick={() => setShowForgotPassword(false)}
                className="auth-button secondary"
                disabled={loading}
              >
                Înapoi
              </button>
            </div>
          </form>
        )}

        <div className="auth-links">
          {!showForgotPassword && (
            <>
              <p>
                Nu ai un cont? <Link to="/register">Înregistrează-te aici</Link>
              </p>
              <p>
                <button 
                  type="button"
                  className="link-button"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Ai uitat parola?
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;