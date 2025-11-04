// app/api/ticker/route.ts
import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { INITIAL_CITIES } from '@/constants';
import { fetchAndProcessWeatherData } from '@/services/weatherService';
import type { WeatherInfo } from '@/types/weather';

const CACHE_TTL = 1800; // 30 minutes in seconds

export async function GET() {
  const cacheKey = "weather:ticker";

  try {
    const cachedData = await redis.get<WeatherInfo[]>(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const weatherPromises = INITIAL_CITIES.map(city =>
      fetchAndProcessWeatherData(city.name, city.state, "0", city.lat, city.lon)
    );

    const results = await Promise.all(weatherPromises);
    const successfulResults = results.filter((data): data is WeatherInfo => data !== null);

    if (successfulResults.length === 0) {
      return NextResponse.json({ message: 'Failed to fetch any weather data for the ticker.' }, { status: 500 });
    }

    redis.set(cacheKey, JSON.stringify(successfulResults), { ex: CACHE_TTL });

    return NextResponse.json(successfulResults);

  } catch (error) {
    console.error('[API_TICKER_ERROR]', error);
    const message = error instanceof Error ? error.message : 'Unknown server error.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
