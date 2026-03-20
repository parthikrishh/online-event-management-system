import { memo } from 'react';
import { CalendarDays, MapPin, Heart, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';
import ImageWithSkeleton from './ImageWithSkeleton';

const MotionArticle = motion.article;

function EventCard({ event, isWishlisted, onToggleWishlist, onBook, onPrefetch }) {
  const eventDate = new Date(event.date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const fallbackCapacity = event.capacity || 50;
  const remainingSeats = Math.max(0, Number(event.availableCapacity ?? fallbackCapacity));
  const soldOut = remainingSeats <= 0;

  return (
    <MotionArticle
      className="event-card"
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={onPrefetch}
      onFocusCapture={onPrefetch}
    >
      <div className="event-card__media">
        <ImageWithSkeleton src={event.image} alt={event.name} className="event-card__img" wrapperClassName="event-card__img-wrap" />
        <button className="event-card__wishlist" onClick={onToggleWishlist} type="button" aria-label="Toggle wishlist">
          <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
        {event.category ? <span className="event-chip">{event.category}</span> : null}
      </div>

      <div className="event-card__body">
        <h3>{event.name}</h3>
        <div className="event-card__meta">
          <span><CalendarDays size={16} /> {eventDate}</span>
          <span><MapPin size={16} /> {event.location}</span>
        </div>
        <p className="event-card__desc">{event.description}</p>
        <div className="event-card__footer">
          <div className="event-card__price">
            <IndianRupee size={16} />
            <strong>{event.price}</strong>
          </div>
          <span className={`event-card__availability ${soldOut ? 'is-soldout' : ''}`}>
            {soldOut ? 'Sold out' : `${remainingSeats} seats left`}
          </span>
          <button className="btn btn-primary" type="button" onClick={onBook} disabled={soldOut}>
            {soldOut ? 'Unavailable' : 'Book Tickets'}
          </button>
        </div>
      </div>
    </MotionArticle>
  );
}

export default memo(EventCard);
