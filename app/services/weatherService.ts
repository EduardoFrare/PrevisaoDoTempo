import type { WeatherApiResponse, WeatherInfo, ForecastItem } from "@/types/weather";

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

export async function fetchProcessedWeatherData(
  cities: { name: string; state: string }[],
  dayOffset: string
): Promise<{ [key: string]: WeatherInfo }> {
  
  if (!API_KEY) {
    throw new Error("Chave da API não configurada!");
  }

  const results: { [key: string]: WeatherInfo } = {};
  
  for (const city of cities) {
    try {
      // 1. Obter geolocalização
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

      // 2. Obter previsão do tempo
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`
      );
      const weatherJson: WeatherApiResponse = await weatherRes.json();

      if (weatherJson.cod !== "200") {
        console.warn(`Dados de clima não encontrados para: ${city.name}.`);
        continue;
      }

      // 3. Processar dados para o dia alvo
      const timezoneOffset = weatherJson.city.timezone;
      const now = new Date();
      const nowUtc = now.getTime() + now.getTimezoneOffset() * 60000;
      const cityLocalNow = new Date(nowUtc + timezoneOffset * 1000);

      const targetDate = new Date(cityLocalNow);
      targetDate.setUTCDate(targetDate.getUTCDate() + parseInt(dayOffset));
      const targetDateString = targetDate.toISOString().split("T")[0];

      const dayForecasts = weatherJson.list.filter((item: ForecastItem) => {
        const forecastLocalDate = new Date((item.dt + timezoneOffset) * 1000);
        return forecastLocalDate.toISOString().split("T")[0] === targetDateString;
      });

      if (dayForecasts.length === 0) {
        // Lida com casos onde não há previsão para o dia
        continue;
      }

      let maxTemp = -Infinity;
      let minTemp = Infinity;
      let totalRain = 0;
      const fullDayRain = Array.from({ length: 24 }, (_, i) => ({ hour: i, rain: 0 }));

      for (const forecast of dayForecasts) {
        if (forecast.main.temp_max > maxTemp) maxTemp = forecast.main.temp_max;
        if (forecast.main.temp_min < minTemp) minTemp = forecast.main.temp_min;

        const rainAmount = forecast.rain?.["3h"] ?? 0;
        totalRain += rainAmount;
        
        const forecastLocalDate = new Date((forecast.dt + timezoneOffset) * 1000);
        const forecastHour = forecastLocalDate.getUTCHours();
        
        const hourIndex = fullDayRain.findIndex((h) => h.hour === forecastHour);
        if (hourIndex !== -1) {
          fullDayRain[hourIndex].rain = rainAmount;
        }
      }

      const representativeForecast = dayForecasts[Math.floor(dayForecasts.length / 2)];
      const cityNameState = `${city.name}, ${city.state}`;

      results[cityNameState] = {
        name: cityNameState,
        max: Math.round(maxTemp),
        min: Math.round(minTemp),
        rain: parseFloat(totalRain.toFixed(2)),
        wind: Math.round(representativeForecast.wind.speed * 3.6),
        code: representativeForecast.weather[0].id,
        rainHours: fullDayRain,
      };

    } catch (e) {
      console.error(`Erro detalhado ao buscar previsão para "${city.name}":`, e);
    }
  }
  
  return results;
}