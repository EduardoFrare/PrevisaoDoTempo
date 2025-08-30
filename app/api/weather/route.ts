// app/api/weather/route.ts
import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { WeatherInfo } from '@/types/weather'; // CAMINHO CORRIGIDO

const CACHE_TTL = 60 * 60; // 1 hora em segundos

async function fetchAndProcessWeatherData(
  city: string,
  state: string,
  dayOffset: string
): Promise<WeatherInfo | null> {
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=pt&format=json`
  );
  if (!geoRes.ok) return null;
  const geoJson = await geoRes.json();
  if (!geoJson.results || geoJson.results.length === 0) return null;
  const { latitude, longitude } = geoJson.results[0];

  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&hourly=precipitation,weathercode&wind_speed_unit=kmh&timezone=auto&forecast_days=5`
  );
  if (!weatherRes.ok) return null;
  const weatherJson = await weatherRes.json();
  const dailyData = weatherJson.daily;
  const hourlyData = weatherJson.hourly;
  const offset = parseInt(dayOffset, 10);

  const rainHours = hourlyData.time
    .map((time: string, index: number) => {
      return {
        hour: new Date(time).getHours(),
        rain: hourlyData.precipitation[index],
      };
    })
    .filter(
      (_: any, index: number) =>
        index >= offset * 24 && index < (offset + 1) * 24
    );

  return {
    name: `${city}, ${state}`,
    max: Math.round(dailyData.temperature_2m_max[offset]),
    min: Math.round(dailyData.temperature_2m_min[offset]),
    rain: parseFloat(dailyData.precipitation_sum[offset].toFixed(2)),
    wind: 0,
    code: dailyData.weathercode[offset],
    rainHours: rainHours,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const state = searchParams.get('state');
  const dayOffset = searchParams.get('dayOffset');

  if (!city || !state || !dayOffset) {
    return NextResponse.json(
      { error: 'Parâmetros inválidos' },
      { status: 400 }
    );
  }

  const cacheKey = `weather:${city}:${state}:${dayOffset}`;

  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData as string));
    }

    const weatherData = await fetchAndProcessWeatherData(city, state, dayOffset);
    if (!weatherData) {
      return NextResponse.json(
        { error: 'Não foi possível obter os dados do tempo' },
        { status: 500 }
      );
    }

    await redis.set(cacheKey, JSON.stringify(weatherData), { ex: CACHE_TTL });
    return NextResponse.json(weatherData);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}