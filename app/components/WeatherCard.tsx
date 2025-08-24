// app/components/WeatherCard.tsx
"use client";

import RainChart from "./RainChart"; // Importando o nosso novo componente de gráfico

// Interface para os dados do clima de uma cidade
interface WeatherInfo {
  name: string;
  max: number;
  min: number;
  rain: number;
  wind: number;
  code: number;
  rainHours: { hour: number; rain: number }[];
}

// Interface para as propriedades que o WeatherCard recebe
interface WeatherCardProps {
  city: WeatherInfo;
  onRemove: (cityName: string) => void;
}

// Função auxiliar para obter o ícone do clima
function getWeatherIcon(code: number) {
    if ([0].includes(code)) return "☀️";
    if ([1, 2, 3].includes(code)) return "⛅";
    if ([45, 48].includes(code)) return "🌫️";
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧️";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
    if ([95, 96, 99].includes(code)) return "⛈️";
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
      
      {city.rainHours.length > 0 && <RainChart rainHours={city.rainHours} />}
    </div>
  );
}