import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Feed from './pages/Feed';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import Register from './pages/Register';
import Security from './pages/Security';
import Messages from './pages/Messages';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="container">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/explore"
            element={
              <ProtectedRoute>
                <Explore />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/profile"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:username"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="*"
            element={
              <div className="empty-state">
                <h2>Page not found</h2>
                <Link to="/" className="btn">Back to feed</Link>
              </div>
            }
          />

          <Route
           path="/settings/security"
           element={
            <ProtectedRoute>
            <Security />
            </ProtectedRoute>
        }
          />

        <Route
  path="/messages"
  element={
    <ProtectedRoute>
      <Messages />
    </ProtectedRoute>
  }
/>
<Route
  path="/messages/:username"
  element={
    <ProtectedRoute>
      <Messages />
    </ProtectedRoute>
  }
/>  
        </Routes>
      </main>
    </div>
  );
}