export const getItem = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const setItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const initStorage = () => {
  if (!getItem('oems_current_user')) {
    setItem('oems_current_user', null);
  }

  if (!getItem('oems_wishlists')) {
    setItem('oems_wishlists', {});
  }
  
  if (!getItem('oems_waitlists')) {
    setItem('oems_waitlists', {});
  }

};

// Wishlist Logic (Retained as Local feature)
export const toggleWishlist = (userId, eventId) => {
  const wishlists = getItem('oems_wishlists') || {};
  if (!wishlists[userId]) wishlists[userId] = [];
  
  if (wishlists[userId].includes(eventId)) {
    wishlists[userId] = wishlists[userId].filter(id => id !== eventId);
  } else {
    wishlists[userId].push(eventId);
  }
  setItem('oems_wishlists', wishlists);
  return wishlists[userId];
};

export const getUserWishlist = (userId) => {
  const wishlists = getItem('oems_wishlists') || {};
  return wishlists[userId] || [];
};

// Waitlist Logic (Retained as Local feature)
export const addToWaitlist = (userId, eventId) => {
  const waitlists = getItem('oems_waitlists') || {};
  if (!waitlists[eventId]) waitlists[eventId] = [];
  if (!waitlists[eventId].includes(userId)) {
    waitlists[eventId].push(userId);
    setItem('oems_waitlists', waitlists);
  }
  return waitlists[eventId];
};

export const getWaitlistCount = (eventId) => {
  const waitlists = getItem('oems_waitlists') || {};
  return waitlists[eventId] ? waitlists[eventId].length : 0;
};

