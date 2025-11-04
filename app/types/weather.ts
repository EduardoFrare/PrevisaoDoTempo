// app/types/weather.ts

/**
 * Represents a single forecast item from an older weather API (e.g., OpenWeatherMap).
 * This is kept for reference.
 * @deprecated
 */
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

/**
 * Represents the response from an older weather API (e.g., OpenWeatherMap).
 * This is kept for reference.
 * @deprecated
 */
export interface WeatherApiResponse {
  cod: string;
  list: ForecastItem[];
  city: {
    timezone: number;
  };
}

/**
 * Represents the processed weather information used throughout the application.
 */
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
  lat?: number;
  lon?: number;
}

/**
 * Represents a city with its name, state, and optional coordinates.
 */
export interface City {
  name: string;
  state: string;
  lat?: number;
  lon?: number;
}