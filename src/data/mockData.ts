export interface FilterState {
  mes: string;
  tipoContrato: string;
  tipoImovel: string;
  bairro: string;
}

export const MESES = [
  "Todos", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export const TIPOS_CONTRATO = ["Todos", "Locação", "Venda"];
export const TIPOS_IMOVEL = ["Todos", "Casa", "Apartamento", "Terreno", "Ponto Comercial", "Sala Comercial", "Galpão"];
export const BAIRROS = [
  "Todos", "Ponta Verde", "Jatiúca", "Pajuçara", "Mangabeiras",
  "Farol", "Benedito Bentes", "Stella Maris", "Cruz das Almas",
  "Gruta de Lourdes", "Serraria"
];

export interface ContratoData {
  mes: string;
  mesIndex: number;
  tipoContrato: string;
  tipoImovel: string;
  bairro: string;
  regiao: string;
  valor: number;
  comissao: number;
}

const regiaoMap: Record<string, string> = {
  "Ponta Verde": "Orla",
  "Jatiúca": "Orla",
  "Pajuçara": "Orla",
  "Mangabeiras": "Centro-Sul",
  "Farol": "Centro",
  "Benedito Bentes": "Periferia",
  "Stella Maris": "Litoral Norte",
  "Cruz das Almas": "Centro-Sul",
  "Gruta de Lourdes": "Centro",
  "Serraria": "Periferia",
};

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateMockData(): ContratoData[] {
  const data: ContratoData[] = [];
  const meses = MESES.slice(1);
  const tipos = TIPOS_CONTRATO.slice(1);
  const imoveis = TIPOS_IMOVEL.slice(1);
  const bairros = BAIRROS.slice(1);

  for (let i = 0; i < 200; i++) {
    const mesIndex = Math.floor(Math.random() * 12);
    const bairro = randomChoice(bairros);
    const tipoContrato = randomChoice(tipos);
    const baseValor = tipoContrato === "Venda" ? 150000 + Math.random() * 500000 : 1500 + Math.random() * 8000;
    const comissaoRate = tipoContrato === "Venda" ? 0.05 : 0.1;

    data.push({
      mes: meses[mesIndex],
      mesIndex,
      tipoContrato,
      tipoImovel: randomChoice(imoveis),
      bairro,
      regiao: regiaoMap[bairro],
      valor: Math.round(baseValor * 100) / 100,
      comissao: Math.round(baseValor * comissaoRate * 100) / 100,
    });
  }
  return data;
}

export const MOCK_DATA = generateMockData();

export function filterData(data: ContratoData[], filters: FilterState): ContratoData[] {
  return data.filter((d) => {
    if (filters.mes !== "Todos" && d.mes !== filters.mes) return false;
    if (filters.tipoContrato !== "Todos" && d.tipoContrato !== filters.tipoContrato) return false;
    if (filters.tipoImovel !== "Todos" && d.tipoImovel !== filters.tipoImovel) return false;
    if (filters.bairro !== "Todos" && d.bairro !== filters.bairro) return false;
    return true;
  });
}
