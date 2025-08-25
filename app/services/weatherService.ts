import type { WeatherInfo } from "@/types/weather";

// Agora esta função chama o NOSSO backend, não mais a API externa
export async function fetchProcessedWeatherData(
  cities: { name: string; state: string }[],
  dayOffset: string
): Promise<{ [key: string]: WeatherInfo }> {
  
  const results: { [key: string]: WeatherInfo } = {};

  for (const city of cities) {
    // Chama o nosso endpoint /api/weather para cada cidade
    const response = await fetch(`/api/weather?city=${city.name}&state=${city.state}&dayOffset=${dayOffset}`);
    
    if (!response.ok) {
      console.warn(`Falha ao buscar dados para ${city.name} do nosso backend.`);
      continue;
    }

    // O backend já deve retornar os dados processados e cacheados!
    const processedData: WeatherInfo = await response.json();
    results[`${city.name}, ${city.state}`] = processedData;
  }
  
  return results;
}