import React, { createContext, useContext, useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

// ---- Types ----
export interface Imovel {
  id: string;
  endereco: string;
  cep: string;
  bairro: string;
  cidade: string;
  complemento: string;
  tipo: string;
  valor: number;
  status: "Disponível" | "Vendido" | "Alugado";
  criadoEm: string;
  ultimaVisita: string;
  fotoUrl: string;
}

export type ContratoEtapa = "Proposta" | "Documentação" | "Assinatura" | "Concluído";

export interface ContratoNota {
  id: string;
  texto: string;
  data: string;
}

export interface Contrato {
  id: string;
  imovelId: string;
  clienteId: string;
  tipo: "Locação" | "Venda";
  valorTotal: number;
  comissaoPercent: number;
  dataInicio: string;
  dataFim: string;
  etapa: ContratoEtapa;
  notas: ContratoNota[];
  dataRecebimento: string;
  comissaoPaga: boolean;
  documentoUrl: string;
}

export interface ClientePreferencia {
  tipoImovel: string;
  bairro: string;
  valorMax: number;
}

export interface Cliente {
  id: string;
  nome: string;
  contato: string;
  cpfCnpj: string;
  interesses: string[];
  preferencia?: ClientePreferencia;
}

export interface MatchAlerta {
  clienteId: string;
  clienteNome: string;
  imovelId: string;
  imovelEndereco: string;
  imovelBairro: string;
  imovelTipo: string;
  imovelValor: number;
}

interface DataContextType {
  imoveis: Imovel[];
  contratos: Contrato[];
  clientes: Cliente[];
  addImovel: (i: Omit<Imovel, "id">) => void;
  updateImovel: (i: Imovel) => void;
  deleteImovel: (id: string) => void;
  addContrato: (c: Omit<Contrato, "id">) => void;
  updateContrato: (c: Contrato) => void;
  deleteContrato: (id: string) => void;
  addCliente: (c: Omit<Cliente, "id">) => void;
  updateCliente: (c: Cliente) => void;
  deleteCliente: (id: string) => void;
  getMatches: () => MatchAlerta[];
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
};

// ---- Helpers ----
const uid = () => Math.random().toString(36).slice(2, 10);

const BAIRROS_LIST = ["Ponta Verde", "Jatiúca", "Pajuçara", "Mangabeiras", "Farol", "Benedito Bentes", "Stella Maris", "Cruz das Almas", "Gruta de Lourdes", "Serraria"];
const TIPOS_IMOVEL = ["Casa", "Apartamento", "Terreno", "Ponto Comercial", "Sala Comercial", "Galpão"];
const FOTOS_IMOVEL: Record<string, string> = {
  Casa: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=200&h=150&fit=crop",
  Apartamento: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200&h=150&fit=crop",
  Terreno: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&h=150&fit=crop",
  "Ponto Comercial": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=150&fit=crop",
  "Sala Comercial": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=150&fit=crop",
  "Galpão": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200&h=150&fit=crop",
};
const NOMES = ["Ana Silva", "Carlos Mendes", "Fernanda Oliveira", "José Santos", "Maria Costa", "Pedro Lima", "Juliana Alves", "Roberto Souza", "Camila Pereira", "Lucas Rocha", "Patrícia Martins", "Bruno Ferreira", "Raquel Nunes", "Thiago Barbosa", "Beatriz Gomes"];
const RUAS = ["Rua do Sol", "Av. Álvaro Otacílio", "Rua Jangadeiros Alagoanos", "Av. Gustavo Paiva", "Rua Cel. Antônio Cândido", "Rua Dr. Antônio Gouveia", "Av. Fernandes Lima", "Rua Barão de Penedo", "Rua Dep. José Lages", "Av. Comendador Gustavo Paiva"];
const ETAPAS: ContratoEtapa[] = ["Proposta", "Documentação", "Assinatura", "Concluído"];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function generateInitialData() {
  const clientes: Cliente[] = NOMES.map((nome, i) => ({
    id: `cli-${i}`,
    nome,
    contato: `(82) 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
    cpfCnpj: `${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}`,
    interesses: [pick(TIPOS_IMOVEL), pick(BAIRROS_LIST)],
    preferencia: Math.random() > 0.3 ? {
      tipoImovel: pick(TIPOS_IMOVEL),
      bairro: pick(BAIRROS_LIST),
      valorMax: Math.round(200000 + Math.random() * 600000),
    } : undefined,
  }));

  const imoveis: Imovel[] = [];
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const tipo = pick(TIPOS_IMOVEL);
    const isVenda = Math.random() > 0.5;
    const hoursAgo = Math.floor(Math.random() * 200);
    const criadoEm = new Date(now.getTime() - hoursAgo * 3600000).toISOString();
    const visitaDaysAgo = Math.floor(Math.random() * 30);
    const ultimaVisita = visitaDaysAgo < 20 ? new Date(now.getTime() - visitaDaysAgo * 86400000).toISOString() : "";
    imoveis.push({
      id: `imo-${i}`,
      endereco: `${pick(RUAS)}, ${Math.floor(10 + Math.random() * 2000)}`,
      cep: `57${Math.floor(10 + Math.random() * 90)}${Math.floor(100 + Math.random() * 900)}`,
      bairro: pick(BAIRROS_LIST),
      cidade: "Maceió",
      complemento: i % 3 === 0 ? `Apto ${Math.floor(100 + Math.random() * 900)}` : "",
      tipo,
      valor: isVenda ? Math.round(150000 + Math.random() * 500000) : Math.round(1500 + Math.random() * 8000),
      status: pick(["Disponível", "Vendido", "Alugado"] as const),
      criadoEm,
      ultimaVisita,
      fotoUrl: FOTOS_IMOVEL[tipo] || "",
    });
  }

  const contratos: Contrato[] = [];
  const meses2025 = Array.from({ length: 12 }, (_, i) => {
    const m = (i + 1).toString().padStart(2, "0");
    return { start: `2025-${m}-01`, end: `2025-${m}-28` };
  });

  const notasExemplo = [
    "Cliente solicitou desconto na entrada",
    "Aguardando vistoria do banco",
    "Documentação enviada para análise",
    "Cliente pediu prazo maior",
    "Certidão negativa solicitada",
  ];

  for (let i = 0; i < 60; i++) {
    const imovel = pick(imoveis);
    const cliente = pick(clientes);
    const tipo = imovel.status === "Alugado" ? "Locação" as const : imovel.status === "Vendido" ? "Venda" as const : pick(["Locação", "Venda"] as const);
    const mesData = pick(meses2025);
    const comissaoPercent = tipo === "Venda" ? 5 : 10;
    const etapa = pick(ETAPAS);
    const numNotas = Math.floor(Math.random() * 3);
    const notas: ContratoNota[] = Array.from({ length: numNotas }, (_, j) => ({
      id: uid(),
      texto: pick(notasExemplo),
      data: new Date(now.getTime() - Math.floor(Math.random() * 30) * 86400000).toISOString(),
    }));

    contratos.push({
      id: `con-${i}`,
      imovelId: imovel.id,
      clienteId: cliente.id,
      tipo,
      valorTotal: imovel.valor,
      comissaoPercent,
      dataInicio: mesData.start,
      dataFim: mesData.end,
      etapa,
      notas,
      dataRecebimento: etapa === "Concluído" ? mesData.end : "",
      comissaoPaga: etapa === "Concluído" && Math.random() > 0.4,
      documentoUrl: etapa === "Concluído" || etapa === "Assinatura" ? "https://drive.google.com/example" : "",
    });
  }

  return { clientes, imoveis, contratos };
}

// ---- Provider ----
export function DataProvider({ children }: { children: React.ReactNode }) {
  const [initial] = useState(generateInitialData);
  const [imoveis, setImoveis] = useState<Imovel[]>(initial.imoveis);
  const [contratos, setContratos] = useState<Contrato[]>(initial.contratos);
  const [clientes, setClientes] = useState<Cliente[]>(initial.clientes);

  const addImovel = useCallback((i: Omit<Imovel, "id">) => {
    setImoveis((prev) => [...prev, { ...i, id: uid() }]);
    toast({ title: "Imóvel cadastrado", description: "Registro salvo com sucesso." });
  }, []);
  const updateImovel = useCallback((i: Imovel) => {
    setImoveis((prev) => prev.map((x) => (x.id === i.id ? i : x)));
    toast({ title: "Imóvel atualizado", description: "Alterações salvas." });
  }, []);
  const deleteImovel = useCallback((id: string) => {
    setImoveis((prev) => prev.filter((x) => x.id !== id));
    toast({ title: "Imóvel excluído", description: "Registro removido." });
  }, []);

  const addContrato = useCallback((c: Omit<Contrato, "id">) => {
    setContratos((prev) => [...prev, { ...c, id: uid() }]);
    toast({ title: "Contrato cadastrado", description: "Registro salvo com sucesso." });
  }, []);
  const updateContrato = useCallback((c: Contrato) => {
    setContratos((prev) => prev.map((x) => (x.id === c.id ? c : x)));
    toast({ title: "Contrato atualizado", description: "Alterações salvas." });
  }, []);
  const deleteContrato = useCallback((id: string) => {
    setContratos((prev) => prev.filter((x) => x.id !== id));
    toast({ title: "Contrato excluído", description: "Registro removido." });
  }, []);

  const addCliente = useCallback((c: Omit<Cliente, "id">) => {
    setClientes((prev) => [...prev, { ...c, id: uid() }]);
    toast({ title: "Cliente cadastrado", description: "Registro salvo com sucesso." });
  }, []);
  const updateCliente = useCallback((c: Cliente) => {
    setClientes((prev) => prev.map((x) => (x.id === c.id ? c : x)));
    toast({ title: "Cliente atualizado", description: "Alterações salvas." });
  }, []);
  const deleteCliente = useCallback((id: string) => {
    setClientes((prev) => prev.filter((x) => x.id !== id));
    toast({ title: "Cliente excluído", description: "Registro removido." });
  }, []);

  const getMatches = useCallback((): MatchAlerta[] => {
    const disponíveis = imoveis.filter((i) => i.status === "Disponível");
    const matches: MatchAlerta[] = [];
    for (const cliente of clientes) {
      if (!cliente.preferencia) continue;
      const { tipoImovel, bairro, valorMax } = cliente.preferencia;
      for (const imovel of disponíveis) {
        const tipoMatch = !tipoImovel || tipoImovel === imovel.tipo;
        const bairroMatch = !bairro || bairro === imovel.bairro;
        const valorMatch = !valorMax || imovel.valor <= valorMax;
        if (tipoMatch && bairroMatch && valorMatch) {
          matches.push({
            clienteId: cliente.id,
            clienteNome: cliente.nome,
            imovelId: imovel.id,
            imovelEndereco: imovel.endereco,
            imovelBairro: imovel.bairro,
            imovelTipo: imovel.tipo,
            imovelValor: imovel.valor,
          });
        }
      }
    }
    return matches;
  }, [imoveis, clientes]);

  return (
    <DataContext.Provider value={{
      imoveis, contratos, clientes,
      addImovel, updateImovel, deleteImovel,
      addContrato, updateContrato, deleteContrato,
      addCliente, updateCliente, deleteCliente,
      getMatches,
    }}>
      {children}
    </DataContext.Provider>
  );
}
