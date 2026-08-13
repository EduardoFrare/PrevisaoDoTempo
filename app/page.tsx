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
import { EmbedHelperModal } from "./components/EmbedHelperModal/EmbedHelperModal";
import { FloatingAiButton } from "./components/FloatingAiButton";
import Footer from "./components/controls/Footer";

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
  const [isEmbedHelperOpen, setIsEmbedHelperOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<'ALL' | 'GO' | 'OFERTAS'>('ALL');
  
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [modelUsed, setModelUsed] = useState(""); // Novo estado para o modelo
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [easterEgg, setEasterEgg] = useState<'none' | 'silent-hill' | 'bikini-bottom' | 'new-vegas' | 'nikki-glitch'>('none');

  useEffect(() => {
    async function fetchWeather(silent = false) {
      if (!silent) setIsLoading(true);
      setErrorMsg("");
      try {
        const data = await fetchProcessedWeatherData(cities, dayOffset);
        setWeatherData(data);
      } catch (error) {
        console.error(error);
        const errorMessage = (error as Error).message || "Falha ao buscar dados do tempo.";
        setErrorMsg(errorMessage);
      } finally {
        if (!silent) setIsLoading(false);
      }
    }
    
    if (cities.length > 0) {
      fetchWeather();

      const intervalId = setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchWeather(true); // true = refresh silencioso, sem tela de loading
        }
      }, 30 * 60 * 1000);
      
      return () => clearInterval(intervalId);
    } else {
      setIsLoading(false);
    }
  }, [cities, dayOffset]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const bodyClasses = ['easter-egg-silent-hill', 'easter-egg-bikini', 'easter-egg-vegas', 'easter-egg-nikki'];
      bodyClasses.forEach(c => document.body.classList.remove(c));

      if (easterEgg === 'silent-hill') document.body.classList.add('easter-egg-silent-hill');
      if (easterEgg === 'bikini-bottom') document.body.classList.add('easter-egg-bikini');
      if (easterEgg === 'new-vegas') document.body.classList.add('easter-egg-vegas');
      if (easterEgg === 'nikki-glitch') document.body.classList.add('easter-egg-nikki');
    }

    const handleCancel = () => {
      if (easterEgg !== 'none') {
        setEasterEgg('none');
      }
    };
    
    if (easterEgg !== 'none') {
      setTimeout(() => window.addEventListener('click', handleCancel), 100);
    }
    return () => window.removeEventListener('click', handleCancel);
  }, [easterEgg]);

  function addCity() {
    if (!newCity.trim()) return;

    const rawCity = newCity.trim().toLowerCase();
    if (rawCity === "silent hill") {
      setEasterEgg('silent-hill');
      setNewCity("");
      setIsPanelOpen(false);
      return;
    }
    if (rawCity === "fenda do biquini" || rawCity === "fenda do biquíni") {
      setEasterEgg('bikini-bottom');
      setNewCity("");
      setIsPanelOpen(false);
      return;
    }
    if (rawCity === "mojave" || rawCity === "new vegas") {
      setEasterEgg('new-vegas');
      setNewCity("");
      setIsPanelOpen(false);
      return;
    }
    if (rawCity === "freaky nikki" || rawCity === "bear bailey" || rawCity === "one wish willow") {
      setEasterEgg('nikki-glitch');
      setNewCity("");
      setIsPanelOpen(false);
      return;
    }

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
    INITIAL_CITIES.some(initialCity => city.name.startsWith(initialCity.name))
  );

  const calculatePaddingTop = () => {
    let paddingTop = 60; // Base padding for the header
   if (isPanelOpen) {
      paddingTop += 85; // Height of the AddCityPanel
    }
    return `${paddingTop}px`;
  };

  return (
    <div className="site-wrapper">
      {easterEgg === 'silent-hill' && <div className="fog-overlay"></div>}
      {easterEgg === 'bikini-bottom' && (
        <div className="water-overlay">
          <div className="bubble" style={{ left: '10%', width: '30px', height: '30px', animationDelay: '0s' }}></div>
          <div className="bubble" style={{ left: '30%', width: '50px', height: '50px', animationDelay: '2s' }}></div>
          <div className="bubble" style={{ left: '50%', width: '20px', height: '20px', animationDelay: '1s' }}></div>
          <div className="bubble" style={{ left: '70%', width: '40px', height: '40px', animationDelay: '3s' }}></div>
          <div className="bubble" style={{ left: '90%', width: '25px', height: '25px', animationDelay: '0.5s' }}></div>
        </div>
      )}
      {easterEgg === 'new-vegas' && <div className="vegas-crt-overlay"></div>}
      {easterEgg === 'nikki-glitch' && <div className="glitch-overlay"></div>}

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
          onOpenEmbedHelper={() => setIsEmbedHelperOpen(true)}
          selectedGroup={selectedGroup}
          onGroupChange={setSelectedGroup}
        />
        
        <FloatingAiButton onGenerateSummary={handleGenerateSummary} />
        
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
            <div className="cards">
              {cities
                .filter((city) => {
                  if (selectedGroup === 'ALL') return true;
                  return city.groups?.includes(selectedGroup);
                })
                .map((_, idx) => (
                  <div key={idx} className="weather-card skeleton-card">
                    <div className="card-header-skel"></div>
                    <div className="card-body-skel"></div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="cards">
              {Object.values(weatherData)
                .filter((city) => {
                  if (selectedGroup === 'ALL') return true;
                  return city.groups?.includes(selectedGroup);
                })
                .map((city) => (
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

        <AiSummaryModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          summary={aiSummary}
          modelUsed={modelUsed}
          isLoading={isAiLoading}
        />

        <EmbedHelperModal 
          isOpen={isEmbedHelperOpen} 
          onClose={() => setIsEmbedHelperOpen(false)} 
        />
      </main>
      <Footer />
    </div>
  );
}