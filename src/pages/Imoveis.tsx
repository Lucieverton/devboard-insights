import { useState, useMemo } from "react";
import { useData, Imovel } from "@/contexts/DataContext";
import { BAIRROS, TIPOS_IMOVEL } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Plus, Pencil, Trash2, Eye, Search, ChevronLeft, ChevronRight, Sparkles, Share2, CalendarDays, HandshakeIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { PhotoGallery } from "@/components/imoveis/PhotoGallery";
import { ImageCarousel } from "@/components/imoveis/ImageCarousel";
import { FinalizarNegocioModal } from "@/components/imoveis/FinalizarNegocioModal";

const STATUSES = ["Disponível", "Vendido", "Alugado"] as const;
const PAGE_SIZE = 8;
const bairrosOpts = BAIRROS.slice(1);
const tiposOpts = TIPOS_IMOVEL.slice(1);

const emptyForm: Omit<Imovel, "id"> = {
  endereco: "", cep: "", bairro: bairrosOpts[0], cidade: "Maceió", complemento: "",
  tipo: tiposOpts[0], valor: 0, status: "Disponível",
  criadoEm: new Date().toISOString(), ultimaVisita: "", fotoUrl: "",
  fotos: [], fotoCapa: 0,
};

function isNew(criadoEm: string) {
  return Date.now() - new Date(criadoEm).getTime() < 48 * 3600000;
}

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

function gerarWhatsApp(i: Imovel) {
  const valor = i.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const texto = encodeURIComponent(
    `🏠 *${i.tipo} - ${i.bairro}*\n📍 ${i.endereco}\n💰 ${valor}\n📌 Status: ${i.status}\n\nDevBoard Stores`
  );
  window.open(`https://wa.me/?text=${texto}`, "_blank");
}

