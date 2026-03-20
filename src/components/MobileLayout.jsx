import { useMemo, useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, Home, LogOut, Menu, ShieldCheck, User as UserIcon, X } from 'lucide-react';
import { setItem } from '../utils/storage';

export default function MobileLayout({ user, setUser, children, toast, onCloseToast }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const tables = document.querySelectorAll('.mobile-layout table');
      tables.forEach((table) => {
        const headers = Array.from(table.querySelectorAll('thead th')).map((th) => th.textContent?.trim() || 'Field');
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach((row) => {
          const cells = row.querySelectorAll('td');
          cells.forEach((cell, idx) => {
            cell.setAttribute('data-label', headers[idx] || 'Field');
          });
        });
      });
    }, 20);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const dashboardPath = useMemo(() => {
    if (!user) return '/login';
    return user.role === 'admin' ? '/admin' : '/dashboard';
  }, [user]);

  const profilePath = useMemo(() => {
    if (!user) return '/login';
    return user.role === 'admin' ? '/admin' : '/dashboard';
  }, [user]);

  const handleLogout = () => {
    setItem('oems_current_user', null);
    setUser(null);
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <div className="mobile-layout">
      <header className="mobile-topbar">
        <button
          type="button"
          className="mobile-icon-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="Open mobile menu"
        >
          <Menu size={20} />
        </button>

        <Link to="/" className="mobile-brand">
          Event<span>X</span>
        </Link>

        <div className="mobile-avatar-mini" aria-hidden="true">
          {user?.image ? <img src={user.image} alt="profile" /> : <UserIcon size={16} />}
        </div>
      </header>

      {menuOpen && <button type="button" className="mobile-overlay" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}

      <aside className={`mobile-drawer ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer__head">
          <h3>Menu</h3>
          <button type="button" className="mobile-icon-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <div className="mobile-user-row">
          <div className="mobile-avatar-large">
            {user?.image ? <img src={user.image} alt="profile" /> : <UserIcon size={18} />}
          </div>
          <div>
            <strong>{user?.name || 'Guest User'}</strong>
            <small>{user ? user.email : 'Login to continue'}</small>
          </div>
        </div>

        <nav className="mobile-drawer__nav">
          <NavLink to="/" className="mobile-drawer__link" onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/events" className="mobile-drawer__link" onClick={() => setMenuOpen(false)}>Events</NavLink>
          <NavLink to={dashboardPath} className="mobile-drawer__link" onClick={() => setMenuOpen(false)}>Bookings</NavLink>
          <NavLink to={profilePath} className="mobile-drawer__link" onClick={() => setMenuOpen(false)}>Profile</NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className="mobile-drawer__link mobile-drawer__link-admin" onClick={() => setMenuOpen(false)}>
              <ShieldCheck size={16} /> Admin Console
            </NavLink>
          )}
        </nav>

        <div className="mobile-drawer__actions">
          {user ? (
            <button type="button" className="btn btn-secondary mobile-wide-btn" onClick={handleLogout}>
              <LogOut size={16} /> Log Out
            </button>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary mobile-wide-btn" onClick={() => setMenuOpen(false)}>User Login</Link>
              <Link to="/admin-login" className="btn btn-secondary mobile-wide-btn" onClick={() => setMenuOpen(false)}>Admin Login</Link>
            </>
          )}
        </div>
      </aside>

      {toast && (
        <div className="toast-container mobile-toast-container">
          <button type="button" className="mobile-toast-close" onClick={onCloseToast} aria-label="Close notification">
            <X size={14} />
          </button>
          {toast.message ? (
            <div className={`toast-message toast-${toast.type || 'info'}`}>
              <div className="toast-content">{toast.message}</div>
            </div>
          ) : null}
        </div>
      )}

      <main className="mobile-main">{children}</main>

      <nav className="mobile-bottom-nav" aria-label="Primary">
        <NavLink to="/" className="mobile-bottom-nav__item">
          <Home size={18} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/events" className="mobile-bottom-nav__item">
          <CalendarDays size={18} />
          <span>Events</span>
        </NavLink>
        <NavLink to={dashboardPath} className="mobile-bottom-nav__item">
          <CalendarDays size={18} />
          <span>Bookings</span>
        </NavLink>
        <NavLink to={profilePath} className="mobile-bottom-nav__item">
          <UserIcon size={18} />
          <span>Profile</span>
        </NavLink>
      </nav>
    </div>
  );
}
