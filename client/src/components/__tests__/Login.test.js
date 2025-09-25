// Mock react-router-dom before any imports
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, ...props }) => <a {...props}>{children}</a>
}), { virtual: true });

// Mock axios before any imports
jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
  defaults: {
    baseURL: '',
    headers: { common: {} }
  }
}), { virtual: true });

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Login from '../Login';
import { AuthProvider } from '../../contexts/AuthContext';

// Setup useNavigate mock

describe('Login component', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    axios.post.mockReset();
    axios.get.mockReset();
    localStorage.clear();
  });

  const renderLoginWithAuth = () => {
    return render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );
  };

  it('submits credentials to remote server and navigates on success', async () => {
    // Mock successful login response
    axios.post.mockResolvedValueOnce({
      data: { 
        token: 'test-token',
        user: { id: 1, email: 'test@example.com' },
        message: 'Login successful'
      }
    });

    renderLoginWithAuth();

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Password123!');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/login', {
        email: 'test@example.com',
        password: 'Password123!'
      });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error feedback on failed login from remote server', async () => {
    // Mock failed login response
    axios.post.mockRejectedValueOnce({
      response: {
        data: { message: 'Invalid credentials' }
      }
    });

    renderLoginWithAuth();

    await userEvent.type(screen.getByLabelText(/email/i), 'fail@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'badpass');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/login', {
        email: 'fail@example.com',
        password: 'badpass'
      });
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
