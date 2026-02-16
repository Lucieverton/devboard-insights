import { NavLink } from "react-router-dom";
import { LayoutDashboard, Home, FileText, Users, Settings } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Imóveis", path: "/imoveis", icon: Home },
  { label: "Contratos", path: "/contratos", icon: FileText },
  { label: "Clientes", path: "/clientes", icon: Users },
  { label: "Configurações", path: "/configuracoes", icon: Settings },
];

export function AppSidebar({ children }: { children?: React.ReactNode }) {
  return (
    <aside className="w-56 shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-base font-bold text-neon tracking-tight">DevBoard</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Stores</p>
      </div>

      <nav className="p-2 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
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

      {/* Extra sidebar content (filters on dashboard) */}
      {children && (
        <div className="flex-1 flex flex-col overflow-hidden border-t border-sidebar-border mt-2">
          {children}
        </div>
      )}
    </aside>
  );
}
