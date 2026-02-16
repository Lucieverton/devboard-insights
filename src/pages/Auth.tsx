import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { LogIn, UserPlus, Loader2 } from "lucide-react";

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) toast({ title: "Erro ao entrar", description: error, variant: "destructive" });
      } else {
        if (!nome.trim()) {
          toast({ title: "Informe seu nome", variant: "destructive" });
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, nome);
        if (error) toast({ title: "Erro ao cadastrar", description: error, variant: "destructive" });
        else toast({ title: "Conta criada!", description: "Verifique seu email para confirmar o cadastro." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neon tracking-tight">DevBoard Stores</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Sistema Imobiliário</p>
        </div>

        <div className="neon-border card-inset rounded-lg bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground text-center">
            {isLogin ? "Entrar" : "Criar Conta"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <div>
                <Label className="text-xs text-muted-foreground">Nome</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome completo" className="bg-secondary border-border" />
              </div>
            )}
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="bg-secondary border-border" required />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Senha</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="bg-secondary border-border" required minLength={6} />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/80" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : isLogin ? <LogIn className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
              {isLogin ? "Entrar" : "Criar Conta"}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground">
            {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline">
              {isLogin ? "Criar conta" : "Entrar"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
