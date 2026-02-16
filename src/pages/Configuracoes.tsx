import { useData } from "@/contexts/DataContext";

export default function ConfiguracoesPage() {
  const { imoveis, contratos, clientes } = useData();

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-neon">Configurações</h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="neon-border card-inset rounded-lg bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Total de Imóveis</p>
          <p className="text-3xl font-bold font-mono text-neon">{imoveis.length}</p>
        </div>
        <div className="neon-border card-inset rounded-lg bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Total de Contratos</p>
          <p className="text-3xl font-bold font-mono text-neon">{contratos.length}</p>
        </div>
        <div className="neon-border card-inset rounded-lg bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Total de Clientes</p>
          <p className="text-3xl font-bold font-mono text-neon">{clientes.length}</p>
        </div>
      </div>

      <div className="neon-border card-inset rounded-lg bg-card p-5 max-w-lg">
        <h3 className="text-sm font-semibold text-foreground mb-3">Sobre o Sistema</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p><span className="text-foreground">Versão:</span> 1.0.0</p>
          <p><span className="text-foreground">Plataforma:</span> DevBoard Stores</p>
          <p><span className="text-foreground">Região:</span> Maceió - AL</p>
          <p className="text-xs mt-4">Dashboard financeiro imobiliário de alta performance. Dados armazenados localmente até conexão com banco de dados.</p>
        </div>
      </div>
    </div>
  );
}
