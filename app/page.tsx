"use client";

import React, { useEffect, useState } from "react";
import Controls from "./components/weather/Controls";
import WeatherCard from "./components/weather/WeatherCard";
import { INITIAL_CITIES } from "@/constants";
// ALTERAÇÃO AQUI: O caminho foi simplificado para apontar apenas para a pasta.
import { fetchProcessedWeatherData } from "@/services"; 
import type { WeatherInfo } from "@/types/weather";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

export default function Home() {
  const [cities, setCities] = useState(INITIAL_CITIES);
  const [dayOffset, setDayOffset] = useState("0");
  const [weatherData, setWeatherData] = useState<{ [key: string]: WeatherInfo; }>({});
  const [newCity, setNewCity] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      setIsLoading(true);
      setErrorMsg("");
      try {
        const data = await fetchProcessedWeatherData(cities, dayOffset);
        setWeatherData(data);
      } catch (error) {
        console.error(error);
        setErrorMsg((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWeather();
  }, [cities, dayOffset]);

  function addCity() {
    if (!newCity.trim()) return;

    const [cityName, state] = newCity.split(",").map(s => s.trim());
    if (!cityName) return;

    const cityKey = cityName.toLowerCase();
    if (cities.some((c) => c.name.toLowerCase() === cityKey)) {
      setErrorMsg("Cidade já adicionada!");
      return;
    }
    
    setCities([...cities, { name: cityName, state: state || "" }]);
    setNewCity("");
    setErrorMsg("");
  }

  function removeCity(cityNameWithState: string) {
    const pureCityName = cityNameWithState.split(",")[0];
    setCities(cities.filter((c) => c.name !== pureCityName));
  }

  return (
    <main>
      <div className="app-container">
        <Controls
          dayOffset={dayOffset}
          onDayChange={setDayOffset}
          newCity={newCity}
          onNewCityChange={setNewCity}
          onAddCity={addCity}
        />

        {errorMsg && <p className="error-msg">{errorMsg}</p>}

        {isLoading ? (
          <p style={{ textAlign: 'center' }}>Carregando dados do clima...</p>
        ) : (
          <div className="cards">
            {Object.values(weatherData).map((city) => (
              <WeatherCard
                key={city.name}
                city={city}
                onRemove={removeCity}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}