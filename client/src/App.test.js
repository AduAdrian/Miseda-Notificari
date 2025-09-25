import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock(
  'react-router-dom',
  () => ({
    BrowserRouter: ({ children }) => <div>{children}</div>,
    Routes: ({ children }) => <div>{children}</div>,
    Route: ({ element }) => element,
    Navigate: ({ to }) => <div>navigate:{to}</div>
  }),
  { virtual: true }
);

jest.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: () => ({ user: null, loading: false })
}));

jest.mock('./components/Header', () => () => <header>Notification Center</header>);
jest.mock('./components/Login', () => () => <div>Login Form</div>);
jest.mock('./components/Register', () => () => <div>Register Form</div>);
jest.mock('./components/Dashboard', () => () => <div>Dashboard</div>);
jest.mock('./components/NotificationList', () => () => <div>Notifications</div>);
jest.mock('./components/CreateNotification', () => () => <div>Create Notification</div>);
jest.mock('./components/Profile', () => () => <div>Profile</div>);
jest.mock('./components/ProtectedRoute', () => ({ children }) => <>{children}</>);

test('renders application shell with header and login route', () => {
  render(<App />);

  expect(screen.getByText(/notification center/i)).toBeInTheDocument();
  expect(screen.getByText(/login form/i)).toBeInTheDocument();
});
