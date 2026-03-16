export const getItem = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const setItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const initStorage = () => {
  if (!getItem('oems_users')) {
    setItem('oems_users', [
      { id: '1', name: 'Admin User', email: 'admin@event.com', password: 'admin', role: 'admin' },
      { id: '2', name: 'Test User', email: 'user@event.com', password: 'user', role: 'user' },
    ]);
  }

  const SEED_EVENTS = [
    { id: 'seed1', name: 'Tech Conference 2026', description: 'A massive tech conference focusing on AI and Web Dev.', date: '2026-05-10', time: '10:00 AM', location: 'San Francisco, CA', price: 150, vipPrice: 250, category: 'Technology', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800', venueSize: 50, status: 'approved' },
    { id: 'seed2', name: 'React Summit 2026', description: 'React performance, server components, and styling excellence.', date: '2026-06-15', time: '09:00 AM', location: 'New York, NY', price: 200, vipPrice: 350, category: 'Technology', image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&q=80&w=800', venueSize: 50, status: 'approved' },
    { id: 'seed3', name: 'Live Art Exhibition 2026', description: 'Showcasing the works of emerging local artists.', date: '2026-07-22', time: '11:00 AM', location: 'Austin, TX', price: 20, vipPrice: 40, category: 'Cultural Events', image: 'https://images.unsplash.com/photo-1467307983825-619af9548301?auto=format&fit=crop&q=80&w=800', venueSize: 50, status: 'approved' },
    { id: 'seed4', name: 'Summer Music Festival 2026', description: 'A massive three-day outdoor music festival featuring world-class artists.', date: '2026-08-10', time: '04:00 PM', location: 'Chicago, IL', price: 100, vipPrice: 300, category: 'Music Concerts', image: 'https://images.unsplash.com/photo-1501281668695-021444638ffc?auto=format&fit=crop&q=80&w=800', venueSize: 100, status: 'approved' },
    { id: 'seed5', name: 'DJ Night Extravaganza 2026', description: 'A night of electrifying beats and non-stop dance music.', date: '2026-09-05', time: '08:00 PM', location: 'Las Vegas, NV', price: 80, vipPrice: 150, category: 'DJ Night', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800', venueSize: 100, status: 'approved' },
  ];

  if (!getItem('oems_events')) {
    setItem('oems_events', SEED_EVENTS);
  } else {
    // Auto-reset events if all existing events are past-dated (stale demo data)
    const existingEvents = getItem('oems_events') || [];
    const today = new Date().toLocaleDateString('en-CA');
    const hasUpcoming = existingEvents.some(e => e.date >= today);
    if (!hasUpcoming && existingEvents.length > 0) {
      setItem('oems_events', SEED_EVENTS);
    }
  }

  if (!getItem('oems_bookings')) {
    setItem('oems_bookings', []);
  }

  if (!getItem('oems_wishlists')) {
    setItem('oems_wishlists', {});
  }
  
  if (!getItem('oems_waitlists')) {
    setItem('oems_waitlists', {}); // { eventId: [userId, ...] }
  }

  if (!getItem('oems_reviews')) {
    setItem('oems_reviews', []); // { eventId, userId, rating, comment, date }
  }

  if (!getItem('oems_refunds')) {
    setItem('oems_refunds', []); // { id, bookingId, userId, amount, reason, status, date }
  }

  if (!getItem('oems_admin_logs')) {
    setItem('oems_admin_logs', []); // { action, details, date }
  }
};

export const getCurrentUser = () => {
  return getItem('oems_current_user');
};

export const loginUser = (email, password) => {
  const users = getItem('oems_users') || [];
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    setItem('oems_current_user', user);
    return user;
  }
  return null;
};

export const logoutUser = () => {
  localStorage.removeItem('oems_current_user');
};

export const registerUser = ({ name, email, password }) => {
  const users = getItem('oems_users') || [];
  if (users.find(u => u.email === email)) {
    return false; // Email exists
  }
  const newUser = { id: Date.now().toString(), name, email, password, role: 'user' };
  users.push(newUser);
  setItem('oems_users', users);
  setItem('oems_current_user', newUser);
  return newUser;
};

export const resetPassword = (email, newPassword) => {
  const users = getItem('oems_users') || [];
  const userIndex = users.findIndex(u => u.email === email);
  if (userIndex !== -1) {
    users[userIndex].password = newPassword;
    setItem('oems_users', users);
    return true;
  }
  return false;
};

export const updateUserProfile = (userId, updatedData) => {
  const users = getItem('oems_users') || [];
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex !== -1) {
    // Merge existing user data with updated data
    users[userIndex] = { ...users[userIndex], ...updatedData };
    setItem('oems_users', users);
    
    // Update session data if it's the current user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      setItem('oems_current_user', users[userIndex]);
    }
    return users[userIndex];
  }
  return null;
};

