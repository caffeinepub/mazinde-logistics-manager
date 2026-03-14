import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDashboardStats,
  useMaintenanceTrucks,
  useOrders,
  useTrips,
} from "@/hooks/useQueries";
import {
  AlertTriangle,
  Package,
  Route,
  TrendingDown,
  TrendingUp,
  Truck,
  Wrench,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const TRUCK_SLIDES = [
  "/assets/generated/truck-hero-1.dim_800x400.jpg",
  "/assets/generated/truck-hero-2.dim_800x400.jpg",
  "/assets/generated/truck-hero-3.dim_800x400.jpg",
];

function TruckSlideshow() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % TRUCK_SLIDES.length);
    }, 4000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div
      data-ocid="dashboard.truck.slideshow"
      className="relative w-full h-48 rounded-2xl overflow-hidden mb-4"
      style={{ boxShadow: "0 8px 32px oklch(0.05 0.05 255 / 0.6)" }}
    >
      {TRUCK_SLIDES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`Mazinde Fleet ${i + 1}`}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        />
      ))}

      {/* Bottom gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, oklch(0.08 0.06 255 / 0.95) 0%, oklch(0.08 0.06 255 / 0.30) 45%, transparent 100%)",
        }}
      />

      {/* Text overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-white font-display font-bold text-base tracking-wide">
          Mazinde Logistics Fleet
        </p>
        <p className="text-white/50 text-xs mt-0.5">
          East Africa — Connecting Nations
        </p>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-3 right-4 flex gap-1.5">
        {TRUCK_SLIDES.map((src, i) => (
          <button
            type="button"
            key={src}
            onClick={() => setCurrent(i)}
            className="transition-all duration-300 rounded-full"
            style={{
              width: i === current ? "18px" : "6px",
              height: "6px",
              background:
                i === current
                  ? "oklch(0.75 0.20 55)"
                  : "oklch(0.95 0 0 / 0.40)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function formatTime(t: bigint) {
  return new Date(Number(t / 1_000_000n)).toLocaleDateString();
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    available: "badge-available",
    "on-trip": "badge-on-trip",
    maintenance: "badge-maintenance",
    pending: "badge-pending",
    approved: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    delivered: "badge-delivered",
    cancelled: "badge-cancelled",
    active: "badge-on-trip",
    completed: "badge-delivered",
  };
  return (
    <span
      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${map[status.toLowerCase()] || "bg-white/10 text-white/70"}`}
    >
      {status}
    </span>
  );
}

const STAT_CONFIG = [
  {
    label: "Available Trucks",
    key: "availableTrucks" as const,
    icon: Truck,
    iconColor: "oklch(0.60 0.18 145)",
    iconBg: "oklch(0.60 0.18 145 / 0.15)",
    glowColor: "oklch(0.60 0.18 145 / 0.25)",
  },
  {
    label: "Trucks On Trip",
    key: "trucksOnTrip" as const,
    icon: Route,
    iconColor: "oklch(0.65 0.18 250)",
    iconBg: "oklch(0.65 0.18 250 / 0.15)",
    glowColor: "oklch(0.65 0.18 250 / 0.25)",
  },
  {
    label: "In Maintenance",
    key: "trucksInMaintenance" as const,
    icon: Wrench,
    iconColor: "oklch(0.72 0.18 52)",
    iconBg: "oklch(0.72 0.18 52 / 0.15)",
    glowColor: "oklch(0.72 0.18 52 / 0.25)",
  },
  {
    label: "Pending Orders",
    key: "pendingOrders" as const,
    icon: Package,
    iconColor: "oklch(0.80 0.16 75)",
    iconBg: "oklch(0.80 0.16 75 / 0.15)",
    glowColor: "oklch(0.80 0.16 75 / 0.25)",
  },
  {
    label: "Monthly Income",
    key: "monthlyIncome" as const,
    icon: TrendingUp,
    iconColor: "oklch(0.62 0.18 145)",
    iconBg: "oklch(0.62 0.18 145 / 0.15)",
    glowColor: "oklch(0.62 0.18 145 / 0.25)",
    isMoney: true,
  },
  {
    label: "Monthly Expenses",
    key: "monthlyExpenses" as const,
    icon: TrendingDown,
    iconColor: "oklch(0.60 0.22 25)",
    iconBg: "oklch(0.60 0.22 25 / 0.15)",
    glowColor: "oklch(0.60 0.22 25 / 0.25)",
    isMoney: true,
  },
];

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: trips } = useTrips();
  const { data: orders } = useOrders();
  const { data: maintenanceTrucks } = useMaintenanceTrucks();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div
        className="px-4 pt-12 pb-6"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.08 0.06 260) 0%, oklch(0.14 0.09 252) 100%)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-sm">
              Mazinde Logistics Manager
            </p>
          </div>
          <div
            className="w-11 h-11 rounded-full overflow-hidden border-2 glow-amber-sm"
            style={{ borderColor: "oklch(0.75 0.20 55 / 0.40)" }}
          >
            <img
              src="/assets/generated/mazinde-logo-transparent.dim_200x200.png"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="px-4 -mt-3">
        {/* === TRUCK SLIDESHOW === */}
        <TruckSlideshow />

        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {STAT_CONFIG.map((card, i) => {
            const Icon = card.icon;
            const raw = stats?.[card.key];
            const displayValue = card.isMoney
              ? raw !== undefined
                ? `$${(raw as number).toFixed(0)}`
                : "$0"
              : (raw?.toString() ?? "0");

            return (
              <div
                key={card.label}
                data-ocid={`dashboard.stats.card.${i + 1}`}
                className="glass-card rounded-2xl p-4"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{
                    background: card.iconBg,
                    boxShadow: `0 0 12px ${card.glowColor}`,
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: card.iconColor }} />
                </div>
                {statsLoading ? (
                  <Skeleton
                    className="h-8 w-16 mb-1"
                    data-ocid="dashboard.stats.loading_state"
                  />
                ) : (
                  <p
                    className="text-2xl font-display font-bold"
                    style={{ color: card.iconColor }}
                  >
                    {displayValue}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                  {card.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Maintenance Alerts */}
        {maintenanceTrucks && maintenanceTrucks.length > 0 && (
          <div
            className="rounded-2xl p-4 mb-5 border"
            style={{
              background: "oklch(0.72 0.18 52 / 0.08)",
              borderColor: "oklch(0.72 0.18 52 / 0.25)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber" />
              <span className="text-sm font-semibold text-amber">
                {maintenanceTrucks.length} Truck
                {maintenanceTrucks.length > 1 ? "s" : ""} Need Service
              </span>
            </div>
            <div className="space-y-1">
              {maintenanceTrucks.slice(0, 3).map((truck) => (
                <p key={truck.id} className="text-xs text-muted-foreground">
                  {truck.plateNumber} — {truck.model}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Activity Tabs */}
        <Tabs defaultValue="trips">
          <TabsList
            data-ocid="dashboard.activity.tab"
            className="w-full mb-3"
            style={{
              background: "oklch(0.15 0.06 250)",
              border: "1px solid oklch(0.22 0.06 250)",
            }}
          >
            <TabsTrigger value="trips" className="flex-1">
              Recent Trips
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex-1">
              Recent Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trips" className="space-y-2">
            {!trips || trips.length === 0 ? (
              <div
                data-ocid="dashboard.trips.empty_state"
                className="text-center py-8 text-muted-foreground text-sm"
              >
                <Route className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No trips yet
              </div>
            ) : (
              trips.slice(0, 5).map((trip, idx) => (
                <div
                  key={trip.id}
                  data-ocid={`dashboard.trips.item.${idx + 1}`}
                  className="glass-card rounded-xl p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {trip.startLocation} → {trip.destination}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(trip.startDate)} · {trip.distanceKm}km
                    </p>
                  </div>
                  <StatusBadge status={trip.status} />
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-2">
            {!orders || orders.length === 0 ? (
              <div
                data-ocid="dashboard.orders.empty_state"
                className="text-center py-8 text-muted-foreground text-sm"
              >
                <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No orders yet
              </div>
            ) : (
              orders.slice(0, 5).map((order, idx) => (
                <div
                  key={order.id}
                  data-ocid={`dashboard.orders.item.${idx + 1}`}
                  className="glass-card rounded-xl p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.pickupLocation} → {order.deliveryLocation}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with ❤ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="underline text-amber"
          target="_blank"
          rel="noreferrer"
        >
          caffeine.ai
        </a>
      </div>
    </div>
  );
}
