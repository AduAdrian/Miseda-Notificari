# Notification App

A full-stack notification management application built with React frontend and Node.js backend, designed to connect to your existing MySQL database.

## 🚀 Features

- **User Authentication**: Secure login and registration system
- **Real-time Notifications**: Create, view, and manage notifications
- **Dashboard**: Overview of notification statistics
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **MySQL Integration**: Connects to your existing database

## 🛠️ Tech Stack

**Frontend:**

- React 18
- React Router DOM
- Axios for API calls
- CSS3 with modern styling

**Backend:**

- Node.js with Express
- MySQL2 for database connectivity
- JWT for authentication
- bcryptjs for password hashing
- CORS for cross-origin requests
- Rate limiting for security

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js (v14 or higher)
- MySQL database access
- Your database credentials from phpMyAdmin

## ⚙️ Installation

1. **Install root dependencies:**

   ```bash
   npm install
   ```

2. **Install server dependencies:**

   ```bash
   cd server
   npm install
   cd ..
   ```

3. **Install client dependencies:**

   ```bash
   cd client
   npm install
   cd ..
   ```

   Or use the convenience script:

   ```bash
   npm run install-deps
   ```

## 🔧 Configuration

1. **Database Setup:**

   - Run the SQL commands in `server/database.sql` in your phpMyAdmin
   - This will create the required tables: `users` and `notifications`

2. **Environment Variables:**
   - Copy `server/.env.example` to `server/.env`
   - Update the database credentials and security settings:
   ```env
   DB_HOST=server50.romania-webhosting.com
   DB_USER=your_database_username
   DB_PASSWORD=your_database_password
   DB_NAME=your_database_name
   JWT_SECRET=your-super-secret-jwt-key
   ALLOWED_ORIGINS=https://misedainspectsrl.ro,https://www.misedainspectsrl.ro
   ```
   - Copy `client/.env.example` to `client/.env`
   - Point the frontend to the desired backend host:
   ```env
   REACT_APP_API_URL=https://misedainspectsrl.ro
   ```
   - For local development you can omit the variables or set `REACT_APP_API_URL=http://localhost:5000`

## 🚀 Running the Application

**Development Mode:**

```bash
npm run dev
```

This will start:

- Backend server on http://localhost:5000 (or your configured `REACT_APP_API_URL`)
- Frontend React app on http://localhost:3000

**Production Mode:**

```bash
npm start
```

## 📊 API Endpoints

- `POST /api/register` - User registration
- `POST /api/login` - User authentication
- `GET /api/profile` - Get user profile
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create new notification
- `PUT /api/notifications/:id/read` - Mark notification as read

## 🎨 Screenshots

The application includes:

- **Dashboard**: Welcome page with statistics
- **Notifications**: Complete notification management
- **Create**: Form to create new notifications
- **Profile**: User profile information
- **Authentication**: Login and registration forms

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcryptjs
- Rate limiting to prevent abuse
- CORS protection
- SQL injection protection with parameterized queries

## 📱 Responsive Design

The application is fully responsive and works great on:

- Desktop computers
- Tablets
- Mobile phones

## 🚀 Deployment

To deploy to https://misedainspectsrl.ro/:

1. Build the frontend:
   ```bash
   cd client
   npm run build
   ```
2. Upload the contents of `client/build` to your hosting provider (e.g., cPanel or static hosting).
3. Deploy the Node.js server (or host it via your provider) with the environment variables from `.env`.
4. Ensure the domain points to the deployed frontend and that the backend is reachable at the same domain or a subdomain.

The application is also ready for deployment to:

- Heroku
- Vercel (frontend)
- DigitalOcean
- AWS
- Any Node.js hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Important Notes

- Make sure to update your database credentials in the `.env` file
- The sample data includes a default admin user with password 'password'
- For production, make sure to use secure JWT secrets and database passwords
- Run the database setup SQL before starting the application

## 🆘 Troubleshooting

**Common Issues:**

1. **Database Connection Error:**

   - Verify your database credentials in `.env`
   - Ensure your database server is accessible
   - Check if the database and tables exist

2. **Port Already in Use:**

   - Change the PORT in `.env` file
   - Kill the process using the port: `lsof -ti:5000 | xargs kill -9`

3. **CORS Issues:**
   - Ensure the frontend URL is listed in `ALLOWED_ORIGINS`
   - Confirm `REACT_APP_API_URL` matches the backend host
   - Check if the backend server is running

For more help, please create an issue in the repository.
