import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, ShieldCheck, Menu, X } from 'lucide-react';
import { logoutUser } from '../utils/storage';

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setIsMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand" style={{ fontSize: '1.8rem', fontWeight: 950, letterSpacing: '-1.5px', fontStyle: 'italic' }}>
        EventX
      </Link>

      <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>
      
      <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
        <Link 
          to="/" 
          className="nav-link" 
          style={{ color: isActive('/') ? 'var(--primary)' : 'inherit' }}
          onClick={() => setIsMenuOpen(false)}
        >
          Home
        </Link>
        {user ? (
          <>
            <Link 
              to={user.role === 'admin' ? '/admin' : '/dashboard'} 
              className="nav-link"
              style={{ color: (isActive('/admin') || isActive('/dashboard')) ? 'var(--primary)' : 'inherit' }}
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <div className="nav-user-controls" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '0px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', overflow: 'hidden', border: '1px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                {user.image ? <img src={user.image} alt="DP" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={18} />}
              </div>
              {user.role === 'admin' && <span className="badge badge-admin">Admin</span>}
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          </>
        ) : (
          <div className="nav-auth-buttons" style={{ display: 'flex', gap: '1rem' }}>
            <Link 
              to="/login" 
              className="btn btn-primary"
              style={{ background: isActive('/login') ? 'var(--primary-hover)' : 'var(--primary)' }}
              onClick={() => setIsMenuOpen(false)}
            >
              <User size={18} /> User Login
            </Link>
            <Link 
              to="/admin-login" 
              className="btn btn-secondary"
              style={{ borderColor: isActive('/admin-login') ? 'var(--primary)' : 'var(--border)' }}
              onClick={() => setIsMenuOpen(false)}
            >
              <ShieldCheck size={18} /> Admin Portal
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
