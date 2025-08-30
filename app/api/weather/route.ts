// app/api/weather/route.ts
import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { WeatherInfo } from '@/types/weather';

// Mantido em 1 hora para atualizações frequentes via cron
const CACHE_TTL = 3600; 

async function fetchAndProcessWeatherData(
  city: string,
  state: string,
  dayOffset: string
): Promise<WeatherInfo | null> {
    // ... (toda a lógica da função fetchAndProcessWeatherData permanece a mesma)
    // Apenas para contextualizar, esta é a função que busca e processa os dados da Open-Meteo
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
        wind: 0, // O vento não está sendo buscado nesta versão
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
    return NextResponse.json({ message: 'Parâmetros inválidos' }, { status: 400 });
  }

  const cacheKey = `weather:${city}:${state}:${dayOffset}`;

  try {
    // Correção: O cliente redis já retorna o objeto JSON, não precisa de parse.
    const cachedData = await redis.get<WeatherInfo>(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const weatherData = await fetchAndProcessWeatherData(city, state, dayOffset);
    if (!weatherData) {
      // Retorna um erro mais claro que pode ser tratado no frontend
      return NextResponse.json({ message: `Não foi possível obter dados para ${city}, ${state}` }, { status: 500 });
    }

    // `await` não é necessário no set para não bloquear a resposta
    redis.set(cacheKey, JSON.stringify(weatherData), { ex: CACHE_TTL });
    return NextResponse.json(weatherData);

  } catch (error) {
    console.error(`[API ERRO] para ${city}:`, error);
    // Correção: Padroniza o retorno de erro para sempre ser um JSON válido.
    const message = error instanceof Error ? error.message : 'Erro desconhecido no servidor.';
    return NextResponse.json({ message }, { status: 500 });
  }
}