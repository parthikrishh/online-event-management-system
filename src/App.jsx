import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useMutation, api } from './services/apiService';
import Toast from './components/Toast';
import { ToastProvider } from './context/ToastContext';
import RouteLoader from './components/RouteLoader';
import PageTransition from './components/PageTransition';
import {
  loadAdminDashboard,
  loadAdminLogin,
  loadBooking,
  loadEventDetails,
  loadEvents,
  loadHome,
  loadUserDashboard,
  loadUserLogin,
  prefetchRoutes,
} from './utils/routePrefetch';

const Home = lazy(() => loadHome());
const Events = lazy(() => loadEvents());
const EventDetails = lazy(() => loadEventDetails());
const Booking = lazy(() => loadBooking());
const UserLogin = lazy(() => loadUserLogin());
const AdminLogin = lazy(() => loadAdminLogin());
const UserDashboard = lazy(() => loadUserDashboard());
const AdminDashboard = lazy(() => loadAdminDashboard());

function AnimatedRoutes({ user, setUser }) {
  const location = useLocation();

  useEffect(() => {
    const key = `scroll:${location.pathname}`;
    const saved = sessionStorage.getItem(key);
    if (saved) {
      window.scrollTo(0, Number(saved));
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      sessionStorage.setItem(`scroll:${location.pathname}`, String(window.scrollY));
    };
  }, [location.pathname]);

  const page = (element) => <PageTransition routeKey={location.pathname}>{element}</PageTransition>;

  return (
    <Suspense fallback={<RouteLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={page(<Home user={user} />)} />
          <Route path="/events" element={page(<Events user={user} />)} />
          <Route path="/events/:eventId" element={page(<EventDetails user={user} />)} />
          <Route path="/booking/:eventId" element={page(<Booking user={user} />)} />
          <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/'} /> : page(<UserLogin setUser={setUser} />)} />
          <Route path="/admin-login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/'} /> : page(<AdminLogin setUser={setUser} />)} />

          <Route
            path="/dashboard"
            element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : page(<UserDashboard user={user} />)) : <Navigate to="/login" />}
          />

          <Route
            path="/admin"
            element={user && user.role === 'admin' ? page(<AdminDashboard user={user} />) : <Navigate to="/" />}
          />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('oems_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      return null;
    }
  });
  const [toast, setToast] = useState(null);
  const seed = useMutation(api.events.seed);

  useEffect(() => {
    // Seed initial admin and demo user if data is missing
    const performSeed = async () => {
      try {
        // Seed default data in local storage on first run
        await seed();
      } catch (e) {
        console.warn("Seeding failed", e);
      }
    };
    performSeed();
  }, [seed]);

  useEffect(() => {
    prefetchRoutes(['events'], { idle: true });
    if (user?.role === 'admin') {
      prefetchRoutes(['admin'], { idle: true });
    }
  }, [user?.role]);

  return (
    <ToastProvider onToastChange={(t) => setToast(t)}>
      <Router>
        <div className="app-container">
          <Navbar user={user} setUser={setUser} />
          {toast && (
            <div className="toast-container">
              <Toast 
                message={toast.message} 
                type={toast.type} 
                onClose={() => setToast(null)} 
              />
            </div>
          )}
          <main className="main-content">
            <AnimatedRoutes user={user} setUser={setUser} />
          </main>
        <Footer />
      </div>
    </Router>
    </ToastProvider>
  );
}

export default App;
