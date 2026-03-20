import { useNavigate, useParams } from 'react-router-dom';

export default function Booking() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="empty-state">
      <h3>Booking Experience</h3>
      <p>Use the optimized seat flow from the events page for event: {eventId}</p>
      <button className="btn btn-primary" onClick={() => navigate('/events')} type="button">
        Go to Events
      </button>
    </div>
  );
}
