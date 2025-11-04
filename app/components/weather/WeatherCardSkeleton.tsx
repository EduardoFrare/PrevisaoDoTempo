// app/components/weather/WeatherCardSkeleton.tsx
/**
 * A skeleton component that displays a loading state for the WeatherCard.
 * It shows a simplified version of the card with placeholder elements.
 * @returns The WeatherCardSkeleton component.
 */
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