export const deleteUserAccount = (userId) => {
  // Remove from user list
  const users = getItem('oems_users') || [];
  setItem('oems_users', users.filter(u => u.id !== userId));
  
  // Remove their bookings
  const bookings = getItem('oems_bookings') || [];
  setItem('oems_bookings', bookings.filter(b => b.userId !== userId));

  // Remove their reviews
  const reviews = getItem('oems_reviews') || [];
  setItem('oems_reviews', reviews.filter(r => r.userId !== userId));

  // Remove from wishlists
  const wishlists = getItem('oems_wishlists') || {};
  delete wishlists[userId];
  setItem('oems_wishlists', wishlists);
  
  // Clean up session
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    localStorage.removeItem('oems_current_user');
  }
  
  return true;
};

export const getBookedSeatsForEvent = (eventId) => {
  const bookings = getItem('oems_bookings') || [];
  return bookings
    .filter(b => b.eventId === eventId)
    .reduce((acc, b) => {
      if (b.selectedSeats) return [...acc, ...b.selectedSeats];
      return acc;
    }, []);
};

export const bookEvent = (userId, eventId, numTickets, selectedSeats = [], promoDiscount = 0, promoCode = null) => {
  const events = getItem('oems_events') || [];
  const event = events.find(e => e.id === eventId);
  if (!event) return null;

  const users = getItem('oems_users') || [];
  const user = users.find(u => u.id === userId);
  if (!user) return null;

  let totalAmount = 0;
  // Calculate tiered pricing
  selectedSeats.forEach(seat => {
    const row = seat.charAt(0);
    if (row === 'A' || row === 'B') {
      totalAmount += (event.vipPrice || event.price * 1.5);
    } else {
      totalAmount += Number(event.price);
    }
  });
  
  const originalTotal = totalAmount;
  
  // Apply Promo
  let discountedAmount = totalAmount;
  if (promoDiscount > 0) {
    discountedAmount = totalAmount - (totalAmount * promoDiscount);
  }

  const cgst = discountedAmount * 0.09;
  const sgst = discountedAmount * 0.09;
  const grandTotal = discountedAmount + cgst + sgst;

  const newBooking = {
    id: Date.now().toString(),
    billId: 'BILL-' + Math.floor(100000 + Math.random() * 900000),
    userId,
    userName: user.name,
    eventId,
    eventName: event.name,
    numTickets,
    selectedSeats,
    ticketPrice: event.price, // base price
    originalTotal: Number(originalTotal.toFixed(2)),
    discountUsed: promoDiscount,
    promoCode: promoCode,
    discountedAmount: Number(discountedAmount.toFixed(2)),
    cgst: Number(cgst.toFixed(2)),
    sgst: Number(sgst.toFixed(2)),
    totalAmount: Number(grandTotal.toFixed(2)), // final grand total
    bookingDate: new Date().toISOString(),
    status: 'booked'
  };

  const bookings = getItem('oems_bookings') || [];
  bookings.push(newBooking);
  setItem('oems_bookings', bookings);
  return newBooking;
};

// Wishlist Logic
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

// Check-in logic
export const checkInTicket = (billId, targetEventId) => {
  const bookings = getItem('oems_bookings') || [];
  const events = getItem('oems_events') || [];
  const booking = bookings.find(b => b.billId === billId);
  
  if (!booking) return 'not_found';

  // If a specific event is selected at the gate, verify it matches
  if (targetEventId && booking.eventId !== targetEventId) {
    return 'event_mismatch';
  }
  
  const event = events.find(e => e.id === booking.eventId);
  if (!event) return 'not_found';

  // Date comparison logic
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  const eventDate = event.date; // already YYYY-MM-DD

  if (today !== eventDate) {
    return 'not_today';
  }

  if (['cancelled', 'refunded', 'refund_requested'].includes(booking.status)) return 'invalid_status';
  if (booking.status === 'checked-in') return 'already_checked_in';

  const index = bookings.findIndex(b => b.billId === billId);
  bookings[index].status = 'checked-in';
  bookings[index].checkInDate = new Date().toISOString();
  setItem('oems_bookings', bookings);
  return 'success';
};

export const revertCheckIn = (bookingId) => {
  const bookings = getItem('oems_bookings') || [];
  const idx = bookings.findIndex(b => b.id === bookingId);
  if (idx !== -1) {
    bookings[idx].status = 'booked';
    delete bookings[idx].checkInDate;
    setItem('oems_bookings', bookings);
    return true;
  }
  return false;
};

// Cancellation logic
export const cancelBookingByUser = (bookingId) => {
  let bookings = getItem('oems_bookings') || [];
  const index = bookings.findIndex(b => b.id === bookingId);
  if (index !== -1 && bookings[index].status === 'booked') {
    bookings[index].status = 'cancelled';
    setItem('oems_bookings', bookings);
    return true;
  }
  return false;
};

export const deleteBooking = (bookingId) => {
  let bookings = getItem('oems_bookings') || [];
  const updatedBookings = bookings.filter(b => b.id !== bookingId);
  setItem('oems_bookings', updatedBookings);
  return true;
};

