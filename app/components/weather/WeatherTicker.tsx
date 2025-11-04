// app/components/weather/WeatherTicker.tsx
"use client";

import { useEffect, useState } from "react";
import type { WeatherInfo } from "@/types/weather";
import { getWeatherDescription } from "@/services/weatherService";
import { WeatherIcon } from "./WeatherIcon";
import { LuWind } from "react-icons/lu";
import "./WeatherTicker.css";

type WeatherTickerProps = {
  cities: WeatherInfo[];
};

export default function WeatherTicker({ cities }: WeatherTickerProps) {
  const [tickerCities, setTickerCities] = useState<WeatherInfo[]>([]);

  useEffect(() => {
    if (cities.length > 0) {
      // Duplicate the cities to create a seamless loop
      setTickerCities([...cities, ...cities]);
    }
  }, [cities]);

  if (tickerCities.length === 0) {
    return null;
  }

  return (
    <div className="weather-ticker-container">
      <div className="weather-ticker">
        {tickerCities.map((city, index) => {
          const weatherDescription = getWeatherDescription(city.code);
          return (
            <div key={index} className="ticker-item">
              <span className="city-name">{city.name}</span>
              <WeatherIcon code={city.code} size={24} title={weatherDescription} />
              <span className="temperature">{city.currentTemperature}°C</span>
              <span className="wind"><LuWind className="windIcon" size={24} /> {city.wind || 0} km/h</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
