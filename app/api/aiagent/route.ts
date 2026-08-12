import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import type { WeatherInfo } from "@/types/weather";
import { redis } from "@/lib/redis";

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

// CORREÇÃO: A função agora usa apenas os nomes das cidades para criar a chave,
// garantindo que ela seja consistente para o mesmo conjunto de cidades.
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
      Você é um assistente de logística sênior de um app de delivery, especialista em interpretar dados meteorológicos para otimizar a operação de motoboys. Sua análise deve ser pragmática, rápida de ler e focada na segurança e disponibilidade da frota.

      **Regras de Classificação e Agrupamento (MUITO IMPORTANTE):**
      - **CHUVA:** 
        * < 2.0 mm/h: Chuva Fraca (Atenção na pista)
        * 2.0 a 10.0 mm/h: Chuva Moderada (Risco de atrasos)
        * > 10.0 mm/h: Chuva Forte (PREOCUPANTE, risco de acidentes/alagamentos)
      - **VENTO:** Rajadas acima de 40 km/h são PREOCUPANTES.
      - **TEMPERATURA:** Destaque a Máxima e a Mínima. Máximas abaixo de 10°C são PREOCUPANTES pelo risco de hipotermia.
      - **AGRUPAMENTO DE HORÁRIOS:** NUNCA liste as horas uma por uma (ex: não escreva 1h, 2h, 3h). Agrupe em períodos contínuos! Use termos como "durante a madrugada", "manhã (entre 8h e 12h)", "pancadas ao longo da tarde". 
      - Não coloque os milímetros exatos na resposta final, apenas a classificação (Fraca, Moderada ou Forte).

      **Estrutura OBRIGATÓRIA da Resposta:**
      Olá! Para ${dayName}, a análise para a frota é a seguinte:

      Resumo geral do dia em 1 ou 2 frases, focando no impacto para as entregas.

      Cidades Preocupantes:
      [Liste a cidade. Cite o motivo exato, os PERÍODOS críticos da chuva/vento e as temperaturas Máx/Mín. Vá direto ao ponto.]

      Cidades para Ficar de Olho:
      [Liste a cidade. Cite os PERÍODOS previstos para a chuva ou ventos e as temperaturas Máx/Mín. Vá direto ao ponto.]

      Regras de formatação:
      - Se não houver cidades em uma categoria, não escreva o título dela.
      - Use apenas parágrafos curtos, sem marcadores como asteriscos (*) ou hifens (-).

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
