import type { Trip } from "@/backend";
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
  useAddTrip,
  useDeleteTrip,
  useDrivers,
  useOrders,
  useTrips,
  useTrucks,
  useUpdateTrip,
} from "@/hooks/useQueries";
import { Pencil, Plus, Route, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const EA_CITIES = [
  "Dar es Salaam",
  "Dodoma",
  "Arusha",
  "Mwanza",
  "Mbeya",
  "Tanga",
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Kampala",
  "Entebbe",
  "Jinja",
  "Kigali",
  "Bujumbura",
  "Lusaka",
  "Lubumbashi",
  "Goma",
];

function emptyTrip(): Trip {
  return {
    id: crypto.randomUUID(),
    truckId: "",
    driverId: "",
    orderId: "",
    startLocation: "",
    destination: "",
    cargoType: "",
    distanceKm: 0,
    tripPriceUSD: 0,
    fuelCostUSD: 0,
    status: "Active",
    startDate: BigInt(Date.now()) * 1_000_000n,
    createdAt: BigInt(Date.now()) * 1_000_000n,
    endDate: undefined,
  };
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: "badge-on-trip",
    Completed: "badge-delivered",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] || "bg-gray-100 text-gray-800"}`}
    >
      {status}
    </span>
  );
}

function formatDate(t: bigint) {
  return new Date(Number(t / 1_000_000n)).toLocaleDateString();
}

export default function TripsPage() {
  const { data: trips, isLoading } = useTrips();
  const { data: trucks } = useTrucks();
  const { data: drivers } = useDrivers();
  const { data: orders } = useOrders();
  const addTrip = useAddTrip();
  const updateTrip = useUpdateTrip();
  const deleteTrip = useDeleteTrip();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Trip | null>(null);
  const [form, setForm] = useState<Trip>(emptyTrip());
  const [statusFilter, setStatusFilter] = useState("all");

  const openAdd = () => {
    setEditing(null);
    setForm(emptyTrip());
    setDialogOpen(true);
  };
  const openEdit = (t: Trip) => {
    setEditing(t);
    setForm({ ...t });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await updateTrip.mutateAsync({ id: editing.id, trip: form });
        toast.success("Trip updated");
      } else {
        await addTrip.mutateAsync(form);
        toast.success("Trip added");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save trip");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTrip.mutateAsync(deleteId);
      toast.success("Trip deleted");
    } catch {
      toast.error("Failed to delete");
    }
    setDeleteId(null);
  };

  const filtered =
    trips?.filter((t) => statusFilter === "all" || t.status === statusFilter) ??
    [];

  return (
    <div className="animate-fade-in">
      <div className="gradient-navy px-4 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-bold text-white">Trips</h1>
            <p className="text-white/50 text-sm">Active & completed routes</p>
          </div>
          <Button
            data-ocid="trips.add_button"
            onClick={openAdd}
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-9 px-4 text-sm"
          >
            <Plus className="w-4 h-4 mr-1" /> New Trip
          </Button>
        </div>
      </div>

      <div className="px-4 pt-4">
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList data-ocid="trips.status.tab" className="w-full mb-4">
            <TabsTrigger value="all" className="flex-1">
              All
            </TabsTrigger>
            <TabsTrigger value="Active" className="flex-1">
              Active
            </TabsTrigger>
            <TabsTrigger value="Completed" className="flex-1">
              Completed
            </TabsTrigger>
          </TabsList>
          <TabsContent value={statusFilter}>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-2xl" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div
                data-ocid="trips.list"
                className="text-center py-12 text-muted-foreground"
              >
                <Route className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No trips</p>
              </div>
            ) : (
              <div data-ocid="trips.list" className="space-y-3">
                {filtered.map((trip, i) => (
                  <div
                    key={trip.id}
                    data-ocid={`trips.item.${i + 1}`}
                    className="bg-card rounded-2xl p-4 shadow-card border border-border"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm">
                            {trip.startLocation} → {trip.destination}
                          </p>
                          <StatusBadge status={trip.status} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {trucks?.find((t) => t.id === trip.truckId)
                            ?.plateNumber ?? trip.truckId}{" "}
                          ·{" "}
                          {drivers?.find((d) => d.id === trip.driverId)?.name ??
                            trip.driverId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {trip.distanceKm}km · ${trip.tripPriceUSD} · Fuel: $
                          {trip.fuelCostUSD}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(trip.startDate)}
                          {trip.endDate ? ` → ${formatDate(trip.endDate)}` : ""}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          data-ocid={`trips.edit_button.${i + 1}`}
                          onClick={() => openEdit(trip)}
                          className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          data-ocid={`trips.delete_button.${i + 1}`}
                          onClick={() => setDeleteId(trip.id)}
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
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="mx-4 rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Trip" : "New Trip"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Start Location</Label>
              <Select
                value={form.startLocation}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, startLocation: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {EA_CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Destination</Label>
              <Select
                value={form.destination}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, destination: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {EA_CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cargo Type</Label>
              <Input
                value={form.cargoType}
                onChange={(e) =>
                  setForm((p) => ({ ...p, cargoType: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Distance (km)</Label>
              <Input
                type="number"
                value={form.distanceKm}
                onChange={(e) =>
                  setForm((p) => ({ ...p, distanceKm: Number(e.target.value) }))
                }
              />
            </div>
            <div>
              <Label>Trip Price (USD)</Label>
              <Input
                type="number"
                value={form.tripPriceUSD}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    tripPriceUSD: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <Label>Fuel Cost (USD)</Label>
              <Input
                type="number"
                value={form.fuelCostUSD}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    fuelCostUSD: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <Label>Truck</Label>
              <Select
                value={form.truckId || "none"}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, truckId: v === "none" ? "" : v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select truck" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {trucks?.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.plateNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Driver</Label>
              <Select
                value={form.driverId || "none"}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, driverId: v === "none" ? "" : v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select driver" />
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
            <div>
              <Label>Linked Order</Label>
              <Select
                value={form.orderId || "none"}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, orderId: v === "none" ? "" : v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {orders?.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.customerName} ({o.pickupLocation})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
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
              disabled={addTrip.isPending || updateTrip.isPending}
              className="bg-primary text-primary-foreground"
            >
              {editing ? "Update" : "Save"} Trip
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
            <AlertDialogTitle>Delete Trip?</AlertDialogTitle>
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
