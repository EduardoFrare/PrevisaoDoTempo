export interface City {
  name: string;
  state: string;
  latitude: number; // Latitude é opcional
  longitude: number; // Longitude é opcional
}

export const INITIAL_CITIES: City[] = [
  { name: 'Chapeco', state: 'SC', latitude: -27.10, longitude: -52.61 },
  { name: 'Passo Fundo', state: 'RS', latitude: -28.26, longitude: -52.40 },
  { name: 'Erechim', state: 'RS', latitude: -27.63, longitude: -52.27 },
  { name: 'Carazinho', state: 'RS', latitude: -28.28, longitude: -52.78 },
  { name: 'Santo Angelo', state: 'RS', latitude: -28.30, longitude: -54.26 },
  { name: "Santa Rosa", state: "RS", latitude: -27.8725, longitude: -54.4703 }, 
  { name: 'Lages', state: 'SC', latitude: -27.81, longitude: -50.32 },
  { name: 'Ijui', state: 'RS', latitude: -28.38, longitude: -53.91 },
  { name: 'Vacaria', state: 'RS', latitude: -28.51, longitude: -50.93 },
  { name: 'Concordia', state: 'SC', latitude: -27.23, longitude: -52.02 },
  { name: 'Joaçaba', state: 'SC', latitude: -27.18, longitude: -51.50 },
];
