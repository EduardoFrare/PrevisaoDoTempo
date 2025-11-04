// app/api/weather/route.ts
import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { WeatherInfo } from '@/types/weather';

const CACHE_TTL = 1800;

/**
 * Fetches and processes weather data for a given city.
 * It first tries to get coordinates from the request, otherwise, it uses a geocoding API.
 * Then, it fetches the weather forecast and formats it into a WeatherInfo object.
 * @param city - The name of the city.
 * @param state - The state of the city.
 * @param dayOffset - The number of days from today for the forecast.
 * @param lat - The latitude of the city (optional).
 * @param lon - The longitude of the city (optional).
 * @returns A Promise that resolves to a WeatherInfo object or null if an error occurs.
 */
async function fetchAndProcessWeatherData(
  city: string,
  state: string,
  dayOffset: string,
  lat?: number,
  lon?: number
): Promise<WeatherInfo | null> {

    let latitude = lat;
    let longitude = lon;

    if (!latitude || !longitude) {
      console.log(`[GEOCODING] Coordenadas não fornecidas para ${city}. Buscando na API...`);
      const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=pt&format=json`
      );
      if (!geoRes.ok) return null;
      const geoJson = await geoRes.json();
      if (!geoJson.results || geoJson.results.length === 0) return null;
      
      latitude = geoJson.results[0].latitude;
      longitude = geoJson.results[0].longitude;
    } else {
      console.log(`[GEOCODING] Usando coordenadas pré-definidas para ${city}.`);
    }

    // CORREÇÃO: Adicionado 'current=temperature_2m' para a temperatura ATUAL
    const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,windspeed_10m_max&hourly=precipitation,weathercode&current=temperature_2m&wind_speed_unit=kmh&timezone=auto&forecast_days=5`
    );
    if (!weatherRes.ok) return null;
    const weatherJson = await weatherRes.json();
    const dailyData = weatherJson.daily;
    const hourlyData = weatherJson.hourly;
    const offset = parseInt(dayOffset, 10);

    const rainHours = hourlyData.time
        .map((time: string, index: number) => ({
        hour: new Date(time).getHours(),
        rain: hourlyData.precipitation[index],
        }))
        .filter(
        (_: { hour: number; rain: number }, index: number) =>
            index >= offset * 24 && index < (offset + 1) * 24
        );

    return {
        name: `${city}, ${state}`,
        max: Math.round(dailyData.temperature_2m_max[offset]),
        min: Math.round(dailyData.temperature_2m_min[offset]),
        rain: parseFloat(dailyData.precipitation_sum[offset].toFixed(2)),
        rainProbability: dailyData.precipitation_probability_max[offset],
        wind: parseFloat(dailyData.windspeed_10m_max[offset].toFixed(2)),
        code: dailyData.weathercode[offset],
        rainHours: rainHours,
        lat: latitude,
        lon: longitude,
        // CORREÇÃO: Usando a temperatura ATUAL do campo 'current' apenas para o dia de hoje
        currentTemperature: offset === 0 ? Math.round(weatherJson.current.temperature_2m) : undefined,
    };
}

/**
 * Handles GET requests to the weather API.
 * It retrieves weather data for a specified city, either from the cache or by fetching it.
 * The data is then cached for future requests.
 * @param request - The incoming HTTP request.
 * @returns A JSON response with the weather data or an error message.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const state = searchParams.get('state');
  const dayOffset = searchParams.get('dayOffset');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!city || !state || !dayOffset) {
    return NextResponse.json({ message: 'Parâmetros inválidos' }, { status: 400 });
  }

  const cacheKey = `weather:${city}:${state}:${dayOffset}`;

  try {
     const cachedData = await redis.get<WeatherInfo>(cacheKey);
     if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const latNum = lat ? parseFloat(lat) : undefined;
    const lonNum = lon ? parseFloat(lon) : undefined;

    const weatherData = await fetchAndProcessWeatherData(city, state, dayOffset, latNum, lonNum);
    if (!weatherData) {
      return NextResponse.json({ message: `Não foi possível obter dados para ${city}, ${state}` }, { status: 500 });
    }

    redis.set(cacheKey, JSON.stringify(weatherData), { ex: CACHE_TTL });
    return NextResponse.json(weatherData);

  } catch (error) {
    console.error(`[API ERRO] para ${city}:`, error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido no servidor.';
    return NextResponse.json({ message }, { status: 500 });
  }
}