"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import WeatherTicker from "@/components/weather/WeatherTicker";
import { INITIAL_CITIES } from "@/constants";
import { fetchProcessedWeatherData } from "@/services/weatherService";
import type { WeatherInfo } from "@/types/weather";

function TickerEmbedContent() {
  const searchParams = useSearchParams();
  const group = searchParams.get("group")?.toUpperCase() || "ALL";
  const customCitiesStr = searchParams.get("cities");
  
  const [tickerCitiesData, setTickerCitiesData] = useState<WeatherInfo[]>([]);

  useEffect(() => {
    async function fetchWeather() {
      let targetCities = INITIAL_CITIES;

      if (customCitiesStr) {
        // Parse custom cities: "São Paulo, SP|Rio de Janeiro, RJ"
        const parts = customCitiesStr.split('|').map(s => s.trim()).filter(Boolean);
        const customTarget = parts.map(part => {
          const [name, state] = part.split(',').map(s => s.trim());
          return { name, state: state || '' };
        });
        if (customTarget.length > 0) {
          targetCities = customTarget;
        }
      } else {
        // Filter cities by group
        if (group !== "ALL") {
          targetCities = targetCities.filter((city) => city.groups?.includes(group as "GO" | "OFERTAS"));
        }
        
        // Fallback if group has no cities or invalid group
        if (targetCities.length === 0) {
          targetCities = INITIAL_CITIES;
        }
      }

      try {
        // Fetch for dayOffset = "0" (today)
        const data = await fetchProcessedWeatherData(targetCities, "0");
        setTickerCitiesData(Object.values(data));
      } catch (error) {
        console.error("Falha ao carregar clima para o ticker embeddado:", error);
      }
    }
    
    fetchWeather();

    // Atualiza automaticamente a cada 30 minutos (1800000 ms)
    const intervalId = setInterval(() => {
      // Só gasta requisição se a aba estiver visível na tela da pessoa
      if (document.visibilityState === 'visible') {
        fetchWeather();
      }
    }, 30 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [group, customCitiesStr]);

  if (tickerCitiesData.length === 0) {
    return null; // Minimalistic loading state or just hidden while loading
  }

  return (
    <>
      <style>{`
        /* Remove global styles that could break the iframe layout */
        body {
          background-color: transparent !important;
          margin: 0;
          padding: 0;
          overflow: hidden; /* Hide scrollbars in iframe */
        }
        main { padding-top: 0 !important; }
        .site-wrapper { min-height: auto !important; }
        .footer-bar { display: none !important; }
      `}</style>
      <div style={{ padding: '0', margin: '0', width: '100%' }}>
        <WeatherTicker cities={tickerCitiesData} />
      </div>
    </>
  );
}

export default function EmbedTickerPage() {
  return (
    <Suspense fallback={null}>
      <TickerEmbedContent />
    </Suspense>
  );
}
