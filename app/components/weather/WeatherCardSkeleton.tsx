// app/components/weather/WeatherCardSkeleton.tsx
export default function WeatherCardSkeleton() {
  return (
    <div className="weather-card skeleton">
      <div className="card-header">
        <div className="skeleton-text skeleton-title"></div>
      </div>
      <div className="card-body">
        <div className="skeleton-text skeleton-line"></div>
        <div className="skeleton-text skeleton-line"></div>
        <div className="skeleton-text skeleton-line"></div>
      </div>
      <div className="rain-hours">
        <div className="skeleton-text skeleton-subtitle"></div>
        <div className="skeleton-chart"></div>
      </div>
    </div>
  );
}