// const currencies: string[] = [];
// const names = {
//   en: {} as Record<string, string>,
// };
const cache = new Map<string, number>();
const cacheHistorico = new Map<string, number>();

interface ResponseData {
  [s: string]: {
    [s: string]: number;
  };
}



export async function getMoedas() {
  const res = await fetch(
    "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json"
  );
  if (!res.ok) {
    throw new Error("Falha ao carregar moedas");
  }
  const dados = (await res.json()) as Record<string, string>;
  return dados;
}

export async function getCambio(moedaDe: string, moedaPara: string) {
  const chave = moedaDe + "-" + moedaPara;
  if (cache.has(chave)) {
    return cache.get(chave);
  }

  const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${moedaDe}.json`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Falha na resposta da API");
  }

  const dados = (await res.json()) as ResponseData;
  
  // Atualiza o cache com todas as conversões disponíveis
  for (const moeda in dados[moedaDe]) {
    const cambio = dados[moedaDe][moeda];
    cache.set(moedaDe + "-" + moeda, cambio);
    cache.set(moeda + "-" + moedaDe, 1 / cambio);
  }

  return dados[moedaDe][moedaPara];
}

export async function getHistoricoCambio(moedaDe: string, moedaPara: string, data: string) {
  const chaveCache = `${moedaDe}-${moedaPara}-${data}`;
  
  // Verifica se os dados já estão em cache
  if (cacheHistorico.has(chaveCache)) {
    return cacheHistorico.get(chaveCache);
  }

  const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${data}/v1/currencies/${moedaDe}.json`;
  
  try {
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error("Falha ao carregar dados históricos");
    }
    
    const dados = await res.json();
    const taxa = dados[moedaDe]?.[moedaPara];
    
    if (taxa === undefined) {
      throw new Error("Taxa de câmbio não disponível para esta data");
    }
    
    // Armazena no cache antes de retornar
    cacheHistorico.set(chaveCache, taxa);
    return taxa;
    
  } catch (error) {
    console.error(`Erro ao buscar histórico para ${data}:`, error);
    throw error;
  }
}

export async function getHistoricoPeriodo(moedaDe: string, moedaPara: string, dias: number) {
  const datas = [];
  const hoje = new Date();
  
  // Gera array de datas para o período solicitado
  for (let i = 0; i < dias; i++) {
    const data = new Date(hoje);
    data.setDate(hoje.getDate() - i);
    const dataFormatada = data.toISOString().split('T')[0];
    datas.push(dataFormatada);
  }

  try {
    // Busca dados para todas as datas em paralelo
    const resultados = await Promise.all(
      datas.map(async (data) => {
        try {
          const taxa = await getHistoricoCambio(moedaDe, moedaPara, data);
          return {
            date: data,
            taxa: taxa
          };
        } catch (err) {
          console.error(`Erro para data ${data}:`, err);
          return {
            date: data,
            taxa: null,
            erro: err instanceof Error ? err.message : 'Erro desconhecido'
          };
        }
      })
    );

    return resultados;
    
  } catch (error) {
    console.error("Erro ao buscar histórico completo:", error);
    throw error;
  }
}