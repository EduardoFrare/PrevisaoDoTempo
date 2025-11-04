// app/api/weather/route.ts
import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { WeatherInfo } from '@/types/weather';
import { fetchAndProcessWeatherData } from '@/services/weatherService';

const CACHE_TTL = 1800; 

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
