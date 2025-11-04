// app/api/cron/route.ts
import { NextResponse } from 'next/server';
import { INITIAL_CITIES } from '@/constants';

/**
 * Handles GET requests to the cron job API.
 * This endpoint is designed to be called by a cron job to warm up the weather cache
 * for the initial set of cities. It is protected by a secret key in production.
 * @param request - The incoming HTTP request.
 * @returns A JSON response indicating the success or failure of the cache warming process.
 */
export async function GET(request: Request) {
  // Protege a rota com o segredo
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Determina a URL base correta para ambiente local ou de produção
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  try {
    const results = await Promise.allSettled(
      INITIAL_CITIES.map(city => {
        const url = `${baseUrl}/api/weather?city=${encodeURIComponent(city.name)}&state=${city.state}&dayOffset=0`;
        console.log(`[CRON] Aquecendo cache para: ${city.name}, ${city.state}`);
        return fetch(url, { method: 'GET' });
      })
    );
    
    // Log para verificar os resultados
    results.forEach((result, index) => {
        const cityName = INITIAL_CITIES[index].name;
        if(result.status === 'fulfilled') {
            console.log(`[CRON] Sucesso para ${cityName}. Status: ${result.value.status}`);
        } else {
            console.error(`[CRON] Falha para ${cityName}:`, result.reason);
        }
    });

    return NextResponse.json({ success: true, message: 'Rotina de aquecimento de cache finalizada.' });

  } catch (error) {
    console.error('[CRON] Erro geral no job:', error);
    return NextResponse.json({ success: false, message: 'Erro interno ao executar o cron job...' }, { status: 500 });
  }
}