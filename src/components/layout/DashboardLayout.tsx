import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Home, ShoppingBag, Upload, Heart, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "dashboard", href: "/dashboard" },
    { icon: ShoppingBag, label: "browse", href: "/browse" },
    { icon: Package, label: "my orders", href: "/orders" },
    { icon: Heart, label: "wishlist", href: "/wishlist" },
    { icon: Upload, label: "upload item", href: "/upload" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header variant="authenticated" />
      <div className="flex-1 flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex md:w-64 border-r bg-card">
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || location.pathname + location.search === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-40">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || location.pathname + location.search === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center py-2 rounded-lg transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
