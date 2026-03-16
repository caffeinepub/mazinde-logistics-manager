import { ExternalBlob } from "@/backend";
import type { Settings as SettingsType } from "@/backend";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useSettings, useUpdateSettings } from "@/hooks/useQueries";
import { useTheme } from "@/hooks/useTheme";
import { Globe, LogOut, Palette, Save, Settings, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const { clear } = useInternetIdentity();
  const { themes, currentTheme, setTheme } = useTheme();

  const [form, setForm] = useState<SettingsType>({
    companyName: "Mazinde Logistics",
    motto: "Reliable Transport Across East Africa",
    language: "en",
  });
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const isSwahili = form.language === "sw";

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(form);
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const buffer = await file.arrayBuffer();
      const blob = ExternalBlob.fromBytes(new Uint8Array(buffer));
      setForm((p) => ({ ...p, logoUrl: blob }));
      toast.success("Logo ready — save to apply");
    } catch {
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="gradient-navy px-4 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-amber-400" />
          <div>
            <h1 className="text-xl font-display font-bold text-white">
              Settings
            </h1>
            <p className="text-white/50 text-sm">App configuration</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            {/* Company Info */}
            <div className="bg-card rounded-2xl p-4 shadow-card border border-border space-y-4">
              <h2 className="font-semibold text-foreground">
                Company Information
              </h2>
              <div>
                <Label>Company Name</Label>
                <Input
                  value={form.companyName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, companyName: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Motto</Label>
                <Input
                  value={form.motto}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, motto: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Logo Upload */}
            <div className="bg-card rounded-2xl p-4 shadow-card border border-border">
              <h2 className="font-semibold text-foreground mb-3">
                Company Logo
              </h2>
              <div className="flex items-center gap-3">
                {form.logoUrl ? (
                  <img
                    src={form.logoUrl.getDirectURL()}
                    alt="Logo"
                    className="w-12 h-12 rounded-lg object-cover border"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <label>
                    <Button
                      data-ocid="settings.logo.upload_button"
                      variant="outline"
                      size="sm"
                      disabled={uploading}
                      className="cursor-pointer"
                      asChild
                    >
                      <span>{uploading ? "Uploading..." : "Upload Logo"}</span>
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG up to 2MB
                  </p>
                </div>
              </div>
            </div>

            {/* Language */}
            <div className="bg-card rounded-2xl p-4 shadow-card border border-border">
              <h2 className="font-semibold text-foreground mb-3">Language</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {isSwahili ? "Kiswahili" : "English"}
                  </span>
                </div>
                <Switch
                  data-ocid="settings.language.toggle"
                  checked={isSwahili}
                  onCheckedChange={(v) =>
                    setForm((p) => ({ ...p, language: v ? "sw" : "en" }))
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Toggle between English and Swahili
              </p>
            </div>

            {/* App Theme */}
            <div
              data-ocid="settings.theme.toggle"
              className="bg-card rounded-2xl p-4 shadow-card border border-border"
            >
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4 text-muted-foreground" />
                <h2 className="font-semibold text-foreground">App Theme</h2>
              </div>
              <div className="flex items-center gap-3 mb-2">
                {themes.map((theme, i) => (
                  <button
                    key={theme.id}
                    type="button"
                    data-ocid={`settings.theme.swatch.${i + 1}`}
                    onClick={() => setTheme(theme.id)}
                    title={theme.name}
                    style={{
                      backgroundColor: `oklch(${theme.accent})`,
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      border:
                        currentTheme.id === theme.id
                          ? "3px solid white"
                          : "3px solid transparent",
                      boxShadow:
                        currentTheme.id === theme.id
                          ? `0 0 0 2px oklch(${theme.accent})`
                          : "none",
                      cursor: "pointer",
                      transition: "transform 0.15s, box-shadow 0.15s",
                      transform:
                        currentTheme.id === theme.id
                          ? "scale(1.15)"
                          : "scale(1)",
                      flexShrink: 0,
                    }}
                    aria-label={theme.name}
                    aria-pressed={currentTheme.id === theme.id}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Selected:{" "}
                <span className="font-medium text-foreground">
                  {currentTheme.name}
                </span>
              </p>
            </div>

            {/* Actions */}
            <Button
              data-ocid="settings.save_button"
              onClick={handleSave}
              disabled={updateSettings.isPending}
              className="w-full bg-primary text-primary-foreground h-12 rounded-xl font-semibold"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateSettings.isPending ? "Saving..." : "Save Settings"}
            </Button>

            <Button
              data-ocid="settings.logout_button"
              variant="outline"
              onClick={() => setLogoutOpen(true)}
              className="w-full h-12 rounded-xl font-semibold border-red-200 text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </>
        )}

        <p className="text-center text-xs text-muted-foreground py-4">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="underline"
            target="_blank"
            rel="noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </div>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent className="mx-4 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Logout?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be returned to the login screen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="settings.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="settings.confirm_button"
              onClick={clear}
              className="bg-primary text-primary-foreground"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
