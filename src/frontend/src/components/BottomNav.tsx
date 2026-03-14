import type { Page } from "@/App";
import {
  DollarSign,
  LayoutDashboard,
  Package,
  Route,
  Settings,
  Truck,
  Users,
} from "lucide-react";

interface BottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: {
  id: Page;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  ocid: string;
}[] = [
  {
    id: "dashboard",
    label: "Home",
    icon: LayoutDashboard,
    ocid: "nav.dashboard.link",
  },
  { id: "trucks", label: "Trucks", icon: Truck, ocid: "nav.trucks.link" },
  { id: "trips", label: "Trips", icon: Route, ocid: "nav.trips.link" },
  { id: "orders", label: "Orders", icon: Package, ocid: "nav.orders.link" },
  { id: "employees", label: "Staff", icon: Users, ocid: "nav.employees.link" },
  {
    id: "finance",
    label: "Finance",
    icon: DollarSign,
    ocid: "nav.finance.link",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    ocid: "nav.settings.link",
  },
];

export default function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Floating pill container */}
      <div
        className="mx-3 mb-3 rounded-2xl flex items-stretch overflow-hidden"
        style={{
          background: "oklch(0.13 0.07 252 / 0.85)",
          backdropFilter: "blur(20px) saturate(1.5)",
          WebkitBackdropFilter: "blur(20px) saturate(1.5)",
          border: "1px solid oklch(0.95 0.01 250 / 0.08)",
          boxShadow:
            "0 8px 32px oklch(0.05 0.05 255 / 0.6), 0 1px 0 oklch(0.95 0 0 / 0.05) inset",
        }}
      >
        {navItems.map(({ id, label, icon: Icon, ocid }) => {
          const active = currentPage === id;
          return (
            <button
              type="button"
              key={id}
              data-ocid={ocid}
              onClick={() => onNavigate(id)}
              className="flex-1 flex flex-col items-center gap-0.5 py-2.5 px-1 transition-all duration-200 relative"
            >
              {/* Active background pill */}
              {active && (
                <span
                  className="absolute inset-1 rounded-xl"
                  style={{ background: "oklch(0.75 0.20 55 / 0.12)" }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <span
                  style={{
                    color: active
                      ? "oklch(0.75 0.20 55)"
                      : "oklch(0.60 0.04 250)",
                    filter: active
                      ? "drop-shadow(0 0 6px oklch(0.75 0.20 55 / 0.6))"
                      : "none",
                    display: "flex",
                    transition: "color 0.2s, filter 0.2s",
                  }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span
                  className="text-[9px] font-medium leading-none transition-colors duration-200"
                  style={{
                    color: active
                      ? "oklch(0.75 0.20 55)"
                      : "oklch(0.55 0.04 250)",
                  }}
                >
                  {label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
