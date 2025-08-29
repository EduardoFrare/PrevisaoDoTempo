// app/services/weatherService.ts (Solução)
import type { WeatherInfo } from "@/types/weather";

export async function fetchProcessedWeatherData(
  cities: { name: string; state: string }[],
  dayOffset: string
): Promise<{ [key: string]: WeatherInfo }> {

  // 1. Cria um array de Promises, uma para cada requisição
  const weatherPromises = cities.map(city =>
    fetch(`/api/weather?city=${city.name}&state=${city.state}&dayOffset=${dayOffset}`)
      .then(res => {
        if (!res.ok) {
          // Loga o erro mas não quebra a aplicação inteira
          console.warn(`Falha ao buscar dados para ${city.name} do nosso backend.`);
          return null; 
        }
        return res.json();
      })
      .then(data => ({ city, data })) // Passa a cidade junto com os dados
  );

  // 2. Executa todas as Promises em paralelo
  const results = await Promise.all(weatherPromises);

  // 3. Monta o objeto de resultados
  const weatherData: { [key: string]: WeatherInfo } = {};
  results.forEach(result => {
    if (result && result.data) {
      weatherData[`${result.city.name}, ${result.city.state}`] = result.data;
    }
  });

  return weatherData;
}