import { useState, useMemo, lazy, Suspense } from 'react';
import { setItem } from '../utils/storage';
import { useQuery, useMutation, api } from '../services/apiService';
import { Download, CalendarDays, CheckCircle2, Star, RefreshCcw, Info, Trash2, Search, User as UserIcon, Mail, ShieldCheck, Camera, LogOut, Edit, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const QRCodeCanvas = lazy(() => import('qrcode.react').then((module) => ({ default: module.QRCodeCanvas })));

export default function UserDashboard({ user }) {
  const { showToast } = useToast();
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
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [downloadingBookingId, setDownloadingBookingId] = useState(null);

  const userBookingsData = useQuery(api.bookings.listByUser, { userId: user?.id || "" });
  const eventsData = useQuery(api.events.list);
  const reviewsData = useQuery(api.misc.listReviews);
  const refundMutation = useMutation(api.bookings.processRefund);
  const addReviewMutation = useMutation(api.misc.addReview);
  const deleteBookingMutation = useMutation(api.bookings.remove);
  const updateProfileMutation = useMutation(api.users.update);
  const deleteUserMutation = useMutation(api.users.remove);
  const bookings = useMemo(() => (userBookingsData ? [...userBookingsData].reverse() : []), [userBookingsData]);
  const events = eventsData || [];

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const eventName = (booking.eventName || '').toLowerCase();
      const billId = (booking.billId || '').toLowerCase();
      const query = bookingSearch.toLowerCase();
      const matchesSearch = eventName.includes(query) || billId.includes(query);
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, bookingSearch, statusFilter]);


  const handleOpenRefund = (booking) => {
    setSelectedBookingForRefund(booking);
    setRefundForm({ reason: '', bankDetails: '' });
    setIsRefundModalOpen(true);
  };

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    try {
      await refundMutation({
        bookingId: selectedBookingForRefund.id,
        isApproved: true 
      });
      showToast("Refund processed successfully.", "success");
    } catch (err) {
      console.error("Refund failed", err);
      showToast("Refund failed. Please try again.", "error");
    }
    setIsRefundModalOpen(false);
  };

  const handleCancelBooking = (booking) => {
    if (confirm("Are you sure you want to cancel this booking? This will initiate a refund request.")) {
      handleOpenRefund(booking);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (confirm("Are you sure you want to delete this booking from your history? This cannot be undone.")) {
      try {
        await deleteBookingMutation({ id: bookingId });
        showToast("Booking record removed.", "info");
      } catch (err) {
        console.error("Delete booking failed", err);
        showToast("Failed to remove booking record.", "error");
      }
    }
  };


  const handleOpenReview = (booking) => {
    setSelectedBookingForReview(booking);
    setReviewForm({ rating: 5, comment: '' });
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const reviewData = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      eventId: selectedBookingForReview.eventId,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      date: new Date().toISOString()
    };
    try {
      await addReviewMutation(reviewData);
      showToast("Review submitted! Thank you.", "success");
    } catch (err) {
      console.error("Review submission failed", err);
      showToast("Review submission failed.", "error");
    }
    setIsReviewModalOpen(false);
  };

  const handleDownloadReceipt = async (booking) => {
    setDownloadingBookingId(booking.id);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const event = events.find(e => e.id === booking.eventId);

    const statusText = booking.status ? booking.status.replace(/_/g, ' ').toUpperCase() : 'BOOKED';
    const transactionId = booking.transactionId || `TXN-${booking.id?.slice(-8) || booking.billId?.slice(-8) || 'UNKNOWN'}`;
    const paymentStatus = (booking.paymentStatus || 'paid').toUpperCase();
    const seatText = booking.selectedSeats?.length ? booking.selectedSeats.join(', ') : 'Not allocated';

    doc.setFillColor(255, 107, 0);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('EVENTX', 14, 18);
    doc.setFontSize(10);
    doc.text('Booking Invoice', 14, 24);

    doc.setTextColor(33, 37, 45);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 36);

    const drawSection = (title, y) => {
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(226, 229, 236);
      doc.rect(14, y, 182, 8, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 107, 0);
      doc.text(title, 16, y + 5.5);
    };

    const drawRow = (label, value, y) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(49, 57, 72);
      doc.text(label, 16, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(78, 89, 109);
      doc.text(String(value), 70, y, { maxWidth: 120 });
    };

    drawSection('Event Details', 42);
    drawRow('Event Name', booking.eventName || 'N/A', 56);
    drawRow('Date', event?.date || 'N/A', 63);
    drawRow('Time', event?.time || 'N/A', 70);
    drawRow('Venue', event?.location || 'N/A', 77);

    drawSection('User Details', 84);
    drawRow('Name', booking.userName || 'N/A', 98);
    drawRow('Email', booking.userEmail || user.email || 'N/A', 105);
    drawRow('Seats', seatText, 112);

    drawSection('Booking Info', 119);
    drawRow('Booking ID', booking.id || 'N/A', 133);
    drawRow('Bill ID', booking.billId || 'N/A', 140);
    drawRow('Transaction ID', transactionId, 147);
    drawRow('Booked On', new Date(booking.bookingDate).toLocaleString(), 154);
    drawRow('Payment Status', paymentStatus, 161);
    drawRow('Ticket Status', statusText, 168);

    doc.setFillColor(255, 247, 239);
    doc.setDrawColor(255, 214, 183);
    doc.rect(14, 176, 182, 46, 'FD');

    const base = Number(booking.originalTotal || booking.discountedAmount || booking.totalAmount || 0);
    const discountAmount = Number(booking.discountUsed ? base * booking.discountUsed : 0);
    const taxable = Number(booking.discountedAmount || base - discountAmount || 0);
    const cgst = Number(booking.cgst || 0);
    const sgst = Number(booking.sgst || 0);
    const total = Number(booking.totalAmount || taxable + cgst + sgst);

    drawRow('Subtotal', `INR ${base.toFixed(2)}`, 187);
    drawRow('Discount', `- INR ${discountAmount.toFixed(2)}`, 194);
    drawRow('CGST (9%)', `INR ${cgst.toFixed(2)}`, 201);
    drawRow('SGST (9%)', `INR ${sgst.toFixed(2)}`, 208);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(186, 73, 0);
    doc.setFontSize(12);
    doc.text(`TOTAL: INR ${total.toFixed(2)}`, 16, 218);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(122, 128, 141);
    doc.text('This is a computer-generated invoice from EventX.', 14, 286);
    doc.text('Please carry your booking ID for verification at entry.', 130, 286, { align: 'right' });

      doc.save(`Invoice_${booking.billId}.pdf`);
    } catch (error) {
      console.error('Failed to generate invoice', error);
      showToast('Failed to generate invoice. Please try again.', 'error');
    } finally {
      setDownloadingBookingId(null);
    }
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfileMutation({
        id: user.id,
        updates: profileForm
      });
      const updated = { ...user, ...profileForm };
      setItem('oems_current_user', updated);
      showToast('Profile updated successfully!', 'success');
      setIsProfileModalOpen(false);
    } catch {
      showToast('Profile update failed. Please retry.', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('CRITICAL: Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await deleteUserMutation({ id: user.id });
        showToast('Account deleted. Logging out...', 'success');
        setItem('oems_current_user', null);
        window.location.href = '/';
      } catch {
        showToast('Account deletion failed. Please retry.', 'error');
      }
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

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
        <button
          className={`btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
          style={{
            background: activeTab === 'bookings' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'bookings' ? 'white' : 'var(--text-muted)',
            borderRadius: '50px',
            border: activeTab === 'bookings' ? 'none' : '1px solid var(--border)'
          }}
        >
          <CalendarDays size={18} /> My Bookings
        </button>
        <button
          className={`btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
          style={{
            background: activeTab === 'profile' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'profile' ? 'white' : 'var(--text-muted)',
            borderRadius: '50px',
            border: activeTab === 'profile' ? 'none' : '1px solid var(--border)'
          }}
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
                {filteredBookings.map(booking => (
                  <div key={booking.id} className="receipt" style={{ padding: '2rem', borderRadius: '16px', background: 'var(--surface-raised)', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '5px', background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }}></div>
                    <div className="receipt-header" style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '1px dashed var(--border)', paddingBottom: '1.5rem' }}>
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
                          showToast('Copied to clipboard: ' + booking.billId, "info");
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

                    <div style={{ margin: '2rem 0 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ background: 'white', padding: '12px', borderRadius: '8px', marginBottom: '1rem', display: 'inline-block', boxShadow: '0 4px 20px rgba(255, 85, 0, 0.2)' }}>
                        <Suspense fallback={<div style={{ width: '130px', height: '130px', background: '#eceff3', borderRadius: '8px' }} />}>
                          <QRCodeCanvas value={booking.billId} size={130} level={"H"} />
                        </Suspense>
                      </div>
                      {booking.status === 'checked-in' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                          <CheckCircle2 size={18} /> Verified Entry
                        </div>
                      )}
                      {booking.status === 'booked' && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', fontWeight: 500 }}>
                          Scan at venue for quick entry
                        </p>
                      )}
                      {(booking.status === 'cancelled' || booking.status === 'refunded') && (
                        <p style={{ color: 'var(--danger)', fontSize: '0.85rem', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}>
                          Ticket Revoked
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ flex: 1 }}
                        onClick={() => handleDownloadReceipt(booking)}
                        disabled={downloadingBookingId === booking.id}
                      >
                        <Download size={16} /> {downloadingBookingId === booking.id ? 'Preparing...' : 'Bill'}
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
                          const reviews = reviewsData || [];
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
                <div style={{ width: '100px', height: '100px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', overflow: 'hidden', border: '4px solid var(--surface-raised)', boxShadow: '0 4px 20px rgba(255, 85, 0, 0.3)' }}>
                  {user.image ? (
                    <img src={user.image} alt="Profile" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                  <button className="btn btn-secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '50px' }} onClick={() => setIsProfileModalOpen(true)}>
                    <Edit size={14} /> Edit Profile
                  </button>
                  <button className="btn btn-danger" style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', borderRadius: '50px' }} onClick={handleDeleteAccount}>
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
          <div className="modal-content" style={{ maxWidth: '450px' }}>
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
                <Info size={20} color="var(--primary)" style={{ marginTop: '2px' }} />
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
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Edit Profile</h2>
            <form onSubmit={handleUpdateProfile}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: '100px', height: '100px', background: '#f3f4f6', borderRadius: '2px', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px dashed var(--border)', position: 'relative' }}>
                  {profileForm.image ? <img src={profileForm.image} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserIcon size={40} color="#9ca3af" />}
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
