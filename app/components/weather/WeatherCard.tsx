"use client";

import RainChart from "./RainChart";
import type { WeatherInfo } from "@/types/weather";
import { FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import React, { useState, useEffect } from 'react';

interface WeatherCardProps {
  city: WeatherInfo;
  onRemove: (cityName: string) => void;
  isAllChartsOpen: boolean;
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

export default function WeatherCard({ city, onRemove, isAllChartsOpen }: WeatherCardProps) {
  const [isChartVisible, setIsChartVisible] = useState(false);
  
  useEffect(() => {
    setIsChartVisible(isAllChartsOpen);
  }, [isAllChartsOpen]);

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
            <button className="rain-title-button" onClick={() => setIsChartVisible(!isChartVisible)}>
              💧 Precipitação por Hora (mm)
              {isChartVisible ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            {isChartVisible && <RainChart rainHours={city.rainHours} />}
        </div>
      )}
    </div>
  );
}