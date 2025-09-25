import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setMessage('Token invalid. Te rugăm să soliciti din nou resetarea parolei.');
    }
  }, [token]);

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

    // Validări
    if (!formData.newPassword) {
      setMessage('Te rugăm să introduci parola nouă');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage('Parola trebuie să aibă cel puțin 6 caractere');
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('Parolele nu se potrivesc');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://misedainspectsrl.ro'}/api/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Parola a fost resetată cu succes');
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMessage(data.message || 'Eroare la resetarea parolei');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setMessage('Eroare la conectarea la server. Încercați din nou mai târziu.');
    }
    
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Token Invalid</h2>
          <p className="error-message">
            Token-ul pentru resetarea parolei este invalid sau lipsește.
          </p>
          <Link to="/login" className="auth-link">
            Înapoi la conectare
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Resetează Parola</h2>
        
        {message && (
          <div className={`message ${message.includes('succes') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="newPassword">Parola nouă:</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Minim 6 caractere"
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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmă parola:</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Repetă parola nouă"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Se resetează...' : 'Resetează parola'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login" className="auth-link">
            Înapoi la conectare
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;