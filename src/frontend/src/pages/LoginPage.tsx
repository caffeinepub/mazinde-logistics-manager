import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Loader2, Lock, Shield, Truck, User } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-6 overflow-hidden gradient-login-bg">
      {/* Decorative orbs */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.55 0.20 250 / 0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute bottom-1/4 right-0 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.75 0.20 55 / 0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(oklch(0.95 0 0 / 1) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.95 0 0 / 1) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="w-full max-w-sm relative z-10 animate-slide-in">
        {/* Logo area */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-5">
            <div
              className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 glow-amber"
              style={{ background: "oklch(0.15 0.08 250)" }}
            >
              <img
                src="/assets/generated/mazinde-logo-transparent.dim_200x200.png"
                alt="Mazinde Logistics"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Amber ring pulse */}
            <div
              className="absolute inset-0 rounded-2xl animate-pulse"
              style={{
                boxShadow: "0 0 0 4px oklch(0.75 0.20 55 / 0.15)",
              }}
            />
          </div>
          <h1 className="text-3xl font-display font-bold text-gradient tracking-tight">
            Mazinde Logistics
          </h1>
          <p className="text-muted-foreground text-sm mt-1 tracking-wider uppercase text-xs">
            Manager Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-2xl p-6">
          {/* Card header */}
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/[0.06]">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center glow-amber-sm"
              style={{ background: "oklch(0.75 0.20 55 / 0.15)" }}
            >
              <Truck className="w-5 h-5 text-amber" />
            </div>
            <div>
              <h2 className="text-foreground font-semibold text-sm">
                Secure Login
              </h2>
              <p className="text-muted-foreground text-xs">
                Mazinde Fleet Management System
              </p>
            </div>
            <div className="ml-auto">
              <Shield className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Input fields */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="login-email"
                className="text-xs text-muted-foreground uppercase tracking-wide"
              >
                Email or Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="login-email"
                  data-ocid="login.email.input"
                  type="text"
                  placeholder="admin@mazindelogistics.co.tz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/[0.05] border-white/10 text-foreground placeholder:text-muted-foreground focus:border-amber-500/50 focus:ring-amber-500/20 h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="login-password"
                className="text-xs text-muted-foreground uppercase tracking-wide"
              >
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="login-password"
                  data-ocid="login.password.input"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white/[0.05] border-white/10 text-foreground placeholder:text-muted-foreground focus:border-amber-500/50 focus:ring-amber-500/20 h-11 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Login button */}
          <Button
            data-ocid="login.submit_button"
            onClick={login}
            disabled={isLoggingIn}
            className="w-full mt-6 h-12 rounded-xl text-base font-semibold tracking-wide glow-amber-sm transition-all duration-300"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.72 0.20 55), oklch(0.65 0.22 48))",
              color: "oklch(0.10 0 0)",
            }}
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Login to Dashboard →"
            )}
          </Button>

          <p className="text-muted-foreground text-xs text-center mt-4 leading-relaxed">
            Admin access only. Authentication secured by{" "}
            <span className="text-amber">Internet Identity</span>.
          </p>
        </div>

        <p className="text-muted-foreground/40 text-xs text-center mt-8 tracking-wider uppercase">
          Reliable Transport Across East Africa
        </p>
      </div>
    </div>
  );
}
