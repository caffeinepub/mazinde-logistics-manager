import type { Order } from "@/backend";
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
  useAddOrder,
  useDeleteOrder,
  useDrivers,
  useOrders,
  useTrucks,
  useUpdateOrder,
} from "@/hooks/useQueries";
import { Package, Pencil, Plus, Trash2 } from "lucide-react";
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
const STATUS_OPTIONS = [
  "Pending",
  "Approved",
  "On Trip",
  "Delivered",
  "Cancelled",
];

function emptyOrder(): Order {
  return {
    id: crypto.randomUUID(),
    customerName: "",
    customerPhone: "",
    cargoType: "",
    pickupLocation: "",
    deliveryLocation: "",
    priceUSD: 0,
    status: "Pending",
    createdAt: BigInt(Date.now()) * 1_000_000n,
    assignedTruckId: undefined,
    assignedDriverId: undefined,
  };
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: "badge-pending",
    Approved: "bg-blue-100 text-blue-800",
    "On Trip": "badge-on-trip",
    Delivered: "badge-delivered",
    Cancelled: "badge-cancelled",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] || "bg-gray-100 text-gray-800"}`}
    >
      {status}
    </span>
  );
}

export default function OrdersPage() {
  const { data: orders, isLoading } = useOrders();
  const { data: trucks } = useTrucks();
  const { data: drivers } = useDrivers();
  const addOrder = useAddOrder();
  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Order | null>(null);
  const [form, setForm] = useState<Order>(emptyOrder());
  const [statusFilter, setStatusFilter] = useState("all");

  const openAdd = () => {
    setEditing(null);
    setForm(emptyOrder());
    setDialogOpen(true);
  };
  const openEdit = (o: Order) => {
    setEditing(o);
    setForm({ ...o });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await updateOrder.mutateAsync({ id: editing.id, order: form });
        toast.success("Order updated");
      } else {
        await addOrder.mutateAsync(form);
        toast.success("Order added");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save order");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteOrder.mutateAsync(deleteId);
      toast.success("Order deleted");
    } catch {
      toast.error("Failed to delete");
    }
    setDeleteId(null);
  };

  const filtered =
    orders?.filter(
      (o) => statusFilter === "all" || o.status === statusFilter,
    ) ?? [];

  return (
    <div className="animate-fade-in">
      <div className="gradient-navy px-4 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-bold text-white">
              Orders
            </h1>
            <p className="text-white/50 text-sm">Customer transport requests</p>
          </div>
          <Button
            data-ocid="orders.add_button"
            onClick={openAdd}
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-9 px-4 text-sm"
          >
            <Plus className="w-4 h-4 mr-1" /> New Order
          </Button>
        </div>
      </div>

      <div className="px-4 pt-4">
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList
            data-ocid="orders.status.tab"
            className="w-full mb-4 overflow-x-auto"
          >
            <TabsTrigger value="all" className="flex-1 text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="Pending" className="flex-1 text-xs">
              Pending
            </TabsTrigger>
            <TabsTrigger value="Approved" className="flex-1 text-xs">
              Approved
            </TabsTrigger>
            <TabsTrigger value="On Trip" className="flex-1 text-xs">
              On Trip
            </TabsTrigger>
            <TabsTrigger value="Delivered" className="flex-1 text-xs">
              Done
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
                data-ocid="orders.list"
                className="text-center py-12 text-muted-foreground"
              >
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No orders</p>
              </div>
            ) : (
              <div data-ocid="orders.list" className="space-y-3">
                {filtered.map((order, i) => (
                  <div
                    key={order.id}
                    data-ocid={`orders.item.${i + 1}`}
                    className="bg-card rounded-2xl p-4 shadow-card border border-border"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{order.customerName}</p>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {order.pickupLocation} → {order.deliveryLocation}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.cargoType} · ${order.priceUSD}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.customerPhone}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          data-ocid={`orders.edit_button.${i + 1}`}
                          onClick={() => openEdit(order)}
                          className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          data-ocid={`orders.delete_button.${i + 1}`}
                          onClick={() => setDeleteId(order.id)}
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
            <DialogTitle>{editing ? "Edit Order" : "New Order"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Customer Name</Label>
              <Input
                value={form.customerName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, customerName: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Customer Phone</Label>
              <Input
                value={form.customerPhone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, customerPhone: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Cargo Type</Label>
              <Input
                value={form.cargoType}
                onChange={(e) =>
                  setForm((p) => ({ ...p, cargoType: e.target.value }))
                }
                placeholder="Electronics, Food, etc."
              />
            </div>
            <div>
              <Label>Pickup Location</Label>
              <Select
                value={form.pickupLocation}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, pickupLocation: v }))
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
              <Label>Delivery Location</Label>
              <Select
                value={form.deliveryLocation}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, deliveryLocation: v }))
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
              <Label>Price (USD)</Label>
              <Input
                type="number"
                value={form.priceUSD}
                onChange={(e) =>
                  setForm((p) => ({ ...p, priceUSD: Number(e.target.value) }))
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
              <Label>Assigned Truck</Label>
              <Select
                value={form.assignedTruckId ?? "none"}
                onValueChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    assignedTruckId: v === "none" ? undefined : v,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
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
              disabled={addOrder.isPending || updateOrder.isPending}
              className="bg-primary text-primary-foreground"
            >
              {editing ? "Update" : "Save"} Order
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
            <AlertDialogTitle>Delete Order?</AlertDialogTitle>
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
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
