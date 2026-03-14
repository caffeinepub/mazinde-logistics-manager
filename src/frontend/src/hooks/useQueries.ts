import type {
  Driver,
  FinanceEntry,
  MaintenanceRecord,
  Order,
  Settings,
  Trip,
  Truck,
} from "@/backend";
import { useActor } from "@/hooks/useActor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ---- Dashboard ----
export function useDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

// ---- Trucks ----
export function useTrucks() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["trucks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listTrucks();
    },
    enabled: !!actor && !isFetching,
  });
}
export function useAddTruck() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (t: Truck) => actor!.addTruck(t),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trucks"] }),
  });
}
export function useUpdateTruck() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, truck }: { id: string; truck: Truck }) =>
      actor!.updateTruck(id, truck),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trucks"] }),
  });
}
export function useDeleteTruck() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actor!.deleteTruck(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trucks"] }),
  });
}
export function useMaintenanceTrucks() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["trucks-maintenance"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTrucksNeedingMaintenance();
    },
    enabled: !!actor && !isFetching,
  });
}

// ---- Drivers ----
export function useDrivers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["drivers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listDrivers();
    },
    enabled: !!actor && !isFetching,
  });
}
export function useAddDriver() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: Driver) => actor!.addDriver(d),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drivers"] }),
  });
}
export function useUpdateDriver() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, driver }: { id: string; driver: Driver }) =>
      actor!.updateDriver(id, driver),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drivers"] }),
  });
}
export function useDeleteDriver() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actor!.deleteDriver(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drivers"] }),
  });
}

// ---- Orders ----
export function useOrders() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listOrders();
    },
    enabled: !!actor && !isFetching,
  });
}
export function useAddOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (o: Order) => actor!.addOrder(o),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}
export function useUpdateOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, order }: { id: string; order: Order }) =>
      actor!.updateOrder(id, order),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}
export function useDeleteOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actor!.deleteOrder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

// ---- Trips ----
export function useTrips() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["trips"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listTrips();
    },
    enabled: !!actor && !isFetching,
  });
}
export function useAddTrip() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (t: Trip) => actor!.addTrip(t),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  });
}
export function useUpdateTrip() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, trip }: { id: string; trip: Trip }) =>
      actor!.updateTrip(id, trip),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  });
}
export function useDeleteTrip() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actor!.deleteTrip(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  });
}

// ---- Finance ----
export function useFinanceEntries() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["finance"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listFinanceEntries();
    },
    enabled: !!actor && !isFetching,
  });
}
export function useAddFinanceEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (e: FinanceEntry) => actor!.addFinanceEntry(e),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["finance"] }),
  });
}
export function useDeleteFinanceEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actor!.deleteFinanceEntry(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["finance"] }),
  });
}
export function useMonthlyReport(month: number, year: number) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["monthly-report", month, year],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMonthlyReport(BigInt(month), BigInt(year));
    },
    enabled: !!actor && !isFetching,
  });
}
export function useAnnualReport(year: number) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["annual-report", year],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAnnualReport(BigInt(year));
    },
    enabled: !!actor && !isFetching,
  });
}

// ---- Settings ----
export function useSettings() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSettings();
    },
    enabled: !!actor && !isFetching,
  });
}
export function useUpdateSettings() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (s: Settings) => actor!.updateSettings(s),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });
}

// ---- Maintenance ----
export function useMaintenanceRecords() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["maintenance"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMaintenanceRecords();
    },
    enabled: !!actor && !isFetching,
  });
}
export function useAddMaintenanceRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (r: MaintenanceRecord) => actor!.addMaintenanceRecord(r),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["maintenance"] }),
  });
}
