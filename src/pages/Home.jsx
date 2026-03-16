import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, CalendarDays, IndianRupee, Heart, Star } from 'lucide-react';
import { getItem, bookEvent, getBookedSeatsForEvent, toggleWishlist, getUserWishlist, addToWaitlist, getWaitlistCount, getReviewsForEvent } from '../utils/storage';
import { sendBookingEmail } from '../utils/email';

export default function Home({ user }) {
  const navigate = useNavigate();
  const [events] = useState(() => getItem('oems_events') || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [wishlist, setWishlist] = useState(() => user ? getUserWishlist(user.id) : []);
  
  const upcomingEventsList = events.filter(e => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return new Date(e.date) >= today;
  });
  const categories = ['All', ...new Set(upcomingEventsList.map(e => e.category).filter(Boolean))];
  
  // Booking modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [modalEvent, setModalEvent] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const seatRows = ['A', 'B', 'C', 'D', 'E'];
  const seatCols = Array.from({length: 10}, (_, i) => i + 1);

  const toggleSeat = (seatId) => {
    if (bookedSeats.includes(seatId)) return;
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      if (selectedSeats.length >= 10) {
        alert("You can only book up to 10 seats per transaction.");
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleWishlist = (e, eventId) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    const newList = toggleWishlist(user.id, eventId);
    setWishlist(newList);
  };

  const upcomingEvents = events.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || e.category === activeCategory;
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const eventDate = new Date(e.date);
    const isFuture = eventDate >= today;
    
    return matchesSearch && matchesCategory && isFuture;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  const pastEvents = events.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || e.category === activeCategory;
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const eventDate = new Date(e.date);
    const isPast = eventDate < today;
    
    return matchesSearch && matchesCategory && isPast;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleWaitlist = (e, eventId) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    addToWaitlist(user.id, eventId);
    alert("You have been added to the waitlist! We will notify you if a seat becomes available.");
  };

  const handleBookClick = (event) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'admin') {
      alert("Admins are restricted from booking tickets. Please use a regular user account.");
      return;
    }
    setModalEvent(event);
    setSelectedSeats([]);
    setModalEvent(event);
    setSelectedSeats([]);
    setBookedSeats(getBookedSeatsForEvent(event.id));
    setPaymentMethod('upi');
    setPromoCode('');
    setDiscount(0);
    setBookingSuccess(false);
    setIsModalOpen(true);
  };

  const getPricing = () => {
    if (!modalEvent) return { subtotal: 0, discountAmount: 0, cgst: 0, sgst: 0, total: 0 };
    let base = 0;
    selectedSeats.forEach(seat => {
      if (seat.startsWith('A') || seat.startsWith('B')) {
        base += (modalEvent.vipPrice || modalEvent.price * 1.5);
      } else {
        base += modalEvent.price;
      }
    });
    
    const disc = base * discount;
    const afterDisc = base - disc;
    const cgst = afterDisc * 0.09;
    const sgst = afterDisc * 0.09;
    const final = afterDisc + cgst + sgst;
    
    return {
      subtotal: base,
      discountAmount: disc,
      afterDiscount: afterDisc,
      cgst: cgst,
      sgst: sgst,
      total: final
    };
  };

  const PROMO_CODES = {
    'WELCOME20': { rate: 0.20, once: false },
    'EVENT50': { rate: 0.50, once: false },
    'OEMS25': { rate: 0.25, once: false },
    'FESTIVAL10': { rate: 0.10, once: false },
    'FIRSTBOOK': { rate: 0.30, once: true },
    'LOYALTY50': { rate: 0.50, once: true }
  };

  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    const userBookings = getItem('oems_bookings')?.filter(b => b.userId === user.id) || [];
    
    if (PROMO_CODES[code]) {
      const promo = PROMO_CODES[code];
      
      // Tiered/Usage Logic
      if (code === 'FIRSTBOOK' && userBookings.length > 0) {
        alert('This code is only for new users on their first booking!');
        setDiscount(0);
        return;
      }
      
      if (code === 'LOYALTY50' && userBookings.length < 5) {
        alert(`You need at least 5 previous bookings to use this reward. (Current: ${userBookings.length})`);
        setDiscount(0);
        return;
      }

      // Check if they've already used this specific "once" code in past bookings
      if (promo.once && userBookings.some(b => b.promoCode === code)) {
        alert('You have already used this special one-time offer!');
        setDiscount(0);
        return;
      }

      setDiscount(promo.rate);
      alert(`Success! ${promo.rate * 100}% discount applied to your total.`);
    } else {
      setDiscount(0);
      if (code !== '') alert('Invalid promo code. Please try again.');
    }
  };

  const submitBooking = (e) => {
    e.preventDefault();
    if (!modalEvent || !user) return;
    
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat.");
      return;
    }

    const promoCodeUsed = discount > 0 ? promoCode.trim().toUpperCase() : null;
    const result = bookEvent(user.id, modalEvent.id, selectedSeats.length, selectedSeats, discount, promoCodeUsed);
    if (result) {
      // Send email in background
      sendBookingEmail(user, result).catch(err => console.error("Email send failed", err));
      
      setBookingSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        navigate('/dashboard');
      }, 1500);
    }
  };

  return (
    <div>
      <div className="flex-between">
        <h1 className="page-title">Upcoming Events</h1>
        <div className="search-bar">
          <Search size={20} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search events or locations..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`btn ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid">
        {upcomingEvents.map(event => (
          <div key={event.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {event.image && (
              <div style={{ width: '100%', height: '200px', backgroundImage: `url(${event.image})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                <button 
                  onClick={(e) => handleWishlist(e, event.id)}
                  style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '0px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', boxShadow: 'var(--shadow-sm)' }}
                >
                  <Heart size={20} fill={wishlist.includes(event.id) ? 'var(--secondary)' : 'none'} color={wishlist.includes(event.id) ? 'var(--secondary)' : 'var(--text-muted)'} />
                </button>
                {event.category && (
                  <span style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'var(--primary)', color: 'white', padding: '0.2rem 0.8rem', borderRadius: '0px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {event.category}
                  </span>
                )}
              </div>
            )}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h2 className="card-title" style={{ fontSize: '1.3rem', margin: 0 }}>{event.name}</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={(e) => handleWishlist(e, event.id)} style={{ background: 'none' }}>
                    <Heart size={20} fill={wishlist.includes(event.id) ? 'var(--secondary)' : 'none'} color={wishlist.includes(event.id) ? 'var(--secondary)' : event.image ? 'white' : 'var(--text-muted)'} />
                  </button>
                </div>
              </div>

            <div className="card-meta">
              <CalendarDays size={16} /> 
              <span>{new Date(event.date).toLocaleDateString()}</span>
              {event.time && (
                <>
                  <span style={{ margin: '0 0.4rem', opacity: 0.5 }}>•</span>
                  <span>{event.time}</span>
                </>
              )}
            </div>
            <div className="card-meta">
              <MapPin size={16} /> {event.location}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="card-meta" style={{ color: 'var(--success)', fontWeight: 600, marginBottom: 0 }}>
                <IndianRupee size={16} /> From INR {event.price}
              </div>
              <div style={{ 
                background: 'rgba(0, 210, 255, 0.1)', 
                color: 'var(--secondary)', 
                padding: '0.2rem 0.6rem', 
                fontSize: '0.8rem', 
                fontWeight: '800', 
                border: '1px solid rgba(0, 210, 255, 0.2)' 
              }}>
                {(() => {
                  const booked = getBookedSeatsForEvent(event.id).length;
                  const total = 50; 
                  const balance = total - booked;
                  return `${balance} SEATS LEFT`;
                })()}
              </div>
            </div>

            <div style={{ marginBottom: '1rem', marginTop: '0.5rem' }}>
              {(() => {
                const eventReviews = getReviewsForEvent(event.id);
                if (eventReviews.length === 0) return <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>No reviews yet</span>;
                const avg = eventReviews.reduce((s, r) => s + r.rating, 0) / eventReviews.length;
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#f59e0b', fontWeight: 'bold' }}>
                    <Star size={16} fill="#f59e0b" /> {avg.toFixed(1)} <span style={{color: 'var(--text-muted)', fontWeight: 'normal', fontSize: '0.8rem'}}>({eventReviews.length} reviews)</span>
                  </div>
                );
              })()}
            </div>

            <p className="card-description" style={{ fontSize: '0.9rem' }}>{event.description}</p>
            
            {(() => {
                const bookedCount = getBookedSeatsForEvent(event.id).length;
                const isFull = bookedCount >= (event.venueSize || 50);
                if (isFull) {
                  return (
                    <button 
                      onClick={(e) => handleWaitlist(e, event.id)}
                      className="btn btn-secondary" 
                      style={{ width: '100%', marginTop: 'auto', border: '1px solid var(--primary)', color: 'var(--primary)' }}
                    >
                      Event Full - Join Waitlist ({getWaitlistCount(event.id)})
                    </button>
                  );
                }
                return (
                  <button 
                    onClick={() => handleBookClick(event)}
                    className="btn btn-primary" 
                    style={{ width: '100%', marginTop: 'auto' }}
                  >
                    Book Event
                  </button>
                );
            })()}
            </div>
          </div>
        ))}
        {upcomingEvents.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', background: 'var(--surface)', borderRadius: '0px', border: '2px dashed var(--border)' }}>
            <CalendarDays size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: 'var(--text-main)' }}>No Upcoming Events Found</h3>
            <p className="text-muted">Stay tuned for new event announcements!</p>
          </div>
        )}
      </div>

      {pastEvents.length > 0 && (activeCategory === 'All') && (
        <div style={{ marginTop: '5rem', borderTop: '1px solid var(--border)', paddingTop: '4rem' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 className="page-title" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Past Events / Memories</h2>
            <p className="text-muted">Take a look back at the amazing events we've hosted recently.</p>
          </div>
          <div className="grid">
            {pastEvents.map(event => (
              <div key={event.id} className="card" style={{ padding: 0, overflow: 'hidden', opacity: 0.85 }}>
                {event.image && (
                  <div style={{ width: '100%', height: '180px', backgroundImage: `url(${event.image})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                    <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(30, 41, 59, 0.9)', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.1)' }}>
                      COMPLETED
                    </span>
                  </div>
                )}
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>{event.name}</h3>
                  <div className="card-meta" style={{ marginBottom: '0.5rem' }}>
                    <CalendarDays size={14} /> 
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="card-meta">
                    <MapPin size={14} />
                    <span>{event.location}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem', lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {event.description}
                  </p>
                  <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                     <span className="badge badge-admin" style={{ background: 'rgba(99, 102, 241, 0.05)', color: 'var(--text-muted)', borderColor: 'var(--border)', width: '100%', textAlign: 'center' }}>
                        MEMORIES ARCHIVED 🎞️
                     </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isModalOpen && modalEvent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>Book Tickets for {modalEvent.name}</h2>
              <div style={{ 
                background: 'rgba(0, 210, 255, 0.1)', 
                color: 'var(--secondary)', 
                padding: '0.4rem 0.8rem', 
                fontSize: '0.85rem', 
                fontWeight: '900', 
                border: '1px solid rgba(0, 210, 255, 0.2)' 
              }}>
                {50 - getBookedSeatsForEvent(modalEvent.id).length} SEATS REMAINING
              </div>
            </div>
            {bookingSuccess ? (
              <div style={{ color: 'var(--secondary)', fontWeight: 600, textAlign: 'center', padding: '2rem 0' }}>
                Booking Successful! Redirecting to Dashboard...
              </div>
            ) : (
                <form onSubmit={submitBooking}>
                  <div style={{ marginBottom: '1.5rem', width: '100%', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    <div style={{ padding: '0.5rem', background: 'var(--surface-raised)', borderRadius: '0px', border: '1px solid var(--border)', textAlign: 'center', minWidth: 'fit-content' }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '2px' }}>STAGE</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                        {seatRows.map((row) => {
                          const isVip = row === 'A' || row === 'B';
                          return (
                          <div key={row} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ width: '30px', fontWeight: 'bold', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isVip ? 'var(--secondary)' : 'var(--text-muted)' }}>
                              {row} {isVip && <span style={{fontSize: '0.5rem', marginLeft: '2px'}}>VIP</span>}
                            </span>
                            {seatCols.map(col => {
                              const seatId = `${row}${col}`;
                              const isBooked = bookedSeats.includes(seatId);
                              const isSelected = selectedSeats.includes(seatId);
                              let seatColors = { bg: 'var(--bg-secondary)', border: 'var(--border)' };
                              if (isBooked) seatColors = { bg: '#ef4444', border: '#ef4444', color: 'white', cursor: 'not-allowed' };
                              else if (isSelected) seatColors = { bg: 'var(--primary)', border: 'var(--primary)', color: 'white' };
                              return (
                                <div 
                                  key={seatId} 
                                  onClick={() => toggleSeat(seatId)}
                                  style={{ 
                                    width: '24px', height: '24px', borderRadius: '4px', fontSize: '0.65rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: seatColors.cursor || 'pointer',
                                    backgroundColor: seatColors.bg, border: `1px solid ${seatColors.border}`, color: seatColors.color || 'inherit',
                                    transition: 'all 0.2s'
                                  }}
                                >
                                  {col}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><div style={{ width: 12, height: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}></div> Available</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><div style={{ width: 12, height: 12, background: 'var(--primary)' }}></div> Selected</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><div style={{ width: 12, height: 12, background: '#ef4444' }}></div> Booked</span>
                      </div>
                      <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        VIP Seats (Rows A-B): INR {modalEvent.vipPrice || modalEvent.price * 1.5} | Regular (Rows C-E): INR {modalEvent.price}
                      </p>
                    </div>
                  </div>

                  <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Selected Tickets</label>
                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>{selectedSeats.length}</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <select 
                      className="form-input" 
                      value={paymentMethod}
                      readOnly
                    >
                      <option value="upi">UPI / Net Banking</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input 
                      type="text" className="form-input" 
                      placeholder="Promo Code"
                      value={promoCode} onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <button type="button" className="btn btn-secondary" onClick={applyPromo}>Apply</button>
                  </div>
                  
                  {(() => {
                    const count = (getItem('oems_bookings') || []).filter(b => b.userId === user.id).length;
                    if (count === 0) return <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>🎁 Tip: Use <strong>FIRSTBOOK</strong> for 30% off your first order!</p>;
                    if (count >= 5) return <p style={{ fontSize: '0.75rem', color: 'var(--success)', marginBottom: '1.5rem' }}>🔥 Loyalty Reward: Use <strong>LOYALTY50</strong> for 50% discount!</p>;
                    return <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Quick Tip: You've completed {count} events. Bookmark OEMS25 for future!</p>;
                  })()}

                  <div className="form-group" style={{ marginBottom: '2rem' }}>
                    {(() => {
                      const pricing = getPricing();
                      return (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                            <span>Subtotal</span>
                            <span>INR {pricing.subtotal.toFixed(2)}</span>
                          </div>
                          {discount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--success)', marginBottom: '0.3rem' }}>
                              <span>Promo Discount ({discount * 100}%)</span>
                              <span>- INR {pricing.discountAmount.toFixed(2)}</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                            <span>CGST (9%)</span>
                            <span>+ INR {pricing.cgst.toFixed(2)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                            <span>SGST (9%)</span>
                            <span>+ INR {pricing.sgst.toFixed(2)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700, paddingTop: '0.5rem', borderTop: '1px dashed var(--border)' }}>
                            <span>Total Amount</span>
                            <span style={{ color: 'var(--primary)' }}>INR {pricing.total.toFixed(2)}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button type="submit" className="btn btn-success" disabled={selectedSeats.length === 0} style={{ opacity: selectedSeats.length === 0 ? 0.5 : 1 }}>Pay & Confirm</button>
                  </div>
                </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
