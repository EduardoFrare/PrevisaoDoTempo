// app/api/weather/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { WeatherApiResponse, WeatherInfo, ForecastItem } from "@/types/weather";
import { redis } from '@/lib/redis';

const API_KEY = process.env.OPENWEATHER_API_KEY;
// Cache de 30 minutos em segundos (30 * 60 = 1800)
const CACHE_TTL_SECONDS = 1800;

export async function GET(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'Chave da API não configurada no servidor.' }, { status: 500 });
  }

  const searchParams = request.nextUrl.searchParams;
  const city = searchParams.get('city');
  const state = searchParams.get('state');
  const dayOffset = searchParams.get('dayOffset') || '0';

  if (!city || !state) {
    return NextResponse.json({ error: 'Cidade e estado são obrigatórios.' }, { status: 400 });
  }

  // Chave padronizada para o cache
  const cacheKey = `weather:${city.toLowerCase().replace(/\s+/g, '-')}:${state.toLowerCase()}:${dayOffset}`;

  try {
    // 1. Tenta buscar do cache
    const cachedData = await redis.get<WeatherInfo>(cacheKey);
    if (cachedData) {
      console.log(`[CACHE HIT] Retornando dados para ${city}, ${state}`);
      return NextResponse.json(cachedData);
    }

    console.log(`[CACHE MISS] Buscando dados para ${city}, ${state}`);

    // 2. Se não encontrou, busca na API externa
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city},${state},BR&limit=1&appid=${API_KEY}`
    );
    const geoJson = await geoRes.json();
    if (!geoJson || geoJson.length === 0) {
      throw new Error(`Geolocalização não encontrada para ${city}, ${state}`);
    }
    const { lat, lon } = geoJson[0];
    
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`
    );
    const weatherJson: WeatherApiResponse = await weatherRes.json();
    
    // 3. Processa os dados (lógica original do seu projeto)
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
      throw new Error(`Não há previsão para ${city} na data selecionada.`);
    }

    let maxTemp = -Infinity;
    let minTemp = Infinity;
    let totalRain = 0;
    const fullDayRain = Array.from({ length: 24 }, (_, i) => ({ hour: i, rain: 0 }));

    for (const forecast of dayForecasts) {
      maxTemp = Math.max(maxTemp, forecast.main.temp_max);
      minTemp = Math.min(minTemp, forecast.main.temp_min);
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
    
    const processedData: WeatherInfo = {
      name: `${city}, ${state}`,
      max: Math.round(maxTemp),
      min: Math.round(minTemp),
      rain: parseFloat(totalRain.toFixed(2)),
      wind: Math.round(representativeForecast.wind.speed * 3.6),
      code: representativeForecast.weather[0].id,
      rainHours: fullDayRain,
    };

    // 4. Salva o resultado no cache antes de retornar
    await redis.set(cacheKey, processedData, { ex: CACHE_TTL_SECONDS });

    return NextResponse.json(processedData);

  } catch (error) {
    console.error(`Erro no backend para a cidade ${city}:`, error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}