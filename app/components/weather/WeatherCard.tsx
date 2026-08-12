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
    <div className="weather-card">
      <div className="card-header">
        <div className="card-header-left">
          <h2 className="city-name">{city.name}</h2>
          {city.groups && (
            <div className="group-badges">
              {city.groups.includes('GO') && <span className="group-badge go">GO</span>}
              {city.groups.includes('OFERTAS') && <span className="group-badge ofertas">OFERTAS</span>}
            </div>
          )}
        </div>

        <div className="card-header-right">
          {/* Mostra a temperatura atual SÓ se for o dia de "Hoje" */}
          {typeof city.currentTemperature === 'number' && (
            <div className="weather-info">
              <WeatherIcon code={city.code} size={28} title={weatherDescription} />
              <span>{city.currentTemperature}°</span>
            </div>
          )}
          <button onClick={() => onRemove(city.name)} className="remove-btn">
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="card-body">
        <p>🌡️ Máx: {city.max}°C / Mín: {city.min}°C</p>
        <p>
          💧 Chuva: {city.rain} mm
          {typeof city.rainProbability === 'number' && ` - ${city.rainProbability}%`}
        </p>
        <p>💨 Vento: {city.wind || 0} km/h</p>
      </div>

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