export default function ImoveisPage() {
  const { imoveis, addImovel, updateImovel, deleteImovel } = useData();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<keyof Imovel>("endereco");
  const [sortAsc, setSortAsc] = useState(true);
  const [statusTab, setStatusTab] = useState("Todos");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);

  const [modalOpen, setModalOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Imovel | null>(null);
  const [viewing, setViewing] = useState<Imovel | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Imovel, "id">>(emptyForm);
  const [cepLoading, setCepLoading] = useState(false);
  const [finalizarOpen, setFinalizarOpen] = useState(false);
  const [finalizarImovel, setFinalizarImovel] = useState<Imovel | null>(null);

  // Price bounds for slider
  const priceBounds = useMemo(() => {
    if (imoveis.length === 0) return [0, 1000000] as [number, number];
    const vals = imoveis.map((i) => i.valor);
    return [Math.min(...vals), Math.max(...vals)] as [number, number];
  }, [imoveis]);

  const filtered = useMemo(() => {
    let list = imoveis.filter((i) => {
      if (statusTab !== "Todos" && i.status !== statusTab) return false;
      if (i.valor < priceRange[0] || i.valor > priceRange[1]) return false;
      if (search) {
        const q = search.toLowerCase();
        return i.endereco.toLowerCase().includes(q) || i.bairro.toLowerCase().includes(q) || i.tipo.toLowerCase().includes(q);
      }
      return true;
    });
    list.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortAsc ? av - bv : bv - av;
      return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return list;
  }, [imoveis, search, sortKey, sortAsc, statusTab, priceRange]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const openNew = () => { setEditing(null); setForm({ ...emptyForm, criadoEm: new Date().toISOString() }); setModalOpen(true); };
  const openEdit = (i: Imovel) => {
    setEditing(i);
    setForm({ endereco: i.endereco, cep: i.cep, bairro: i.bairro, cidade: i.cidade, complemento: i.complemento, tipo: i.tipo, valor: i.valor, status: i.status, criadoEm: i.criadoEm, ultimaVisita: i.ultimaVisita, fotoUrl: i.fotoUrl, fotos: i.fotos || [], fotoCapa: i.fotoCapa || 0 });
    setModalOpen(true);
  };
  const openView = (i: Imovel) => { setViewing(i); setViewOpen(true); };
  const openDelete = (id: string) => { setDeleteId(id); setDeleteOpen(true); };

  const handleSave = async () => {
    if (!form.endereco.trim()) return;
    if (editing) await updateImovel({ ...form, id: editing.id });
    else await addImovel(form);
    setModalOpen(false);
  };

  const handleSort = (key: keyof Imovel) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const buscarCep = async (cep: string) => {
    const cleaned = cep.replace(/\D/g, "");
    if (cleaned.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleaned}`);
      if (res.ok) {
        const data = await res.json();
        setForm((prev) => ({
          ...prev,
          bairro: data.neighborhood || prev.bairro,
          cidade: data.city || prev.cidade,
          endereco: data.street ? `${data.street}${prev.endereco ? ", " + prev.endereco.split(",").pop()?.trim() : ""}` : prev.endereco,
        }));
        toast({ title: "CEP encontrado", description: `${data.neighborhood}, ${data.city}` });
      } else {
        toast({ title: "CEP não encontrado", description: "Verifique o número digitado.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro ao buscar CEP", description: "Verifique sua conexão.", variant: "destructive" });
    } finally {
      setCepLoading(false);
    }
  };

  const SortHeader = ({ k, label }: { k: keyof Imovel; label: string }) => (
    <th className="py-2 px-3 text-left text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-primary select-none" onClick={() => handleSort(k)}>
      {label} {sortKey === k ? (sortAsc ? "↑" : "↓") : ""}
    </th>
  );

  return (
    <div className="p-3 md:p-6 space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-lg md:text-xl font-bold text-neon">Imóveis</h2>
        <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/80">
          <Plus className="w-4 h-4 mr-1.5" /> Adicionar Novo
        </Button>
      </div>

      {/* Status Tabs */}
      <Tabs value={statusTab} onValueChange={(v) => { setStatusTab(v); setPage(0); }}>
        <TabsList className="bg-secondary border border-border/50">
          {["Todos", "Disponível", "Vendido", "Alugado"].map((s) => (
            <TabsTrigger
              key={s}
              value={s}
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_8px_hsl(183_100%_50%/0.3)] transition-all"
            >
              {s === "Todos" ? "Exibir Tudo" : s}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Search + Price Slider */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} placeholder="Buscar imóveis..." className="pl-9 bg-secondary border-border" />
        </div>
        <div className="w-full sm:max-w-sm space-y-1">
          <Label className="text-xs text-muted-foreground">
            Faixa de Preço: {priceRange[0].toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} — {priceRange[1].toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </Label>
          <Slider
            min={priceBounds[0]}
            max={priceBounds[1]}
            step={1000}
            value={priceRange}
            onValueChange={(v) => { setPriceRange(v as [number, number]); setPage(0); }}
            className="[&_[data-radix-slider-track]]:bg-secondary [&_[data-radix-slider-range]]:bg-primary [&_[data-radix-slider-thumb]]:border-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="neon-border card-inset rounded-lg bg-card overflow-x-auto">
        <TooltipProvider delayDuration={200}>
          <table className="w-full text-sm min-w-[800px]">
            <thead><tr className="border-b border-border/50">
              <th className="py-2 px-3 w-6"></th>
              <SortHeader k="endereco" label="Endereço" />
              <SortHeader k="bairro" label="Bairro" />
              <SortHeader k="tipo" label="Tipo" />
              <SortHeader k="valor" label="Valor" />
              <SortHeader k="status" label="Status" />
              <th className="py-2 px-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Última Visita</th>
              <th className="py-2 px-3 text-right text-xs uppercase tracking-wider text-muted-foreground">Ações</th>
            </tr></thead>
            <tbody>
              {paged.map((i) => (
                <tr key={i.id} className="border-b border-border/20 hover:bg-secondary/30 transition-colors group">
                  {/* New badge */}
                  <td className="py-2 px-2 text-center">
                    {isNew(i.criadoEm) && (
                      <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                    )}
                  </td>
                  {/* Address with hover thumbnail */}
                  <td className="py-2 px-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-default">{i.endereco}</span>
                      </TooltipTrigger>
                      {(i.fotos?.length > 0 || i.fotoUrl) && (
                        <TooltipContent side="right" className="p-0 bg-card border-primary/30 neon-border">
                          <img src={i.fotos?.[i.fotoCapa || 0] || i.fotoUrl} alt={i.tipo} className="w-48 h-32 object-cover rounded" />
                          {i.fotos?.length > 1 && (
                            <span className="absolute bottom-1 right-1 bg-background/70 text-[10px] text-primary px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                              +{i.fotos.length} fotos
                            </span>
                          )}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </td>
                  <td className="py-2 px-3 text-muted-foreground">{i.bairro}</td>
                  <td className="py-2 px-3 text-muted-foreground">{i.tipo}</td>
                  <td className="py-2 px-3 font-mono text-green-neon">{i.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  <td className="py-2 px-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${i.status === "Disponível" ? "bg-accent/20 text-accent" : i.status === "Vendido" ? "bg-chart-orange/20 text-chart-orange" : "bg-primary/20 text-primary"}`}>
                      {i.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" /> {formatDate(i.ultimaVisita)}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right space-x-1 whitespace-nowrap">
                    {i.status === "Disponível" && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-accent" onClick={() => { setFinalizarImovel(i); setFinalizarOpen(true); }} aria-label="Finalizar Negócio">
                        <HandshakeIcon className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-primary" onClick={() => openView(i)}><Eye className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-primary" onClick={() => openEdit(i)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-accent" onClick={() => gerarWhatsApp(i)} aria-label="Compartilhar WhatsApp"><Share2 className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={() => openDelete(i.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">Nenhum imóvel encontrado</td></tr>}
            </tbody>
          </table>
        </TooltipProvider>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{filtered.length} registro(s)</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft className="w-4 h-4" /></Button>
          <span>{page + 1} / {totalPages}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Form Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-neon">{editing ? "Editar Imóvel" : "Novo Imóvel"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {/* CEP */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">CEP</Label>
                <div className="flex gap-2">
                  <Input
                    value={form.cep}
                    onChange={(e) => setForm({ ...form, cep: e.target.value })}
                    onBlur={() => buscarCep(form.cep)}
                    placeholder="57000-000"
                    className="bg-secondary border-border"
                    maxLength={9}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-border text-xs shrink-0"
                    onClick={() => buscarCep(form.cep)}
                    disabled={cepLoading}
                  >
                    {cepLoading ? "..." : "Buscar"}
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Cidade</Label>
                <Input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} className="bg-secondary border-border" />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Endereço</Label>
              <Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Bairro</Label>
                <Select value={form.bairro} onValueChange={(v) => setForm({ ...form, bairro: v })}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">{bairrosOpts.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Complemento</Label>
                <Input value={form.complemento} onChange={(e) => setForm({ ...form, complemento: e.target.value })} placeholder="Apto, Bloco..." className="bg-secondary border-border" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Tipo</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">{tiposOpts.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Valor (R$)</Label>
                <Input type="number" value={form.valor} onChange={(e) => setForm({ ...form, valor: Number(e.target.value) })} className="bg-secondary border-border" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Imovel["status"] })}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Última Visita</Label>
                <Input
                  type="date"
                  value={form.ultimaVisita ? form.ultimaVisita.split("T")[0] : ""}
                  onChange={(e) => setForm({ ...form, ultimaVisita: e.target.value ? new Date(e.target.value).toISOString() : "" })}
                  className="bg-secondary border-border"
                />
              </div>
            </div>
            {/* Photo Gallery */}
            <PhotoGallery
              photos={form.fotos}
              coverIndex={form.fotoCapa}
              onChange={(fotos, fotoCapa) => setForm({ ...form, fotos, fotoCapa, fotoUrl: fotos[fotoCapa] || "" })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} className="border-border">Cancelar</Button>
            <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/80">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="text-neon">Detalhes do Imóvel</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-3">
              <ImageCarousel
                images={viewing.fotos?.length ? viewing.fotos : viewing.fotoUrl ? [viewing.fotoUrl] : []}
                aspectRatio="aspect-video"
              />
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Endereço:</span> {viewing.endereco}</p>
                {viewing.complemento && <p><span className="text-muted-foreground">Complemento:</span> {viewing.complemento}</p>}
                <p><span className="text-muted-foreground">Bairro:</span> {viewing.bairro}</p>
                <p><span className="text-muted-foreground">Cidade:</span> {viewing.cidade}</p>
                <p><span className="text-muted-foreground">CEP:</span> {viewing.cep}</p>
                <p><span className="text-muted-foreground">Tipo:</span> {viewing.tipo}</p>
                <p><span className="text-muted-foreground">Valor:</span> <span className="font-mono text-green-neon">{viewing.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span></p>
                <p><span className="text-muted-foreground">Status:</span> {viewing.status}</p>
                <p><span className="text-muted-foreground">Cadastrado em:</span> {formatDate(viewing.criadoEm)}{isNew(viewing.criadoEm) && <span className="ml-2 text-accent text-xs">✨ Novo!</span>}</p>
                <p><span className="text-muted-foreground">Última Visita:</span> {formatDate(viewing.ultimaVisita)}</p>
                {viewing.fotos?.length > 0 && <p className="text-xs text-muted-foreground">{viewing.fotos.length} foto(s) no imóvel</p>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/80" onClick={async () => { if (deleteId) await deleteImovel(deleteId); setDeleteOpen(false); }}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Finalizar Negócio Modal */}
      {finalizarImovel && (
        <FinalizarNegocioModal
          open={finalizarOpen}
          onOpenChange={(v) => { setFinalizarOpen(v); if (!v) setFinalizarImovel(null); }}
          imovel={finalizarImovel}
        />
      )}
    </div>
  );
}
