import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="container">
        <Link to="/dashboard" className="logo">
          <h1>📱 Notification App</h1>
        </Link>
        
        <nav className="nav">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/notifications" className="nav-link">Notifications</Link>
              <Link to="/create" className="nav-link">Create</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
              <button onClick={handleLogout} className="nav-button">
                Logout ({user.username})
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;