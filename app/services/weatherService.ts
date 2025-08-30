// app/services/weatherService.ts
import type { WeatherInfo } from "@/types/weather"; // CAMINHO CORRIGIDO

export async function fetchProcessedWeatherData(
  cities: { name: string; state: string }[],
  dayOffset: string
): Promise<{ [key: string]: WeatherInfo }> {
  const weatherPromises = cities.map(city =>
    fetch(`/api/weather?city=${city.name}&state=${city.state}&dayOffset=${dayOffset}`)
      .then(res => {
        if (!res.ok) {
          console.warn(`Falha ao buscar dados para ${city.name} do nosso backend.`);
          return null;
        }
        return res.json();
      })
      .then(data => ({ city, data }))
  );

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