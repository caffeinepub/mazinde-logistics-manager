import type { Driver } from "@/backend";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  useAddDriver,
  useDeleteDriver,
  useDrivers,
  useTrucks,
  useUpdateDriver,
} from "@/hooks/useQueries";
import { CreditCard, Pencil, Phone, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function emptyDriver(): Driver {
  return {
    id: crypto.randomUUID(),
    name: "",
    phone: "",
    licenseNumber: "",
    salaryUSD: 0,
    isActive: true,
    assignedTruckId: undefined,
  };
}

export default function DriversPage() {
  const { data: drivers, isLoading } = useDrivers();
  const { data: trucks } = useTrucks();
  const addDriver = useAddDriver();
  const updateDriver = useUpdateDriver();
  const deleteDriver = useDeleteDriver();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [form, setForm] = useState<Driver>(emptyDriver());

  const openAdd = () => {
    setEditing(null);
    setForm(emptyDriver());
    setDialogOpen(true);
  };
  const openEdit = (d: Driver) => {
    setEditing(d);
    setForm({ ...d });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await updateDriver.mutateAsync({ id: editing.id, driver: form });
        toast.success("Driver updated");
      } else {
        await addDriver.mutateAsync(form);
        toast.success("Driver added");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save driver");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDriver.mutateAsync(deleteId);
      toast.success("Driver removed");
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
              Employees
            </h1>
            <p className="text-white/50 text-sm">Manage drivers & staff</p>
          </div>
          <Button
            data-ocid="drivers.add_button"
            onClick={openAdd}
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-9 px-4 text-sm"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Driver
          </Button>
        </div>
      </div>

      <div className="px-4 pt-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : !drivers || drivers.length === 0 ? (
          <div
            data-ocid="drivers.list"
            className="text-center py-12 text-muted-foreground"
          >
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No drivers yet</p>
            <p className="text-sm">Add your first driver</p>
          </div>
        ) : (
          <div data-ocid="drivers.list" className="space-y-3">
            {drivers.map((driver, i) => (
              <div
                key={driver.id}
                data-ocid={`drivers.item.${i + 1}`}
                className="bg-card rounded-2xl p-4 shadow-card border border-border"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{driver.name}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          driver.isActive
                            ? "badge-available"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {driver.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      {driver.phone}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CreditCard className="w-3 h-3" />
                      License: {driver.licenseNumber}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Salary: ${driver.salaryUSD}/mo
                    </p>
                    {driver.assignedTruckId && (
                      <p className="text-xs text-muted-foreground">
                        Truck:{" "}
                        {trucks?.find((t) => t.id === driver.assignedTruckId)
                          ?.plateNumber ?? driver.assignedTruckId}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      data-ocid={`drivers.edit_button.${i + 1}`}
                      onClick={() => openEdit(driver)}
                      className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      data-ocid={`drivers.delete_button.${i + 1}`}
                      onClick={() => setDeleteId(driver.id)}
                      className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Driver" : "Add Driver"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="John Mwangi"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="+255 712 345678"
              />
            </div>
            <div>
              <Label>License Number</Label>
              <Input
                value={form.licenseNumber}
                onChange={(e) =>
                  setForm((p) => ({ ...p, licenseNumber: e.target.value }))
                }
                placeholder="DL-12345"
              />
            </div>
            <div>
              <Label>Salary (USD/month)</Label>
              <Input
                type="number"
                value={form.salaryUSD}
                onChange={(e) =>
                  setForm((p) => ({ ...p, salaryUSD: Number(e.target.value) }))
                }
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
              />
              <Label>Active Employee</Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={addDriver.isPending || updateDriver.isPending}
              className="bg-primary text-primary-foreground"
            >
              {editing ? "Update" : "Add"} Driver
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
            <AlertDialogTitle>Remove Driver?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
