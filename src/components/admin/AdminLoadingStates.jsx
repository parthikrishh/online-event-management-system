export function DashboardStatsSkeleton() {
  return (
    <div className="grid">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="admin-card admin-skeleton-card">
          <div className="skeleton skeleton-circle" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line short" />
        </div>
      ))}
    </div>
  );
}

export function AdminTableSkeleton({ columns = 5, rows = 7 }) {
  return (
    <div className="admin-table-skeleton">
      <table>
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, idx) => (
              <th key={idx}>
                <div className="skeleton skeleton-line" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx}>
              {Array.from({ length: columns }).map((__, cellIdx) => (
                <td key={cellIdx}>
                  <div className="skeleton skeleton-line" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DashboardFeedSkeleton() {
  return (
    <div className="admin-card">
      <div className="skeleton skeleton-title" />
      <div className="admin-feed-skeleton">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="admin-feed-skeleton-row">
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line short" />
          </div>
        ))}
      </div>
    </div>
  );
}
