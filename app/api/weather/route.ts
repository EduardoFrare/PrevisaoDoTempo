// app/api/weather/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { WeatherApiResponse, WeatherInfo, ForecastItem } from "@/types/weather";
import { redis } from '@/lib/redis';

const API_KEY = process.env.OPENWEATHER_API_KEY;
// Aumentamos o tempo de vida do cache para 3 horas. Como o cron vai rodar a cada hora,
// os dados nunca ficarão mais de 1 hora desatualizados. O TTL maior é uma segurança.
const CACHE_TTL_SECONDS = 10800; // 3 horas

async function fetchAndProcessWeatherData(city: string, state: string, dayOffset: string): Promise<WeatherInfo | null> {
    if (!API_KEY) throw new Error('Chave da API não configurada no servidor.');

    // 1. Geolocalização
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city},${state},BR&limit=1&appid=${API_KEY}`
    );
    if (!geoRes.ok) return null;
    const geoJson = await geoRes.json();
    if (!geoJson || geoJson.length === 0) return null;
    const { lat, lon } = geoJson[0];
    
    // 2. Previsão do tempo
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`
    );
    if (!weatherRes.ok) return null;
    const weatherJson: WeatherApiResponse = await weatherRes.json();
    if (!weatherJson.list || weatherJson.list.length === 0) return null;
    
    // 3. Processamento dos dados
    const timezoneOffset = weatherJson.city.timezone;
    const now = new Date();
    const nowUtc = now.getTime() + now.getTimezoneOffset() * 60000;
    const cityLocalNow = new Date(nowUtc + timezoneOffset * 1000);

    const targetDate = new Date(cityLocalNow);
    targetDate.setUTCDate(targetDate.getUTCDate() + parseInt(dayOffset));
    const targetDateString = targetDate.toISOString().split("T")[0];

    let dayForecasts = weatherJson.list.filter((item: ForecastItem) => {
      const forecastLocalDate = new Date((item.dt + timezoneOffset) * 1000);
      return forecastLocalDate.toISOString().split("T")[0] === targetDateString;
    });

    if (dayForecasts.length === 0 && dayOffset === '0') {
      dayForecasts = [weatherJson.list[0]];
    }

    if (dayForecasts.length === 0) return null;

    let maxTemp = -Infinity, minTemp = Infinity, totalRain = 0;
    const fullDayRain = Array.from({ length: 24 }, (_, i) => ({ hour: i, rain: 0 }));

    for (const forecast of dayForecasts) {
      maxTemp = Math.max(maxTemp, forecast.main.temp_max);
      minTemp = Math.min(minTemp, forecast.main.temp_min);
      const rainAmount3h = forecast.rain?.["3h"] ?? 0;
      totalRain += rainAmount3h;
      
      const forecastLocalDate = new Date((forecast.dt + timezoneOffset) * 1000);
      const forecastHour = forecastLocalDate.getUTCHours();
      
      // Distribui a chuva de 3 horas pela média de 1 hora
      const hourlyRain = rainAmount3h / 3;

      for (let i = 0; i < 3; i++) {
        const currentHour = (forecastHour + i) % 24;
        const hourIndex = fullDayRain.findIndex((h) => h.hour === currentHour);
        if (hourIndex !== -1) {
          // Atribui o valor de chuva para cada uma das 3 horas
          fullDayRain[hourIndex].rain = hourlyRain;
        }
      }
    }

    const representativeForecast = dayForecasts[Math.floor(dayForecasts.length / 2)];
    
    return {
      name: `${city}, ${state}`,
      max: Math.round(maxTemp),
      min: Math.round(minTemp),
      rain: parseFloat(totalRain.toFixed(2)),
      wind: Math.round(representativeForecast.wind.speed * 3.6),
      code: representativeForecast.weather[0].id,
      rainHours: fullDayRain,
    };
}


export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const city = searchParams.get('city');
  const state = searchParams.get('state');
  const dayOffset = searchParams.get('dayOffset') || '0';

  if (!city || !state) {
    return NextResponse.json({ error: 'Cidade e estado são obrigatórios.' }, { status: 400 });
  }

  const cacheKey = `weather:${city.toLowerCase().replace(/\s+/g, '-')}:${state.toLowerCase()}:${dayOffset}`;

  try {
    // Tenta buscar dados frescos primeiro
    const freshData = await fetchAndProcessWeatherData(city, state, dayOffset);

    if (freshData) {
      console.log(`[FRESH DATA] Dados frescos obtidos e cacheados para ${city}, ${state}`);
      // Salva os dados frescos no cache
      await redis.set(cacheKey, freshData, { ex: CACHE_TTL_SECONDS });
      return NextResponse.json(freshData);
    }
    
    // Se a busca por dados frescos falhar, tenta usar o cache
    console.warn(`[CACHE FALLBACK] Falha ao buscar dados frescos para ${city}. Tentando cache...`);
    const cachedData = await redis.get<WeatherInfo>(cacheKey);

    if (cachedData) {
      console.log(`[CACHE HIT] Retornando dados do cache para ${city}, ${state}`);
      return NextResponse.json(cachedData);
    }

    // Se falhar e não tiver cache, retorna erro
    throw new Error(`Não foi possível obter a previsão para ${city} e não há dados em cache.`);

  } catch (error) {
    console.error(`Erro final no backend para a cidade ${city}:`, error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}