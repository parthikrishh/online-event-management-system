import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';

export default function OverviewCharts({ events, bookings }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '3rem' }}>
      <div className="admin-card" style={{ flex: '1 1 500px', minWidth: 0 }}>
        <div className="flex-between" style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: 0 }}>Revenue Growth Trends</h3>
          <small className="text-muted">{events.length} Events Total</small>
        </div>
        <div style={{ height: 350, overflowX: 'auto', overflowY: 'hidden', paddingBottom: '10px' }}>
          <div style={{ minWidth: events.length > 8 ? `${events.length * 60}px` : '100%', height: '100%' }}>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart
                data={(events || []).map((event) => {
                  const eventBookings = (bookings || []).filter((booking) => booking.eventId === event.id);
                  return {
                    name: (event.name || '').length > 12 ? `${event.name.substring(0, 10)}...` : (event.name || 'Event'),
                    full_name: event.name || 'Unnamed Event',
                    revenue: eventBookings
                      .filter((booking) => !['cancelled', 'refunded', 'refund_requested'].includes(booking.status))
                      .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0),
                  };
                })}
              >
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} interval={0} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-lg)',
                    color: 'var(--text-main)',
                    padding: '12px',
                  }}
                  itemStyle={{ color: 'var(--primary)', fontWeight: '800' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ flex: '1 1 300px' }}>
        <h3 style={{ marginBottom: '2rem', textAlign: 'center' }}>Ticket Distribution</h3>
        <div style={{ height: 350 }}>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={(events || [])
                  .map((event) => ({
                    name: event.name || 'Unnamed',
                    value: (bookings || [])
                      .filter((booking) => booking.eventId === event.id && !['cancelled', 'refunded', 'refund_requested'].includes(booking.status))
                      .reduce((sum, booking) => sum + (booking.numTickets || 0), 0),
                  }))
                  .filter((data) => data.value > 0)}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={5}
                dataKey="value"
              >
                {(events || []).map((entry, index) => {
                  const COLORS = ['#FF5500', '#FF8800', '#FFAA00', '#FFDD00', '#FF2200', '#FF0055', '#BD00FF', '#00F0FF'];
                  return <Cell key={`cell-${entry.id || index}`} fill={COLORS[index % COLORS.length]} stroke="none" />;
                })}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface-raised)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-lg)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
