// Tipagem da resposta da API OpenWeatherMap
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
  wind: number;
  code: number;
  rainHours: { hour: number; rain: number }[];
}