import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  Wheat,
  ChefHat,
  Percent,
  Upload,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { to: "/costs", label: "مصاريف المطعم", icon: Receipt },
  { to: "/ingredients", label: "المواد الخام", icon: Wheat },
  { to: "/recipes", label: "الوصفات", icon: ChefHat },
  { to: "/offers/rules", label: "قواعد الخصومات", icon: Percent },
  { to: "/sales/import", label: "استيراد المبيعات", icon: Upload },
];

const AppSidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { pathname } = useLocation();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed right-0 top-0 h-screen w-64 bg-sidebar text-sidebar-foreground border-l border-sidebar-border flex flex-col z-50 overflow-y-auto transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <ChefHat className="h-6 w-6 text-sidebar-primary" />
              <span>MenuProfit</span>
            </h1>
            <p className="text-xs text-sidebar-foreground/60 mt-1">إدارة تكاليف المطعم</p>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden text-sidebar-foreground" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || pathname.startsWith(to + "/");
            return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default AppSidebar;
export { links };