export const cancelEventAndRefund = (eventId, reason = "Event Cancelled by Admin") => {
  let events = getItem('oems_events') || [];
  events = events.filter(e => e.id !== eventId);
  setItem('oems_events', events);

  let bookings = getItem('oems_bookings') || [];
  const affectedBookings = bookings.filter(b => b.eventId === eventId && (b.status === 'booked' || b.status === 'checked-in'));
  
  // Create refund records for history
  const refunds = getItem('oems_refunds') || [];
  affectedBookings.forEach(b => {
    refunds.push({
      id: Date.now().toString() + Math.random(),
      bookingId: b.id,
      userId: b.userId,
      amount: b.totalAmount,
      reason: reason,
      bankDetails: "Auto-refund (Event Cancelled)",
      status: 'approved',
      date: new Date().toISOString()
    });
  });
  setItem('oems_refunds', refunds);

  bookings = bookings.map(b => {
    if (b.eventId === eventId && (b.status === 'booked' || b.status === 'checked-in')) {
      return { ...b, status: 'refunded' };
    }
    return b;
  });
  setItem('oems_bookings', bookings);
  return affectedBookings;
};

// Waitlist Logic
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

// Review Logic
export const addReview = (userId, userName, eventId, rating, comment) => {
  const reviews = getItem('oems_reviews') || [];
  const newReview = {
    id: Date.now().toString(),
    userId,
    userName,
    eventId,
    rating,
    comment,
    date: new Date().toISOString()
  };
  reviews.push(newReview);
  setItem('oems_reviews', reviews);
  return newReview;
};

export const getReviewsForEvent = (eventId) => {
  const reviews = getItem('oems_reviews') || [];
  return reviews.filter(r => r.eventId === eventId).reverse();
};



export const requestRefund = (bookingId, userId, amount, reason, bankDetails) => {
  const refunds = getItem('oems_refunds') || [];
  const newRefund = {
    id: Date.now().toString(),
    bookingId,
    userId,
    amount,
    reason,
    bankDetails,
    status: 'pending',
    date: new Date().toISOString()
  };
  refunds.push(newRefund);
  setItem('oems_refunds', refunds);

  // Update booking status
  const bookings = getItem('oems_bookings') || [];
  const bookingIndex = bookings.findIndex(b => b.id === bookingId);
  if (bookingIndex !== -1) {
    bookings[bookingIndex].status = 'refund_requested';
    setItem('oems_bookings', bookings);
  }

  return newRefund;
};

export const processRefund = (refundId, approve) => {
  const refunds = getItem('oems_refunds') || [];
  const refundIndex = refunds.findIndex(r => r.id === refundId);
  if (refundIndex === -1) return false;

  refunds[refundIndex].status = approve ? 'approved' : 'rejected';
  setItem('oems_refunds', refunds);

  if (approve) {
    const bookings = getItem('oems_bookings') || [];
    const bookingIndex = bookings.findIndex(b => b.id === refunds[refundIndex].bookingId);
    if (bookingIndex !== -1) {
      bookings[bookingIndex].status = 'refunded';
      setItem('oems_bookings', bookings);
    }
  }

  return true;
};

export const deleteRefund = (refundId) => {
  const refunds = getItem('oems_refunds') || [];
  const updatedRefunds = refunds.filter(r => r.id !== refundId);
  setItem('oems_refunds', updatedRefunds);
  return true;
};

export const addAdminLog = (action, details) => {
  const logs = getItem('oems_admin_logs') || [];
  logs.unshift({
    id: Date.now().toString(),
    action,
    details,
    date: new Date().toISOString()
  });
  setItem('oems_admin_logs', logs.slice(0, 50)); 
};

export const deleteEvent = (eventId) => {
  // Delete the event
  const events = getItem('oems_events') || [];
  setItem('oems_events', events.filter(e => e.id !== eventId));
  
  // Clean up bookings
  const bookings = getItem('oems_bookings') || [];
  setItem('oems_bookings', bookings.filter(b => b.eventId !== eventId));

  // Clean up reviews
  const reviews = getItem('oems_reviews') || [];
  setItem('oems_reviews', reviews.filter(r => r.eventId !== eventId));

  // Clean up waitlist
  const waitlists = getItem('oems_waitlists') || {};
  delete waitlists[eventId];
  setItem('oems_waitlists', waitlists);

  // Clean up wishlists entries
  const wishlists = getItem('oems_wishlists') || {};
  Object.keys(wishlists).forEach(uId => {
    wishlists[uId] = wishlists[uId].filter(id => id !== eventId);
  });
  setItem('oems_wishlists', wishlists);

  return true;
};

export const deleteReview = (reviewId) => {
  const reviews = getItem('oems_reviews') || [];
  setItem('oems_reviews', reviews.filter(r => r.id !== reviewId));
  return true;
};

export const cleanupPastEvents = () => {
    const events = getItem('oems_events') || [];
    const today = new Date().toLocaleDateString('en-CA');
    const pastEvents = events.filter(e => e.date < today);
    const upcomingEvents = events.filter(e => e.date >= today);
    
    if (pastEvents.length > 0) {
        setItem('oems_events', upcomingEvents);
        addAdminLog('System Cleanup', `Successfully removed ${pastEvents.length} past events from the active database.`);
        return pastEvents.length;
    }
    return 0;
};

