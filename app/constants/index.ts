import { City } from '../types/weather';

export const GO_CITIES: City[] = [
  { name: 'Chapeco', state: 'SC', lat: -27.10, lon: -52.61, groups: ['GO', 'OFERTAS'] },
  { name: 'Passo Fundo', state: 'RS', lat: -28.26, lon: -52.40, groups: ['GO', 'OFERTAS'] },
  { name: 'Erechim', state: 'RS', lat: -27.63, lon: -52.27, groups: ['GO', 'OFERTAS'] },
  { name: 'Carazinho', state: 'RS', lat: -28.28, lon: -52.78, groups: ['GO', 'OFERTAS'] },
  { name: 'Santo Angelo', state: 'RS', lat: -28.30, lon: -54.26, groups: ['GO', 'OFERTAS'] },
  { name: 'Santa Rosa', state: 'RS', lat: -27.8725, lon: -54.4703, groups: ['GO', 'OFERTAS'] },
  { name: 'Lages', state: 'SC', lat: -27.81, lon: -50.32, groups: ['GO', 'OFERTAS'] },
  { name: 'Vacaria', state: 'RS', lat: -28.51, lon: -50.93, groups: ['GO', 'OFERTAS'] },
  { name: 'Concordia', state: 'SC', lat: -27.23, lon: -52.02, groups: ['GO', 'OFERTAS'] },
];

export const OFERTAS_EXTRA_CITIES: City[] = [
  { name: 'Ijui', state: 'RS', lat: -28.38, lon: -53.91, groups: ['OFERTAS'] },
  { name: 'Joaçaba', state: 'SC', lat: -27.18, lon: -51.50, groups: ['OFERTAS'] },
  { name: 'Campos Novos', state: 'SC', lat: -27.40, lon: -51.22, groups: ['OFERTAS'] },
  { name: 'Panambi', state: 'RS', lat: -28.23, lon: -53.50, groups: ['OFERTAS'] },
  { name: 'Indaial', state: 'SC', lat: -26.90, lon: -49.23, groups: ['OFERTAS'] },
  { name: 'Criciuma', state: 'SC', lat: -28.68, lon: -49.37, groups: ['OFERTAS'] },
  { name: 'Pinhalzinho', state: 'SC', lat: -26.84, lon: -52.99, groups: ['OFERTAS'] },
  { name: 'Maravilha', state: 'SC', lat: -26.76, lon: -53.17, groups: ['OFERTAS'] },
  { name: 'Sarandi', state: 'RS', lat: -27.94, lon: -52.92, groups: ['OFERTAS'] },
  { name: 'Xaxim', state: 'SC', lat: -26.96, lon: -52.53, groups: ['OFERTAS'] },
  { name: 'Xanxere', state: 'SC', lat: -26.87, lon: -52.40, groups: ['OFERTAS'] },
  { name: 'Araraquara', state: 'SP', lat: -21.79, lon: -48.17, groups: ['OFERTAS'] },
];

export const INITIAL_CITIES: City[] = [...GO_CITIES, ...OFERTAS_EXTRA_CITIES];
