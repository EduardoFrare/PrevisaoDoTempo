"use client";

import RainChart from "./RainChart";
import type { WeatherInfo } from "@/types/weather"; // CAMINHO ATUALIZADO
import { FiX } from 'react-icons/fi';

// Interface para as propriedades que o WeatherCard recebe
interface WeatherCardProps {
  city: WeatherInfo;
  onRemove: (cityName: string) => void;
}

// Função auxiliar para obter o ícone do clima
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
        <h2 className="city-name">{city.name}<span className="weather-icon">{getWeatherIcon(city.code)}</span></h2>
        <button onClick={() => onRemove(city.name)} className="remove-btn"><FiX /></button>
      </div>

      <div className="card-body">
        <p>🌡️ Máx: {city.max}°C / Mín: {city.min}°C</p>
        <p>💧 Chuva: {city.rain} mm</p>
        <p>💨 Vento médio: {city.wind} km/h</p>
      </div>
      
      {city.rainHours.length > 0 && (
         <div className="rain-hours">
            <p className="rain-title">💧 Precipitação por Hora (mm)</p>
            <RainChart rainHours={city.rainHours} />
        </div>
      )}
    </div>
  );
}