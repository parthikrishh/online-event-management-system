import { useState } from 'react';
import { getItem, cancelBookingByUser, addReview, deleteBooking, updateUserProfile, deleteUserAccount } from '../utils/storage';
import { Download, CalendarDays, CheckCircle2, Star, RefreshCcw, Info, Trash2, Search, User as UserIcon, Mail, ShieldCheck, Camera, LogOut, Edit, Eye, EyeOff } from 'lucide-react';
import { requestRefund } from '../utils/storage';
import { jsPDF } from 'jspdf';
import { QRCodeCanvas } from 'qrcode.react';

export default function UserDashboard({ user }) {
  const loadBookings = () => {
    const allBookings = getItem('oems_bookings') || [];
    const userBookings = allBookings.filter(b => b.userId === user.id);
    setBookings(userBookings.reverse());
  };

  const [bookings, setBookings] = useState(() => {
    const allBookings = getItem('oems_bookings') || [];
    const userBookings = allBookings.filter(b => b.userId === user.id);
    return userBookings.reverse(); // latest first
  });

  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [bookingSearch, setBookingSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'profile'
  const [selectedBookingForRefund, setSelectedBookingForRefund] = useState(null);
  const [refundForm, setRefundForm] = useState({ reason: '', bankDetails: '' });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    email: user.email,
    password: user.password,
    image: user.image || ''
  });

  const handleOpenRefund = (booking) => {
    setSelectedBookingForRefund(booking);
    setRefundForm({ reason: '', bankDetails: '' });
    setIsRefundModalOpen(true);
  };

  const handleRefundSubmit = (e) => {
    e.preventDefault();
    requestRefund(selectedBookingForRefund.id, user.id, selectedBookingForRefund.totalAmount, refundForm.reason, refundForm.bankDetails);
    alert("Refund request submitted successfully. Admin will process it soon.");
    setIsRefundModalOpen(false);
    loadBookings();
  };

  const handleCancelBooking = (booking) => {
    if (confirm("Are you sure you want to cancel this booking? This will initiate a refund request.")) {
      handleOpenRefund(booking);
    }
  };

  const handleDeleteBooking = (bookingId) => {
    if (confirm("Are you sure you want to delete this booking from your history? This cannot be undone.")) {
      deleteBooking(bookingId);
      loadBookings();
    }
  };

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  const handleOpenReview = (booking) => {
    setSelectedBookingForReview(booking);
    setReviewForm({ rating: 5, comment: '' });
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    addReview(user.id, user.name, selectedBookingForReview.eventId, reviewForm.rating, reviewForm.comment);
    alert("Review submitted! Thank you for your feedback.");
    setIsReviewModalOpen(false);
  };

  const handleDownloadReceipt = (booking) => {
    const doc = new jsPDF();
    const events = getItem('oems_events') || [];
    const event = events.find(e => e.id === booking.eventId);
    
    // Header & Logo Branding
    doc.setFillColor(255, 49, 82); // Zomato Red
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text("EVENTX BOOKING SYSTEM", 20, 25);
    doc.setFontSize(10);
    doc.text("OFFICIAL BOOKING RECEIPT", 20, 32);

    // Status Watermark / Stamp - Improved with dynamic sizing and global replacement
    const statusText = booking.status ? booking.status.replace(/_/g, ' ').toUpperCase() : 'BOOKED';
    
    if (booking.status !== 'booked' && booking.status !== 'checked-in') {
        // Draw a stylized stamp box
        doc.setDrawColor(239, 68, 68);
        doc.setLineWidth(1.5);
        doc.rect(45, 140, 120, 60, 'S');
        
        doc.setTextColor(239, 68, 68); // Bright Red
        doc.setFont('helvetica', 'bold');
        
        // Dynamic font size for long labels
        const stampFontSize = statusText.length > 10 ? 40 : 50;
        doc.setFontSize(stampFontSize);
        
        // Center the status text inside the box
        doc.text(statusText, 105, 175, { align: 'center' });
        
        // Secondary warning text - smaller and wrapped
        doc.setFontSize(10);
        doc.text("THIS TICKET IS VOID / NO LONGER VALID", 105, 185, { align: 'center' });
    }
    
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Booking Date: ${new Date(booking.bookingDate).toLocaleString()}`, 20, 50);
    doc.text(`Bill ID: ${booking.billId}`, 150, 50);

    // Event Info Section
    doc.setFillColor(248, 250, 252); // Slate-50
    doc.rect(20, 60, 170, 45, 'F');
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.rect(20, 60, 170, 45, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    // Ensure long event names don't clip
    const eventName = booking.eventName.toUpperCase();
    doc.text(eventName.length > 30 ? eventName.substring(0, 30) + "..." : eventName, 25, 70);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Date: ${event?.date || 'N/A'}`, 25, 80);
    doc.text(`Time: ${event?.time || 'N/A'}`, 25, 87);
    doc.text(`Venue: ${event?.location || 'N/A'}`, 25, 94);

    // Attendee Info
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text("ATTENDEE DETAILS", 20, 120);
    doc.line(20, 122, 60, 122);

    doc.setFont('helvetica', 'normal');
    const details = [
        ["Ticket Holder:", booking.userName],
        ["Tickets Booked:", booking.numTickets.toString()],
        ["Seats Assigned:", booking.selectedSeats ? (booking.selectedSeats.length > 5 ? booking.selectedSeats.slice(0, 5).join(', ') + '...' : booking.selectedSeats.join(', ')) : 'N/A'],
        ["Unit Price:", `INR ${booking.ticketPrice}`],
        ["Status:", statusText]
    ];

    if (booking.discountUsed > 0) {
        const discAmt = booking.originalTotal - (booking.discountedAmount || booking.totalAmount / 1.18);
        details.push(["Base Total:", `INR ${booking.originalTotal.toFixed(2)}`]);
        details.push(["Discount:", `- INR ${discAmt.toFixed(2)} (${(booking.discountUsed * 100).toFixed(0)}%)`]);
    }

    if (booking.cgst) {
        details.push(["Taxable Amt:", `INR ${booking.discountedAmount.toFixed(2)}`]);
        details.push(["CGST (9%):", `INR ${booking.cgst.toFixed(2)}`]);
        details.push(["SGST (9%):", `INR ${booking.sgst.toFixed(2)}`]);
    }

    let currentY = 132;
    details.forEach(item => {
        doc.setFont('helvetica', 'bold');
        doc.text(item[0], 20, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(item[1], 70, currentY);
        currentY += 8;
    });

    // Total Summary
    doc.setFillColor(99, 102, 241, 0.05);
    doc.rect(120, 180, 70, 30, 'F');
    doc.setDrawColor(99, 102, 241, 0.2);
    doc.rect(120, 180, 70, 30, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("TOTAL PAID", 125, 192);
    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229);
    doc.text(`INR ${booking.totalAmount}`, 125, 204);
    
    // Branding Footer
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text("Generated by OEMS Professional Billing System", 20, 280);
    doc.text("Thank you for your business!", 150, 280);

    doc.save(`Invoice_${booking.billId}.pdf`);
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm({ ...profileForm, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    const updated = updateUserProfile(user.id, profileForm);
    if (updated) {
      alert('Profile updated successfully!');
      setIsProfileModalOpen(false);
      window.location.reload(); // Refresh to update user context
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('CRITICAL: Are you sure you want to delete your account? This will remove all your bookings and personal data. This action cannot be undone.')) {
        deleteUserAccount(user.id);
        alert('Account deleted successfully. Logging out...');
        window.location.href = '/'; 
    }
  };

  return (
    <div>
      <div className="flex-between">
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>User Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your profile and bookings</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <button 
          className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('bookings')}
        >
          <CalendarDays size={18} /> My Bookings
        </button>
        <button 
          className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('profile')}
        >
          <UserIcon size={18} /> My Profile
        </button>
      </div>

      {activeTab === 'bookings' && (
        <>
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CalendarDays size={24} color="var(--primary)" /> Bookings History
            </h2>
            <div className="user-dashboard-filters" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
                <select 
                    className="form-input" 
                    style={{ width: '150px', marginBottom: 0, height: '42px', padding: '0 1rem', flex: '1 1 150px' }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="booked">Booked</option>
                    <option value="checked-in">Checked In</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refund_requested">Refund Requested</option>
                    <option value="refunded">Refunded</option>
                </select>
                <div className="search-bar" style={{ maxWidth: '300px', marginBottom: 0, flex: '2 1 200px' }}>
                    <Search size={18} />
                    <input 
                        type="text" 
                        placeholder="Search Event or ID..." 
                        value={bookingSearch}
                        onChange={(e) => setBookingSearch(e.target.value)}
                    />
                </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            {bookings.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>You haven't booked any events yet.</p>
              </div>
            ) : (
              <div className="grid">
                {bookings.filter(b => {
                  const matchesSearch = b.eventName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                    b.billId.toLowerCase().includes(bookingSearch.toLowerCase());
                  const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
                  return matchesSearch && matchesStatus;
                }).map(booking => (
                  <div key={booking.id} className="receipt">
                    <div className="receipt-header">
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{booking.eventName}</h3>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>
                        Booked on {new Date(booking.bookingDate).toLocaleDateString()}
                      </span>
                      {booking.status === 'cancelled' && (
                        <span style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.2rem 0.5rem', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          CANCELLED
                        </span>
                      )}
                      {booking.status === 'refund_requested' && (
                        <span style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.2rem 0.5rem', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          REFUND PENDING
                        </span>
                      )}
                      {booking.status === 'refunded' && (
                        <span style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.2rem 0.5rem', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          REFUNDED
                        </span>
                      )}
                    </div>
                    
                    <div className="receipt-row">
                      <span style={{ color: 'var(--text-muted)' }}>Bill ID:</span>
                      <span 
                        style={{ fontFamily: 'monospace', fontWeight: 600, cursor: 'pointer' }} 
                        onClick={() => {
                            navigator.clipboard.writeText(booking.billId);
                            alert('Copied to clipboard: ' + booking.billId);
                        }}
                        title="Click to copy"
                      >
                        {booking.billId}
                      </span>
                    </div>
                    <div className="receipt-row">
                      <span style={{ color: 'var(--text-muted)' }}>Name:</span>
                      <span>{booking.userName}</span>
                    </div>
                    <div className="receipt-row">
                      <span style={{ color: 'var(--text-muted)' }}>Tickets:</span>
                      <span>{booking.numTickets}</span>
                    </div>
                    {booking.selectedSeats && booking.selectedSeats.length > 0 && (
                      <div className="receipt-row">
                        <span style={{ color: 'var(--text-muted)' }}>Seats:</span>
                        <span>{booking.selectedSeats.join(', ')}</span>
                      </div>
                    )}
                    <div className="receipt-row">
                      <span style={{ color: 'var(--text-muted)' }}>Price per ticket:</span>
                      <span>INR {booking.ticketPrice}</span>
                    </div>

                    <div className="receipt-total">
                      <span>Total Amount</span>
                      <span style={{ color: 'var(--primary)' }}>INR {booking.totalAmount}</span>
                    </div>
                    
                    <div style={{ margin: '2.5rem 0 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ background: 'white', padding: '10px', borderRadius: '2px', marginBottom: '1rem', display: 'inline-block' }}>
                         <QRCodeCanvas value={booking.billId} size={120} level={"H"} />
                      </div>
                      {booking.status === 'checked-in' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', fontWeight: 'bold' }}>
                          <CheckCircle2 size={18} /> Ticket Checked In
                        </div>
                      )}
                      {booking.status === 'booked' && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
                          Show this QR code at the entrance
                        </p>
                      )}
                      {(booking.status === 'cancelled' || booking.status === 'refunded') && (
                        <p style={{ color: 'var(--danger)', fontSize: '0.9rem', textAlign: 'center', fontWeight: 'bold' }}>
                          Invalid Ticket
                        </p>
                      )}
                    </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ flex: 1 }}
                          onClick={() => handleDownloadReceipt(booking)}
                        >
                          <Download size={16} /> Bill
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.4rem', borderRadius: '2px' }}
                          title="Delete from history"
                          onClick={() => handleDeleteBooking(booking.id)}
                        >
                          <Trash2 size={16} color="var(--danger)" />
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {booking.status === 'booked' && (
                          <div style={{ display: 'flex', gap: '0.5rem', flex: 2 }}>
                            <button 
                                className="btn btn-danger" 
                                style={{ flex: 1, padding: '0.5rem' }}
                                onClick={() => handleCancelBooking(booking)}
                            >
                                Cancel & Refund
                            </button>
                          </div>
                        )}
                        {booking.status === 'checked-in' && (
                          (() => {
                            const reviews = getItem('oems_reviews') || [];
                            const hasReviewed = reviews.some(r => r.userId === user.id && r.eventId === booking.eventId);
                            if (hasReviewed) return <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 'bold' }}>Already Reviewed</span>;
                            return (
                              <button 
                                className="btn btn-primary" 
                                style={{ flex: 1 }}
                                onClick={() => handleOpenReview(booking)}
                              >
                                <Star size={16} /> Review
                              </button>
                            );
                          })()
                        )}
                      </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'profile' && (
        <div style={{ maxWidth: '800px' }}>
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserIcon size={24} color="var(--primary)" /> Profile Information
          </h2>
          
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: '100px', height: '100px', background: 'var(--primary)', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', overflow: 'hidden', border: '3px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                  {user.image ? (
                    <img src={user.image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <UserIcon size={50} />
                  )}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{user.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <Mail size={16} /> {user.email}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-user">
                    <ShieldCheck size={14} style={{ marginRight: '4px' }} />
                    {user.role.toUpperCase()}
                  </span>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={() => setIsProfileModalOpen(true)}>
                    <Edit size={14} /> Edit Profile
                  </button>
                  <button className="btn btn-danger" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none' }} onClick={handleDeleteAccount}>
                    <Trash2 size={14} /> Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid">
            <div className="card" style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Bookings</p>
              <h4 style={{ fontSize: '2rem', color: 'var(--primary)' }}>{bookings.length}</h4>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Attended Events</p>
              <h4 style={{ fontSize: '2rem', color: 'var(--success)' }}>
                {bookings.filter(b => b.status === 'checked-in').length}
              </h4>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Spent</p>
              <h4 style={{ fontSize: '2rem', color: 'var(--secondary)' }}>
                INR {bookings.filter(b => b.status === 'booked' || b.status === 'checked-in').reduce((sum, b) => sum + b.totalAmount, 0).toFixed(2)}
              </h4>
            </div>
          </div>
        </div>
      )}
      
      {isRefundModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '450px'}}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '60px', height: '60px', background: 'rgba(255, 49, 82, 0.1)', borderRadius: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <RefreshCcw size={30} color="var(--primary)" />
                </div>
                <h2 style={{ marginBottom: '0.5rem' }}>Request Refund</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Please provide details for your refund of <strong>INR {selectedBookingForRefund?.totalAmount}</strong> for <strong>{selectedBookingForRefund?.eventName}</strong>.</p>
            </div>
            
            <form onSubmit={handleRefundSubmit}>
              <div className="form-group">
                <label className="form-label">Reason for Refund</label>
                <textarea 
                  required className="form-input" rows="3"
                  placeholder="e.g. Health issues, flight cancelled..."
                  value={refundForm.reason}
                  onChange={e => setRefundForm({ ...refundForm, reason: e.target.value })}
                ></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Bank Account / Payment Details</label>
                <textarea 
                  required className="form-input" rows="3"
                  placeholder="Enter your bank name, A/C number or UPI ID for refund"
                  value={refundForm.bankDetails}
                  onChange={e => setRefundForm({ ...refundForm, bankDetails: e.target.value })}
                ></textarea>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(255, 49, 82, 0.05)', borderRadius: '0px', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <Info size={20} color="var(--primary)" style={{marginTop: '2px'}} />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Refunds are processed manually by our admin within 3-5 business days.</p>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsRefundModalOpen(false)}>Back</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isReviewModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ marginBottom: '1.5rem' }}>Review {selectedBookingForReview?.eventName}</h2>
            <form onSubmit={handleReviewSubmit}>
              <div className="form-group">
                <label className="form-label">Rating</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  {[1, 2, 3, 4, 5].map(num => (
                    <button 
                      key={num} 
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: num })}
                      style={{ 
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: num <= reviewForm.rating ? '#f59e0b' : 'var(--text-muted)'
                      }}
                    >
                      <Star size={32} fill={num <= reviewForm.rating ? '#f59e0b' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Your Comment</label>
                <textarea 
                  required className="form-input" rows="4"
                  placeholder="Tell us about your experience..."
                  value={reviewForm.comment}
                  onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                ></textarea>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsReviewModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isProfileModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '500px'}}>
            <h2 style={{ marginBottom: '1.5rem' }}>Edit Profile</h2>
            <form onSubmit={handleUpdateProfile}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: '100px', height: '100px', background: '#f3f4f6', borderRadius: '2px', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px dashed var(--border)', position: 'relative' }}>
                   {profileForm.image ? <img src={profileForm.image} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <UserIcon size={40} color="#9ca3af" />}
                   <label style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary)', color: 'white', padding: '0.4rem', borderRadius: '2px', cursor: 'pointer' }}>
                     <Camera size={14} />
                     <input type="file" hidden accept="image/*" onChange={handleProfileImageChange} />
                   </label>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Change Profile Photo</p>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" required className="form-input"
                  value={profileForm.name}
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" required className="form-input"
                  value={profileForm.email}
                  onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Change Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    className="form-input"
                    value={profileForm.password}
                    onChange={e => setProfileForm({ ...profileForm, password: e.target.value })}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsProfileModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
