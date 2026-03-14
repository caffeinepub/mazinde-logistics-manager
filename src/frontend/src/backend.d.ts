import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface MonthlyReport {
    totalIncome: number;
    totalExpenses: number;
    profit: number;
}
export interface Trip {
    id: string;
    status: string;
    truckId: string;
    driverId: string;
    destination: string;
    cargoType: string;
    endDate?: Time;
    createdAt: Time;
    fuelCostUSD: number;
    orderId: string;
    distanceKm: number;
    startLocation: string;
    tripPriceUSD: number;
    startDate: Time;
}
export type Time = bigint;
export interface Driver {
    id: string;
    assignedTruckId?: string;
    name: string;
    isActive: boolean;
    licenseNumber: string;
    salaryUSD: number;
    phone: string;
}
export interface MaintenanceRecord {
    id: string;
    kmAtService: bigint;
    serviceDate: Time;
    truckId: string;
    serviceType: string;
    mechanicName: string;
    costUSD: number;
}
export interface Order {
    id: string;
    customerName: string;
    status: string;
    cargoType: string;
    assignedTruckId?: string;
    customerPhone: string;
    createdAt: Time;
    assignedDriverId?: string;
    deliveryLocation: string;
    priceUSD: number;
    pickupLocation: string;
}
export interface DashboardStats {
    pendingOrders: bigint;
    trucksOnTrip: bigint;
    availableTrucks: bigint;
    trucksInMaintenance: bigint;
    monthlyExpenses: number;
    monthlyIncome: number;
}
export interface Settings {
    motto: string;
    language: string;
    logoUrl?: ExternalBlob;
    companyName: string;
}
export interface Truck {
    id: string;
    status: string;
    model: string;
    currentKm: bigint;
    assignedDriverId?: string;
    plateNumber: string;
    lastServiceDate: Time;
    capacityTons: number;
}
export interface FinanceEntry {
    id: string;
    entryType: string;
    relatedTripId?: string;
    date: Time;
    description: string;
    category: string;
    amountUSD: number;
}
export interface Notification {
    id: string;
    notificationType: string;
    createdAt: Time;
    isRead: boolean;
    message: string;
}
export interface UserProfile {
    name: string;
    role: string;
    phone?: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addDriver(driver: Driver): Promise<void>;
    addFinanceEntry(entry: FinanceEntry): Promise<void>;
    addMaintenanceRecord(record: MaintenanceRecord): Promise<void>;
    addNotification(notification: Notification): Promise<void>;
    addOrder(order: Order): Promise<void>;
    addTrip(trip: Trip): Promise<void>;
    addTruck(truck: Truck): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteDriver(id: string): Promise<void>;
    deleteFinanceEntry(id: string): Promise<void>;
    deleteMaintenanceRecord(id: string): Promise<void>;
    deleteOrder(id: string): Promise<void>;
    deleteTrip(id: string): Promise<void>;
    deleteTruck(id: string): Promise<void>;
    getAnnualReport(year: bigint): Promise<MonthlyReport>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<DashboardStats>;
    getDriver(id: string): Promise<Driver>;
    getFinanceEntry(id: string): Promise<FinanceEntry>;
    getMaintenanceRecord(id: string): Promise<MaintenanceRecord>;
    getMonthlyReport(month: bigint, year: bigint): Promise<MonthlyReport>;
    getNotification(id: string): Promise<Notification>;
    getOrder(id: string): Promise<Order>;
    getSettings(): Promise<Settings>;
    getTrip(id: string): Promise<Trip>;
    getTruck(id: string): Promise<Truck>;
    getTrucksNeedingMaintenance(): Promise<Array<Truck>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listDrivers(): Promise<Array<Driver>>;
    listFinanceEntries(): Promise<Array<FinanceEntry>>;
    listMaintenanceByTruck(truckId: string): Promise<Array<MaintenanceRecord>>;
    listMaintenanceRecords(): Promise<Array<MaintenanceRecord>>;
    listNotifications(): Promise<Array<Notification>>;
    listOrders(): Promise<Array<Order>>;
    listTrips(): Promise<Array<Trip>>;
    listTrucks(): Promise<Array<Truck>>;
    markAllNotificationsRead(): Promise<void>;
    markNotificationRead(notificationId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateDriver(id: string, updatedDriver: Driver): Promise<Driver>;
    updateFinanceEntry(id: string, updatedEntry: FinanceEntry): Promise<FinanceEntry>;
    updateMaintenanceRecord(id: string, updatedRecord: MaintenanceRecord): Promise<MaintenanceRecord>;
    updateOrder(id: string, updatedOrder: Order): Promise<Order>;
    updateSettings(newSettings: Settings): Promise<void>;
    updateTrip(id: string, updatedTrip: Trip): Promise<Trip>;
    updateTruck(id: string, updatedTruck: Truck): Promise<Truck>;
}
