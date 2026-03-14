import type { Truck as TruckType } from "@/backend";
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
import {
  useAddTruck,
  useDeleteTruck,
  useDrivers,
  useTrucks,
  useUpdateTruck,
} from "@/hooks/useQueries";
import { Pencil, Plus, Trash2, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const STATUS_OPTIONS = ["Available", "On Trip", "Maintenance"];

function emptyTruck(): TruckType {
  return {
    id: crypto.randomUUID(),
    plateNumber: "",
    model: "",
    capacityTons: 0,
    currentKm: 0n,
    status: "Available",
    lastServiceDate: BigInt(Date.now()) * 1_000_000n,
    assignedDriverId: undefined,
  };
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Available: "badge-available",
    "On Trip": "badge-on-trip",
    Maintenance: "badge-maintenance",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] || "bg-gray-100 text-gray-800"}`}
    >
      {status}
    </span>
  );
}

export default function TrucksPage() {
  const { data: trucks, isLoading } = useTrucks();
  const { data: drivers } = useDrivers();
  const addTruck = useAddTruck();
  const updateTruck = useUpdateTruck();
  const deleteTruck = useDeleteTruck();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<TruckType | null>(null);
  const [form, setForm] = useState<TruckType>(emptyTruck());

  const openAdd = () => {
    setEditing(null);
    setForm(emptyTruck());
    setDialogOpen(true);
  };

  const openEdit = (truck: TruckType) => {
    setEditing(truck);
    setForm({ ...truck });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await updateTruck.mutateAsync({ id: editing.id, truck: form });
        toast.success("Truck updated");
      } else {
        await addTruck.mutateAsync(form);
        toast.success("Truck added");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save truck");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTruck.mutateAsync(deleteId);
      toast.success("Truck removed");
    } catch {
      toast.error("Failed to delete");
    }
    setDeleteId(null);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="gradient-navy px-4 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-bold text-white">Fleet</h1>
            <p className="text-white/50 text-sm">Manage your trucks</p>
          </div>
          <Button
            data-ocid="trucks.add_button"
            onClick={openAdd}
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-9 px-4 text-sm"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Truck
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
        ) : !trucks || trucks.length === 0 ? (
          <div
            data-ocid="trucks.list"
            className="text-center py-12 text-muted-foreground"
          >
            <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No trucks yet</p>
            <p className="text-sm">Add your first truck to get started</p>
          </div>
        ) : (
          <div data-ocid="trucks.list" className="space-y-3">
            {trucks.map((truck, i) => (
              <div
                key={truck.id}
                data-ocid={`trucks.item.${i + 1}`}
                className="bg-card rounded-2xl p-4 shadow-card border border-border"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground">
                        {truck.plateNumber}
                      </p>
                      <StatusBadge status={truck.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {truck.model} · {truck.capacityTons}t
                    </p>
                    {truck.assignedDriverId && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Driver:{" "}
                        {drivers?.find((d) => d.id === truck.assignedDriverId)
                          ?.name ?? truck.assignedDriverId}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {Number(truck.currentKm).toLocaleString()} km
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      data-ocid={`trucks.edit_button.${i + 1}`}
                      onClick={() => openEdit(truck)}
                      className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      data-ocid={`trucks.delete_button.${i + 1}`}
                      onClick={() => setDeleteId(truck.id)}
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          data-ocid="trucks.form.dialog"
          className="mx-4 rounded-2xl"
        >
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Truck" : "Add Truck"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Plate Number</Label>
              <Input
                value={form.plateNumber}
                onChange={(e) =>
                  setForm((p) => ({ ...p, plateNumber: e.target.value }))
                }
                placeholder="T 123 ABC"
              />
            </div>
            <div>
              <Label>Model</Label>
              <Input
                value={form.model}
                onChange={(e) =>
                  setForm((p) => ({ ...p, model: e.target.value }))
                }
                placeholder="Scania R450"
              />
            </div>
            <div>
              <Label>Capacity (tons)</Label>
              <Input
                type="number"
                value={form.capacityTons}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    capacityTons: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <Label>Current KM</Label>
              <Input
                type="number"
                value={Number(form.currentKm)}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    currentKm: BigInt(e.target.value || 0),
                  }))
                }
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assigned Driver</Label>
              <Select
                value={form.assignedDriverId ?? "none"}
                onValueChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    assignedDriverId: v === "none" ? undefined : v,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {drivers?.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={addTruck.isPending || updateTruck.isPending}
              className="bg-primary text-primary-foreground"
            >
              {editing ? "Update" : "Add"} Truck
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent className="mx-4 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Truck?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="trucks.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="trucks.confirm_button"
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
