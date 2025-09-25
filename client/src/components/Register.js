import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    nume: '',
    prenume: '',
    telefon: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordData, setForgotPasswordData] = useState({
    contact: '',
    method: 'email' // 'email' or 'sms'
  });
  
  const { register } = useAuth();
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

    // Validare: cel puțin unul dintre telefon sau email trebuie completat
    if (!formData.telefon && !formData.email) {
      setMessage('Te rugăm să completezi cel puțin numărul de telefon sau email-ul');
      setLoading(false);
      return;
    }

    // Validare telefon (dacă este completat)
    if (formData.telefon && !/^[0-9+\-\s()]{10,15}$/.test(formData.telefon)) {
      setMessage('Te rugăm să introduci un număr de telefon valid');
      setLoading(false);
      return;
    }

    // Validare email (dacă este completat)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setMessage('Te rugăm să introduci o adresă de email validă');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage('Parolele nu se potrivesc');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setMessage('Parola trebuie să aibă cel puțin 6 caractere');
      setLoading(false);
      return;
    }

    // Validare nume și prenume
    if (formData.nume.trim().length < 2) {
      setMessage('Te rugăm să introduci numele complet');
      setLoading(false);
      return;
    }

    if (formData.prenume.trim().length < 2) {
      setMessage('Te rugăm să introduci prenumele complet');
      setLoading(false);
      return;
    }

    const result = await register(
      formData.nume.trim(),
      formData.prenume.trim(),
      formData.telefon.trim() || null,
      formData.email.trim() || null,
      formData.password
    );
    
    if (result.success) {
      setMessage('Înregistrare realizată cu succes! Te poți conecta acum.');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setMessage(result.message);
    }
    
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!forgotPasswordData.contact) {
      setMessage('Te rugăm să introduci email-ul sau numărul de telefon');
      setLoading(false);
      return;
    }

    // Simulare trimitere email/SMS
    setTimeout(() => {
      setMessage(`Instrucțiuni pentru resetarea parolei au fost trimise ${forgotPasswordData.method === 'email' ? 'prin email' : 'prin SMS'}`);
      setShowForgotPassword(false);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Înregistrare</h2>
        
        {message && (
          <div className={`message ${message.includes('succes') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {!showForgotPassword ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group half-width">
                <label htmlFor="nume">Nume *:</label>
                <input
                  type="text"
                  id="nume"
                  name="nume"
                  value={formData.nume}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  minLength="2"
                  placeholder="Introduceți numele"
                />
              </div>

              <div className="form-group half-width">
                <label htmlFor="prenume">Prenume *:</label>
                <input
                  type="text"
                  id="prenume"
                  name="prenume"
                  value={formData.prenume}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  minLength="2"
                  placeholder="Introduceți prenumele"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="telefon">Număr telefon:</label>
              <input
                type="tel"
                id="telefon"
                name="telefon"
                value={formData.telefon}
                onChange={handleChange}
                disabled={loading}
                placeholder="Ex: 0721123456 sau +40721123456"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                placeholder="exemplu@email.com"
              />
            </div>

            <div className="contact-requirement">
              <small>* Cel puțin unul dintre câmpurile "Număr telefon" sau "Email" trebuie completat</small>
            </div>

            <div className="form-group">
              <label htmlFor="password">Parolă *:</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  minLength="6"
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
              <label htmlFor="confirmPassword">Confirmă parola *:</label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Repetă parola"
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
              {loading ? 'Se înregistrează...' : 'Înregistrează-te'}
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
                Ai deja un cont? <Link to="/login">Conectează-te aici</Link>
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

export default Register;