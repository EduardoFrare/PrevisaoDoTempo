// app/components/weather/WeatherCard.tsx
"use client";

import { useState, useEffect } from "react";
import type { WeatherInfo } from "@/types/weather";
import { getWeatherDescription } from "@/services/weatherService";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import RainChart from "./RainChart";
import { WeatherIcon } from "./WeatherIcon";

type WeatherCardProps = {
  city: WeatherInfo;
  onRemove: (cityName: string) => void;
  isAllChartsOpen: boolean;
};

export default function WeatherCard({
  city,
  onRemove,
  isAllChartsOpen,
}: WeatherCardProps) {
  const [isChartVisible, setIsChartVisible] = useState(false);
  const weatherDescription = getWeatherDescription(city.code);

  useEffect(() => {
    setIsChartVisible(isAllChartsOpen);
  }, [isAllChartsOpen]);

  return (
    // Mantendo a classe principal original "weather-card"
    <div className="weather-card">
      <div className="card-header">
        <h2 className="city-name">
          {city.name}
          {/* O ícone novo é usado aqui, dentro da estrutura antiga */}
          <span style={{ marginLeft: '10px', verticalAlign: 'middle' }}>
            <WeatherIcon code={city.code} size={28} title={weatherDescription} />
          </span>
        </h2>
        <button onClick={() => onRemove(city.name)} className="remove-btn">
          <X size={24} />
        </button>
      </div>

      {/* Mantendo a classe "card-body" e a estrutura dos parágrafos */}
      <div className="card-body">
        <p>🌡️ Máx: {city.max}°C / Mín: {city.min}°C</p>
        <p>💧 Chuva: {city.rain} mm</p>
        <p>💨 Vento: {city.wind || 0} km/h</p>
      </div>

      {/* Mantendo a estrutura do botão e do container do gráfico */}
      {city.rainHours && city.rainHours.length > 0 && (
        <div className="rain-hours">
          <button
            className="rain-title-button"
            onClick={() => setIsChartVisible(!isChartVisible)}
          >
            💧 Precipitação por Hora (mm)
            {isChartVisible ? <ChevronUp /> : <ChevronDown />}
          </button>
          {isChartVisible && <RainChart rainHours={city.rainHours} />}
        </div>
      )}
    </div>
  );
}