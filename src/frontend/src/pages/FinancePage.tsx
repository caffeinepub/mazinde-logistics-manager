import type { FinanceEntry } from "@/backend";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAddFinanceEntry,
  useAnnualReport,
  useDeleteFinanceEntry,
  useFinanceEntries,
  useMonthlyReport,
} from "@/hooks/useQueries";
import {
  BarChart3,
  DollarSign,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CATEGORIES = [
  "Fuel",
  "Driver Salary",
  "Maintenance",
  "Insurance",
  "Trip Payment",
  "Delivery Fee",
  "Other",
];
const ENTRY_TYPES = ["Income", "Expense"];

function emptyEntry(): FinanceEntry {
  return {
    id: crypto.randomUUID(),
    entryType: "Expense",
    category: "Fuel",
    description: "",
    amountUSD: 0,
    date: BigInt(Date.now()) * 1_000_000n,
    relatedTripId: undefined,
  };
}

function formatDate(t: bigint) {
  return new Date(Number(t / 1_000_000n)).toLocaleDateString();
}

export default function FinancePage() {
  const now = new Date();
  const { data: entries, isLoading } = useFinanceEntries();
  const { data: monthlyReport } = useMonthlyReport(
    now.getMonth() + 1,
    now.getFullYear(),
  );
  const { data: annualReport } = useAnnualReport(now.getFullYear());
  const addEntry = useAddFinanceEntry();
  const deleteEntry = useDeleteFinanceEntry();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FinanceEntry>(emptyEntry());

  const openAdd = () => {
    setForm(emptyEntry());
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      await addEntry.mutateAsync(form);
      toast.success("Entry added");
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteEntry.mutateAsync(deleteId);
      toast.success("Entry deleted");
    } catch {
      toast.error("Failed to delete");
    }
    setDeleteId(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="gradient-navy px-4 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-bold text-white">
              Finance
            </h1>
            <p className="text-white/50 text-sm">Income, expenses & reports</p>
          </div>
          <Button
            data-ocid="finance.add_button"
            onClick={openAdd}
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-9 px-4 text-sm"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Entry
          </Button>
        </div>
      </div>

      <div className="px-4 pt-4">
        <Tabs defaultValue="entries">
          <TabsList data-ocid="finance.tab" className="w-full mb-4">
            <TabsTrigger value="entries" className="flex-1">
              Entries
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex-1">
              Monthly
            </TabsTrigger>
            <TabsTrigger value="annual" className="flex-1">
              Annual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entries">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 rounded-2xl" />
                ))}
              </div>
            ) : !entries || entries.length === 0 ? (
              <div
                data-ocid="finance.list"
                className="text-center py-12 text-muted-foreground"
              >
                <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No entries yet</p>
              </div>
            ) : (
              <div data-ocid="finance.list" className="space-y-3">
                {entries.map((entry, i) => (
                  <div
                    key={entry.id}
                    data-ocid={`finance.item.${i + 1}`}
                    className="bg-card rounded-2xl p-4 shadow-card border border-border"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            entry.entryType === "Income"
                              ? "bg-green-50"
                              : "bg-red-50"
                          }`}
                        >
                          {entry.entryType === "Income" ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {entry.description || entry.category}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.category} · {formatDate(entry.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold text-sm ${
                            entry.entryType === "Income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {entry.entryType === "Income" ? "+" : "-"}$
                          {entry.amountUSD.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          data-ocid={`finance.delete_button.${i + 1}`}
                          onClick={() => setDeleteId(entry.id)}
                          className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="monthly">
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">
                Monthly Report —{" "}
                {now.toLocaleString("default", { month: "long" })}{" "}
                {now.getFullYear()}
              </h3>
              {monthlyReport ? (
                <div className="space-y-3">
                  <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Total Income
                      </span>
                    </div>
                    <p className="text-2xl font-display font-bold text-green-700">
                      ${monthlyReport.totalIncome.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">
                        Total Expenses
                      </span>
                    </div>
                    <p className="text-2xl font-display font-bold text-red-700">
                      ${monthlyReport.totalExpenses.toFixed(2)}
                    </p>
                  </div>
                  <div
                    className={`rounded-2xl p-4 border ${
                      monthlyReport.profit >= 0
                        ? "bg-blue-50 border-blue-200"
                        : "bg-orange-50 border-orange-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3
                        className={`w-4 h-4 ${monthlyReport.profit >= 0 ? "text-blue-600" : "text-orange-600"}`}
                      />
                      <span
                        className={`text-sm font-medium ${monthlyReport.profit >= 0 ? "text-blue-800" : "text-orange-800"}`}
                      >
                        Net Profit
                      </span>
                    </div>
                    <p
                      className={`text-2xl font-display font-bold ${monthlyReport.profit >= 0 ? "text-blue-700" : "text-orange-700"}`}
                    >
                      ${monthlyReport.profit.toFixed(2)}
                    </p>
                  </div>
                </div>
              ) : (
                <Skeleton className="h-48 rounded-2xl" />
              )}
            </div>
          </TabsContent>

          <TabsContent value="annual">
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">
                Annual Report — {now.getFullYear()}
              </h3>
              {annualReport ? (
                <div className="space-y-3">
                  <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Annual Income
                      </span>
                    </div>
                    <p className="text-2xl font-display font-bold text-green-700">
                      ${annualReport.totalIncome.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">
                        Annual Expenses
                      </span>
                    </div>
                    <p className="text-2xl font-display font-bold text-red-700">
                      ${annualReport.totalExpenses.toFixed(2)}
                    </p>
                  </div>
                  <div
                    className={`rounded-2xl p-4 border ${
                      annualReport.profit >= 0
                        ? "bg-blue-50 border-blue-200"
                        : "bg-orange-50 border-orange-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3
                        className={`w-4 h-4 ${annualReport.profit >= 0 ? "text-blue-600" : "text-orange-600"}`}
                      />
                      <span
                        className={`text-sm font-medium ${annualReport.profit >= 0 ? "text-blue-800" : "text-orange-800"}`}
                      >
                        Annual Profit
                      </span>
                    </div>
                    <p
                      className={`text-2xl font-display font-bold ${annualReport.profit >= 0 ? "text-blue-700" : "text-orange-700"}`}
                    >
                      ${annualReport.profit.toFixed(2)}
                    </p>
                  </div>
                </div>
              ) : (
                <Skeleton className="h-48 rounded-2xl" />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add Finance Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Type</Label>
              <Select
                value={form.entryType}
                onValueChange={(v) => setForm((p) => ({ ...p, entryType: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENTRY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Amount (USD)</Label>
              <Input
                type="number"
                value={form.amountUSD}
                onChange={(e) =>
                  setForm((p) => ({ ...p, amountUSD: Number(e.target.value) }))
                }
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={addEntry.isPending}
              className="bg-primary text-primary-foreground"
            >
              Add Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent className="mx-4 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
