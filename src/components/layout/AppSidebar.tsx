import { NavLink } from "react-router-dom";
import { LayoutDashboard, Home, FileText, Users, Settings, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Imóveis", path: "/imoveis", icon: Home },
  { label: "Contratos", path: "/contratos", icon: FileText },
  { label: "Clientes", path: "/clientes", icon: Users },
  { label: "Configurações", path: "/configuracoes", icon: Settings },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="p-2 space-y-0.5">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === "/"}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive
                ? "bg-primary/10 text-primary neon-border"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`
          }
        >
          <item.icon className="w-4 h-4" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export function MobileMenuTrigger() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <>
      <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={() => setOpen(true)}>
        <Menu className="w-5 h-5" />
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-56 bg-sidebar border-sidebar-border p-0">
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <div className="p-4 border-b border-sidebar-border">
            <h1 className="text-base font-bold text-neon tracking-tight">DevBoard</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Stores</p>
          </div>
          <SidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}

export function AppSidebar({ children }: { children?: React.ReactNode }) {
  return (
    <aside className="w-56 shrink-0 bg-sidebar border-r border-sidebar-border flex-col h-screen sticky top-0 hidden md:flex">
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-base font-bold text-neon tracking-tight">DevBoard</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Stores</p>
      </div>

      <SidebarNav />

      {children && (
        <div className="flex-1 flex flex-col overflow-hidden border-t border-sidebar-border mt-2">
          {children}
        </div>
      )}
    </aside>
  );
}
