// app/components/WeatherCard.tsx
"use client";

import RainChart from "./RainChart";

interface WeatherInfo {
  name: string;
  max: number;
  min: number;
  rain: number;
  wind: number;
  code: number;
  rainHours: { hour: number; rain: number }[];
}

interface WeatherCardProps {
  city: WeatherInfo;
  onRemove: (cityName: string) => void;
}

function getWeatherIcon(code: number) {
  if (code >= 200 && code < 300) return "⛈️";
  if (code >= 300 && code < 400) return "💧";
  if (code >= 500 && code < 600) return "🌧️";
  if (code >= 600 && code < 700) return "❄️";
  if (code >= 700 && code < 800) return "🌫️";
  if (code === 800) return "☀️";
  if (code === 801 || code === 802) return "🌤️";
  if (code === 803 || code === 804) return "☁️";
  return "❔";
}

export default function WeatherCard({ city, onRemove }: WeatherCardProps) {
  return (
    <div className="weather-card">
      <div className="card-header">
        <h2 className="city-name">
          {city.name} <span>{getWeatherIcon(city.code)}</span>
        </h2>
        <button
          onClick={() => onRemove(city.name)}
          className="remove-btn"
        >
          Remover
        </button>
      </div>

      <div className="card-body">
        <p>🌡️ Máx: {city.max}°C / Mín: {city.min}°C</p>
        <p>💧 Chuva: {city.rain} mm</p>
        <p>💨 Vento médio: {city.wind} km/h</p>
      </div>
      
      {/* ALTERAÇÃO AQUI: Envolvemos o RainChart em uma div com a classe que aplica o padding */}
      {city.rainHours.length > 0 && (
        <div className="rain-hours">
          <RainChart rainHours={city.rainHours} />
        </div>
      )}
    </div>
  );
}