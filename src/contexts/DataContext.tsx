import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

// ---- Types (kept for UI compatibility) ----
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
  fotos: string[];
  fotoCapa: number;
  quartos?: number;
  banheiros?: number;
  vagas?: number;
  area_m2?: number;
  destaque?: boolean;
}

export type ContratoEtapa = "Proposta" | "Documentação" | "Assinatura" | "Concluído" | "Cancelado";

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
  loading: boolean;
  addImovel: (i: Omit<Imovel, "id">) => Promise<void>;
  updateImovel: (i: Imovel) => Promise<void>;
  deleteImovel: (id: string) => Promise<void>;
  addContrato: (c: Omit<Contrato, "id">) => Promise<void>;
  updateContrato: (c: Contrato) => Promise<void>;
  deleteContrato: (id: string) => Promise<void>;
  addCliente: (c: Omit<Cliente, "id">) => Promise<void>;
  updateCliente: (c: Cliente) => Promise<void>;
  deleteCliente: (id: string) => Promise<void>;
  getMatches: () => MatchAlerta[];
  uploadImovelPhotos: (imovelId: string, files: File[]) => Promise<string[]>;
  deleteImovelPhoto: (imovelId: string, photoUrl: string, storagePath?: string) => Promise<void>;
  setImovelCover: (imovelId: string, photoUrl: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
};

