import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, LayoutDashboard, LogIn, Shield, LogOut, Menu, X } from 'lucide-react';
import { setItem } from '../../utils/storage';

export default function MobileLayout({ user, setUser, children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    setItem('oems_current_user', null);
    setUser(null);
    closeMenu();
    navigate('/');
  };

  const dashboardPath = user?.role === 'admin' ? '/admin' : '/dashboard';

  return (
    <div className="app-shell app-shell--mobile">
      <header className="mobile-topbar">
        <Link to="/" className="mobile-brand" onClick={closeMenu}>
          Event<span>X</span>
        </Link>
        <button
          className="mobile-topbar-btn"
          type="button"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {isMenuOpen && <button className="mobile-menu-overlay" type="button" onClick={closeMenu} aria-label="Close menu" />}

      <aside className={`mobile-menu-drawer ${isMenuOpen ? 'active' : ''}`}>
        <Link to="/events" className="mobile-drawer-link" onClick={closeMenu}>Explore Events</Link>
        {user ? (
          <>
            <Link to={dashboardPath} className="mobile-drawer-link" onClick={closeMenu}>
              {user.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}
            </Link>
            <button type="button" className="mobile-drawer-logout" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mobile-drawer-link" onClick={closeMenu}>User Login</Link>
            <Link to="/admin-login" className="mobile-drawer-link" onClick={closeMenu}>Admin Login</Link>
          </>
        )}
      </aside>

      <main className="main-content main-content--mobile">{children}</main>

      <nav className="mobile-bottom-nav">
        <Link to="/" className={`mobile-bottom-link ${location.pathname === '/' ? 'active' : ''}`}>
          <Home size={16} /> Home
        </Link>
        <Link to="/events" className={`mobile-bottom-link ${location.pathname.startsWith('/events') ? 'active' : ''}`}>
          <Search size={16} /> Explore
        </Link>
        {user ? (
          <Link to={dashboardPath} className={`mobile-bottom-link ${location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin') ? 'active' : ''}`}>
            <LayoutDashboard size={16} /> Dashboard
          </Link>
        ) : (
          <Link to="/login" className={`mobile-bottom-link ${location.pathname === '/login' ? 'active' : ''}`}>
            <LogIn size={16} /> Login
          </Link>
        )}
        {!user && (
          <Link to="/admin-login" className={`mobile-bottom-link ${location.pathname === '/admin-login' ? 'active' : ''}`}>
            <Shield size={16} /> Admin
          </Link>
        )}
      </nav>
    </div>
  );
}
