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
    // Mapeamento para os códigos da OpenWeatherMap
    if (code >= 200 && code < 300) return "⛈️"; // Trovoada
    if (code >= 300 && code < 400) return "💧"; // Chuvisco (Drizzle)
    if (code >= 500 && code < 600) return "🌧️"; // Chuva
    if (code >= 600 && code < 700) return "❄️"; // Neve
    if (code >= 700 && code < 800) return "🌫️"; // Névoa, Fumaça, etc.
    if (code === 800) return "☀️"; // Céu Limpo
    if (code === 801 || code === 802) return "🌤️"; // Poucas Nuvens
    if (code === 803 || code === 804) return "☁️"; // Nublado
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