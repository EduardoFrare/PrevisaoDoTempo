// app/types/weather.ts

// Tipagem de uma API mais antiga, como OpenWeatherMap (mantida para referência)
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

// Tipagem dos nossos dados já processados e usados no app
export interface WeatherInfo {
  name: string;
  max: number;
  min: number;
  rain: number;
  rainProbability?: number;
  wind: number;
  code: number;
  rainHours: { hour: number; rain: number }[];
  currentTemperature?: number;
}

// Nova tipagem para as cidades, permitindo coordenadas opcionais
export interface City {
  name: string;
  state: string;
  lat?: number;
  lon?: number;
}