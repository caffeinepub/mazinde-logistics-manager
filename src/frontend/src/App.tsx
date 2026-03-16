import BottomNav from "@/components/BottomNav";
import { Toaster } from "@/components/ui/sonner";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { ThemeProvider } from "@/hooks/useTheme";
import DashboardPage from "@/pages/DashboardPage";
import DriversPage from "@/pages/DriversPage";
import FinancePage from "@/pages/FinancePage";
import LoginPage from "@/pages/LoginPage";
import OrdersPage from "@/pages/OrdersPage";
import SettingsPage from "@/pages/SettingsPage";
import SplashScreen from "@/pages/SplashScreen";
import TripsPage from "@/pages/TripsPage";
import TrucksPage from "@/pages/TrucksPage";
import { useEffect, useState } from "react";

export type Page =
  | "dashboard"
  | "trucks"
  | "trips"
  | "orders"
  | "employees"
  | "finance"
  | "settings";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const { identity, isInitializing } = useInternetIdentity();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;
  if (isInitializing) return null;
  if (!identity) return <LoginPage />;

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage />;
      case "trucks":
        return <TrucksPage />;
      case "trips":
        return <TripsPage />;
      case "orders":
        return <OrdersPage />;
      case "employees":
        return <DriversPage />;
      case "finance":
        return <FinancePage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <main className="pb-20">{renderPage()}</main>
        <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
