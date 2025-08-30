// app/components/weather/WeatherCard.tsx
"use client";

import { useState } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { getWeatherDescription } from "@/services/weatherService";
import type { WeatherInfo } from "@/types/weather";
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
  const [isChartOpen, setIsChartOpen] = useState(false);
  const weatherDescription = getWeatherDescription(city.code);

  const toggleChart = () => {
    setIsChartOpen(!isChartOpen);
  };

  const isOpen = isAllChartsOpen || isChartOpen;

  return (
    <div className="card">
      <button className="remove-btn" onClick={() => onRemove(city.name)}>
        <X size={20} />
      </button>
      <div className="card-header">
        <h2>{city.name}</h2>
        <div className="weather-info">
          <WeatherIcon code={city.code} size={32} />
          <span>{weatherDescription}</span>
        </div>
      </div>
      <div className="temp-details">
        <p className="temp-max">Máx: {city.max}°</p>
        <p className="temp-min">Mín: {city.min}°</p>
      </div>
      <div className="extra-details">
        <p>Chuva: {city.rain}mm</p>
      </div>
      <div className="chart-toggle" onClick={toggleChart}>
        <span>Previsão de chuva por hora</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>
      {isOpen && (
        <div className="chart-container">
          {/* Correção: a propriedade deve ser 'rainHours' e não 'data' */}
          <RainChart rainHours={city.rainHours} />
        </div>
      )}
    </div>
  );
}