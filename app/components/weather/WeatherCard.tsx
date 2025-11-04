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

/**
 * A card component that displays the weather information for a single city.
 * It includes the city name, temperature, rain, wind, and a chart of hourly rain data.
 * It also has a button to remove the city from the list.
 * @param {object} props - The component props.
 * @param {WeatherInfo} props.city - The weather information for the city.
 * @param {(cityName: string) => void} props.onRemove - Function to call when the city is removed.
 * @param {boolean} props.isAllChartsOpen - Whether all rain charts are open.
 * @returns The WeatherCard component.
 */
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
        <h2 className="city-name">{city.name}</h2>

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