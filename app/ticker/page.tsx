// app/ticker/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import WeatherTicker from "@/components/weather/WeatherTicker";
import LoadingIndicator from "@/components/LoadingIndicator";
import type { WeatherInfo } from "@/types/weather";

export default function TickerPage() {
  const [tickerData, setTickerData] = useState<WeatherInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function fetchTickerData() {
      setIsLoading(true);
      setErrorMsg("");
      try {
        const response = await fetch('/api/ticker');
        if (!response.ok) {
          throw new Error('Failed to fetch ticker data.');
        }
        const data = await response.json();
        setTickerData(data);
      } catch (error) {
        console.error(error);
        const errorMessage = (error as Error).message || "Failed to fetch weather data.";
        setErrorMsg(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTickerData();
  }, []);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (errorMsg) {
    return <div style={{ color: 'red', padding: '20px' }}>Error: {errorMsg}</div>;
  }

  return <WeatherTicker cities={tickerData} />;
}
