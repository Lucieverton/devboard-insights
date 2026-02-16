import { useState, useMemo } from "react";
import { useData, Cliente } from "@/contexts/DataContext";
import { BAIRROS, TIPOS_IMOVEL } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Eye, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const PAGE_SIZE = 8;
const emptyForm: Omit<Cliente, "id"> = { nome: "", contato: "", cpfCnpj: "", interesses: [] };

export default function ClientesPage() {
  const { clientes, addCliente, updateCliente, deleteCliente } = useData();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<keyof Cliente>("nome");
  const [sortAsc, setSortAsc] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [viewing, setViewing] = useState<Cliente | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Cliente, "id">>(emptyForm);
  const [interesseInput, setInteresseInput] = useState("");

  const filtered = useMemo(() => {
    let list = clientes.filter((c) => {
      const s = search.toLowerCase();
      return c.nome.toLowerCase().includes(s) || c.cpfCnpj.includes(s) || c.contato.includes(s);
    });
    list.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return list;
  }, [clientes, search, sortKey, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const openNew = () => { setEditing(null); setForm(emptyForm); setInteresseInput(""); setModalOpen(true); };
  const openEdit = (c: Cliente) => { setEditing(c); setForm({ nome: c.nome, contato: c.contato, cpfCnpj: c.cpfCnpj, interesses: [...c.interesses] }); setInteresseInput(""); setModalOpen(true); };
  const openView = (c: Cliente) => { setViewing(c); setViewOpen(true); };
  const openDelete = (id: string) => { setDeleteId(id); setDeleteOpen(true); };

  const handleSave = () => {
    if (!form.nome.trim()) return;
    if (editing) updateCliente({ ...form, id: editing.id });
    else addCliente(form);
    setModalOpen(false);
  };

  const addInteresse = () => {
    if (interesseInput.trim() && !form.interesses.includes(interesseInput.trim())) {
      setForm({ ...form, interesses: [...form.interesses, interesseInput.trim()] });
      setInteresseInput("");
    }
  };
  const removeInteresse = (i: number) => {
    setForm({ ...form, interesses: form.interesses.filter((_, idx) => idx !== i) });
  };

  const handleSort = (key: keyof Cliente) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortHeader = ({ k, label }: { k: keyof Cliente; label: string }) => (
    <th className="py-2 px-3 text-left text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-primary select-none" onClick={() => handleSort(k)}>
      {label} {sortKey === k ? (sortAsc ? "↑" : "↓") : ""}
    </th>
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neon">Clientes</h2>
        <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/80"><Plus className="w-4 h-4 mr-1.5" /> Adicionar Novo</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} placeholder="Buscar clientes..." className="pl-9 bg-secondary border-border" />
      </div>
      <div className="neon-border card-inset rounded-lg bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border/50">
            <SortHeader k="nome" label="Nome" />
            <SortHeader k="contato" label="Contato" />
            <SortHeader k="cpfCnpj" label="CPF/CNPJ" />
            <th className="py-2 px-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Interesses</th>
            <th className="py-2 px-3 text-right text-xs uppercase tracking-wider text-muted-foreground">Ações</th>
          </tr></thead>
          <tbody>
            {paged.map((c) => (
              <tr key={c.id} className="border-b border-border/20 hover:bg-secondary/30 transition-colors">
                <td className="py-2 px-3 font-medium">{c.nome}</td>
                <td className="py-2 px-3 text-muted-foreground">{c.contato}</td>
                <td className="py-2 px-3 font-mono text-xs text-muted-foreground">{c.cpfCnpj}</td>
                <td className="py-2 px-3">
                  <div className="flex gap-1 flex-wrap">
                    {c.interesses.slice(0, 2).map((int, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{int}</span>
                    ))}
                    {c.interesses.length > 2 && <span className="text-[10px] text-muted-foreground">+{c.interesses.length - 2}</span>}
                  </div>
                </td>
                <td className="py-2 px-3 text-right space-x-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-primary" onClick={() => openView(c)}><Eye className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-primary" onClick={() => openEdit(c)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={() => openDelete(c.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </td>
              </tr>
            ))}
            {paged.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Nenhum cliente encontrado</td></tr>}
          </tbody>
        </table>
      </div>
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
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="text-neon">{editing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs text-muted-foreground">Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="bg-secondary border-border" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs text-muted-foreground">Contato</Label><Input value={form.contato} onChange={(e) => setForm({ ...form, contato: e.target.value })} placeholder="(82) 9xxxx-xxxx" className="bg-secondary border-border" /></div>
              <div><Label className="text-xs text-muted-foreground">CPF/CNPJ</Label><Input value={form.cpfCnpj} onChange={(e) => setForm({ ...form, cpfCnpj: e.target.value })} placeholder="000.000.000-00" className="bg-secondary border-border" /></div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Interesses</Label>
              <div className="flex gap-2 mt-1">
                <Input value={interesseInput} onChange={(e) => setInteresseInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInteresse())} placeholder="Ex: Apartamento, Ponta Verde..." className="bg-secondary border-border flex-1" />
                <Button variant="outline" size="sm" onClick={addInteresse} className="border-border">+</Button>
              </div>
              <div className="flex gap-1 flex-wrap mt-2">
                {form.interesses.map((int, i) => (
                  <Badge key={i} variant="secondary" className="cursor-pointer hover:bg-destructive/20" onClick={() => removeInteresse(i)}>{int} ×</Badge>
                ))}
              </div>
            </div>
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
          <DialogHeader><DialogTitle className="text-neon">Detalhes do Cliente</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Nome:</span> {viewing.nome}</p>
              <p><span className="text-muted-foreground">Contato:</span> {viewing.contato}</p>
              <p><span className="text-muted-foreground">CPF/CNPJ:</span> <span className="font-mono">{viewing.cpfCnpj}</span></p>
              <div><span className="text-muted-foreground">Interesses:</span>
                <div className="flex gap-1 flex-wrap mt-1">{viewing.interesses.map((int, i) => <Badge key={i} variant="secondary">{int}</Badge>)}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader><AlertDialogTitle>Confirmar exclusão</AlertDialogTitle><AlertDialogDescription>Tem certeza que deseja excluir este cliente?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/80" onClick={() => { if (deleteId) deleteCliente(deleteId); setDeleteOpen(false); }}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
