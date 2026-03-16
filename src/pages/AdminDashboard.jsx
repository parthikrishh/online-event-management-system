import { useState } from 'react';
import { getItem, setItem, checkInTicket, revertCheckIn, cancelEventAndRefund, processRefund, deleteUserAccount, deleteBooking, deleteRefund, addAdminLog, deleteEvent, deleteReview, cleanupPastEvents } from '../utils/storage';
import { sendCancellationEmail, sendRefundEmail } from '../utils/email';
import { Users, CalendarDays, BookOpen, FileText, Plus, Trash2, Edit, LayoutDashboard, QrCode, Download, RefreshCcw, Star, CheckCircle2, Search, ShieldCheck } from 'lucide-react';
import * as XLSX from 'xlsx';
import { XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, CartesianGrid } from 'recharts';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem('oems_admin_tab') || 'overview');
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    sessionStorage.setItem('oems_admin_tab', tab);
  };
  const [users, setUsers] = useState(() => getItem('oems_users') || []);
  const [events, setEvents] = useState(() => getItem('oems_events') || []);
  const [bookings, setBookings] = useState(() => (getItem('oems_bookings') || []).reverse());
  const [refunds, setRefunds] = useState(() => getItem('oems_refunds') || []);
  const [reviews, setReviews] = useState(() => getItem('oems_reviews') || []);

  const EVENT_CATEGORIES = [
    'Technology', 'Meetups', 'Music Concerts', 'DJ Night', 'Corporate Events',
    'Cultural Events', 'Stand-up Comedy Show', 'Game Night', 'Food Festival', 'IT-related Workshops'
  ];

  const CATEGORY_IMAGES = {
    'Technology': [
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800'
    ],
    'Meetups': [
        'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1522071823991-b5ae7724e657?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1543269667-5faad9ee9f5f?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1523240693567-0cf5c2736c8c?auto=format&fit=crop&q=80&w=800'
    ],
    'Music Concerts': [
        'https://images.unsplash.com/photo-1501281668695-021444638ffc?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1459749411177-042ae50b553c?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1514525253344-f91d5993d065?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1429962714451-bb934ec04c05?auto=format&fit=crop&q=80&w=800'
    ],
    'DJ Night': [
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1571266028243-e4bb33392ed6?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1530103578275-0e11e30eeece?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1594623930572-3005481009a7?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1574391857241-105152a425f1?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800'
    ],
    'Corporate Events': [
        'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1475721027187-402ad2989a3b?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1540575861501-7c91bec32c3f?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1591115711421-2645cca8824a?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1559223607-a43c990c692c?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1560439514-4e9645039924?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1520333789090-1afc82db536a?auto=format&fit=crop&q=80&w=800'
    ],
    'Cultural Events': [
        'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1514525253344-f91d5993d065?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1467307983825-619af9548301?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1561414927-6d86591d0c4f?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1523580494863-6f30312248ca?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1501281668695-021444638ffc?auto=format&fit=crop&q=80&w=800'
    ],
    'Stand-up Comedy Show': [
        'https://images.unsplash.com/photo-1516280440614-37939bbdd4f1?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1585699324551-f6c309eedee6?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1543584732-7a350d04a1f3?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1551632432-c7360b7f0177?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1525994886773-080516fc293b?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1525013066836-c6090f0ad9d8?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1516280440614-37939bbdd4f1?auto=format&fit=crop&q=80&w=800'
    ],
    'Game Night': [
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1553481199-ef9ad1056148?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1519332978332-21b7d621d05e?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1580234810002-438a481c1f31?auto=format&fit=crop&q=80&w=800'
    ],
    'Food Festival': [
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1484723088339-fe441c8fef4c?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1514328539413-73ba513f56e6?auto=format&fit=crop&q=80&w=800'
    ],
    'IT-related Workshops': [
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1515378717309-4ff106f20436?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1522071823991-b5ae7724e657?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1542621334-a254cf47733d?auto=format&fit=crop&q=80&w=800'
    ]
  };

  // Event modal state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventFormData, setEventFormData] = useState({
    name: '', description: '', date: '', time: '', location: '', price: '', vipPrice: '', category: '', image: ''
  });
  
  const [checkInBillId, setCheckInBillId] = useState('');
  const [checkInEventId, setCheckInEventId] = useState('');
  const [checkInResult, setCheckInResult] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);

  // Search & Filter states
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [bookingEventFilter, setBookingEventFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [eventSearch, setEventSearch] = useState('');
  const [eventCategoryFilter, setEventCategoryFilter] = useState('all');
  const [eventTimeFilter, setEventTimeFilter] = useState('upcoming');
  const [reviewRatingFilter, setReviewRatingFilter] = useState('all');

  const loadData = () => {
    setUsers(getItem('oems_users') || []);
    setEvents(getItem('oems_events') || []);
    setBookings((getItem('oems_bookings') || []).reverse());
    setRefunds(getItem('oems_refunds') || []);
    setReviews(getItem('oems_reviews') || []);
  };

  const openAddEvent = () => {
    setEditingEvent(null);
    setEventFormData({ name: '', description: '', date: '', time: '', location: '', price: '', vipPrice: '', category: '', image: '' });
    setIsEventModalOpen(true);
  };

  const openEditEvent = (event) => {
    setEditingEvent(event);
    setEventFormData({
      name: event.name,
      description: event.description,
      date: event.date,
      time: event.time || '',
      location: event.location,
      price: event.price,
      vipPrice: event.vipPrice || '',
      category: event.category || '',
      image: event.image || ''
    });
    setIsEventModalOpen(true);
  };

  const handleDeleteEvent = (id) => {
    const event = events.find(e => e.id === id);
    if (!event) return;

    if (confirm(`Are you sure you want to permanently DELETE "${event.name}"? This will remove all associated bookings and cannot be undone.`)) {
      deleteEvent(id);
      addAdminLog('Event Deleted', `Permanently removed event "${event.name}" and cleared associated bookings.`);
      loadData();
    }
  };

  const handleCancelAndRefund = (id) => {
    const event = events.find(e => e.id === id);
    if (!event) return;

    const reason = prompt(`Reason for cancelling "${event.name}":`, "Technical issues / Scheduling conflict");
    
    if (reason === null) return; // User clicked Cancel in prompt

    if (confirm(`CONFIRM: You are about to cancel "${event.name}" and refund all attendees. Reason: ${reason}. Proceed?`)) {
      const affectedBookings = cancelEventAndRefund(id, reason);
      
      // Notify all affected users
      affectedBookings.forEach(booking => {
        const user = users.find(u => u.id === booking.userId);
        if (user) {
          sendCancellationEmail(user.email, user.name, event.name, reason)
            .catch(err => console.error(`Failed to send cancellation email to ${user.email}`, err));
        }
      });

      addAdminLog('Event Cancelled', `Cancelled "${event.name}". Reason: ${reason}. ${affectedBookings.length} refunds initiated.`);
      alert(`Event cancelled. ${affectedBookings.length} bookings have been moved to refunded status and notification emails have been queued.`);
      loadData();
    }
  };

  const handleManualRefund = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    if (['refunded', 'cancelled'].includes(booking.status)) {
        alert("This booking is already refunded or cancelled.");
        return;
    }

    const reason = prompt(`Reason for refunding ${booking.userName}'s booking for ${booking.eventName}:`, "Admin initiated refund");
    if (reason === null) return;

    if (confirm(`Confirm refund of INR ${booking.totalAmount} to ${booking.userName}?`)) {
        const allBookings = getItem('oems_bookings') || [];
        const idx = allBookings.findIndex(b => b.id === bookingId);
        if (idx !== -1) {
            allBookings[idx].status = 'refunded';
            setItem('oems_bookings', allBookings);
            
            const user = users.find(u => u.id === booking.userId);
            if (user) {
                sendRefundEmail(user.email, user.name, booking.totalAmount, booking.billId)
                    .catch(e => console.error(e));
            }

            const refundsList = getItem('oems_refunds') || [];
            refundsList.push({
                id: Date.now().toString(),
                bookingId: booking.id,
                userId: booking.userId,
                amount: booking.totalAmount,
                reason: reason,
                bankDetails: "Manual Admin Refund",
                status: 'approved',
                date: new Date().toISOString()
            });
            setItem('oems_refunds', refundsList);
            
            addAdminLog('Manual Refund', `Refunded ${booking.userName} for ${booking.eventName}. Reason: ${reason}`);
            alert("Refund processed successfully.");
            loadData();
        }
    }
  };

  const handleRevertCheckIn = (id) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;

    if (confirm(`Revert check-in for ${booking.userName}? This will set their ticket back to 'Booked' status.`)) {
        if (revertCheckIn(id)) {
            addAdminLog('Check-in Reverted', `Undid check-in for ${booking.userName} (Bill ID: ${booking.billId}).`);
            loadData();
        }
    }
  };

  const handleDeleteBooking = (id) => {
    if (confirm('Are you sure you want to delete this booking record? This will not process a refund.')) {
      deleteBooking(id);
      addAdminLog('Booking Deleted', `Removed booking record ID: ${id}`);
      loadData();
    }
  };
  const handleCleanupPastEvents = () => {
    if (confirm('Are you sure you want to remove all past events from the database? This cannot be undone.')) {
        const removedCount = cleanupPastEvents();
        if (removedCount > 0) {
            alert(`Successfully removed ${removedCount} past events.`);
            loadData();
        } else {
            alert('No past events found to remove.');
        }
    }
  };

  const handleDeleteUser = (id) => {
    const userToDelete = users.find(u => u.id === id);
    if (!userToDelete) return;
    if (userToDelete.role === 'admin') {
      alert("Cannot delete admin users.");
      return;
    }
    if (confirm(`Are you sure you want to delete user "${userToDelete.name}"? This will also remove their entire booking history, reviews, and profile data.`)) {
      deleteUserAccount(id);
      addAdminLog('User Deleted', `Permanently removed user account: ${userToDelete.name}`);
      loadData();
    }
  };

  const handleDeleteReview = (id) => {
    if (confirm('Are you sure you want to delete this review?')) {
      deleteReview(id);
      addAdminLog('Review Deleted', `Removed a user review.`);
      loadData();
    }
  };

  const handleEventSubmit = (e) => {
    e.preventDefault();
    
    // Date collision check
    const duplicateEvent = events.find(ev => 
      ev.date === eventFormData.date && 
      (!editingEvent || ev.id !== editingEvent.id)
    );

    if (duplicateEvent) {
      alert(`CONFLICT: An event "${duplicateEvent.name}" is already scheduled for ${eventFormData.date}. Please choose another date.`);
      return;
    }

    if (editingEvent) {
      const updatedEvents = events.map(ev => 
        ev.id === editingEvent.id 
          ? { ...ev, ...eventFormData, price: Number(eventFormData.price), vipPrice: Number(eventFormData.vipPrice) }
          : ev
      );
      setItem('oems_events', updatedEvents);
      addAdminLog('Event Updated', `Modified details for "${eventFormData.name}".`);
    } else {
      const newEvent = {
        id: Date.now().toString(),
        ...eventFormData,
        price: Number(eventFormData.price),
        vipPrice: Number(eventFormData.vipPrice),
        status: 'approved'
      };
      setItem('oems_events', [...events, newEvent]);
      addAdminLog('Event Created', `Added new event "${eventFormData.name}".`);
    }
    setIsEventModalOpen(false);
    loadData();
  };

  const submitCheckIn = (e) => {
    e.preventDefault();
    if (!checkInBillId) return;
    const res = checkInTicket(checkInBillId.trim(), checkInEventId);
    setCheckInResult(res);
    if (res === 'success') {
      addAdminLog('Check-in', `Verified Bill ID ${checkInBillId}.`);
      loadData(); 
    }
  };

  const getFilteredBookings = () => {
    return bookings.filter(b => {
      const matchesSearch = b.billId.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.userName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.eventName.toLowerCase().includes(bookingSearch.toLowerCase());
      const matchesStatus = bookingStatusFilter === 'all' || b.status === bookingStatusFilter;
      const matchesEvent = bookingEventFilter === 'all' || b.eventName === bookingEventFilter;
      return matchesSearch && matchesStatus && matchesEvent;
    });
  };

  const getFilteredEvents = () => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    return events.filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(eventSearch.toLowerCase()) ||
                          e.location.toLowerCase().includes(eventSearch.toLowerCase());
      const matchesCategory = eventCategoryFilter === 'all' || e.category === eventCategoryFilter;
      const matchesTime = eventTimeFilter === 'all' || (eventTimeFilter === 'upcoming' ? e.date >= todayStr : e.date < todayStr);
      return matchesSearch && matchesCategory && matchesTime;
    }).sort((a, b) => new Date(a.date) - new Date(b.date)).map(e => {
        // Calculate per-event stats
        const eventBookings = bookings.filter(b => b.eventId === e.id);
        const activeBookings = eventBookings.filter(b => b.status !== 'refunded' && b.status !== 'cancelled' && b.status !== 'refund_requested');
        const eventReviews = reviews.filter(r => r.eventId === e.id);
        const eventRefunds = refunds.filter(r => r.bookingId && eventBookings.some(b => b.id === r.bookingId));

        return {
            ...e,
            revenue: activeBookings.reduce((sum, b) => sum + b.totalAmount, 0),
            ticketsSold: activeBookings.reduce((sum, b) => sum + b.numTickets, 0),
            avgRating: eventReviews.length > 0 ? (eventReviews.reduce((sum, r) => sum + r.rating, 0) / eventReviews.length).toFixed(1) : 'N/A',
            refundCount: eventBookings.filter(b => b.status === 'refunded' || b.status === 'cancelled' || b.status === 'refund_requested').length
        };
    });
  };

  const getFilteredUsers = () => {
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                          u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      return matchesSearch && matchesRole;
    });
  };

  const exportBookingsToExcel = () => {
    const filtered = getFilteredBookings();
    const dataToExport = filtered.map(b => ({
      'Bill ID': b.billId,
      'Event Name': b.eventName,
      'Customer Name': b.userName,
      'Tickets Booked': b.numTickets,
      'Subtotal (₹)': b.discountedAmount || b.totalAmount,
      'CGST (₹)': b.cgst || 0,
      'SGST (₹)': b.sgst || 0,
      'Grand Total (₹)': b.totalAmount,
      'Status': b.status ? b.status.toUpperCase() : 'BOOKED',
      'Date': new Date(b.bookingDate).toLocaleDateString()
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Bookings");
    XLSX.writeFile(workbook, "OEMS_Filtered_Bookings.xlsx");
  };

  const exportEventsToExcel = () => {
    const filtered = getFilteredEvents();
    const dataToExport = filtered.map(e => ({
      'Event Name': e.name,
      'Category': e.category,
      'Date': e.date,
      'Location': e.location,
      'Price': e.price,
      'Tickets Sold': e.ticketsSold,
      'Revenue (₹)': e.revenue,
      'Avg Rating': e.avgRating,
      'Cancelled/Refunded': e.refundCount
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Event Performance");
    XLSX.writeFile(workbook, "OEMS_Event_Stats.xlsx");
  };

  const exportUsersToExcel = () => {
    const filtered = getFilteredUsers();
    const dataToExport = filtered.map(u => ({
      'User ID': u.id,
      'Name': u.name,
      'Email': u.email,
      'Role': u.role,
      'Status': 'ACTIVE'
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Users");
    XLSX.writeFile(workbook, "OEMS_Filtered_Users.xlsx");
  };

  const exportActivityReport = () => {
    const data = bookings.map(b => ({
      'User Name': b.userName,
      'Action': 'Booked',
      'Event': b.eventName,
      'Date': new Date(b.bookingDate).toLocaleDateString(),
      'Time': new Date(b.bookingDate).toLocaleTimeString(),
      'Status': b.status.toUpperCase()
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "User Activity");
    XLSX.writeFile(workbook, "User_Booking_Activity.xlsx");
  };

  const exportPeriodicReport = (type) => {
    const now = new Date();
    let threshold = new Date();
    let fileName = "";
    
    if (type === 'daily') {
        threshold.setHours(0, 0, 0, 0);
        fileName = "Daily_Report_" + threshold.toLocaleDateString();
    } else if (type === 'weekly') {
        threshold.setDate(now.getDate() - 7);
        fileName = "Weekly_Performance_Report";
    } else if (type === 'monthly') {
        threshold.setMonth(now.getMonth() - 1);
        fileName = "Monthly_Financial_Analysis";
    }

    const filtered = bookings.filter(b => new Date(b.bookingDate) >= threshold);
    
    if (filtered.length === 0) {
        alert(`No bookings found for this ${type} period.`);
        return;
    }

    const data = filtered.map(b => ({
        'Bill ID': b.billId,
        'Event': b.eventName,
        'Customer': b.userName,
        'Tickets': b.numTickets,
        'Subtotal': b.discountedAmount || b.totalAmount,
        'Tax (CGST+SGST)': (b.cgst || 0) + (b.sgst || 0),
        'Total Amount': b.totalAmount,
        'Status': b.status.toUpperCase(),
        'Revenue Impact': ['cancelled', 'refunded'].includes(b.status) ? 0 : b.totalAmount,
        'DateTime': new Date(b.bookingDate).toLocaleString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Performance Data");
    XLSX.writeFile(workbook, `OEMS_${fileName}.xlsx`);
    addAdminLog('Report Generated', `Downloaded ${type} performance report.`);
  };

  const exportAdminLogs = () => {
    const logs = getItem('oems_admin_logs') || [];
    const data = logs.map(l => ({
      'Action': l.action,
      'Details': l.details,
      'Date': new Date(l.date).toLocaleDateString(),
      'Time': new Date(l.date).toLocaleTimeString()
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Admin Logs");
    XLSX.writeFile(workbook, "Admin_Action_Logs.xlsx");
  };

  const handleProcessRefund = (refundId, approve) => {
    if (confirm(`Are you sure you want to ${approve ? 'approve' : 'reject'} this refund?`)) {
        processRefund(refundId, approve);
        addAdminLog('Refund Processed', `${approve ? 'Approved' : 'Rejected'} refund request #${refundId}.`);
        
        if (approve) {
            const refund = refunds.find(r => r.id === refundId);
            const userObj = users.find(u => u.id === refund?.userId);
            const booking = bookings.find(b => b.id === refund?.bookingId);
            if (userObj && refund && booking) {
                sendRefundEmail(userObj.email, userObj.name, refund.amount, booking.billId);
            }
        }
        
        loadData();
    }
  };

  const handleDeleteRefund = (id) => {
    if (confirm('Are you sure you want to delete this refund record?')) {
        deleteRefund(id);
        addAdminLog('Refund Deleted', `Removed refund record #${id}.`);
        loadData();
    }
  };



  return (
    <div className="admin-dashboard-container" style={{ paddingTop: '2rem' }}>
      <div className="admin-sidebar">
        <h2 className="admin-sidebar-title" style={{ 
          fontSize: '1.4rem', 
          fontWeight: '950', 
          marginBottom: '2rem', 
          background: 'linear-gradient(135deg, var(--primary), #FF7B8F)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          paddingLeft: '1.5rem',
          letterSpacing: '-1px'
        }}>EVENTX ADMIN</h2>

        <button 
          className={`admin-sidebar-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          <LayoutDashboard size={20} /> Dashboard
        </button>
        <button 
          className={`admin-sidebar-item ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => handleTabChange('events')}
        >
          <CalendarDays size={20} /> Events Management
        </button>
        <button 
          className={`admin-sidebar-item ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => handleTabChange('bookings')}
        >
          <BookOpen size={20} /> All Bookings
        </button>
        <button 
          className={`admin-sidebar-item ${activeTab === 'scan' ? 'active' : ''}`}
          onClick={() => { handleTabChange('scan'); setCheckInResult(null); setCheckInBillId(''); }}
        >
          <QrCode size={20} /> Gate Scan
        </button>
        <button 
          className={`admin-sidebar-item ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => handleTabChange('users')}
        >
          <Users size={20} /> User Accounts
        </button>
        <button 
          className={`admin-sidebar-item ${activeTab === 'refunds' ? 'active' : ''}`}
          onClick={() => handleTabChange('refunds')}
        >
          <RefreshCcw size={20} /> Refunds
        </button>
        <button 
          className={`admin-sidebar-item ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => handleTabChange('reviews')}
        >
          <Star size={20} /> Feedback
        </button>
        <button 
          className={`admin-sidebar-item ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => handleTabChange('activity')}
        >
          <FileText size={20} /> Activity Log
        </button>
        <button 
          className={`admin-sidebar-item ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => handleTabChange('logs')}
        >
          <ShieldCheck size={20} /> Security Logs
        </button>

        <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
             <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>Professional Admin Suite v2.0</p>
        </div>
      </div>

      <div className="admin-content-area">


      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div>
          <h2 style={{ marginBottom: '1.5rem' }}>Platform Overview</h2>
          <div className="grid">
        <div className="admin-card" style={{ textAlign: 'center', borderTop: '2px solid var(--primary)' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Total Revenue</h3>
          <p style={{ fontSize: '2.6rem', fontWeight: '900', color: 'var(--primary)', marginTop: '0.5rem' }}>
            ₹{bookings.filter(b => !['refunded', 'cancelled', 'refund_requested'].includes(b.status)).reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}
          </p>
        </div>
        <div className="admin-card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Tickets Sold</h3>
          <p style={{ fontSize: '2.4rem', fontWeight: '900', color: 'var(--success)', marginTop: '0.5rem' }}>
            {bookings.filter(b => !['refunded', 'cancelled', 'refund_requested'].includes(b.status)).reduce((sum, b) => sum + b.numTickets, 0)}
          </p>
        </div>
        <div className="admin-card" style={{ textAlign: 'center', borderTop: '2px solid var(--secondary)' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>System Users</h3>
          <p style={{ fontSize: '2.6rem', fontWeight: '900', color: 'var(--secondary)', marginTop: '0.5rem' }}>
            {users.length}
          </p>
        </div>
      </div>

      <div className="grid" style={{ marginTop: '2rem' }}>
        <div className="admin-card" style={{ textAlign: 'center', borderLeft: '4px solid var(--secondary)' }}>
          <h4 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>MVP Event</h4>
          <p style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '0.5rem' }}>
            {events.length > 0 ? events.reduce((prev, curr) => {
              const prevCount = bookings.filter(b => b.eventId === prev.id).length;
              const currCount = bookings.filter(b => b.eventId === curr.id).length;
              return prevCount > currCount ? prev : curr;
            }).name : 'N/A'}
          </p>
        </div>
        <div className="admin-card" style={{ textAlign: 'center', borderLeft: '4px solid #f59e0b' }}>
          <h4 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>User Satisfaction</h4>
          <p style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '0.5rem' }}>
            {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0.0'} / 5.0 ⭐
          </p>
        </div>
        <div className="admin-card" style={{ textAlign: 'center', background: 'rgba(255, 49, 82, 0.05)', border: '1px solid rgba(255, 49, 82, 0.2)' }}>
          <h4 style={{ color: 'var(--primary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Pending Issues</h4>
          <p style={{ fontSize: '1.4rem', fontWeight: '900', marginTop: '0.5rem', color: 'var(--text-main)' }}>
            {refunds.filter(r => r.status === 'pending').length} Actions
          </p>
        </div>
          </div>

          <div className="admin-card" style={{ marginTop: '2rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 1) 0%, rgba(15, 23, 42, 1) 100%)', border: '1px solid var(--border)' }}>
             <div className="flex-between">
                <div>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={20} color="var(--primary)" /> Analysis Reporting Center
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Generate system-wide performance reports based on key time intervals.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                    <button className="admin-btn admin-btn-secondary" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={() => exportPeriodicReport('daily')}>
                        <Download size={14} /> Daily
                    </button>
                    <button className="admin-btn admin-btn-secondary" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={() => exportPeriodicReport('weekly')}>
                        <Download size={14} /> Weekly
                    </button>
                    <button className="admin-btn admin-btn-primary" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={() => exportPeriodicReport('monthly')}>
                        <Download size={14} /> Monthly
                    </button>
                </div>
             </div>
          </div>


          {/* Charts Section */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '3rem' }}>
            <div className="admin-card" style={{ flex: '1 1 500px', minWidth: 0 }}>
              <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <h3 style={{ margin: 0 }}>Revenue Growth Trends</h3>
                <small className="text-muted">{events.length} Events Total</small>
              </div>
              <div style={{ height: 350, overflowX: 'auto', overflowY: 'hidden', paddingBottom: '10px' }}>
                <div style={{ minWidth: events.length > 8 ? `${events.length * 60}px` : '100%', height: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={events.map(e => {
                      const eventBookings = bookings.filter(b => b.eventId === e.id);
                      return {
                        name: e.name.length > 12 ? e.name.substring(0, 10) + '...' : e.name,
                        full_name: e.name,
                        revenue: eventBookings.filter(b => !['cancelled', 'refunded', 'refund_requested'].includes(b.status)).reduce((sum, b) => sum + b.totalAmount, 0)
                      };
                    })}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis 
                        dataKey="name" 
                        stroke="var(--text-muted)" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false}
                        interval={0}
                      />
                      <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ 
                          backgroundColor: 'var(--surface)', 
                          border: '1px solid var(--border)', 
                          borderRadius: '2px',
                          boxShadow: 'var(--shadow-lg)',
                          color: 'var(--text-main)',
                          padding: '12px'
                        }} 
                        itemStyle={{ color: 'var(--primary)', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px' }}
                        labelStyle={{ color: 'var(--text-muted)', marginBottom: '5px' }}
                        formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                      />
                      <Bar 
                        dataKey="revenue" 
                        fill="var(--primary)" 
                        radius={[0, 0, 0, 0]} 
                        barSize={30}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="admin-card" style={{ flex: '1 1 300px' }}>
              <h3 style={{ marginBottom: '2rem', textAlign: 'center' }}>Ticket Distribution</h3>
              <div style={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={events.map(e => {
                        return {
                          name: e.name,
                          value: bookings.filter(b => b.eventId === e.id && !['cancelled', 'refunded', 'refund_requested'].includes(b.status)).reduce((sum, b) => sum + b.numTickets, 0)
                        };
                      }).filter(data => data.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {events.map((entry, index) => {
                        const COLORS = [
                          '#FF3152', '#00D2FF', '#9D00FF', '#00FF95', 
                          '#FF7B8F', '#00E5FF', '#BD00FF', '#00F0FF', 
                          '#FF0000', '#1A1B23'
                        ];
                        return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                      })}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--surface)', 
                        border: '1px solid var(--border)', 
                        borderRadius: '2px',
                        color: 'var(--text-main)'
                      }}
                    />
                    <Legend iconType="square" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVITY LOG TAB */}
      {activeTab === 'activity' && (
        <div>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>User Booking Activity</h2>
                <button className="admin-btn admin-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={exportActivityReport}>
                    <Download size={16} /> Export to Excel
                </button>
            </div>
            <div className="admin-card" style={{ padding: 0 }}>
                {bookings.length === 0 ? (
                    <p style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No booking activity recorded yet.</p>
                ) : (
                    <div className="admin-table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Action</th>
                                    <th>Event</th>
                                    <th>Status</th>
                                    <th>Amount</th>
                                    <th>Date & Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(b => (
                                    <tr key={b.id}>
                                        <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{b.userName}</td>
                                        <td>Booked Ticket</td>
                                        <td>{b.eventName}</td>
                                        <td>
                                            <span className={`badge ${b.status === 'checked-in' ? 'badge-admin' : 'badge-user'}`} style={{ fontSize: '0.65rem' }}>
                                                {b.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>₹{b.totalAmount}</td>
                                        <td>{new Date(b.bookingDate).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* ADMIN LOGS TAB */}
      {activeTab === 'logs' && (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, color: 'var(--danger)' }}>System Admin Logs</h2>
                <button className="admin-btn admin-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={exportAdminLogs}>
                    <Download size={16} /> Export to Excel
                </button>
            </div>
            <div className="admin-card" style={{ padding: 0, border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                {(getItem('oems_admin_logs') || []).length === 0 ? (
                    <p style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No administrative actions logged yet.</p>
                ) : (
                    <div style={{ padding: '1rem' }}>
                        {(getItem('oems_admin_logs') || []).slice().reverse().map(log => (
                            <div key={log.id} style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', background: 'rgba(239, 68, 68, 0.02)', borderRadius: '8px', marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: '800', color: 'var(--danger)', fontSize: '1rem', letterSpacing: '0.5px' }}>{log.action}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>{new Date(log.date).toLocaleString()}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', opacity: 0.9 }}>{log.details}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      )}



      {/* EVENTS TAB */}
      {activeTab === 'events' && (
        <div>
          <div className="flex-between" style={{ gap: '1rem' }}>
            <h2 style={{ marginBottom: 0 }}>Events ({events.length})</h2>
            <div className="admin-actions-grid" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button 
                className="admin-btn btn-danger" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#dc2626' }}
                onClick={handleCleanupPastEvents}
              >
                <Trash2 size={16} /> Cleanup Past Events
              </button>
              <div className="search-bar" style={{ maxWidth: '200px', marginBottom: 0, height: '42px' }}>
                <Search size={18} />
                <input 
                  type="text" 
                  placeholder="Search events..." 
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                />
              </div>
              <select 
                className="form-input" 
                style={{ width: '150px', marginBottom: 0, height: '42px', padding: '0 0.8rem' }}
                value={eventCategoryFilter}
                onChange={(e) => setEventCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {[...new Set(events.filter(e => {
                  if (eventTimeFilter === 'upcoming') return new Date(e.date) >= new Date().setHours(0,0,0,0);
                  if (eventTimeFilter === 'past') return new Date(e.date) < new Date().setHours(0,0,0,0);
                  return true;
                }).map(e => e.category))].filter(Boolean).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select 
                className="form-input" 
                style={{ width: '130px', marginBottom: 0, height: '42px', padding: '0 0.8rem' }}
                value={eventTimeFilter}
                onChange={(e) => setEventTimeFilter(e.target.value)}
              >
                <option value="upcoming">Upcoming</option>
                <option value="past">Past Events</option>
                <option value="all">All Events</option>
              </select>
              <button className="admin-btn admin-btn-secondary" onClick={exportEventsToExcel} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', height: '42px' }}>
                <Download size={14} /> Export
              </button>
              <button className="admin-btn admin-btn-success" onClick={openAddEvent} style={{ height: '42px' }}>
                <Plus size={18} /> Add Event
              </button>
            </div>
          </div>
          <div className="admin-table-container">
            <table>
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Details</th>
                  <th>Financials</th>
                  <th>Feedback</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredEvents().map(event => (
                  <tr key={event.id}>
                    <td>
                        <strong>{event.name}</strong><br/>
                        <small className="badge-user" style={{ fontSize: '0.65rem', padding: '0.1rem 0.3rem' }}>{event.category}</small>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                        📅 {new Date(event.date).toLocaleDateString()}<br/>
                        📍 {event.location}
                    </td>
                    <td>
                        <div style={{ fontSize: '0.9rem' }}>
                            <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>₹{event.revenue.toFixed(0)}</span><br/>
                            <small className="text-muted">{event.ticketsSold} Tickets Sold</small>
                        </div>
                    </td>
                    <td>
                        <div style={{ fontSize: '0.9rem' }}>
                            <span style={{ color: '#f59e0b' }}>⭐ {event.avgRating}</span><br/>
                            <small style={{ color: 'var(--danger)' }}>{event.refundCount} Returns</small>
                        </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="admin-btn admin-btn-secondary" style={{ padding: '0.4rem' }} onClick={() => openEditEvent(event)} title="Edit">
                          <Edit size={14} />
                        </button>
                        <button className="admin-btn btn-warning" style={{ padding: '0.4rem' }} onClick={() => handleCancelAndRefund(event.id)} title="Cancel & Refund">
                          <RefreshCcw size={14} />
                        </button>
                        <button className="admin-btn btn-danger" style={{ padding: '0.4rem' }} onClick={() => handleDeleteEvent(event.id)} title="Force Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center' }}>No events found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BOOKINGS TAB */}
      {activeTab === 'bookings' && (
        <div>
          <div className="flex-between">
            <h2 style={{ marginBottom: 0 }}>All Bookings ({bookings.length})</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="search-bar" style={{ maxWidth: '200px', marginBottom: 0 }}>
                <Search size={18} />
                <input 
                  type="text" 
                  placeholder="Seach ID/Name..." 
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                />
              </div>
              
              <select 
                className="form-input" 
                style={{ width: '150px', marginBottom: 0, padding: '0.4rem' }}
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="booked">Booked</option>
                <option value="checked-in">Checked In</option>
                <option value="cancelled">Cancelled</option>
                <option value="refund_requested">Refund Requested</option>
                <option value="refunded">Refunded</option>
              </select>

              <select 
                className="form-input" 
                style={{ width: '180px', marginBottom: 0, padding: '0.4rem' }}
                value={bookingEventFilter}
                onChange={(e) => setBookingEventFilter(e.target.value)}
              >
                <option value="all">All Events</option>
                {events.filter(ev => {
                    const today = new Date().toLocaleDateString('en-CA');
                    return ev.date >= today;
                }).map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
              </select>

              <button className="admin-btn admin-btn-success" onClick={exportBookingsToExcel}>
                <Download size={18} /> Export Excel
              </button>
            </div>
          </div>
          <div className="table-container" style={{ marginTop: '1.5rem' }}>
            <table>
              <thead>
                <tr>
                  <th>Bill ID</th>
                  <th>User</th>
                  <th>Event</th>
                  <th>Tickets</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredBookings().map(booking => (
                  <tr key={booking.id}>
                    <td style={{ fontFamily: 'monospace', cursor: 'pointer' }} onClick={() => {
                      navigator.clipboard.writeText(booking.billId);
                      alert('Copied to clipboard: ' + booking.billId);
                    }} title="Click to copy">
                      {booking.billId}
                    </td>
                    <td>{booking.userName}</td>
                    <td>{booking.eventName}</td>
                    <td>{booking.numTickets}</td>
                    <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>INR {booking.totalAmount}</td>
                    <td>
                      <span className={`badge ${booking.status === 'checked-in' ? 'badge-admin' : ['cancelled', 'refunded', 'refund_requested'].includes(booking.status) ? 'badge-danger' : 'badge-user'}`} style={{fontSize: '0.7rem'}}>
                        {booking.status ? booking.status.replace('_', ' ').toUpperCase() : 'BOOKED'}
                      </span>
                    </td>
                    <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {!['refunded', 'cancelled'].includes(booking.status) && (
                            <button className="admin-btn btn-warning" style={{ padding: '0.4rem' }} onClick={() => handleManualRefund(booking.id)} title="Refund Booking">
                                <RefreshCcw size={14} />
                            </button>
                        )}
                        <button className="admin-btn btn-danger" style={{ padding: '0.4rem' }} onClick={() => handleDeleteBooking(booking.id)} title="Delete Record">
                            <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr><td colSpan="7" style={{ textAlign: 'center' }}>No bookings found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SCAN / CHECK-IN TAB */}
      {activeTab === 'scan' && (
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <div className="flex-between" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ marginBottom: 0 }}>Gate Check-In Simulator</h2>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
             <div className="admin-card" style={{ padding: '1rem 2rem', borderBottom: '3px solid var(--success)' }}>
                 <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Currently Inside</p>
                 <h3 style={{ margin: 0 }}>{bookings.filter(b => b.status === 'checked-in').reduce((sum, b) => sum + (b.numTickets || 1), 0)} Attendees</h3>
             </div>
          </div>
          <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button className="admin-btn admin-btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }} onClick={() => {
                     const data = bookings.filter(b => b.status === 'checked-in').map(b => ({
                        'Bill ID': b.billId,
                        'Name': b.userName,
                        'Event': b.eventName,
                        'Tickets': b.numTickets,
                        'Date': new Date(b.bookingDate).toLocaleDateString()
                     }));
                     const ws = XLSX.utils.json_to_sheet(data);
                     const wb = XLSX.utils.book_new();
                     XLSX.utils.book_append_sheet(wb, ws, "Checked In");
                     XLSX.writeFile(wb, "CheckedIn_Report.xlsx");
                }}>
                    <Download size={14} /> Export Checked-in
                </button>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Select the event and enter the Bill ID from the user's ticket.</p>
            
            <form onSubmit={submitCheckIn} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <select 
                className="form-input" 
                value={checkInEventId}
                onChange={(e) => setCheckInEventId(e.target.value)}
                required
              >
                <option value="">-- Select Event at this Gate --</option>
                {events.filter(ev => {
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    return new Date(ev.date) >= today;
                }).map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.name} ({ev.date})</option>
                ))}
              </select>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <input 
                    type="text" 
                    placeholder="Enter Bill ID (e.g. BILL-123456)" 
                    className="form-input" 
                    value={checkInBillId} 
                    onChange={(e) => setCheckInBillId(e.target.value)}
                    required
                />
                <button type="submit" className="admin-btn admin-btn-primary" style={{ whiteSpace: 'nowrap' }}>Check In</button>
              </div>
            </form>

            {checkInResult === 'success' && (
              <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', borderRadius: '2px', border: '1px solid var(--success)' }}>
                <strong>✅ SUCCESS!</strong> Ticket verified. User has been checked in.
              </div>
            )}
            {checkInResult === 'already_checked_in' && (
              <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', borderRadius: '2px', border: '1px solid var(--danger)' }}>
                <strong>⛔ WARNING!</strong> This ticket has already been used for check-in!
              </div>
            )}
            {checkInResult === 'not_found' && (
              <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', borderRadius: '2px', border: '1px solid #f59e0b' }}>
                <strong>❌ ERROR:</strong> Bill ID not found in system. Fake ticket!
              </div>
            )}
            {checkInResult === 'invalid_status' && (
              <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', borderRadius: '2px', border: '1px solid var(--danger)' }}>
                <strong>⛔ REJECTED:</strong> This ticket has been cancelled or refunded!
              </div>
            )}
            {checkInResult === 'not_today' && (
              <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', borderRadius: '2px', border: '1px solid #f59e0b' }}>
                <strong>⏳ DATE MISMATCH:</strong> Check-in is only allowed on the official event date!
              </div>
            )}
            {checkInResult === 'event_mismatch' && (
              <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', borderRadius: '2px', border: '1px solid var(--danger)' }}>
                <strong>🚫 EVENT MISMATCH:</strong> This ticket belongs to a different event!
              </div>
            )}
            
            {/* RECENT CHECK-INS */}
            <div style={{ marginTop: '3rem', textAlign: 'left' }}>
                <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={18} /> Recent Check-ins
                </h4>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {bookings.filter(b => b.status === 'checked-in').length === 0 ? (
                        <p className="text-muted" style={{ textAlign: 'center', padding: '1rem' }}>No check-ins today.</p>
                    ) : (
                        bookings.filter(b => b.status === 'checked-in').map(b => (
                            <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderBottom: '1px solid var(--border)', background: 'var(--surface-raised)', borderRadius: '4px', marginBottom: '0.5rem' }}>
                                <div>
                                    <strong style={{ display: 'block' }}>{b.userName}</strong>
                                    <small className="text-muted">{b.eventName} | {b.billId}</small>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 'bold' }}>
                                        {b.checkInDate ? new Date(b.checkInDate).toLocaleTimeString() : 'Just now'}
                                    </span>
                                    <button 
                                        className="admin-btn btn-danger" 
                                        style={{ padding: '0.3rem', borderRadius: '4px' }}
                                        onClick={() => handleRevertCheckIn(b.id)}
                                        title="Undo Check-in"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div>
          <div className="flex-between" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
            <h2 style={{ marginBottom: 0 }}>All Users ({users.length})</h2>
            <div style={{ display: 'flex', gap: '1rem', flex: 1, justifyContent: 'flex-end' }}>
              <div className="search-bar" style={{ maxWidth: '250px', marginBottom: 0 }}>
                  <Search size={18} />
                  <input 
                    type="text" 
                    placeholder="Name or Email..." 
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
              </div>
              <select 
                className="form-input" 
                style={{ width: '150px', marginBottom: 0, padding: '0.4rem' }}
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <button className="admin-btn admin-btn-secondary" onClick={exportUsersToExcel} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Download size={14} /> Export
              </button>
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Spent</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredUsers().map(u => {
                  const userSpent = bookings.filter(b => b.userId === u.id).reduce((sum, b) => sum + b.totalAmount, 0);
                  return (
                  <tr key={u.id}>
                    <td style={{ fontFamily: 'monospace' }}>{u.id.substring(0, 8)}...</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span style={{ 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '4px', 
                        background: u.role === 'admin' ? 'rgba(79, 70, 229, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: u.role === 'admin' ? 'var(--primary)' : 'var(--secondary)',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>INR {userSpent}</td>
                    <td>
                      {u.role !== 'admin' && (
                        <button className="admin-btn btn-danger" style={{ padding: '0.4rem' }} onClick={() => handleDeleteUser(u.id)} title="Delete User">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REFUND REQUESTS TAB */}
      {activeTab === 'refunds' && (
        <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Refund Management</h2>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Bill ID</th>
                            <th>Amount</th>
                            <th>Reason</th>
                            <th>Bank Details</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {refunds.map(refund => {
                            const booking = bookings.find(b => b.id === refund.bookingId);
                            return (
                                <tr key={refund.id}>
                                    <td>{booking ? booking.billId : 'N/A'}</td>
                                    <td style={{ fontWeight: 'bold' }}>INR {refund.amount}</td>
                                    <td>{refund.reason}</td>
                                    <td style={{ fontSize: '0.8rem' }}>{refund.bankDetails}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span className={`badge ${refund.status === 'approved' ? 'badge-admin' : refund.status === 'rejected' ? 'badge-danger' : 'badge-user'}`} style={{ minWidth: '100px', textAlign: 'center' }}>
                                                {refund.status.toUpperCase()}
                                            </span>
                                            {refund.status === 'pending' && (
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button className="admin-btn admin-btn-success" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleProcessRefund(refund.id, true)}>Approve</button>
                                                    <button className="admin-btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleProcessRefund(refund.id, false)}>Reject</button>
                                                </div>
                                            )}
                                            <button className="admin-btn admin-btn-secondary" style={{ padding: '0.3rem', borderRadius: '4px' }} onClick={() => handleDeleteRefund(refund.id)} title="Delete Record">
                                                <Trash2 size={14} color="var(--danger)" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {refunds.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No refund requests.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* USER REVIEWS TAB */}
      {activeTab === 'reviews' && (
        <div>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ marginBottom: 0 }}>Event Reviews ({reviews.length})</h2>
              <select 
                className="form-input" 
                style={{ width: '150px', marginBottom: 0, padding: '0.4rem' }}
                value={reviewRatingFilter}
                onChange={(e) => setReviewRatingFilter(e.target.value)}
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            <div className="grid">
                {reviews.filter(r => reviewRatingFilter === 'all' || r.rating.toString() === reviewRatingFilter).map(review => {
                    const event = events.find(e => e.id === review.eventId);
                    return (
                        <div key={review.id} className="admin-card" style={{ position: 'relative' }}>
                            <button 
                                onClick={() => handleDeleteReview(review.id)}
                                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                                title="Delete Review"
                            >
                                <Trash2 size={16} />
                            </button>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingRight: '2rem' }}>
                                <strong>{review.userName}</strong>
                                <div style={{ color: '#f59e0b', display: 'flex', gap: '2px' }}>
                                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < review.rating ? "#f59e0b" : "none"} />)}
                                </div>
                            </div>
                            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{review.comment}</p>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>On: {event?.name || 'Unknown Event'}</span>
                        </div>
                    );
                })}
                {reviews.length === 0 && <p className="text-muted">No reviews have been posted yet.</p>}
            </div>
        </div>
      )}

      {/* EVENT MODAL */}
      {isEventModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ marginBottom: '1.5rem' }}>{editingEvent ? 'Edit Event' : 'Add New Event'}</h2>
            <form onSubmit={handleEventSubmit}>
              <div className="form-group">
                <label className="form-label">Event Name</label>
                <input 
                  required type="text" className="form-input" 
                  value={eventFormData.name} 
                  onChange={e => setEventFormData({...eventFormData, name: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  required className="form-input" rows="3"
                  value={eventFormData.description} 
                  onChange={e => setEventFormData({...eventFormData, description: e.target.value})} 
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Date</label>
                  <input 
                    required type="date" 
                    className="form-input" 
                    min={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
                    style={{ 
                        borderColor: events.some(ev => ev.date === eventFormData.date && (!editingEvent || ev.id !== editingEvent.id)) ? 'var(--danger)' : '',
                        backgroundColor: events.some(ev => ev.date === eventFormData.date && (!editingEvent || ev.id !== editingEvent.id)) ? '#fff5f5' : ''
                    }}
                    value={eventFormData.date} 
                    onChange={e => setEventFormData({...eventFormData, date: e.target.value})} 
                  />
                  {(() => {
                    const conflict = events.find(ev => ev.date === eventFormData.date && (!editingEvent || ev.id !== editingEvent.id));
                    if (conflict) {
                      return (
                        <div style={{ 
                            background: 'var(--danger)', 
                            color: 'white', 
                            padding: '0.4rem 0.8rem', 
                            borderRadius: '2px', 
                            marginTop: '0.5rem', 
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                        }}>
                           <Trash2 size={12} /> DATE BOOKED: {conflict.name}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Time</label>
                  <input 
                    required type="time" className="form-input" 
                    value={eventFormData.time} 
                    onChange={e => setEventFormData({...eventFormData, time: e.target.value})} 
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input 
                  required type="text" className="form-input" 
                  value={eventFormData.location} 
                  onChange={e => setEventFormData({...eventFormData, location: e.target.value})} 
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Category</label>
                  <select 
                    required className="form-input"
                    value={eventFormData.category} 
                    onChange={e => {
                        const newCat = e.target.value;
                        setEventFormData({
                            ...eventFormData, 
                            category: newCat,
                            image: CATEGORY_IMAGES[newCat] ? CATEGORY_IMAGES[newCat][0] : ''
                        });
                    }} 
                  >
                    <option value="">Select Category</option>
                    {EVENT_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Select Event Image</label>
                  <select 
                    required className="form-input"
                    value={eventFormData.image} 
                    onChange={e => setEventFormData({...eventFormData, image: e.target.value})} 
                  >
                    <option value="">Choose Image</option>
                    {eventFormData.category && CATEGORY_IMAGES[eventFormData.category] && CATEGORY_IMAGES[eventFormData.category].map((img, idx) => (
                        <option key={idx} value={img}>Image Look #{idx + 1}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Regular Price (INR)</label>
                  <input 
                    required type="number" min="0" className="form-input" 
                    value={eventFormData.price} 
                    onChange={e => setEventFormData({...eventFormData, price: e.target.value})} 
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">VIP Price (INR)</label>
                  <input 
                    required type="number" min="0" className="form-input" placeholder="Price for Row A & B"
                    value={eventFormData.vipPrice} 
                    onChange={e => setEventFormData({...eventFormData, vipPrice: e.target.value})} 
                  />
                </div>
              </div>

              {/* Busy Dates Hint */}
              {!editingEvent && events.length > 0 && (
                <div style={{ padding: '0.8rem', background: 'var(--bg-light)', borderRadius: '2px', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Upcoming Schedule (Not Available):</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {events
                            .filter(ev => ev.date >= `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`)
                            .sort((a, b) => a.date.localeCompare(b.date))
                            .slice(0, 3)
                            .map(ev => (
                                <span key={ev.id} style={{ fontSize: '0.7rem', background: '#fee2e2', color: '#b91c1c', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                                    {ev.date}
                                </span>
                            ))
                        }
                    </div>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEventModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-success">Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
