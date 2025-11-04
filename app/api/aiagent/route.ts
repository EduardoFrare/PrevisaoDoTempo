import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import type { WeatherInfo } from "@/types/weather";
import { redis } from "@/lib/redis";

const CACHE_TTL = 1800;
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

/**
 * Gets the name of the day based on an offset from the current date.
 * @param offset - The number of days from today (0 for today, 1 for tomorrow, etc.).
 * @returns The name of the day (e.g., "hoje", "amanhã", "para segunda-feira").
 */
const getDayName = (offset: string): string => {
  const offsetNum = parseInt(offset, 10);
  if (offsetNum === 0) return "hoje";
  if (offsetNum === 1) return "amanhã";

  const date = new Date();
  date.setDate(date.getDate() + offsetNum);
  const dayOfWeek = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(date);
  return `para ${dayOfWeek}`;
};

/**
 * Creates a unique fingerprint for a set of weather data based on city names.
 * This ensures that the same set of cities always produces the same fingerprint.
 * @param data - An array of weather information objects.
 * @returns A string representing the unique fingerprint of the data.
 */
const createDataFingerprint = (data: WeatherInfo[]): string => {
  // Extrai os nomes das cidades, ordena para garantir a mesma ordem sempre,
  // e junta em uma string única.
  const cityNames = data.map(cityInfo => cityInfo.name).sort().join(',');

  // O resto da lógica para gerar o checksum a partir da string de nomes.
  let checksum = 0;
  for (let i = 0; i < cityNames.length; i++) {
    checksum = (checksum + cityNames.charCodeAt(i) * (i + 1)) % 1000000;
  }
  return checksum.toString();
};

/**
 * Handles POST requests to the AI agent API.
 * It generates a weather summary using Google's Generative AI and caches the result.
 * @param request - The incoming HTTP request.
 * @returns A JSON response with the AI-generated summary or an error message.
 */
export async function POST(request: Request) {
  try {
    const { weatherData, dayOffset } = (await request.json()) as {
      weatherData: WeatherInfo[],
      dayOffset: string
    };
    
    if (!weatherData || weatherData.length === 0) {
      return NextResponse.json({ message: "Dados do tempo não fornecidos." }, { status: 400 });
    }

    // Nenhuma mudança necessária aqui, a função já foi corrigida acima.
    const dataFingerprint = createDataFingerprint(weatherData);
    const cacheKey = `summary:${dayOffset}:${dataFingerprint}`;

    const cachedData = await redis.get<{ summary: string, modelUsed: string }>(cacheKey);
    if (cachedData) {
      console.log(`[AI AGENT] Retornando dados do cache para a chave: ${cacheKey}`);
      return NextResponse.json(cachedData);
    }

    console.log(`[AI AGENT] Cache não encontrado para a chave: ${cacheKey}. Gerando novo resumo.`);

    const dayName = getDayName(dayOffset || "0");

    const prompt = `
      Você é um assistente de logística sênior para um app de delivery, especialista em interpretar dados meteorológicos para otimizar a operação de motoboys. Sua análise deve ser pragmática e focada na segurança, eficiência e preocupação com a quantidade de entregadores.

      **Análise Crítica (O que impede um motoboy de trabalhar):**
      - **CHUVA:** Uma combinação de alta probabilidade (>70%) e volume significativo (>5mm) é PREOCUPANTE. Chuva moderada (entre 2-5mm) ou qualquer chuva com probabilidade acima de 40% são condições para FICAR DE OLHO.
      - **VENTO:** Ventos constantes ou rajadas acima de 40 km/h são PREOCUPANTES. Ventos entre 25-39 km/h são para FICAR DE OLHO.
      - **FRIO:** Uma temperatura MÁXIMA abaixo de 10°C é PREOCUPANTE, especialmente se combinado com chuva ou vento, pois aumenta o risco de hipotermia e desconforto extremo.

      **Estrutura da Resposta:**
      1.  Comece EXATAMENTE com o cabeçalho: "Olá! Para ${dayName}, a análise para a frota é a seguinte:"
      2.  Faça um breve resumo geral do dia (1-2 frases).
      3.  Crie a seção "Cidades Preocupantes". Liste as cidades que se encaixam nos critérios PREOCUPANTES e explique o motivo de forma direta (ex: "Chapecó, SC: Risco de chuva forte e contínua, visibilidade reduzida e pista escorregadia."). Se não houver nenhuma, ignore essa etapa.
      4.  Crie a seção "Cidades para Ficar de Olho". Liste as cidades com condições moderadas que exigem atenção e explique o motivo (ex: "Passo Fundo, RS: Vento moderado no final da tarde, pode afetar o equilíbrio e a estabilidade."). Se não houver nenhuma, ignore essa etapa.
      5.  Se ignorou as duas etapas acima, fale que ta tudo tranquilo.
      6.  NÃO use nenhum outro formato. NÃO use asteriscos (*) ou hifens (-). Use parágrafos e quebras de linha.

      Aqui estão os dados brutos:
      ${JSON.stringify(weatherData, null, 2)}
    `;

    const modelsToTry = [
      "gemini-2.5-pro",
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-1.5-flash",
    ];

    let summary: string | null = null;
    let modelUsed: string | null = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[AI AGENT] Tentando usar o modelo: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        if (text) {
          summary = text;
          modelUsed = modelName;
          console.log(`[AI AGENT] Sucesso com o modelo: ${modelName}`);
          break; 
        }
      } catch (error) { 
        console.warn(`[AI AGENT] Falha ao usar o modelo ${modelName}. Tentando o próximo...`, error);
      }
    }

    if (summary && modelUsed) {
      const responseData = { summary, modelUsed };
      await redis.set(cacheKey, JSON.stringify(responseData), { ex: CACHE_TTL });
      console.log(`[AI AGENT] Novo resumo salvo no cache por ${CACHE_TTL} segundos.`);
      return NextResponse.json(responseData);
    } else {
      console.error("[AI AGENT] Todos os modelos da lista de fallback falharam.");
      return NextResponse.json({ message: "O serviço de IA está indisponível no momento. Tente novamente mais tarde." }, { status: 503 });
    }

  } catch (error) { 
    console.error("Erro geral na rota /api/aiagent:", error);
    return NextResponse.json({ message: "Erro ao processar a requisição." }, { status: 500 });
  }
}