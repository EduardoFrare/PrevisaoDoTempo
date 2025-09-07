export interface City {
  name: string;
  state: string;
  lat?: number; // Latitude é opcional
  lon?: number; // Longitude é opcional
}

export const INITIAL_CITIES: City[] = [
  { name: 'Chapeco', state: 'SC', lat: -27.10, lon: -52.61 },
  { name: 'Passo Fundo', state: 'RS', lat: -28.26, lon: -52.40 },
  { name: 'Erechim', state: 'RS', lat: -27.63, lon: -52.27 },
  { name: 'Carazinho', state: 'RS', lat: -28.28, lon: -52.78 },
  { name: 'Santo Angelo', state: 'RS', lat: -28.30, lon: -54.26 },
  { name: 'Santa Rosa', state: 'RS', lat: -27.87, lon: -54.48 }, 
  { name: 'Lages', state: 'SC', lat: -27.81, lon: -50.32 },
  { name: 'Ijui', state: 'RS', lat: -28.38, lon: -53.91 },
  { name: 'Vacaria', state: 'RS', lat: -28.51, lon: -50.93 },
  { name: 'Concordia', state: 'SC', lat: -27.23, lon: -52.02 },
  { name: 'Joaçaba', state: 'SC', lat: -27.18, lon: -51.50 },
];