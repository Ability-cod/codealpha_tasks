import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import ProjectBoard from './pages/ProjectBoard';
import Notifications from './pages/Notifications';
import EditProfile from './pages/EditProfile';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectBoard /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/settings/profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="*"
            element={
              <div className="empty-state">
                <h2>Page not found</h2>
                <Link to="/" className="btn">Back to dashboard</Link>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}