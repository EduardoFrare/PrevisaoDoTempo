// app/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Controls from "./components/Controls";
import WeatherCard from "./components/WeatherCard";

// Interfaces para a resposta da API
interface ForecastItem {
  dt: number;
  dt_txt: string;
  main: {
    temp_max: number;
    temp_min: number;
  };
  weather: {
    id: number;
  }[];
  wind: {
    speed: number;
  };
  rain?: {
    "3h"?: number;
  };
}

interface WeatherApiResponse {
  cod: string;
  list: ForecastItem[];
  city: {
    timezone: number;
  };
}

// Interface para os nossos dados de clima processados
interface WeatherInfo {
  name: string;
  max: number;
  min: number;
  rain: number;
  wind: number;
  code: number;
  rainHours: { hour: number; rain: number }[];
}

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
  const [weatherData, setWeatherData] = useState<{
    [key: string]: WeatherInfo;
  }>({});
  const [newCity, setNewCity] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

  useEffect(() => {
    async function fetchWeather() {
      if (!API_KEY) {
        setErrorMsg("Chave da API não configurada!");
        return;
      }

      const results: { [key: string]: WeatherInfo } = {};
      for (const city of cities) {
        try {
          const geoRes = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
              city.name
            )},${city.state},BR&limit=1&appid=${API_KEY}`
          );
          const geoJson = await geoRes.json();

          if (!geoJson || geoJson.length === 0) {
            console.warn(`Geolocalização não encontrada para: ${city.name}`);
            continue;
          }
          const { lat, lon } = geoJson[0];

          const weatherRes = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`
          );
          const weatherJson: WeatherApiResponse = await weatherRes.json();

          if (weatherJson.cod !== "200") {
            console.warn(
              `Dados de clima não encontrados para: ${city.name}. Resposta da API:`,
              weatherJson
            );
            continue;
          }

          const timezoneOffset = weatherJson.city.timezone;

          const now = new Date();
          const nowUtc = now.getTime() + now.getTimezoneOffset() * 60000;
          const cityLocalNow = new Date(nowUtc + timezoneOffset * 1000);

          const targetDate = new Date(cityLocalNow);
          targetDate.setUTCDate(targetDate.getUTCDate() + parseInt(dayOffset));
          const targetDateString = targetDate.toISOString().split("T")[0];

          const dayForecasts = weatherJson.list.filter(
            (item: ForecastItem) => {
              const forecastLocalDate = new Date(
                (item.dt + timezoneOffset) * 1000
              );
              return (
                forecastLocalDate.toISOString().split("T")[0] === targetDateString
              );
            }
          );

          if (dayForecasts.length === 0) {
            results[`${city.name}, ${city.state}`] = {
              name: `${city.name}, ${city.state}`,
              max: 0,
              min: 0,
              rain: 0,
              wind: 0,
              code: 800,
              rainHours: Array.from({ length: 24 }, (_, i) => ({
                hour: i,
                rain: 0,
              })),
            };
            console.warn(
              `Não há previsão disponível para ${city.name} na data selecionada.`
            );
            continue;
          }

          let maxTemp = -Infinity;
          let minTemp = Infinity;
          let totalRain = 0;

          const fullDayRain = Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            rain: 0,
          }));

          for (const forecast of dayForecasts) {
            if (forecast.main.temp_max > maxTemp)
              maxTemp = forecast.main.temp_max;
            if (forecast.main.temp_min < minTemp)
              minTemp = forecast.main.temp_min;

            const rainAmount = forecast.rain?.["3h"] ?? 0;
            totalRain += rainAmount;

            const forecastLocalDate = new Date(
              (forecast.dt + timezoneOffset) * 1000
            );
            const forecastHour = forecastLocalDate.getUTCHours();

            const hourIndex = fullDayRain.findIndex(
              (h) => h.hour === forecastHour
            );
            if (hourIndex !== -1) {
              fullDayRain[hourIndex].rain = rainAmount;
            }
          }

          const representativeForecast =
            dayForecasts[Math.floor(dayForecasts.length / 2)];

          results[`${city.name}, ${city.state}`] = {
            name: `${city.name}, ${city.state}`,
            max: Math.round(maxTemp),
            min: Math.round(minTemp),
            rain: parseFloat(totalRain.toFixed(2)),
            wind: Math.round(representativeForecast.wind.speed * 3.6),
            code: representativeForecast.weather[0].id,
            rainHours: fullDayRain,
          };
        } catch (e) {
          console.error(
            `Erro detalhado ao buscar previsão para "${city.name}":`,
            e
          );
        }
      }
      setWeatherData(results);
    }

    fetchWeather();
  }, [cities, dayOffset, API_KEY]);

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
    const pureCityName = cityName.split(",")[0];
    setCities(cities.filter((c) => c.name !== pureCityName));

    const newData = { ...weatherData };
    delete newData[cityName];
    setWeatherData(newData);
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