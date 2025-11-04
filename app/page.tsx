// app/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { HeaderBar } from "./components/controls/HeaderBar";
import { AddCityPanel } from "./components/controls/AddCityPanel";
import WeatherCard from "./components/weather/WeatherCard";
import WeatherTicker from "./components/weather/WeatherTicker";
import LoadingIndicator from "./components/LoadingIndicator";
import { INITIAL_CITIES } from "@/constants";
import { fetchProcessedWeatherData } from "@/services/weatherService";
import type { WeatherInfo, City } from "@/types/weather"; // Importando City
import { AiSummaryModal } from "./components/AiSummaryModal/AiSummaryModal";
import { FiZap } from 'react-icons/fi';

export default function Home() {
  const [cities, setCities] = useState<City[]>(INITIAL_CITIES); // Usando o tipo City
  const [dayOffset, setDayOffset] = useState("0");
  const [weatherData, setWeatherData] = useState<{ [key: string]: WeatherInfo; }>({});
  const [newCity, setNewCity] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isTickerOpen, setIsTickerOpen] = useState(false);
  const [areAllChartsOpen, setAreAllChartsOpen] = useState(false);
  
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [modelUsed, setModelUsed] = useState(""); // Novo estado para o modelo
  const [isAiLoading, setIsAiLoading] = useState(false);

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
    setIsPanelOpen(false);
  }

  function removeCity(cityNameWithState: string) {
    const [cityName] = cityNameWithState.split(",");
    setCities(cities.filter((c) => c.name.toLowerCase() !== cityName.toLowerCase()));
  }

  async function handleGenerateSummary() {
    setIsAiModalOpen(true);
    setIsAiLoading(true);
    setAiSummary("");
    setModelUsed(""); // Limpa o nome do modelo antigo

    try {
      const response = await fetch('/api/aiagent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          weatherData: Object.values(weatherData),
          dayOffset: dayOffset 
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao se comunicar com o Agente de IA.");
      }
      
      const result = await response.json();
      setAiSummary(result.summary);
      setModelUsed(result.modelUsed); // Guarda o nome do modelo retornado

    } catch (error) {
      const errorMessage = (error as Error).message;
      setAiSummary(`Ocorreu um erro: ${errorMessage}`);
    } finally {
      setIsAiLoading(false);
    }
  }

  const initialCitiesData = Object.values(weatherData).filter(city =>
    INITIAL_CITIES.some(initialCity => initialCity.name === city.name)
  );

  const calculatePaddingTop = () => {
    let paddingTop = 60; // Base padding for the header
    if (isPanelOpen) {
      paddingTop += 85; // Height of the AddCityPanel
    }
    if (isTickerOpen) {
      paddingTop += 50; // Approximate height of the WeatherTicker
    }
    return `${paddingTop}px`;
  };

  return (
    <main style={{ paddingTop: calculatePaddingTop() }}>
      <HeaderBar
        dayOffset={dayOffset}
        onDayChange={setDayOffset}
        onTogglePanel={() => setIsPanelOpen(!isPanelOpen)}
        isPanelOpen={isPanelOpen}
        onToggleAllCharts={() => setAreAllChartsOpen(!areAllChartsOpen)}
        areAllChartsOpen={areAllChartsOpen}
        onToggleTicker={() => setIsTickerOpen(!isTickerOpen)}
        isTickerOpen={isTickerOpen}
      />
      
      {isTickerOpen && <WeatherTicker cities={initialCitiesData} />}

      <AddCityPanel
        isOpen={isPanelOpen}
        newCity={newCity}
        onNewCityChange={setNewCity}
        onAddCity={addCity}
        errorMsg={errorMsg}
      />

      <div className="app-container">
        {isLoading ? (
          <LoadingIndicator />
        ) : (
          <div className="cards">
            {Object.values(weatherData).map((city) => (
              <WeatherCard
                key={city.name}
                city={city}
                onRemove={removeCity}
                isAllChartsOpen={areAllChartsOpen}
              />
            ))}
          </div>
        )}
      </div>

      <button 
        onClick={handleGenerateSummary} 
        className="ai-floating-button" 
        title="Gerar Resumo da IA"
      >
        <FiZap size={24} />
      </button>

      <AiSummaryModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        summary={aiSummary}
        modelUsed={modelUsed}
        isLoading={isAiLoading}
      />
    </main>
  );
}