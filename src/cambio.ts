// const currencies: string[] = [];
// const names = {
//   en: {} as Record<string, string>,
// };
const cache = new Map<string, number>();

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
  for (const moeda in dados[moedaDe]) {
    const cambio = dados[moedaDe][moeda];
    cache.set(moedaDe + "-" + moeda, cambio);
    cache.set(moeda + "-" + moedaDe, 1 / cambio);
  }

  return dados[moedaDe][moedaPara];
}
