import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CalendarDays, Search, Sparkles, Tickets, Wallet } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toggleWishlist, getUserWishlist } from '../utils/storage';
import { useQuery, useQueryState, useMutation, api } from '../services/apiService';
import { useToast } from '../context/ToastContext';
import EventCard from '../components/EventCard';
import SkeletonCard from '../components/SkeletonCard';
import RevealOnScroll from '../components/RevealOnScroll';
import { prefetchRoutes } from '../utils/routePrefetch';

const MotionDiv = motion.div;

export default function Home({ user }) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [wishlist, setWishlist] = useState(() => (user ? getUserWishlist(user.id) : []));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [paymentMethod] = useState('upi');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [modalEvent, setModalEvent] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const { data: eventsData, error: eventsError } = useQueryState(api.events.list);
  const secureBookMutation = useMutation(api.bookings.secureBook);
  const userBookingsData = useQuery(api.bookings.listByUser, { userId: user?.id || '' });
  const bookedSeatsData = useQuery(api.bookings.getBookedSeats, modalEvent ? { eventId: modalEvent.id } : 'skip');

  const events = useMemo(() => eventsData || [], [eventsData]);
  const bookedSeats = bookedSeatsData || [];

  const upcomingEventsList = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events.filter((evt) => new Date(evt.date) >= today);
  }, [events]);

  const categories = useMemo(
    () => ['All', ...new Set(upcomingEventsList.map((evt) => evt.category).filter(Boolean))],
    [upcomingEventsList]
  );

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events
      .filter((evt) => {
        const matchesSearch =
          evt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          evt.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'All' || evt.category === activeCategory;
        const isFuture = new Date(evt.date) >= today;
        return matchesSearch && matchesCategory && isFuture;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events, searchTerm, activeCategory]);

  const pastEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events
      .filter((evt) => {
        const matchesSearch =
          evt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          evt.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'All' || evt.category === activeCategory;
        const isPast = new Date(evt.date) < today;
        return matchesSearch && matchesCategory && isPast;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [events, searchTerm, activeCategory]);

  const seatCols = Array.from({ length: 10 }, (_, i) => i + 1);

  const getRowLabel = (index) => {
    let value = index;
    let label = '';
    do {
      label = String.fromCharCode(65 + (value % 26)) + label;
      value = Math.floor(value / 26) - 1;
    } while (value >= 0);
    return label;
  };

  const seatCapacity = Math.max(1, Math.min(500, Number(modalEvent?.capacity || 500)));
  const seatRows = useMemo(() => {
    const rowCount = Math.ceil(seatCapacity / seatCols.length);
    return Array.from({ length: rowCount }, (_, idx) => getRowLabel(idx));
  }, [seatCapacity, seatCols.length]);

  const toggleSeat = (seatId) => {
    if (bookedSeats.includes(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((seat) => seat !== seatId));
      return;
    }

    if (selectedSeats.length >= 10) {
      showToast('You can only book up to 10 seats per transaction.', 'warning');
      return;
    }

    setSelectedSeats([...selectedSeats, seatId]);
  };

  const handleWishlist = (event, eventId) => {
    event.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    const next = toggleWishlist(user.id, eventId);
    setWishlist(next);
  };

  const handleBookClick = (event) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role === 'admin') {
      showToast('Admins are restricted from booking tickets. Use a user account.', 'error');
      return;
    }

    setModalEvent(event);
    setSelectedSeats([]);
    setPromoCode('');
    setDiscount(0);
    setBookingSuccess(false);
    setIsModalOpen(true);
  };

  const getPricing = () => {
    if (!modalEvent) return { subtotal: 0, discountAmount: 0, cgst: 0, sgst: 0, total: 0, afterDiscount: 0 };

    let subtotal = 0;
    selectedSeats.forEach((seat) => {
      if (seat.startsWith('A') || seat.startsWith('B')) {
        subtotal += modalEvent.vipPrice || modalEvent.price * 1.5;
      } else {
        subtotal += modalEvent.price;
      }
    });

    const discountAmount = subtotal * discount;
    const afterDiscount = subtotal - discountAmount;
    const cgst = afterDiscount * 0.09;
    const sgst = afterDiscount * 0.09;
    const total = afterDiscount + cgst + sgst;

    return { subtotal, discountAmount, afterDiscount, cgst, sgst, total };
  };

  const PROMO_CODES = {
    WELCOME20: { rate: 0.2, once: false },
    EVENT50: { rate: 0.5, once: false },
    OEMS25: { rate: 0.25, once: false },
    FESTIVAL10: { rate: 0.1, once: false },
    FIRSTBOOK: { rate: 0.3, once: true },
    LOYALTY50: { rate: 0.5, once: true },
  };

  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    const userBookings = userBookingsData || [];

    if (!PROMO_CODES[code]) {
      setDiscount(0);
      if (code) showToast('Invalid promo code. Please try again.', 'error');
      return;
    }

    const promo = PROMO_CODES[code];

    if (code === 'FIRSTBOOK' && userBookings.length > 0) {
      showToast('This code is only for new users on their first booking.', 'warning');
      setDiscount(0);
      return;
    }

    if (code === 'LOYALTY50' && userBookings.length < 5) {
      showToast(`You need at least 5 previous bookings. Current: ${userBookings.length}`, 'info');
      setDiscount(0);
      return;
    }

    if (promo.once && userBookings.some((booking) => booking.promoCode === code)) {
      showToast('You already used this one-time promo code.', 'warning');
      setDiscount(0);
      return;
    }

    setDiscount(promo.rate);
    showToast(`Applied ${promo.rate * 100}% discount`, 'success');
  };

  const submitBooking = async (event) => {
    event.preventDefault();

    if (!modalEvent || !user) return;
    if (selectedSeats.length === 0) {
      showToast('Please select at least one seat.', 'warning');
      return;
    }

    const pricing = getPricing();
    const bookingId = Date.now().toString();
    const dataForBooking = {
      id: bookingId,
      transactionId: `TXN-${bookingId.slice(-8)}`,
      eventId: modalEvent.id,
      userId: user.id,
      eventName: modalEvent.name,
      userName: user.name,
      userEmail: user.email,
      numTickets: selectedSeats.length,
      selectedSeats,
      ticketPrice: modalEvent.price,
      promoCode: promoCode.trim().toUpperCase() || null,
      discountUsed: discount,
      originalTotal: pricing.subtotal,
      discountedAmount: pricing.afterDiscount,
      cgst: pricing.cgst,
      sgst: pricing.sgst,
      totalAmount: pricing.total,
      paymentMethod,
      paymentStatus: 'paid',
      status: 'booked',
      bookingDate: new Date().toISOString(),
      billId: `BILL-${Math.random().toString(36).slice(2, 11).toUpperCase()}`,
    };

    try {
      await secureBookMutation(dataForBooking);
      setBookingSuccess(true);
      showToast('Booking confirmed successfully.', 'success');
      setTimeout(() => {
        setIsModalOpen(false);
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      console.warn('API booking failed', err);
      showToast('Booking failed. Please retry in a moment.', 'error');
    }
  };

  const pricing = getPricing();
  const bookedSeatCount = bookedSeats.length;
  const modalRemainingSeats = modalEvent
    ? Math.max(0, Number(modalEvent.availableCapacity ?? (seatCapacity - bookedSeatCount)))
    : 0;
  const liveRemainingAfterSelection = Math.max(0, modalRemainingSeats - selectedSeats.length);

  return (
    <div className="home-page">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="hero-kicker">Live entertainment, curated for you</p>
          <h1>Book events like a pro</h1>
          <p>Find concerts, comedy, food festivals, meetups, and more with a cleaner, faster booking journey.</p>
        </div>

        <div className="search-bar hero-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by event, artist, city"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </section>

      <section className="home-section-head">
        <div>
          <h2>Upcoming events</h2>
          <p>Discover what is trending this week.</p>
        </div>
        <div className="category-filter">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
              type="button"
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <MotionDiv
        className="grid events-grid"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
        }}
      >
        {eventsData === undefined && !eventsError && Array.from({ length: 6 }).map((_, idx) => <SkeletonCard key={idx} />)}

        {eventsError && (
          <div className="empty-state">
            <AlertTriangle size={28} />
            <h3>Unable to load events</h3>
            <p>Please check your network and try again.</p>
          </div>
        )}

        {eventsData !== undefined && !eventsError && upcomingEvents.map((event) => (
          <motion.div key={event.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
            <EventCard
              event={event}
              isWishlisted={wishlist.includes(event.id)}
              onToggleWishlist={(evt) => handleWishlist(evt, event.id)}
              onBook={() => handleBookClick(event)}
              onPrefetch={() => prefetchRoutes(['eventDetails', 'booking'], { idle: true })}
            />
          </motion.div>
        ))}

        {eventsData !== undefined && !eventsError && upcomingEvents.length === 0 && (
          <div className="empty-state">
            <CalendarDays size={28} />
            <h3>No matching events</h3>
            <p>Try another search term or category filter.</p>
          </div>
        )}
      </MotionDiv>

      {activeCategory === 'All' && pastEvents.length > 0 && (
        <RevealOnScroll>
          <section className="past-events">
          <div className="home-section-head">
            <div>
              <h2>Past events</h2>
              <p>Great moments from recently completed events.</p>
            </div>
          </div>
          <div className="grid events-grid">
            {pastEvents.map((event) => (
              <article className="event-card event-card--past" key={event.id}>
                <div className="event-card__media" style={{ backgroundImage: event.image ? `url(${event.image})` : undefined }}>
                  <span className="event-chip">Completed</span>
                </div>
                <div className="event-card__body">
                  <h3>{event.name}</h3>
                  <div className="event-card__meta">
                    <span><CalendarDays size={16} /> {new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <p className="event-card__desc">{event.description}</p>
                </div>
              </article>
            ))}
          </div>
          </section>
        </RevealOnScroll>
      )}

      <AnimatePresence>
        {isModalOpen && modalEvent && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="modal-content modal-booking"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.22 }}
            >
            <div className="modal-header-row">
              <div>
                <h2>Book {modalEvent.name}</h2>
                <p>{modalEvent.location} | {new Date(modalEvent.date).toLocaleDateString()}</p>
                <p className={`event-details-availability ${modalRemainingSeats <= 0 ? 'is-soldout' : ''}`}>
                  {modalRemainingSeats <= 0 ? 'Sold out' : `Remaining seats: ${modalRemainingSeats}`}
                </p>
                {modalRemainingSeats > 0 && (
                  <p className="event-details-availability is-live">
                    Live after selection: {liveRemainingAfterSelection}
                  </p>
                )}
              </div>
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Close</button>
            </div>

            <div className="booking-steps">
              <span><Tickets size={14} /> Select Seats</span>
              <span><Sparkles size={14} /> Confirm</span>
              <span><Wallet size={14} /> Pay</span>
            </div>

            {bookingSuccess ? (
              <div className="booking-success">Booking successful. Redirecting to dashboard.</div>
            ) : (
              <form onSubmit={submitBooking}>
                <div className="seat-map-wrap">
                  <p className="seat-stage">STAGE</p>
                  {seatRows.map((row) => (
                    <div className="seat-row" key={row}>
                      <span className="seat-row-label">{row}</span>
                      {seatCols.map((col) => {
                        const seatId = `${row}${col}`;
                        const seatNumber = seatRows.indexOf(row) * seatCols.length + col;
                        if (seatNumber > seatCapacity) {
                          return <span key={`${seatId}-empty`} className="seat seat-empty" aria-hidden="true" />;
                        }
                        const isBooked = bookedSeats.includes(seatId);
                        const isSelected = selectedSeats.includes(seatId);

                        return (
                          <button
                            type="button"
                            className={`seat ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                            key={seatId}
                            onClick={() => toggleSeat(seatId)}
                            disabled={isBooked}
                          >
                            {col}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div className="booking-meta-grid">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Promo code</label>
                    <div className="promo-row">
                      <input
                        type="text"
                        className="form-input"
                        value={promoCode}
                        onChange={(event) => setPromoCode(event.target.value)}
                        placeholder="Use FIRSTBOOK, OEMS25..."
                      />
                      <button type="button" className="btn btn-secondary" onClick={applyPromo}>Apply</button>
                    </div>
                  </div>
                  <div className="booking-summary">
                    <div><span>Seats</span><strong>{selectedSeats.length}</strong></div>
                    <div><span>Subtotal</span><strong>INR {pricing.subtotal.toFixed(2)}</strong></div>
                    <div><span>Discount</span><strong>- INR {pricing.discountAmount.toFixed(2)}</strong></div>
                    <div><span>CGST + SGST</span><strong>INR {(pricing.cgst + pricing.sgst).toFixed(2)}</strong></div>
                    <div className="booking-total"><span>Total</span><strong>INR {pricing.total.toFixed(2)}</strong></div>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={!selectedSeats.length}>Pay & Confirm</button>
                </div>
              </form>
            )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
