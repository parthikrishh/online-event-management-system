export default function RouteLoader() {
  return (
    <div className="route-loader" role="status" aria-live="polite">
      <div className="route-loader__pulse" />
      <div className="route-loader__line" />
      <div className="route-loader__line short" />
    </div>
  );
}
