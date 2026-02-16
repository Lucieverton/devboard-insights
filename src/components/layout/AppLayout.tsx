import { AppSidebar, MobileMenuTrigger } from "@/components/layout/AppSidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden flex items-center gap-2 p-3 border-b border-border/50">
          <MobileMenuTrigger />
          <h1 className="text-base font-bold text-neon tracking-tight">DevBoard</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
