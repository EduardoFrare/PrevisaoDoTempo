// app/api/aiagent/route.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import type { WeatherInfo } from "@/types/weather";
// 1. Importar o nosso cliente Redis
import { redis } from "@/lib/redis";

// 2. Definir o tempo de vida do cache (1800 segundos = 30 minutos)
const CACHE_TTL = 1800;

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

const getDayName = (offset: string): string => {
  const offsetNum = parseInt(offset, 10);
  if (offsetNum === 0) return "hoje";
  if (offsetNum === 1) return "amanhã";

  const date = new Date();
  date.setDate(date.getDate() + offsetNum);
  const dayOfWeek = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(date);
  return `para ${dayOfWeek}`;
};

export async function POST(request: Request) {
  try {
    const { weatherData, dayOffset } = (await request.json()) as { 
      weatherData: WeatherInfo[],
      dayOffset: string 
    };
    
    if (!weatherData || weatherData.length === 0) {
      return NextResponse.json({ message: "Dados do tempo não fornecidos." }, { status: 400 });
    }

    // --- NOVA LÓGICA DE CACHE ---

    // 3. Criar uma chave de cache única baseada nas cidades e no dia
    const cityNames = weatherData.map(city => city.name).sort().join('-');
    const cacheKey = `summary:${cityNames}:${dayOffset}`;

    // 4. Tentar buscar o resumo do cache primeiro
    const cachedSummary = await redis.get<string>(cacheKey);
    if (cachedSummary) {
      console.log(`[AI AGENT] Retornando resumo do cache para a chave: ${cacheKey}`);
      return NextResponse.json({ summary: cachedSummary });
    }

    console.log(`[AI AGENT] Cache não encontrado para a chave: ${cacheKey}. Gerando novo resumo.`);
    // --- FIM DA LÓGICA DE CACHE ---

    const dayName = getDayName(dayOffset || "0");

    const prompt = `
      Você é um assistente de logística amigável e direto para um app de delivery.
      Sua tarefa é analisar os dados de previsão do tempo e criar um briefing para a equipe.
      REGRAS ESTRITAS DE FORMATAÇÃO:
      1. Comece a sua resposta EXATAMENTE com o seguinte cabeçalho: "Olá! Para ${dayName}, temos a seguinte situação:"
      2. NÃO use nenhum outro título ou introdução.
      3. NÃO use marcadores de lista como asteriscos (*) ou hifens (-).
      4. Separe os pontos principais com uma linha em branco para criar parágrafos distintos.
      5. Mantenha um tom conversacional, mas profissional.
      FOCO DA ANÁLISE:
      - **Pontos de Atenção:** Identifique cidades com condições adversas (chuva forte, ventos acima de 40 km/h, etc.) e explique o impacto prático (ex: "Atenção em [Cidade], a chuva pode causar lentidão no trânsito.").
      - **Condições Ideais:** Se a maioria das cidades estiver com tempo bom, mencione isso de forma positiva (ex: "No geral, o dia está excelente para as entregas...").
      - **Recomendação Final:** Termine com uma recomendação clara e curta para a equipe.
      Aqui estão os dados:
      ${JSON.stringify(weatherData, null, 2)}
    `;

    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-1.5-flash",
    ];

    let summary: string | null = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[AI AGENT] Tentando usar o modelo: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        if (text) {
          summary = text;
          console.log(`[AI AGENT] Sucesso com o modelo: ${modelName}`);
          break; 
        }
      } catch (error) {
        console.warn(`[AI AGENT] Falha ao usar o modelo ${modelName}. Tentando o próximo...`);
      }
    }

    if (summary) {
      // 5. Salvar o novo resumo no cache antes de retornar
      await redis.set(cacheKey, summary, { ex: CACHE_TTL });
      console.log(`[AI AGENT] Novo resumo salvo no cache por ${CACHE_TTL} segundos.`);
      return NextResponse.json({ summary });
    } else {
      console.error("[AI AGENT] Todos os modelos da lista de fallback falharam.");
      return NextResponse.json({ message: "O serviço de IA está indisponível no momento. Tente novamente mais tarde." }, { status: 503 });
    }

  } catch (error) {
    console.error("Erro geral na rota /api/aiagent:", error);
    return NextResponse.json({ message: "Erro ao processar a requisição." }, { status: 500 });
  }
}