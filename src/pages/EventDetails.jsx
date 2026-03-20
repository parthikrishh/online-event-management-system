import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, MapPin, AlertTriangle } from 'lucide-react';
import { useQueryState, api } from '../services/apiService';
import SkeletonCard from '../components/SkeletonCard';
import ImageWithSkeleton from '../components/ImageWithSkeleton';

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { data: eventsData, loading: isLoading, error } = useQueryState(api.events.list);

  const event = useMemo(() => (eventsData || []).find((item) => item.id === eventId), [eventsData, eventId]);

  if (isLoading) {
    return <SkeletonCard />;
  }

  if (error) {
    return (
      <div className="empty-state">
        <AlertTriangle size={24} />
        <h3>Could not load event details</h3>
        <p>Please retry in a moment.</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="empty-state">
        <h3>Event not found</h3>
        <p>The requested event is unavailable.</p>
      </div>
    );
  }

  const fallbackCapacity = event.capacity || 50;
  const remainingSeats = Math.max(0, Number(event.availableCapacity ?? fallbackCapacity));

  return (
    <section className="event-details-page">
      <article className="event-details-card">
        <ImageWithSkeleton src={event.image} alt={event.name} className="event-details-img" wrapperClassName="event-details-img-wrap" />
        <div className="event-details-content">
          <h1>{event.name}</h1>
          <p>{event.description}</p>
          <p><CalendarDays size={16} /> {new Date(event.date).toLocaleDateString()}</p>
          <p><MapPin size={16} /> {event.location}</p>
          <p className={`event-details-availability ${remainingSeats <= 0 ? 'is-soldout' : ''}`}>
            {remainingSeats <= 0 ? 'Sold out' : `Remaining seats: ${remainingSeats}`}
          </p>
          <button className="btn btn-primary" type="button" onClick={() => navigate(`/booking/${event.id}`)}>
            Continue Booking
          </button>
        </div>
      </article>
    </section>
  );
}
