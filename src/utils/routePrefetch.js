const prefetchedRoutes = new Set();

const routeLoaders = {
  home: () => import('../pages/Home'),
  events: () => import('../pages/Events'),
  eventDetails: () => import('../pages/EventDetails'),
  booking: () => import('../pages/Booking'),
  userLogin: () => import('../pages/UserLogin'),
  adminLogin: () => import('../pages/AdminLogin'),
  userDashboard: () => import('../pages/UserDashboard'),
  admin: () => import('../pages/AdminDashboard'),
};

export const loadHome = routeLoaders.home;
export const loadEvents = routeLoaders.events;
export const loadEventDetails = routeLoaders.eventDetails;
export const loadBooking = routeLoaders.booking;
export const loadUserLogin = routeLoaders.userLogin;
export const loadAdminLogin = routeLoaders.adminLogin;
export const loadUserDashboard = routeLoaders.userDashboard;
export const loadAdminDashboard = routeLoaders.admin;

const runIdle = (cb) => {
  if (typeof window === 'undefined') return;
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(cb, { timeout: 1800 });
    return;
  }
  window.setTimeout(cb, 450);
};

export const prefetchRoute = (routeKey, options = {}) => {
  const loader = routeLoaders[routeKey];
  if (!loader || prefetchedRoutes.has(routeKey)) return;

  const startLoad = () => {
    if (prefetchedRoutes.has(routeKey)) return;
    prefetchedRoutes.add(routeKey);
    loader().catch(() => {
      prefetchedRoutes.delete(routeKey);
    });
  };

  if (options.idle) {
    runIdle(startLoad);
    return;
  }

  startLoad();
};

export const prefetchRoutes = (routeKeys, options = {}) => {
  routeKeys.forEach((routeKey) => prefetchRoute(routeKey, options));
};
