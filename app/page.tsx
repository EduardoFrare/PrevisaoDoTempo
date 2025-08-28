"use client";

import React, { useEffect, useState } from "react";
// Correção: Importando 'Controls' como um membro nomeado do caminho correto
import { Controls } from "./components/weather/Controls";
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

    if (cities.length > 0) {
      fetchWeather();
    } else {
      setIsLoading(false); // Se não houver cidades, não há o que carregar
    }
  }, [cities, dayOffset]);

  // Função para adicionar cidade, com validação
  function addCity() {
    if (!newCity.trim()) return;

    // Regex para validar o formato "Cidade, UF"
    const cityRegex = /^[a-zA-Z\u00C0-\u017F\s]+,\s*[A-Z]{2}$/;
    if (!cityRegex.test(newCity)) {
      setErrorMsg('Formato inválido. Use: Cidade, UF (ex: Chapecó, SC)');
      return;
    }
    
    const [cityName, state] = newCity.split(",").map(s => s.trim());
    
    // Verifica se a cidade já foi adicionada
    if (cities.some((c) => c.name.toLowerCase() === cityName.toLowerCase() && c.state.toLowerCase() === state.toLowerCase())) {
      setErrorMsg("Essa cidade já está na lista!");
      return;
    }

    // Atualiza o estado das cidades, o que vai disparar o useEffect para buscar o clima
    setCities([...cities, { name: cityName, state: state }]);
    setNewCity(""); // Limpa o input
    setErrorMsg(""); // Limpa mensagens de erro
  }

  // Função para remover a cidade
  function removeCity(cityNameWithState: string) {
    const [cityName] = cityNameWithState.split(",");
    setCities(cities.filter((c) => c.name.toLowerCase() !== cityName.toLowerCase()));
  }

  return (
    <main>
      <div className="app-container">
        {/* Passando as funções e estados corretos para o componente Controls */}
        <Controls
          dayOffset={dayOffset}
          onDayChange={setDayOffset}
          newCity={newCity}
          onNewCityChange={setNewCity}
          onAddCity={addCity}
        />

        {errorMsg && <p className="error-msg">{errorMsg}</p>}

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