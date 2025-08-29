"use client";

import React, { useEffect, useState } from "react";
// Vamos criar um novo componente HeaderBar e AddCityPanel a partir do Controls
import { HeaderBar } from "./components/controls/HeaderBar";
import { AddCityPanel } from "./components/controls/AddCityPanel";
import WeatherCard from "./components/weather/WeatherCard";
import LoadingIndicator from "./components/LoadingIndicator";
import { INITIAL_CITIES } from "@/constants";
import { fetchProcessedWeatherData } from "@/services/weatherService";
import type { WeatherInfo } from "@/types/weather";

export default function Home() {
  const [cities, setCities] = useState(INITIAL_CITIES);
  const [dayOffset, setDayOffset] = useState("0");
  const [weatherData, setWeatherData] = useState<{ [key: string]: WeatherInfo; }>({});
  const [newCity, setNewCity] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false); // Novo estado para o painel

  useEffect(() => {
    async function fetchWeather() {
      setIsLoading(true);
      setErrorMsg("");
      try {
        const data = await fetchProcessedWeatherData(cities, dayOffset);
        setWeatherData(data);
      } catch (error) {
        console.error(error);
        const errorMessage = (error as Error).message || "Falha ao buscar dados do tempo.";
        setErrorMsg(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
    if (cities.length > 0) fetchWeather();
    else setIsLoading(false);
  }, [cities, dayOffset]);

  function addCity() {
    if (!newCity.trim()) return;
    const cityRegex = /^[a-zA-Z\u00C0-\u017F\s]+,\s*[A-Z]{2}$/;
    if (!cityRegex.test(newCity)) {
      setErrorMsg('Formato inválido. Use: Cidade, UF');
      return;
    }
    const [cityName, state] = newCity.split(",").map(s => s.trim());
    if (cities.some((c) => c.name.toLowerCase() === cityName.toLowerCase() && c.state.toLowerCase() === state.toLowerCase())) {
      setErrorMsg("Essa cidade já está na lista!");
      return;
    }
    setCities([...cities, { name: cityName, state: state }]);
    setNewCity("");
    setErrorMsg("");
    setIsPanelOpen(false); // Fecha o painel após adicionar
  }

  function removeCity(cityNameWithState: string) {
    const [cityName] = cityNameWithState.split(",");
    setCities(cities.filter((c) => c.name.toLowerCase() !== cityName.toLowerCase()));
  }

  return (
    <main>
      {/* O HeaderBar fica fixo no topo */}
      <HeaderBar
        dayOffset={dayOffset}
        onDayChange={setDayOffset}
        onTogglePanel={() => setIsPanelOpen(!isPanelOpen)} // Função para abrir/fechar
        isPanelOpen={isPanelOpen}
      />
      
      {/* O AddCityPanel aparece e desaparece */}
      <AddCityPanel
        isOpen={isPanelOpen}
        newCity={newCity}
        onNewCityChange={setNewCity}
        onAddCity={addCity}
        errorMsg={errorMsg}
      />

      {/* Container principal que se ajusta quando o painel está aberto */}
      <div className={`app-container ${isPanelOpen ? 'panel-open' : ''}`}>
        {isLoading ? (
          <LoadingIndicator />
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