// ---- Provider ----
export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  // ---- Fetch all data ----
  const fetchData = useCallback(async () => {
    if (!user) { setImoveis([]); setContratos([]); setClientes([]); setLoading(false); return; }
    setLoading(true);
    try {
      const [imoveisRes, clientesRes, contratosRes] = await Promise.all([
        supabase.from("imoveis").select("*").order("criado_em", { ascending: false }),
        supabase.from("clientes").select("*").order("created_at", { ascending: false }),
        supabase.from("contratos").select("*").order("created_at", { ascending: false }),
      ]);

      // Fetch photos for all imoveis
      const imoveisData = imoveisRes.data || [];
      let fotosMap: Record<string, { url: string; is_capa: boolean; storage_path: string | null }[]> = {};
      if (imoveisData.length > 0) {
        const { data: fotosData } = await supabase
          .from("imovel_fotos")
          .select("*")
          .in("imovel_id", imoveisData.map((i: any) => i.id))
          .order("ordem", { ascending: true });
        (fotosData || []).forEach((f: any) => {
          if (!fotosMap[f.imovel_id]) fotosMap[f.imovel_id] = [];
          fotosMap[f.imovel_id].push({ url: f.url, is_capa: f.is_capa, storage_path: f.storage_path });
        });
      }

      // Fetch notas for contratos
      const contratosData = contratosRes.data || [];
      let notasMap: Record<string, ContratoNota[]> = {};
      if (contratosData.length > 0) {
        const { data: notasData } = await supabase
          .from("contrato_notas")
          .select("*")
          .in("contrato_id", contratosData.map((c: any) => c.id))
          .order("created_at", { ascending: true });
        (notasData || []).forEach((n: any) => {
          if (!notasMap[n.contrato_id]) notasMap[n.contrato_id] = [];
          notasMap[n.contrato_id].push({ id: n.id, texto: n.texto, data: n.created_at });
        });
      }

      // Map to frontend types
      setImoveis(imoveisData.map((i: any) => {
        const fotos = fotosMap[i.id] || [];
        const capaIndex = fotos.findIndex(f => f.is_capa);
        return {
          id: i.id,
          endereco: i.endereco,
          cep: i.cep || "",
          bairro: i.bairro || "",
          cidade: i.cidade || "Maceió",
          complemento: i.complemento || "",
          tipo: i.tipo,
          valor: Number(i.valor),
          status: i.status as Imovel["status"],
          criadoEm: i.criado_em,
          ultimaVisita: i.ultima_visita || "",
          fotoUrl: fotos.length > 0 ? fotos[capaIndex >= 0 ? capaIndex : 0].url : "",
          fotos: fotos.map(f => f.url),
          fotoCapa: capaIndex >= 0 ? capaIndex : 0,
          quartos: i.quartos || undefined,
          banheiros: i.banheiros || undefined,
          vagas: i.vagas || undefined,
          area_m2: i.area_m2 ? Number(i.area_m2) : undefined,
          destaque: i.destaque || false,
        };
      }));

      setClientes((clientesRes.data || []).map((c: any) => ({
        id: c.id,
        nome: c.nome,
        contato: c.contato || "",
        cpfCnpj: c.cpf_cnpj || "",
        interesses: c.interesses || [],
        preferencia: c.pref_tipo_imovel || c.pref_bairro || c.pref_valor_max ? {
          tipoImovel: c.pref_tipo_imovel || "",
          bairro: c.pref_bairro || "",
          valorMax: Number(c.pref_valor_max) || 0,
        } : undefined,
      })));

      setContratos(contratosData.map((c: any) => ({
        id: c.id,
        imovelId: c.imovel_id || "",
        clienteId: c.cliente_id || "",
        tipo: c.tipo as "Locação" | "Venda",
        valorTotal: Number(c.valor_total),
        comissaoPercent: Number(c.comissao_percent),
        dataInicio: c.data_inicio || "",
        dataFim: c.data_fim || "",
        etapa: c.etapa as ContratoEtapa,
        notas: notasMap[c.id] || [],
        dataRecebimento: c.data_recebimento || "",
        comissaoPaga: c.comissao_paga || false,
        documentoUrl: c.documento_url || "",
      })));
    } catch (err) {
      console.error("Error fetching data:", err);
      toast({ title: "Erro ao carregar dados", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ---- Imóveis CRUD ----
  const addImovel = useCallback(async (i: Omit<Imovel, "id">) => {
    if (!user) return;
    const { data, error } = await supabase.from("imoveis").insert({
      user_id: user.id,
      endereco: i.endereco,
      cep: i.cep,
      bairro: i.bairro,
      cidade: i.cidade,
      complemento: i.complemento,
      tipo: i.tipo,
      valor: i.valor,
      status: i.status,
      ultima_visita: i.ultimaVisita || null,
      quartos: (i as any).quartos || null,
      banheiros: (i as any).banheiros || null,
      vagas: (i as any).vagas || null,
      area_m2: (i as any).area_m2 || null,
      destaque: (i as any).destaque || false,
    } as any).select().single();
    if (error) { toast({ title: "Erro ao cadastrar imóvel", description: error.message, variant: "destructive" }); return; }

    // Handle photos - upload to storage
    if (i.fotos && i.fotos.length > 0) {
      for (let idx = 0; idx < i.fotos.length; idx++) {
        const photoData = i.fotos[idx];
        if (photoData.startsWith("data:")) {
          // base64 - upload to storage
          const blob = await fetch(photoData).then(r => r.blob());
          const path = `${user.id}/${data.id}/${Date.now()}_${idx}.jpg`;
          const { error: uploadErr } = await supabase.storage.from("imovel-fotos").upload(path, blob, { contentType: "image/jpeg" });
          if (!uploadErr) {
            const { data: urlData } = supabase.storage.from("imovel-fotos").getPublicUrl(path);
            await supabase.from("imovel_fotos").insert({
              imovel_id: data.id, url: urlData.publicUrl, storage_path: path, is_capa: idx === i.fotoCapa, ordem: idx,
            });
          }
        } else {
          // Already a URL
          await supabase.from("imovel_fotos").insert({
            imovel_id: data.id, url: photoData, is_capa: idx === i.fotoCapa, ordem: idx,
          });
        }
      }
    }

    toast({ title: "Imóvel cadastrado", description: "Registro salvo com sucesso." });
    await fetchData();
  }, [user, fetchData]);

  const updateImovel = useCallback(async (i: Imovel) => {
    if (!user) return;
    const { error } = await supabase.from("imoveis").update({
      endereco: i.endereco,
      cep: i.cep,
      bairro: i.bairro,
      cidade: i.cidade,
      complemento: i.complemento,
      tipo: i.tipo,
      valor: i.valor,
      status: i.status,
      ultima_visita: i.ultimaVisita || null,
      quartos: (i as any).quartos || null,
      banheiros: (i as any).banheiros || null,
      vagas: (i as any).vagas || null,
      area_m2: (i as any).area_m2 || null,
      destaque: (i as any).destaque || false,
    } as any).eq("id", i.id);
    if (error) { toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" }); return; }

    // Auto-cancel non-concluded contracts when property returns to "Disponível"
    if (i.status === "Disponível") {
      await supabase.from("contratos")
        .update({ etapa: "Cancelado" })
        .eq("imovel_id", i.id)
        .in("etapa", ["Proposta", "Documentação", "Assinatura"]);
    }

    // Sync photos: delete old, insert new
    await supabase.from("imovel_fotos").delete().eq("imovel_id", i.id);
    if (i.fotos && i.fotos.length > 0) {
      for (let idx = 0; idx < i.fotos.length; idx++) {
        const photoData = i.fotos[idx];
        if (photoData.startsWith("data:")) {
          const blob = await fetch(photoData).then(r => r.blob());
          const path = `${user.id}/${i.id}/${Date.now()}_${idx}.jpg`;
          const { error: uploadErr } = await supabase.storage.from("imovel-fotos").upload(path, blob, { contentType: "image/jpeg" });
          if (!uploadErr) {
            const { data: urlData } = supabase.storage.from("imovel-fotos").getPublicUrl(path);
            await supabase.from("imovel_fotos").insert({
              imovel_id: i.id, url: urlData.publicUrl, storage_path: path, is_capa: idx === i.fotoCapa, ordem: idx,
            });
          }
        } else {
          await supabase.from("imovel_fotos").insert({
            imovel_id: i.id, url: photoData, is_capa: idx === i.fotoCapa, ordem: idx,
          });
        }
      }
    }

    toast({ title: "Imóvel atualizado", description: "Alterações salvas." });
    await fetchData();
  }, [user, fetchData]);

  const deleteImovel = useCallback(async (id: string) => {
    // Delete photos from storage first
    const { data: fotos } = await supabase.from("imovel_fotos").select("storage_path").eq("imovel_id", id);
    if (fotos) {
      const paths = fotos.filter(f => f.storage_path).map(f => f.storage_path!);
      if (paths.length > 0) await supabase.storage.from("imovel-fotos").remove(paths);
    }
    const { error } = await supabase.from("imoveis").delete().eq("id", id);
    if (error) { toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Imóvel excluído", description: "Registro removido." });
    await fetchData();
  }, [fetchData]);

  // ---- Photo helpers ----
  const uploadImovelPhotos = useCallback(async (imovelId: string, files: File[]): Promise<string[]> => {
    if (!user) return [];
    const urls: string[] = [];
    for (const file of files) {
      const path = `${user.id}/${imovelId}/${Date.now()}_${Math.random().toString(36).slice(2, 6)}.jpg`;
      const { error } = await supabase.storage.from("imovel-fotos").upload(path, file, { contentType: file.type });
      if (!error) {
        const { data } = supabase.storage.from("imovel-fotos").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    return urls;
  }, [user]);

  const deleteImovelPhoto = useCallback(async (imovelId: string, photoUrl: string, storagePath?: string) => {
    if (storagePath) await supabase.storage.from("imovel-fotos").remove([storagePath]);
    await supabase.from("imovel_fotos").delete().eq("imovel_id", imovelId).eq("url", photoUrl);
  }, []);

  const setImovelCover = useCallback(async (imovelId: string, photoUrl: string) => {
    await supabase.from("imovel_fotos").update({ is_capa: false }).eq("imovel_id", imovelId);
    await supabase.from("imovel_fotos").update({ is_capa: true }).eq("imovel_id", imovelId).eq("url", photoUrl);
  }, []);

  // ---- Contratos CRUD ----
  const addContrato = useCallback(async (c: Omit<Contrato, "id">) => {
    if (!user) return;
    const { data, error } = await supabase.from("contratos").insert({
      user_id: user.id,
      imovel_id: c.imovelId,
      cliente_id: c.clienteId,
      tipo: c.tipo,
      valor_total: c.valorTotal,
      comissao_percent: c.comissaoPercent,
      data_inicio: c.dataInicio || null,
      data_fim: c.dataFim || null,
      etapa: c.etapa,
      data_recebimento: c.dataRecebimento || null,
      comissao_paga: c.comissaoPaga,
      documento_url: c.documentoUrl,
    }).select().single();
    if (error) { toast({ title: "Erro ao cadastrar contrato", description: error.message, variant: "destructive" }); return; }
    // Insert notas
    if (c.notas.length > 0) {
      await supabase.from("contrato_notas").insert(
        c.notas.map(n => ({ contrato_id: data.id, texto: n.texto }))
      );
    }
    toast({ title: "Contrato cadastrado", description: "Registro salvo com sucesso." });
    await fetchData();
  }, [user, fetchData]);

  const updateContrato = useCallback(async (c: Contrato) => {
    if (!user) return;
    const { error } = await supabase.from("contratos").update({
      imovel_id: c.imovelId,
      cliente_id: c.clienteId,
      tipo: c.tipo,
      valor_total: c.valorTotal,
      comissao_percent: c.comissaoPercent,
      data_inicio: c.dataInicio || null,
      data_fim: c.dataFim || null,
      etapa: c.etapa,
      data_recebimento: c.dataRecebimento || null,
      comissao_paga: c.comissaoPaga,
      documento_url: c.documentoUrl,
    }).eq("id", c.id);
    if (error) { toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" }); return; }
    // Sync notas: delete old, insert all
    await supabase.from("contrato_notas").delete().eq("contrato_id", c.id);
    if (c.notas.length > 0) {
      await supabase.from("contrato_notas").insert(
        c.notas.map(n => ({ contrato_id: c.id, texto: n.texto }))
      );
    }
    toast({ title: "Contrato atualizado", description: "Alterações salvas." });
    await fetchData();
  }, [user, fetchData]);

  const deleteContrato = useCallback(async (id: string) => {
    const { error } = await supabase.from("contratos").delete().eq("id", id);
    if (error) { toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Contrato excluído", description: "Registro removido." });
    await fetchData();
  }, [fetchData]);

  // ---- Clientes CRUD ----
  const addCliente = useCallback(async (c: Omit<Cliente, "id">) => {
    if (!user) return;
    const { error } = await supabase.from("clientes").insert({
      user_id: user.id,
      nome: c.nome,
      contato: c.contato,
      cpf_cnpj: c.cpfCnpj,
      interesses: c.interesses,
      pref_tipo_imovel: c.preferencia?.tipoImovel || null,
      pref_bairro: c.preferencia?.bairro || null,
      pref_valor_max: c.preferencia?.valorMax || null,
    });
    if (error) { toast({ title: "Erro ao cadastrar cliente", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Cliente cadastrado", description: "Registro salvo com sucesso." });
    await fetchData();
  }, [user, fetchData]);

  const updateCliente = useCallback(async (c: Cliente) => {
    const { error } = await supabase.from("clientes").update({
      nome: c.nome,
      contato: c.contato,
      cpf_cnpj: c.cpfCnpj,
      interesses: c.interesses,
      pref_tipo_imovel: c.preferencia?.tipoImovel || null,
      pref_bairro: c.preferencia?.bairro || null,
      pref_valor_max: c.preferencia?.valorMax || null,
    }).eq("id", c.id);
    if (error) { toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Cliente atualizado", description: "Alterações salvas." });
    await fetchData();
  }, [fetchData]);

  const deleteCliente = useCallback(async (id: string) => {
    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (error) { toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Cliente excluído", description: "Registro removido." });
    await fetchData();
  }, [fetchData]);

  // ---- Match ----
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
      imoveis, contratos, clientes, loading,
      addImovel, updateImovel, deleteImovel,
      addContrato, updateContrato, deleteContrato,
      addCliente, updateCliente, deleteCliente,
      getMatches, uploadImovelPhotos, deleteImovelPhoto, setImovelCover,
    }}>
      {children}
    </DataContext.Provider>
  );
}
