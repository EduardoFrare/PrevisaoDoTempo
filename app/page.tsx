"use client";

import React, { useEffect, useState } from "react";
// Adicione esta interface no topo do seu arquivo, após os imports
interface WeatherInfo {
  name: string;
  max: number;
  min: number;
  rain: number;
  wind: number;
  code: number;
  rainHours: { hour: number; rain: number }[];
}
// Como não estamos mais usando o Home, podemos chamar a função principal de Page
// ou manter como WeatherApp e exportar dentro do Home/Page.
// Vou manter WeatherApp para consistência.
function WeatherApp() {
  const [cities, setCities] = useState([
    { name: "Chapecó", state: "SC" },
    { name: "Passo Fundo", state: "RS" },
    { name: "Erechim", state: "RS" },
    { name: "Carazinho", state: "RS" },
  ]);
  const [dayOffset, setDayOffset] = useState("0");
  // Tipando o estado 'weatherData'
  const [weatherData, setWeatherData] = useState<{ [key: string]: WeatherInfo }>({});
  const [newCity, setNewCity] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchWeather();
  }, [cities, dayOffset]);

  async function fetchWeather() {
    // Tipando a variável 'results'
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
        const lat = loc.latitude;
        const lon = loc.longitude;

        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_mean,weathercode&hourly=precipitation&timezone=auto`
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

        results[`${city.name}-${city.state}`] = {
          name: `${city.name} - ${city.state}`,
          max: weatherJson.daily.temperature_2m_max[idx],
          min: weatherJson.daily.temperature_2m_min[idx],
          rain: weatherJson.daily.precipitation_sum[idx],
          wind: weatherJson.daily.windspeed_10m_mean[idx],
          code: weatherJson.daily.weathercode[idx],
          rainHours: hours,
        };
      } catch (e) {
        console.error("Erro buscando previsão para", city, e);
      }
    }
    setWeatherData(results);
  }

  function getWeatherIcon(code: number) {
    if ([0].includes(code)) return "☀️";
    if ([1, 2, 3].includes(code)) return "⛅";
    if ([45, 48].includes(code)) return "🌫️";
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧️";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
    if ([95, 96, 99].includes(code)) return "⛈️";
    return "❔";
  }

  function addCity() {
    if (!newCity.trim()) return;
    const cityKey = `${newCity.trim()}-`;
    if (cities.some((c) => `${c.name}-${c.state}`.toLowerCase().startsWith(cityKey.toLowerCase()))) {
      setErrorMsg("Cidade já adicionada!");
      return;
    }
    setCities([...cities, { name: newCity.trim(), state: "" }]);
    setNewCity("");
    setErrorMsg("");
  }

  function removeCity(name: string) {
    setCities(cities.filter((c) => `${c.name}-${c.state}` !== name));
    const newData = { ...weatherData };
    delete newData[name];
    setWeatherData(newData);
  }

  return (
    <div className="app-container">
      <h1 className="title">Previsão do Tempo!</h1>

      <div className="controls">
        <select
          className="day-select"
          value={dayOffset}
          onChange={(e) => setDayOffset(e.target.value)}
        >
          <option value="0">Hoje</option>
          <option value="1">Amanhã</option>
          <option value="2">Daqui a 2 dias</option>
        </select>
        <input
          type="text"
          className="city-input"
          placeholder="Adicionar cidade"
          value={newCity}
          onChange={(e) => setNewCity(e.target.value)}
        />
        <button onClick={addCity} className="add-btn">
          Adicionar
        </button>
      </div>

      {errorMsg && <p className="error-msg">{errorMsg}</p>}

      <div className="cards">
        {Object.values(weatherData).map((city) => (
          // --- ESTRUTURA DO CARD MODIFICADA AQUI ---
          <div key={city.name} className="weather-card">
            
            {/* O Header agora é um filho direto do card */}
            <div className="card-header">
              <h2 className="city-name">
                {city.name} <span>{getWeatherIcon(city.code)}</span>
              </h2>
              <button
                onClick={() => removeCity(city.name)}
                className="remove-btn"
              >
                Remover
              </button>
            </div>

            {/* Este novo container agrupa as informações de texto */}
            <div className="card-body">
              <p>🌡️ Máx: {city.max}°C / Mín: {city.min}°C</p>
              <p>💧 Chuva: {city.rain} mm</p>
              <p>💨 Vento médio: {city.wind} km/h</p>
            </div>
            
            {/* O gráfico agora é um filho direto do card */}
            {city.rainHours.length > 0 && (() => {
              const maxRain = Math.max(...city.rainHours.map(h => h.rain).filter(r => typeof r === 'number'), 1);
              
              return (
                <div className="rain-hours">
                  <p className="rain-title">💧 Precipitação por Hora (mm)</p>
                  <div className="rain-chart">
                    {city.rainHours.map(({ hour, rain }) => (
                      <div key={hour} className="chart-bar-item">
                        <span className="label-rain">{(rain ?? 0).toFixed(1)}</span>
                        <div className="bar-container">
                          <div
                            className="bar"
                            style={{ height: `${(rain / maxRain) * 100}%` }}
                          ></div>
                        </div>
                        <span className="label-hour">{String(hour).padStart(2, '0')}h</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        ))}
      </div>
    </div>
  );
}

// Exportando como a página principal
export default function Home() {
  return (
    <main>
      <WeatherApp />
    </main>
  )
}