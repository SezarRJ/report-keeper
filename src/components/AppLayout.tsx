import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useRestaurant } from "@/hooks/useRestaurant";
import { Settings, Menu, LogOut } from "lucide-react";

const AppLayout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut } = useAuth();
  const { restaurant } = useRestaurant();

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <header className="fixed top-0 left-0 right-0 lg:right-64 h-14 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 z-30">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-sm font-semibold truncate max-w-[150px] sm:max-w-none">
            {restaurant?.name || "المطعم"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/setup" className="flex items-center gap-1.5 text-muted-foreground">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">الإعدادات</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <main className="lg:mr-64 pt-14 p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
