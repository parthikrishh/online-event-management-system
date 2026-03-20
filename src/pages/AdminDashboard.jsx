import { useState, lazy, Suspense, useMemo } from 'react';
import { useQueryState, useMutation, api } from '../services/apiService';
import { Users, CalendarDays, BookOpen, FileText, Plus, Trash2, Edit, LayoutDashboard, QrCode, Download, RefreshCcw, Star, CheckCircle2, Search, ShieldCheck } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useToast } from '../context/ToastContext';
import SkeletonCard from '../components/SkeletonCard';
import { AdminTableSkeleton, DashboardFeedSkeleton, DashboardStatsSkeleton } from '../components/admin/AdminLoadingStates';

const OverviewCharts = lazy(() => import('../components/admin/OverviewCharts'));

export default function AdminDashboard() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem('oems_admin_tab') || 'overview');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    sessionStorage.setItem('oems_admin_tab', tab);
  };
  const { data: usersData, loading: usersLoading, error: usersError } = useQueryState(api.users.list);
  const { data: eventsData, loading: eventsLoading, error: eventsError } = useQueryState(api.events.list);
  const { data: bookingsData, loading: bookingsLoading, error: bookingsError } = useQueryState(api.bookings.listAll);
  const { data: refundsData, loading: refundsLoading, error: refundsError } = useQueryState(api.bookings.listRefunds);
  const { data: reviewsData, loading: reviewsLoading, error: reviewsError } = useQueryState(api.misc.listReviews);
  const { data: logsData, error: logsError } = useQueryState(api.misc.listLogs);
  const { data: promoCodesData, loading: promoCodesLoading, error: promoCodesError } = useQueryState(api.promos.list);

  const saveEventMutation = useMutation(api.events.save);
  const deleteEventMutation = useMutation(api.events.remove);
  const processRefundMutation = useMutation(api.bookings.processRefund);
  const checkInMutation = useMutation(api.bookings.checkIn);
  const deleteBookingMutation = useMutation(api.bookings.remove);
  const deleteUserMutation = useMutation(api.users.remove);
  const deleteReviewMutation = useMutation(api.misc.removeReview);
  const deleteRefundMutation = useMutation(api.bookings.removeRefund);
  const addLogMutation = useMutation(api.misc.addLog);
  const revertCheckInMutation = useMutation(api.bookings.revertCheckIn);
  const cancelAndRefundMutation = useMutation(api.events.cancelAndRefund);
  const savePromoMutation = useMutation(api.promos.save);
  const deletePromoMutation = useMutation(api.promos.remove);
  const cancelBookingMutation = useMutation(api.bookings.cancel);

  const users = usersData || [];
  const events = eventsData || [];
  const bookings = useMemo(() => (bookingsData ? [...bookingsData].reverse() : []), [bookingsData]);
  const refunds = refundsData || [];
  const reviews = reviewsData || [];
  const adminLogs = useMemo(() => (logsData ? [...logsData].reverse() : []), [logsData]);
  const promoCodes = promoCodesData || [];
  const lastUpdated = new Date();
  const isOverviewLoading = usersLoading || eventsLoading || bookingsLoading || refundsLoading || reviewsLoading;
  const isEventsTableLoading = eventsLoading || bookingsLoading || reviewsLoading;
  const isBookingsTableLoading = bookingsLoading || eventsLoading || refundsLoading;
  const isUsersTableLoading = usersLoading || bookingsLoading;
  const isRefundsLoading = refundsLoading || bookingsLoading;
  const hasApiError = usersError || eventsError || bookingsError || refundsError || reviewsError || logsError || promoCodesError;

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
    name: '', description: '', date: '', time: '', location: '', price: '', vipPrice: '', category: '', image: '', capacity: '500', vipSeats: '', cgstRate: '9', sgstRate: '9'
  });

  const [checkInBillId, setCheckInBillId] = useState('');
  const [checkInEventId, setCheckInEventId] = useState('');
  const [checkInResult, setCheckInResult] = useState(null);
  const [checkInDetails, setCheckInDetails] = useState(null);

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
  const [eventSort, setEventSort] = useState({ key: 'date', dir: 'asc' });
  const [bookingSort, setBookingSort] = useState({ key: 'bookingDate', dir: 'desc' });
  const [userSort, setUserSort] = useState({ key: 'name', dir: 'asc' });
  const [eventPage, setEventPage] = useState(1);
  const [bookingPage, setBookingPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [editingPromoId, setEditingPromoId] = useState(null);
  const [promoForm, setPromoForm] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '10',
    minOrderAmount: '0',
    usageLimit: '',
    active: true,
    expiresAt: '',
  });
  const pageSize = 8;

  const openAddEvent = () => {
    setEditingEvent(null);
    setEventFormData({ name: '', description: '', date: '', time: '', location: '', price: '', vipPrice: '', category: '', image: '', capacity: '500', vipSeats: '', cgstRate: '9', sgstRate: '9' });
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
      image: event.image || '',
      capacity: String(event.capacity || 50),
      vipSeats: Array.isArray(event.vipSeats) ? event.vipSeats.join(', ') : '',
      cgstRate: String(event.cgstRate ?? 9),
      sgstRate: String(event.sgstRate ?? 9)
    });
    setIsEventModalOpen(true);
  };

  const handleDeleteEvent = async (id) => {
    const event = events.find(e => e.id === id);
    if (!event) return;

    if (confirm(`Are you sure you want to permanently DELETE "${event.name}"? This will remove all associated bookings and cannot be undone.`)) {
      try {
        await deleteEventMutation({ id });
        await addLogMutation({ action: 'Event Deleted', details: `Permanently removed event "${event.name}".` });
        showToast("Event deleted successfully.", "success");
      } catch (err) {
        console.error("Delete event failed", err);
        showToast("Delete event failed.", "error");
      }
    }
  };

  const handleCancelAndRefund = async (id) => {
    const event = events.find(e => e.id === id);
    if (!event) return;

    const reason = prompt(`Reason for cancelling "${event.name}":`, "Technical issues / Scheduling conflict");

    if (reason === null) return;

    if (confirm(`CONFIRM: You are about to cancel "${event.name}" and refund all attendees. Reason: ${reason}. Proceed?`)) {
      try {
        const affectedBookings = await cancelAndRefundMutation({ id, reason });
        await addLogMutation({ action: 'Event Cancelled', details: `Cancelled "${event.name}". Reason: ${reason}. ${affectedBookings.length} refunds initiated.` });
        showToast(`Event cancelled. ${affectedBookings.length} bookings have been fully cancelled and refunded.`, "info");
      } catch {
        showToast("Cancellation failed.", "error");
      }
    }
  };

  const handleManualRefund = async (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    if (['refunded', 'fully_cancelled'].includes(booking.status)) {
      showToast("This booking is already refunded or fully cancelled.", "warning");
      return;
    }

    const reason = prompt(`Reason for refunding ${booking.userName}'s booking for ${booking.eventName}:`, "Admin initiated refund");
    if (reason === null) return;

    if (confirm(`Confirm refund of INR ${booking.totalAmount} to ${booking.userName}?`)) {
      try {
        const cancelRes = await cancelBookingMutation({
          bookingId,
          seatIds: booking.activeSeats || booking.selectedSeats || [],
          reason,
        });
        await processRefundMutation({ bookingId, refundId: cancelRes?.refund?.id, isApproved: true });
        await addLogMutation({ action: 'Manual Refund', details: `Refunded ${booking.userName} for ${booking.eventName}. Reason: ${reason}` });
        showToast("Refund processed successfully.", "success");
      } catch (err) {
        console.error("Refund failed", err);
        showToast("Refund failed.", "error");
      }
    }
  };

  const handleRevertCheckIn = async (id) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;

    if (confirm(`Revert check-in for ${booking.userName}? This will set their ticket back to 'Booked' status.`)) {
      try {
        await revertCheckInMutation({ id: booking.id });
        await addLogMutation({ action: 'Check-in Reverted', details: `Undid check-in for ${booking.userName} (Bill ID: ${booking.billId}).` });
      } catch (err) {
        console.error("Revert check-in failed", err);
        showToast("Revert failed.", "error");
      }
    }
  };

  const handleDeleteBooking = async (id) => {
    if (confirm('Are you sure you want to delete this booking record? This will not process a refund.')) {
      try {
        await deleteBookingMutation({ id });
        await addLogMutation({ action: 'Booking Deleted', details: `Removed booking record ID: ${id}` });
      } catch (err) {
        console.error("Delete booking failed", err);
        showToast("Delete failed.", "error");
      }
    }
  };
  const handleCleanupPastEvents = async () => {
    if (confirm('Are you sure you want to remove all past events from the database? This cannot be undone.')) {
      const today = new Date().toISOString().split('T')[0];
      const pastEvents = events.filter(e => e.date < today);
      for (const e of pastEvents) {
        try {
          await deleteEventMutation({ id: e.id });
        } catch {
          // Continue cleanup if one event delete fails.
        }
      }
      showToast(`Successfully removed ${pastEvents.length} past events.`, "success");
    }
  };

  const handleDeleteUser = async (id) => {
    const userToDelete = users.find(u => u.id === id);
    if (!userToDelete) return;
    if (userToDelete.role === 'admin') {
      showToast("Cannot delete admin users.", "error");
      return;
    }
    if (confirm(`Are you sure you want to delete user "${userToDelete.name}"? This will also remove their data.`)) {
      try {
        await deleteUserMutation({ id });
        await addLogMutation({ action: 'User Deleted', details: `Permanently removed user account: ${userToDelete.name}` });
      } catch (err) {
        console.error("Delete user failed", err);
        showToast("Delete user failed.", "error");
      }
    }
  };

  const handleDeleteReview = async (id) => {
    if (confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteReviewMutation({ id });
        await addLogMutation({ action: 'Review Deleted', details: `Removed a user review.` });
      } catch (err) {
        console.error("Delete review failed", err);
        showToast("Delete review failed.", "error");
      }
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();

    // Date collision check
    const duplicateEvent = events.find(ev =>
      ev.date === eventFormData.date &&
      (!editingEvent || ev.id !== editingEvent.id)
    );

    if (duplicateEvent) {
      showToast(`CONFLICT: An event "${duplicateEvent.name}" is already scheduled for ${eventFormData.date}.`, "error");
      return;
    }

    const totalCapacity = Number(eventFormData.capacity || 500);
    if (!Number.isFinite(totalCapacity) || totalCapacity < 1 || totalCapacity > 500) {
      showToast("Total seats must be between 1 and 500.", "error");
      return;
    }

    const soldTickets = editingEvent
      ? bookings
          .filter((b) => b.eventId === editingEvent.id && !['refunded', 'fully_cancelled', 'payment_failed'].includes(b.status))
          .reduce((sum, b) => sum + (b.numTickets || 0), 0)
      : 0;

    if (editingEvent && totalCapacity < soldTickets) {
      showToast(`Total seats cannot be less than sold tickets (${soldTickets}).`, "error");
      return;
    }

    const eventToSave = {
      ...(editingEvent || {}),
      ...eventFormData,
      id: editingEvent
        ? editingEvent.id
        : `evt_${eventFormData.date}_${eventFormData.name.replace(/\s+/g, '_').toLowerCase()}`,
      price: Number(eventFormData.price),
      vipPrice: Number(eventFormData.vipPrice),
      vipSeats: eventFormData.vipSeats
        .split(',')
        .map((seat) => seat.trim().toUpperCase())
        .filter(Boolean),
      cgstRate: Number(eventFormData.cgstRate || 0),
      sgstRate: Number(eventFormData.sgstRate || 0),
      capacity: totalCapacity,
      availableCapacity: Math.max(0, totalCapacity - soldTickets),
      status: editingEvent ? editingEvent.status : 'approved'
    };

    try {
      await saveEventMutation(eventToSave);
      await addLogMutation({ action: editingEvent ? 'Event Updated' : 'Event Created', details: `Modified/Added "${eventFormData.name}".` });
      setIsEventModalOpen(false);
      showToast("Event saved successfully.", "success");
    } catch (err) {
      console.error("Save event failed", err);
      showToast("Failed to save event.", "error");
    }
  };

  const submitCheckIn = async (e) => {
    e.preventDefault();
    if (!checkInBillId) return;
    const targetEventId = checkInEventId || (events.length > 0 ? events[0].id : '');
    if (!targetEventId) {
      showToast("Please select an event for check-in", "error");
      return;
    }
    try {
      const res = await checkInMutation({ billId: checkInBillId.trim(), eventId: targetEventId });
      setCheckInResult(res?.status || 'invalid');
      setCheckInDetails(res || null);
      if ((res?.status || '') === 'success') {
        await addLogMutation({ action: 'Check-in', details: `Verified Bill ID ${checkInBillId}.` });
      }
    } catch (err) {
      console.error("Check-in failed", err);
      setCheckInResult('invalid');
      setCheckInDetails(null);
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
      const activeBookings = eventBookings.filter(b => !['refunded', 'fully_cancelled', 'payment_failed'].includes(b.status));
      const eventReviews = reviews.filter(r => r.eventId === e.id);
      return {
        ...e,
        revenue: activeBookings.reduce((sum, b) => sum + b.totalAmount, 0),
        ticketsSold: activeBookings.reduce((sum, b) => sum + b.numTickets, 0),
        avgRating: eventReviews.length > 0 ? (eventReviews.reduce((sum, r) => sum + r.rating, 0) / eventReviews.length).toFixed(1) : 'N/A',
        refundCount: eventBookings.filter(b => ['refunded', 'fully_cancelled', 'partially_cancelled', 'refund_requested'].includes(b.status)).length
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
      showToast(`No bookings found for this ${type} period.`, "warning");
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
      'Revenue Impact': ['fully_cancelled', 'refunded', 'payment_failed'].includes(b.status) ? 0 : b.totalAmount,
      'DateTime': new Date(b.bookingDate).toLocaleString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Performance Data");
    XLSX.writeFile(workbook, `OEMS_${fileName}.xlsx`);
    addLogMutation({ action: 'Report Generated', details: `Downloaded ${type} performance report.` });
  };

  const exportAdminLogs = () => {
    const logs = adminLogs || [];
    const data = logs.map(l => ({
      'Action': l.action,
      'Details': l.details,
      'Date': new Date(l.timestamp).toLocaleDateString(),
      'Time': new Date(l.timestamp).toLocaleTimeString()
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Admin Logs");
    XLSX.writeFile(workbook, "Admin_Action_Logs.xlsx");
  };

  const handleProcessRefund = async (refundId, approve) => {
    if (confirm(`Are you sure you want to ${approve ? 'approve' : 'reject'} this refund?`)) {
      try {
        const refund = refunds.find(r => r.id === refundId);
        if (refund) {
          await processRefundMutation({ bookingId: refund.bookingId, refundId: refund.id, isApproved: approve });
          await addLogMutation({ action: 'Refund Processed', details: `${approve ? 'Approved' : 'Rejected'} refund request for booking ID: ${refund.bookingId}.` });
          showToast(`Refund ${approve ? 'approved' : 'rejected'}.`, "success");
        }
      } catch (err) {
        console.error("Refund processing failed", err);
        showToast("Operation failed.", "error");
      }
    }
  };

  const handleDeleteRefund = async (id) => {
    if (confirm('Are you sure you want to delete this refund record?')) {
      try {
        await deleteRefundMutation({ id });
        await addLogMutation({ action: 'Refund Deleted', details: `Removed refund record ID: ${id}.` });
        showToast("Refund record deleted.", "info");
      } catch (err) {
        console.error("Delete refund record failed", err);
        showToast("Delete failed.", "error");
      }
    }
  };

  const resetPromoForm = () => {
    setEditingPromoId(null);
    setPromoForm({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '10',
      minOrderAmount: '0',
      usageLimit: '',
      active: true,
      expiresAt: '',
    });
  };

  const handlePromoEdit = (promo) => {
    setEditingPromoId(promo.id);
    setPromoForm({
      code: promo.code,
      description: promo.description || '',
      discountType: promo.discountType || 'percentage',
      discountValue: String(promo.discountValue || 0),
      minOrderAmount: String(promo.minOrderAmount || 0),
      usageLimit: Number.isFinite(promo.usageLimit) ? String(promo.usageLimit) : '',
      active: promo.active !== false,
      expiresAt: promo.expiresAt ? String(promo.expiresAt).slice(0, 10) : '',
    });
  };

  const handlePromoSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      id: editingPromoId || undefined,
      code: promoForm.code,
      description: promoForm.description,
      discountType: promoForm.discountType,
      discountValue: Number(promoForm.discountValue || 0),
      minOrderAmount: Number(promoForm.minOrderAmount || 0),
      usageLimit: promoForm.usageLimit === '' ? null : Number(promoForm.usageLimit),
      active: promoForm.active,
      expiresAt: promoForm.expiresAt ? new Date(`${promoForm.expiresAt}T23:59:59.000Z`).toISOString() : null,
    };

    try {
      await savePromoMutation(payload);
      await addLogMutation({ action: editingPromoId ? 'Promo Updated' : 'Promo Created', details: `Promo ${payload.code} saved.` });
      showToast(`Promo ${editingPromoId ? 'updated' : 'created'} successfully.`, 'success');
      resetPromoForm();
    } catch (err) {
      console.error('Promo save failed', err);
      showToast('Failed to save promo code.', 'error');
    }
  };

  const handlePromoDelete = async (id) => {
    const promo = promoCodes.find((item) => item.id === id);
    if (!promo) return;
    if (!confirm(`Delete promo code ${promo.code}?`)) return;

    try {
      await deletePromoMutation({ id });
      await addLogMutation({ action: 'Promo Deleted', details: `Promo ${promo.code} deleted.` });
      showToast('Promo deleted.', 'info');
      if (editingPromoId === id) {
        resetPromoForm();
      }
    } catch (err) {
      console.error('Promo delete failed', err);
      showToast('Failed to delete promo code.', 'error');
    }
  };

  const sortRows = (rows, { key, dir }) => {
    const sorted = [...rows].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      if (typeof aVal === 'number' && typeof bVal === 'number') return aVal - bVal;
      if (String(aVal).includes('-') && String(bVal).includes('-') && !Number.isNaN(Date.parse(aVal)) && !Number.isNaN(Date.parse(bVal))) {
        return new Date(aVal) - new Date(bVal);
      }
      return String(aVal).localeCompare(String(bVal));
    });

    return dir === 'asc' ? sorted : sorted.reverse();
  };

  const filteredEvents = getFilteredEvents();
  const filteredBookings = getFilteredBookings();
  const filteredUsers = getFilteredUsers();

  const sortedEvents = useMemo(() => sortRows(filteredEvents, eventSort), [filteredEvents, eventSort]);
  const sortedBookings = useMemo(() => sortRows(filteredBookings, bookingSort), [filteredBookings, bookingSort]);
  const usersWithSpend = useMemo(() => filteredUsers.map((u) => ({
    ...u,
    spent: bookings.filter((b) => b.userId === u.id).reduce((sum, b) => sum + b.totalAmount, 0),
  })), [filteredUsers, bookings]);
  const sortedUsers = useMemo(() => sortRows(usersWithSpend, userSort), [usersWithSpend, userSort]);

  const eventPageCount = Math.max(1, Math.ceil(sortedEvents.length / pageSize));
  const bookingPageCount = Math.max(1, Math.ceil(sortedBookings.length / pageSize));
  const userPageCount = Math.max(1, Math.ceil(sortedUsers.length / pageSize));

  const safeEventPage = Math.min(eventPage, eventPageCount);
  const safeBookingPage = Math.min(bookingPage, bookingPageCount);
  const safeUserPage = Math.min(userPage, userPageCount);

  const pagedEvents = sortedEvents.slice((safeEventPage - 1) * pageSize, safeEventPage * pageSize);
  const pagedBookings = sortedBookings.slice((safeBookingPage - 1) * pageSize, safeBookingPage * pageSize);
  const pagedUsers = sortedUsers.slice((safeUserPage - 1) * pageSize, safeUserPage * pageSize);



  return (
    <div className="admin-dashboard-container" style={{ paddingTop: '2rem' }}>
      <div className="admin-sidebar">
        <h2 className="admin-sidebar-title" style={{
          fontSize: '1.4rem',
          fontWeight: '950',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
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
          onClick={() => { handleTabChange('scan'); setCheckInResult(null); setCheckInDetails(null); setCheckInBillId(''); }}
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
          className={`admin-sidebar-item ${activeTab === 'promos' ? 'active' : ''}`}
          onClick={() => handleTabChange('promos')}
        >
          <Star size={20} /> Promo Codes
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

        {hasApiError && (
          <div className="empty-state" style={{ marginBottom: '1rem' }}>
            <h3>Some dashboard data could not be loaded</h3>
            <p>Core actions are still available. Try again in a moment.</p>
          </div>
        )}


        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="analytics-view">
            <div className="analytics-header">
              <h2 style={{ margin: 0 }}>Platform Analytics</h2>
              <div className="live-indicator">
                <div className="live-indicator-dot"></div>
                LIVE MONITORING • Last update: {lastUpdated.toLocaleTimeString()}
              </div>
            </div>

            {isOverviewLoading ? (
              <DashboardStatsSkeleton />
            ) : (
              <div className="grid">
                <div className="admin-card metric-card" style={{ borderTop: '3px solid var(--primary)' }}>
                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                  <div style={{ padding: '0.5rem', background: 'rgba(255, 85, 0, 0.1)', borderRadius: '8px' }}>
                    <RefreshCcw size={20} color="var(--primary)" />
                  </div>
                  <span style={{ color: 'var(--success)', fontSize: '0.75rem', fontWeight: 800 }}>+12.5% ↑</span>
                </div>
                <h3 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Revenue</h3>
                <p style={{ fontSize: '2.4rem', fontWeight: '950', marginTop: '0.5rem' }}>
                  ₹{bookings.filter(b => !['refunded', 'cancelled', 'refund_requested'].includes(b.status)).reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}
                </p>
              </div>

              <div className="admin-card metric-card" style={{ borderTop: '3px solid var(--success)' }}>
                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                  <div style={{ padding: '0.5rem', background: 'rgba(0, 210, 122, 0.1)', borderRadius: '8px' }}>
                    <BookOpen size={20} color="var(--success)" />
                  </div>
                  <span style={{ color: 'var(--success)', fontSize: '0.75rem', fontWeight: 800 }}>+4.2% ↑</span>
                </div>
                <h3 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Tickets Sold</h3>
                <p style={{ fontSize: '2.4rem', fontWeight: '950', marginTop: '0.5rem' }}>
                  {bookings.filter(b => !['refunded', 'cancelled', 'refund_requested'].includes(b.status)).reduce((sum, b) => sum + b.numTickets, 0)}
                </p>
              </div>

              <div className="admin-card metric-card" style={{ borderTop: '3px solid var(--secondary)' }}>
                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                  <div style={{ padding: '0.5rem', background: 'rgba(255, 136, 0, 0.1)', borderRadius: '8px' }}>
                    <Users size={20} color="var(--secondary)" />
                  </div>
                  <span style={{ color: 'var(--success)', fontSize: '0.75rem', fontWeight: 800 }}>+8.1% ↑</span>
                </div>
                <h3 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Users</h3>
                <p style={{ fontSize: '2.4rem', fontWeight: '950', marginTop: '0.5rem' }}>
                  {users.length}
                </p>
              </div>
              </div>
            )}

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
              <div className="admin-card" style={{ textAlign: 'center', background: 'rgba(255, 85, 0, 0.05)', border: '1px solid rgba(255, 85, 0, 0.1)' }}>
                <h4 style={{ color: 'var(--primary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Pending Issues</h4>
                <p style={{ fontSize: '1.4rem', fontWeight: '900', marginTop: '0.5rem', color: 'var(--text-main)' }}>
                  {refunds.filter(r => r.status === 'pending').length} Actions
                </p>
              </div>
            </div>

            <div className="admin-card" style={{ marginTop: '2rem', background: 'var(--surface-raised)', border: '1px solid var(--border)' }}>
              <div className="report-center">
                <div>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={20} color="var(--primary)" /> Analysis Reporting Center
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Generate system-wide performance reports based on key time intervals.</p>
                </div>
                <div className="report-actions">
                  <button className="admin-btn admin-btn-secondary" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '50px' }} onClick={() => exportPeriodicReport('daily')}>
                    <Download size={14} /> Daily
                  </button>
                  <button className="admin-btn admin-btn-secondary" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '50px' }} onClick={() => exportPeriodicReport('weekly')}>
                    <Download size={14} /> Weekly
                  </button>
                  <button className="admin-btn admin-btn-primary" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '50px' }} onClick={() => exportPeriodicReport('monthly')}>
                    <Download size={14} /> Monthly
                  </button>
                </div>
              </div>
            </div>

            <div className="analytics-split" style={{ marginTop: '2rem' }}>
              {isOverviewLoading ? (
                <DashboardFeedSkeleton />
              ) : (
                <div className="admin-card" style={{ flex: 2 }}>
                <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0 }}>Live Activity Feed</h3>
                  <span className="admin-badge" style={{ background: 'rgba(255, 85, 0, 0.1)', color: 'var(--primary)' }}>Real-time</span>
                </div>
                <div className="activity-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {bookings.slice(0, 5).map((booking, idx) => (
                    <div key={idx} className="activity-row" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: `4px solid ${booking.status === 'booked' ? 'var(--success)' : 'var(--danger)'}` }}>
                      <div>
                        <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>{booking.userName} booked {booking.numTickets}x tickets</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{booking.eventName} • {new Date(booking.bookingDate).toLocaleTimeString()}</p>
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: booking.status === 'booked' ? 'var(--success)' : 'var(--danger)' }}>
                        {booking.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              )}

              <div className="admin-card" style={{ flex: 1 }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Platform Health</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <div className="flex-between" style={{ marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                      <span>Server Uptime</span>
                      <span style={{ color: 'var(--success)' }}>99.9%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '99.9%', height: '100%', background: 'var(--success)' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex-between" style={{ marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                      <span>Database Sync</span>
                      <span style={{ color: 'var(--primary)' }}>Healthy</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '100%', height: '100%', background: 'var(--primary)' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {isOverviewLoading ? (
              <div className="grid"><SkeletonCard /><SkeletonCard /></div>
            ) : (
              <Suspense fallback={<div className="grid"><SkeletonCard /><SkeletonCard /></div>}>
                <OverviewCharts events={events} bookings={bookings} />
              </Suspense>
            )}
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
              {adminLogs.length === 0 ? (
                <p style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No administrative actions logged yet.</p>
              ) : (
                <div style={{ padding: '1rem' }}>
                  {adminLogs.slice().reverse().map(log => (
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
          <div className="analytics-view">
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
              <div>
                <h2 style={{ margin: 0 }}>Event Directory</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Centralized control for all {events.length} system events.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button className="admin-btn btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '50px' }} onClick={handleCleanupPastEvents}>
                  <Trash2 size={16} /> Cleanup
                </button>
                <button className="admin-btn admin-btn-primary" style={{ borderRadius: '50px' }} onClick={openAddEvent}>
                  <Plus size={18} /> Create Event
                </button>
              </div>
            </div>

            <div className="grid" style={{ marginBottom: '2rem' }}>
              <div className="admin-card" style={{ padding: '1rem', textAlign: 'center', borderBottom: '3px solid var(--primary)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Upcoming Events</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 900 }}>{events.filter(e => new Date(e.date) >= new Date().setHours(0, 0, 0, 0)).length}</p>
              </div>
              <div className="admin-card" style={{ padding: '1rem', textAlign: 'center', borderBottom: '3px solid var(--secondary)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Avg. Revenue/Event</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 900 }}>₹{events.length > 0 ? (bookings.reduce((sum, b) => sum + (['cancelled', 'refunded'].includes(b.status) ? 0 : b.totalAmount), 0) / events.length).toFixed(0) : 0}</p>
              </div>
            </div>
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
                  if (eventTimeFilter === 'upcoming') return new Date(e.date) >= new Date().setHours(0, 0, 0, 0);
                  if (eventTimeFilter === 'past') return new Date(e.date) < new Date().setHours(0, 0, 0, 0);
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
            <div className="flex-between" style={{ margin: '1rem 0 0.5rem' }}>
              <small className="text-muted">Showing {pagedEvents.length} of {sortedEvents.length} events</small>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select
                  className="form-input"
                  style={{ width: '180px', marginBottom: 0 }}
                  value={`${eventSort.key}:${eventSort.dir}`}
                  onChange={(e) => {
                    const [key, dir] = e.target.value.split(':');
                    setEventSort({ key, dir });
                  }}
                >
                  <option value="date:asc">Date (Soonest)</option>
                  <option value="date:desc">Date (Latest)</option>
                  <option value="name:asc">Name (A-Z)</option>
                  <option value="name:desc">Name (Z-A)</option>
                  <option value="revenue:desc">Revenue (High-Low)</option>
                </select>
              </div>
            </div>

            <div className="admin-table-container">
              {isEventsTableLoading ? (
                <AdminTableSkeleton columns={5} rows={8} />
              ) : (
                <table>
                <thead>
                  <tr>
                    <th>Event Name</th>
                    <th>Details</th>
                    <th>Financials</th>
                    <th>Tickets</th>
                    <th>Feedback</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedEvents.map(event => (
                    <tr key={event.id}>
                      <td>
                        <strong>{event.name}</strong><br />
                        <small className="badge-user" style={{ fontSize: '0.65rem', padding: '0.1rem 0.3rem' }}>{event.category}</small>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        📅 {new Date(event.date).toLocaleDateString()}<br />
                        📍 {event.location}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.9rem' }}>
                          <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>₹{event.revenue.toFixed(0)}</span><br />
                          <small className="text-muted">{event.ticketsSold} Tickets Sold</small>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem', lineHeight: 1.45 }}>
                          <div><strong>Total:</strong> {event.capacity || 0}</div>
                          <div><strong>Sold:</strong> {event.ticketsSold || 0}</div>
                          <div><strong>Remaining:</strong> {Math.max(0, Number(event.availableCapacity ?? ((event.capacity || 0) - (event.ticketsSold || 0))))}</div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.9rem' }}>
                          <span style={{ color: '#f59e0b' }}>⭐ {event.avgRating}</span><br />
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
                  {sortedEvents.length === 0 && (
                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>No events found.</td></tr>
                  )}
                </tbody>
                </table>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button className="btn btn-secondary" type="button" disabled={safeEventPage <= 1} onClick={() => setEventPage((p) => Math.max(1, p - 1))}>Prev</button>
              <span style={{ alignSelf: 'center', color: 'var(--text-muted)' }}>Page {safeEventPage} / {eventPageCount}</span>
              <button className="btn btn-secondary" type="button" disabled={safeEventPage >= eventPageCount} onClick={() => setEventPage((p) => Math.min(eventPageCount, p + 1))}>Next</button>
            </div>
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div className="analytics-view">
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
              <div>
                <h2 style={{ margin: 0 }}>Order Management</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Real-time overview of all {bookings.length} transactions.</p>
              </div>
            </div>

            <div className="grid" style={{ marginBottom: '2rem' }}>
              <div className="admin-card" style={{ borderLeft: '4px solid var(--success)', padding: '1rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Successful Orders</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 900 }}>{bookings.filter(b => b.status === 'booked').length}</p>
              </div>
              <div className="admin-card" style={{ borderLeft: '4px solid var(--danger)', padding: '1rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Refund Requests</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 900 }}>{refunds.filter(r => r.status === 'pending').length}</p>
              </div>
            </div>

            <div className="flex-between">
              <h2 style={{ marginBottom: 0 }}>Transaction Ledger</h2>
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
                  <option value="refund_requested">Refund Requested</option>
                  <option value="partially_cancelled">Partially Cancelled</option>
                  <option value="fully_cancelled">Fully Cancelled</option>
                  <option value="payment_failed">Payment Failed</option>
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
            <div className="flex-between" style={{ marginTop: '0.75rem' }}>
              <small className="text-muted">Showing {pagedBookings.length} of {sortedBookings.length} bookings</small>
              <select
                className="form-input"
                style={{ width: '220px', marginBottom: 0 }}
                value={`${bookingSort.key}:${bookingSort.dir}`}
                onChange={(e) => {
                  const [key, dir] = e.target.value.split(':');
                  setBookingSort({ key, dir });
                }}
              >
                <option value="bookingDate:desc">Newest first</option>
                <option value="bookingDate:asc">Oldest first</option>
                <option value="totalAmount:desc">Amount (High-Low)</option>
                <option value="totalAmount:asc">Amount (Low-High)</option>
                <option value="userName:asc">User (A-Z)</option>
              </select>
            </div>
            <div className="table-container" style={{ marginTop: '1.5rem' }}>
              {isBookingsTableLoading ? (
                <AdminTableSkeleton columns={8} rows={8} />
              ) : (
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
                  {pagedBookings.map(booking => (
                    <tr key={booking.id}>
                      <td style={{ fontFamily: 'monospace', cursor: 'pointer' }} onClick={() => {
                        navigator.clipboard.writeText(booking.billId);
                        showToast('Copied to clipboard: ' + booking.billId, "info");
                      }} title="Click to copy">
                        {booking.billId}
                      </td>
                      <td>{booking.userName}</td>
                      <td>{booking.eventName}</td>
                      <td>{booking.numTickets}</td>
                      <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>INR {booking.totalAmount}</td>
                      <td>
                        <span className={`badge ${booking.status === 'checked-in' ? 'badge-admin' : ['fully_cancelled', 'refunded', 'refund_requested', 'payment_failed'].includes(booking.status) ? 'badge-danger' : ['partially_cancelled'].includes(booking.status) ? 'badge-user' : 'badge-user'}`} style={{ fontSize: '0.7rem' }}>
                          {booking.status ? booking.status.replace('_', ' ').toUpperCase() : 'BOOKED'}
                        </span>
                      </td>
                      <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {!['refunded', 'fully_cancelled', 'payment_failed'].includes(booking.status) && (
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
                  {sortedBookings.length === 0 && (
                    <tr><td colSpan="7" style={{ textAlign: 'center' }}>No bookings found.</td></tr>
                  )}
                </tbody>
                </table>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button className="btn btn-secondary" type="button" disabled={safeBookingPage <= 1} onClick={() => setBookingPage((p) => Math.max(1, p - 1))}>Prev</button>
              <span style={{ alignSelf: 'center', color: 'var(--text-muted)' }}>Page {safeBookingPage} / {bookingPageCount}</span>
              <button className="btn btn-secondary" type="button" disabled={safeBookingPage >= bookingPageCount} onClick={() => setBookingPage((p) => Math.min(bookingPageCount, p + 1))}>Next</button>
            </div>
          </div>
        )}

        {/* SCAN / CHECK-IN TAB */}
        {activeTab === 'scan' && (
          <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center' }}>
            <div className="flex-between" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ marginBottom: 0 }}>Gate Scan Console</h2>
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
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Select event and scan or enter ticket ID for instant validation.</p>

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
                    today.setHours(0, 0, 0, 0);
                    return new Date(ev.date) >= today;
                  }).map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.name} ({ev.date})</option>
                  ))}
                </select>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Enter Bill ID (e.g. BILL-123456)"
                    className="form-input"
                    value={checkInBillId}
                    onChange={(e) => setCheckInBillId(e.target.value)}
                    style={{ minHeight: '52px', fontSize: '1rem', flex: 1 }}
                    required
                  />
                  <button type="submit" className="admin-btn admin-btn-primary" style={{ whiteSpace: 'nowrap', minHeight: '52px', padding: '0.8rem 1.5rem', fontSize: '1rem' }}>Validate Entry</button>
                </div>
              </form>

              {checkInDetails && (
                <div className="admin-card" style={{ marginBottom: '1rem', textAlign: 'left', border: '1px solid var(--border)' }}>
                  <h4 style={{ marginBottom: '0.7rem' }}>Scan Details</h4>
                  <p><strong>User:</strong> {checkInDetails.userName || 'N/A'}</p>
                  <p><strong>Seat:</strong> {Array.isArray(checkInDetails.seatNumbers) && checkInDetails.seatNumbers.length ? checkInDetails.seatNumbers.join(', ') : 'N/A'}</p>
                  <p><strong>Event:</strong> {checkInDetails.eventName || 'N/A'}</p>
                  <p><strong>Status:</strong> {String(checkInResult || '').replace('_', ' ').toUpperCase()}</p>
                </div>
              )}

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
          <div className="analytics-view">
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
              <div>
                <h2 style={{ margin: 0 }}>Identity Management</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage your base of {users.length} active users.</p>
              </div>
            </div>

            <div className="grid" style={{ marginBottom: '2rem' }}>
              <div className="admin-card" style={{ borderLeft: '4px solid var(--success)', padding: '1rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Verified Users</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 900 }}>{users.length}</p>
              </div>
              <div className="admin-card" style={{ borderLeft: '4px solid var(--primary)', padding: '1rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>System Roles</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 800 }}>{users.filter(u => u.role === 'admin').length} Admins • {users.filter(u => u.role === 'user').length} Fans</p>
              </div>
            </div>

            <div className="flex-between" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
              <h2 style={{ marginBottom: 0 }}>Current Registry</h2>
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
              <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                <small className="text-muted">Showing {pagedUsers.length} of {sortedUsers.length} users</small>
                <select
                  className="form-input"
                  style={{ width: '220px', marginBottom: 0 }}
                  value={`${userSort.key}:${userSort.dir}`}
                  onChange={(e) => {
                    const [key, dir] = e.target.value.split(':');
                    setUserSort({ key, dir });
                  }}
                >
                  <option value="name:asc">Name (A-Z)</option>
                  <option value="name:desc">Name (Z-A)</option>
                  <option value="email:asc">Email (A-Z)</option>
                  <option value="spent:desc">Spent (High-Low)</option>
                  <option value="spent:asc">Spent (Low-High)</option>
                </select>
              </div>
              {isUsersTableLoading ? (
                <AdminTableSkeleton columns={6} rows={8} />
              ) : (
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
                  {pagedUsers.map(u => {
                    const userSpent = u.spent;
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
                    )
                  })}
                </tbody>
                </table>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button className="btn btn-secondary" type="button" disabled={safeUserPage <= 1} onClick={() => setUserPage((p) => Math.max(1, p - 1))}>Prev</button>
              <span style={{ alignSelf: 'center', color: 'var(--text-muted)' }}>Page {safeUserPage} / {userPageCount}</span>
              <button className="btn btn-secondary" type="button" disabled={safeUserPage >= userPageCount} onClick={() => setUserPage((p) => Math.min(userPageCount, p + 1))}>Next</button>
            </div>
          </div>
        )}

        {/* REFUND REQUESTS TAB */}
        {activeTab === 'refunds' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Refund Management</h2>
            <div className="table-container">
              {isRefundsLoading ? (
                <AdminTableSkeleton columns={5} rows={6} />
              ) : (
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
              )}
            </div>
          </div>
        )}

        {/* PROMO CODES TAB */}
        {activeTab === 'promos' && (
          <div className="analytics-view">
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ margin: 0 }}>Promo Code Management</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Manage discount code validity, limits, expiry and active state.
                </p>
              </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'minmax(320px, 420px) minmax(0, 1fr)' }}>
              <div className="admin-card">
                <h3 style={{ marginBottom: '1rem' }}>{editingPromoId ? 'Edit Promo' : 'Create Promo'}</h3>
                <form onSubmit={handlePromoSubmit}>
                  <div className="form-group">
                    <label className="form-label">Code</label>
                    <input
                      required
                      className="form-input"
                      placeholder="SUMMER25"
                      value={promoForm.code}
                      onChange={(e) => setPromoForm((prev) => ({ ...prev, code: e.target.value.toUpperCase().replace(/\s+/g, '') }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input
                      className="form-input"
                      placeholder="Festival campaign"
                      value={promoForm.description}
                      onChange={(e) => setPromoForm((prev) => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.7rem' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Type</label>
                      <select
                        className="form-input"
                        value={promoForm.discountType}
                        onChange={(e) => setPromoForm((prev) => ({ ...prev, discountType: e.target.value }))}
                      >
                        <option value="percentage">Percentage</option>
                        <option value="flat">Flat INR</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Value</label>
                      <input
                        required
                        type="number"
                        min="1"
                        className="form-input"
                        value={promoForm.discountValue}
                        onChange={(e) => setPromoForm((prev) => ({ ...prev, discountValue: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.7rem' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Min Order (INR)</label>
                      <input
                        type="number"
                        min="0"
                        className="form-input"
                        value={promoForm.minOrderAmount}
                        onChange={(e) => setPromoForm((prev) => ({ ...prev, minOrderAmount: e.target.value }))}
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Usage Limit</label>
                      <input
                        type="number"
                        min="1"
                        className="form-input"
                        placeholder="Unlimited"
                        value={promoForm.usageLimit}
                        onChange={(e) => setPromoForm((prev) => ({ ...prev, usageLimit: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={promoForm.expiresAt}
                      onChange={(e) => setPromoForm((prev) => ({ ...prev, expiresAt: e.target.value }))}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <input
                        type="checkbox"
                        checked={promoForm.active}
                        onChange={(e) => setPromoForm((prev) => ({ ...prev, active: e.target.checked }))}
                      />
                      Active
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" className="admin-btn admin-btn-primary">
                      {editingPromoId ? 'Update Promo' : 'Create Promo'}
                    </button>
                    {editingPromoId && (
                      <button type="button" className="admin-btn admin-btn-secondary" onClick={resetPromoForm}>
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="admin-card" style={{ padding: 0 }}>
                {promoCodesLoading ? (
                  <AdminTableSkeleton columns={7} rows={6} />
                ) : (
                  <div className="admin-table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Discount</th>
                          <th>Expiry</th>
                          <th>Usage</th>
                          <th>Status</th>
                          <th>Used</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {promoCodes.map((promo) => {
                          const isExpired = promo.expiresAt ? new Date(promo.expiresAt) < new Date() : false;
                          return (
                            <tr key={promo.id}>
                              <td>
                                <strong>{promo.code}</strong>
                                {promo.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{promo.description}</div>}
                              </td>
                              <td>
                                {promo.discountType === 'percentage'
                                  ? `${promo.discountValue}%`
                                  : `INR ${Math.round(promo.discountValue || 0)}`}
                              </td>
                              <td>{promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString() : 'No expiry'}</td>
                              <td>{promo.usageLimit ?? 'Unlimited'}</td>
                              <td>
                                <span className={`badge ${promo.active && !isExpired ? 'badge-admin' : 'badge-danger'}`}>
                                  {promo.active ? (isExpired ? 'EXPIRED' : 'ACTIVE') : 'INACTIVE'}
                                </span>
                              </td>
                              <td>{promo.usedCount || 0}</td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                  <button className="admin-btn admin-btn-secondary" style={{ padding: '0.3rem' }} onClick={() => handlePromoEdit(promo)}>
                                    <Edit size={14} />
                                  </button>
                                  <button className="admin-btn btn-danger" style={{ padding: '0.3rem' }} onClick={() => handlePromoDelete(promo.id)}>
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {promoCodes.length === 0 && (
                          <tr>
                            <td colSpan="7" style={{ textAlign: 'center' }}>No promo codes configured.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
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
                    onChange={e => setEventFormData({ ...eventFormData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    required className="form-input" rows="3"
                    value={eventFormData.description}
                    onChange={e => setEventFormData({ ...eventFormData, description: e.target.value })}
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
                      onChange={e => setEventFormData({ ...eventFormData, date: e.target.value })}
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
                      onChange={e => setEventFormData({ ...eventFormData, time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    required type="text" className="form-input"
                    value={eventFormData.location}
                    onChange={e => setEventFormData({ ...eventFormData, location: e.target.value })}
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
                      onChange={e => setEventFormData({ ...eventFormData, image: e.target.value })}
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
                      onChange={e => setEventFormData({ ...eventFormData, price: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">VIP Price (INR)</label>
                    <input
                      required type="number" min="0" className="form-input" placeholder="Price for Row A & B"
                      value={eventFormData.vipPrice}
                      onChange={e => setEventFormData({ ...eventFormData, vipPrice: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">VIP Seats (comma separated)</label>
                  <input
                    className="form-input"
                    placeholder="Example: A1, A2, B4, C1"
                    value={eventFormData.vipSeats}
                    onChange={e => setEventFormData({ ...eventFormData, vipSeats: e.target.value })}
                  />
                  <small className="text-muted">These seats will be highlighted and charged with VIP pricing.</small>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">CGST % (Event)</label>
                    <input
                      required
                      type="number"
                      min="0"
                      max="50"
                      className="form-input"
                      value={eventFormData.cgstRate}
                      onChange={e => setEventFormData({ ...eventFormData, cgstRate: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">SGST % (Event)</label>
                    <input
                      required
                      type="number"
                      min="0"
                      max="50"
                      className="form-input"
                      value={eventFormData.sgstRate}
                      onChange={e => setEventFormData({ ...eventFormData, sgstRate: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Total Seats</label>
                    <input
                      required
                      type="number"
                      min="1"
                      max="500"
                      className="form-input"
                      placeholder="Max 500 seats"
                      value={eventFormData.capacity}
                      onChange={e => setEventFormData({ ...eventFormData, capacity: e.target.value })}
                    />
                    <small className="text-muted">Seat map currently supports up to 500 seats per event.</small>
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
