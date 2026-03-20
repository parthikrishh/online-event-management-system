import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Menu, X } from 'lucide-react';
import { setItem } from '../utils/storage';
import { prefetchRoute } from '../utils/routePrefetch';

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    setItem('oems_current_user', null);
    setUser(null);
    setIsMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const prefetch = (routeKey) => {
    prefetchRoute(routeKey, { idle: true });
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        Event<span>X</span>
      </Link>

      <button
        className="mobile-menu-btn"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isMenuOpen}
        aria-controls="main-navigation"
        type="button"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      <div id="main-navigation" className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
        <Link 
          to="/events" 
          className={`nav-link ${isActive('/events') || isActive('/') ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(false)}
          onMouseEnter={() => prefetch('events')}
          onFocus={() => prefetch('events')}
        >
          Explore Events
        </Link>
        {user ? (
          <>
            <Link 
              to={user.role === 'admin' ? '/admin' : '/dashboard'} 
              className={`nav-link ${isActive('/admin') || isActive('/dashboard') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
              onMouseEnter={() => prefetch(user.role === 'admin' ? 'admin' : 'userDashboard')}
              onFocus={() => prefetch(user.role === 'admin' ? 'admin' : 'userDashboard')}
            >
              {user.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}
            </Link>
            <div className="nav-user-controls">
              <div style={{ position: 'relative' }}>
                <div className="nav-avatar">
                  {user.image ? <img src={user.image} alt="profile" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={18} />}
                </div>
                {user.role === 'admin' && <div className="nav-admin-dot" />}
              </div>
              <button onClick={handleLogout} className="btn btn-ghost">
                <LogOut size={16} /> Log Out
              </button>
            </div>
          </>
        ) : (
          <div className="nav-auth-buttons">
            <Link 
              to="/login" 
              className="btn btn-primary"
              onClick={() => setIsMenuOpen(false)}
              onMouseEnter={() => prefetch('userLogin')}
              onFocus={() => prefetch('userLogin')}
            >
              User Login
            </Link>
            <Link 
              to="/admin-login" 
              className="btn btn-secondary"
              onClick={() => setIsMenuOpen(false)}
              onMouseEnter={() => prefetch('adminLogin')}
              onFocus={() => prefetch('adminLogin')}
            >
              Admin Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
