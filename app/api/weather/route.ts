import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { WeatherApiResponse, WeatherInfo, ForecastItem } from "@/types/weather";

// Lembre-se de renomear a variável no seu arquivo .env.local de NEXT_PUBLIC_OPENWEATHER_API_KEY para OPENWEATHER_API_KEY
const API_KEY = process.env.OPENWEATHER_API_KEY;

export async function GET(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'Chave da API não configurada no servidor.' }, { status: 500 });
  }

  const searchParams = request.nextUrl.searchParams;
  const city = searchParams.get('city');
  const state = searchParams.get('state');
  const dayOffset = searchParams.get('dayOffset') || '0';

  if (!city) {
    return NextResponse.json({ error: 'Nome da cidade é obrigatório.' }, { status: 400 });
  }

  try {
    // 1. Obter geolocalização
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city},${state},BR&limit=1&appid=${API_KEY}`
    );
    const geoJson = await geoRes.json();
    if (!geoJson || geoJson.length === 0) {
      throw new Error(`Geolocalização não encontrada para ${city}`);
    }
    const { lat, lon } = geoJson[0];
    
    // 2. Buscar previsão com cache de 1 hora
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`,
      { next: { revalidate: 3600 } } 
    );
    const weatherJson: WeatherApiResponse = await weatherRes.json();
    
    // 3. PROCESSAR OS DADOS (A LÓGICA QUE FALTAVA)
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
    
    const processedData: WeatherInfo = {
      name: `${city}, ${state}`,
      max: Math.round(maxTemp),
      min: Math.round(minTemp),
      rain: parseFloat(totalRain.toFixed(2)),
      wind: Math.round(representativeForecast.wind.speed * 3.6),
      code: representativeForecast.weather[0].id,
      rainHours: fullDayRain,
    };

    // Retorna os dados já processados e no formato correto
    return NextResponse.json(processedData);

  } catch (error) {
    console.error(`Erro no backend para a cidade ${city}:`, error);
    // Retornamos um objeto com uma flag de erro para o frontend lidar
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}