import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import UserLogin from './pages/UserLogin';
import AdminLogin from './pages/AdminLogin';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { getCurrentUser } from './utils/storage';

function App() {
  const [user, setUser] = useState(() => getCurrentUser() || null);

  return (
    <Router>
      <div className="app-container">
        <Navbar user={user} setUser={setUser} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/'} /> : <UserLogin setUser={setUser} />} />
            <Route path="/admin-login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/'} /> : <AdminLogin setUser={setUser} />} />
            
            <Route 
              path="/dashboard" 
              element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <UserDashboard user={user} />) : <Navigate to="/login" />} 
            />
            
            <Route 
              path="/admin" 
              element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
