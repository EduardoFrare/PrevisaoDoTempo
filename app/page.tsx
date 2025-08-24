// app/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Controls from "./components/Controls";
import WeatherCard from "./components/WeatherCard";

// Interface para os dados do clima (pode ser movida para um ficheiro de tipos no futuro)
interface WeatherInfo {
  name: string;
  max: number;
  min: number;
  rain: number;
  wind: number;
  code: number;
  rainHours: { hour: number; rain: number }[];
}

// O nome da função principal da página
export default function Home() {
  const [cities, setCities] = useState([
    { name: "Chapecó", state: "SC" },
    { name: "Passo Fundo", state: "RS" },
    { name: "Erechim", state: "RS" },
    { name: "Carazinho", state: "RS" },
    { name: "Santo Ângelo", state: "RS" },
    { name: "Lages", state: "SC" },
    { name: "Ijuí", state: "RS" },
    { name: "Vacaria", state: "RS" },
  ]);
  const [dayOffset, setDayOffset] = useState("0");
  const [weatherData, setWeatherData] = useState<{ [key: string]: WeatherInfo }>({});
  const [newCity, setNewCity] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function fetchWeather() {
      const results: { [key: string]: WeatherInfo } = {};
      for (const city of cities) {
        try {
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
              city.name
            )}&count=1&language=pt&format=json&country=BR`
          );
          const geoJson = await geoRes.json();
          if (!geoJson.results || geoJson.results.length === 0) continue;

          const loc = geoJson.results[0];
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_mean,weathercode&hourly=precipitation&timezone=auto`
          );
          const weatherJson = await weatherRes.json();

          const idx = parseInt(dayOffset);
          const targetDate = weatherJson.daily.time[idx];
          
          const hours = weatherJson.hourly.time
            .map((t: string, i: number) => ({ time: t, rain: weatherJson.hourly.precipitation[i] }))
            .filter((h: { time: string; rain: number | null }) => 
              h.time.startsWith(targetDate) && typeof h.rain === 'number'
            )
            .map((h: { time: string; rain: number }) => ({ 
              hour: new Date(h.time).getHours(), 
              rain: h.rain 
            }));

          results[`${city.name}, ${city.state}`] = {
            name: `${city.name}, ${loc.admin1 ?? city.state}`,
            max: weatherJson.daily.temperature_2m_max[idx],
            min: weatherJson.daily.temperature_2m_min[idx],
            rain: weatherJson.daily.precipitation_sum[idx],
            wind: weatherJson.daily.windspeed_10m_mean[idx],
            code: weatherJson.daily.weathercode[idx],
            rainHours: hours,
          };
        } catch (e) {
          console.error("Erro buscando previsão para", city.name, e);
        }
      }
      setWeatherData(results);
    }

    fetchWeather();
  }, [cities, dayOffset]);

  function addCity() {
    if (!newCity.trim()) return;
    const cityKey = newCity.trim().toLowerCase();
    if (cities.some((c) => c.name.toLowerCase() === cityKey)) {
      setErrorMsg("Cidade já adicionada!");
      return;
    }
    setCities([...cities, { name: newCity.trim(), state: "" }]);
    setNewCity("");
    setErrorMsg("");
  }

  function removeCity(cityName: string) {
    setCities(cities.filter((c) => `${c.name}, ${c.state}` !== cityName));
    const newData = { ...weatherData };
    delete newData[cityName];
    setWeatherData(newData);
  }

  return (
    <main>
      <div className="app-container">
        <h1 className="title">Previsão do Tempo</h1>

        <Controls 
          dayOffset={dayOffset}
          onDayChange={setDayOffset}
          newCity={newCity}
          onNewCityChange={setNewCity}
          onAddCity={addCity}
        />

        {errorMsg && <p className="error-msg">{errorMsg}</p>}

        <div className="cards">
          {Object.values(weatherData).map((city) => (
            <WeatherCard 
              key={city.name} 
              city={city} 
              onRemove={removeCity} 
            />
          ))}
        </div>
      </div>
    </main>
  );
}