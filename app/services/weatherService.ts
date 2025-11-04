// app/services/weatherService.ts
import type { WeatherInfo, City } from "@/types/weather";

export async function fetchProcessedWeatherData(
  cities: City[],
  dayOffset: string
): Promise<{ [key: string]: WeatherInfo }> {
  const weatherPromises = cities.map(city => {
    let url = `/api/weather?city=${city.name}&state=${city.state}&dayOffset=${dayOffset}`;
    if (city.lat && city.lon) {
      url += `&lat=${city.lat}&lon=${city.lon}`;
    }

    return fetch(url)
      .then(res => {
        if (!res.ok) {
          console.warn(`Falha ao buscar dados para ${city.name} do nosso backend.`);
          return null;
        }
        return res.json();
      })
      .then(data => ({ city, data }));
  });

  const results = await Promise.all(weatherPromises);

  const weatherData: { [key: string]: WeatherInfo } = {};
  results.forEach(result => {
    if (result && result.data) {
      weatherData[`${result.city.name}, ${result.city.state}`] = result.data;
    }
  });

  return weatherData;
}

export const getWeatherDescription = (code: number) => {
  const weatherCodes: { [key: number]: string } = {
    0: 'Céu limpo',
    1: 'Principalmente limpo',
    2: 'Parcialmente nublado',
    3: 'Nublado',
    45: 'Nevoeiro',
    48: 'Nevoeiro com geada',
    51: 'Chuvisco leve',
    53: 'Chuvisco moderado',
    55: 'Chuvisco denso',
    56: 'Chuvisco gelado leve',
    57: 'Chuvisco gelado denso',
    61: 'Chuva fraca',
    63: 'Chuva moderada',
    65: 'Chuva forte',
    66: 'Chuva gelada leve',
    67: 'Chuva gelada forte',
    71: 'Neve fraca',
    73: 'Neve moderada',
    75: 'Neve forte',
    77: 'Grãos de neve',
    80: 'Pancadas de chuva fracas',
    81: 'Pancadas de chuva moderadas',
    82: 'Pancadas de chuva violentas',
    85: 'Pancadas de neve fracas',
    86: 'Pancadas de neve fortes',
    95: 'Trovoada',
    96: 'Trovoada com granizo fraco',
    99: 'Trovoada com granizo forte',
  };
  return weatherCodes[code] || 'Condição desconhecida';
};

export async function fetchAndProcessWeatherData(
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
        currentTemperature: offset === 0 ? Math.round(weatherJson.current.temperature_2m) : undefined,
    };
}
