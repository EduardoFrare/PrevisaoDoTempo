// app/types/weather.ts

// Tipagem da resposta da API OpenWeatherMap (mantida para referência, se usada em outro lugar)
export interface ForecastItem {
  dt: number;
  dt_txt: string;
  main: {
    temp_max: number;
    temp_min: number;
  };
  weather: {
    id: number;
  }[];
  wind: {
    speed: number;
  };
  rain?: {
    "3h"?: number;
  };
}

export interface WeatherApiResponse {
  cod: string;
  list: ForecastItem[];
  city: {
    timezone: number;
  };
}

// Tipagem dos nossos dados já processados
export interface WeatherInfo {
  name: string;
  max: number;
  min: number;
  rain: number;
  rainProbability?: number; // ADICIONADO: Nova propriedade opcional
  wind: number;
  code: number;
  rainHours: { hour: number; rain: number }[];
  currentTemperature?: number;
}