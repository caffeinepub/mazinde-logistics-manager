import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  module Truck {
    public func compareByStatusAndDate(a : Truck, b : Truck) : Order.Order {
      switch (Text.compare(a.status, b.status)) {
        case (#equal) { Int.compare(a.lastServiceDate, b.lastServiceDate) };
        case (order) { order };
      };
    };
  };

  module Notification {
    public func compareByCreatedAtAndType(a : Notification, b : Notification) : Order.Order {
      switch (Int.compare(a.createdAt, b.createdAt)) {
        case (#equal) { Text.compare(a.notificationType, b.notificationType) };
        case (order) { order };
      };
    };
  };

  module OrderModule {
    public func compareByStatusAndCreatedAt(a : Order, b : Order) : Order.Order {
      switch (Text.compare(a.status, b.status)) {
        case (#equal) { Int.compare(a.createdAt, b.createdAt) };
        case (order) { order };
      };
    };
  };

  module Trip {
    public func compareByStatusAndStartDate(a : Trip, b : Trip) : Order.Order {
      switch (Text.compare(a.status, b.status)) {
        case (#equal) { Int.compare(a.startDate, b.startDate) };
        case (order) { order };
      };
    };
  };

  module FinanceEntry {
    public func compareByTypeAndDate(a : FinanceEntry, b : FinanceEntry) : Order.Order {
      switch (Text.compare(a.entryType, b.entryType)) {
        case (#equal) { Int.compare(a.date, b.date) };
        case (order) { order };
      };
    };
  };

  module MaintenanceRecord {
    public func compareByServiceDate(a : MaintenanceRecord, b : MaintenanceRecord) : Order.Order {
      Int.compare(a.serviceDate, b.serviceDate);
    };
  };

  type Truck = {
    id : Text;
    plateNumber : Text;
    model : Text;
    capacityTons : Float;
    assignedDriverId : ?Text;
    lastServiceDate : Time.Time;
    status : Text;
    currentKm : Nat;
  };

  type Driver = {
    id : Text;
    name : Text;
    phone : Text;
    licenseNumber : Text;
    assignedTruckId : ?Text;
    salaryUSD : Float;
    isActive : Bool;
  };

  type Order = {
    id : Text;
    customerName : Text;
    customerPhone : Text;
    cargoType : Text;
    pickupLocation : Text;
    deliveryLocation : Text;
    priceUSD : Float;
    assignedTruckId : ?Text;
    assignedDriverId : ?Text;
    status : Text;
    createdAt : Time.Time;
  };

  type Trip = {
    id : Text;
    orderId : Text;
    truckId : Text;
    driverId : Text;
    startLocation : Text;
    destination : Text;
    distanceKm : Float;
    cargoType : Text;
    tripPriceUSD : Float;
    fuelCostUSD : Float;
    startDate : Time.Time;
    endDate : ?Time.Time;
    status : Text;
    createdAt : Time.Time;
  };

  type FinanceEntry = {
    id : Text;
    entryType : Text;
    category : Text;
    amountUSD : Float;
    description : Text;
    date : Time.Time;
    relatedTripId : ?Text;
  };

  type MaintenanceRecord = {
    id : Text;
    truckId : Text;
    serviceDate : Time.Time;
    costUSD : Float;
    serviceType : Text;
    mechanicName : Text;
    kmAtService : Nat;
  };

  type Notification = {
    id : Text;
    notificationType : Text;
    message : Text;
    isRead : Bool;
    createdAt : Time.Time;
  };

  type Settings = {
    companyName : Text;
    motto : Text;
    language : Text;
    logoUrl : ?Storage.ExternalBlob;
  };

  public type UserProfile = {
    name : Text;
    role : Text;
    phone : ?Text;
  };

  type DashboardStats = {
    availableTrucks : Nat;
    trucksOnTrip : Nat;
    trucksInMaintenance : Nat;
    pendingOrders : Nat;
    monthlyIncome : Float;
    monthlyExpenses : Float;
  };

  type MonthlyReport = {
    totalIncome : Float;
    totalExpenses : Float;
    profit : Float;
  };

  let trucks = Map.empty<Text, Truck>();
  let drivers = Map.empty<Text, Driver>();
  let orders = Map.empty<Text, Order>();
  let trips = Map.empty<Text, Trip>();
  let financeEntries = Map.empty<Text, FinanceEntry>();
  let maintenanceRecords = Map.empty<Text, MaintenanceRecord>();
  let notifications = Map.empty<Text, Notification>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var settings : Settings = {
    companyName = "Mazinde Logistics";
    motto = "Efficient & Reliable Logistics";
    language = "en";
    logoUrl = null;
  };

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // TRUCK OPERATIONS (Admin-only for write, User for read)
  public shared ({ caller }) func addTruck(truck : Truck) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add trucks");
    };
    if (truck.id == "" or truck.plateNumber == "" or truck.model == "") {
      Runtime.trap("Missing required truck fields: id, plateNumber or model.");
    };
    trucks.add(truck.id, truck);
  };

  public shared ({ caller }) func updateTruck(id : Text, updatedTruck : Truck) : async Truck {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update trucks");
    };
    let currentTruck = switch (trucks.get(id)) {
      case (null) { Runtime.trap("Truck not found") };
      case (?truck) { truck };
    };
    let newTruck : Truck = {
      currentTruck with
      plateNumber = updatedTruck.plateNumber;
      model = updatedTruck.model;
      capacityTons = updatedTruck.capacityTons;
      assignedDriverId = updatedTruck.assignedDriverId;
      lastServiceDate = updatedTruck.lastServiceDate;
      status = updatedTruck.status;
      currentKm = updatedTruck.currentKm;
    };
    trucks.add(id, newTruck);
    newTruck;
  };

  public shared ({ caller }) func deleteTruck(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete trucks");
    };
    switch (trucks.get(id)) {
      case (null) { Runtime.trap("Truck not found") };
      case (?_) {
        trucks.remove(id);
      };
    };
  };

  public query ({ caller }) func getTruck(id : Text) : async Truck {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view trucks");
    };
    switch (trucks.get(id)) {
      case (null) { Runtime.trap("Truck not found") };
      case (?truck) { truck };
    };
  };

  public query ({ caller }) func listTrucks() : async [Truck] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view trucks");
    };
    trucks.values().toArray().sort(Truck.compareByStatusAndDate);
  };

  // DRIVER OPERATIONS (Admin-only for write, User for read)
  public shared ({ caller }) func addDriver(driver : Driver) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add drivers");
    };
    if (driver.id == "" or driver.name == "" or driver.phone == "" or driver.licenseNumber == "") {
      Runtime.trap("Missing required driver fields: id, name, phone or license number.");
    };
    drivers.add(driver.id, driver);
  };

  public shared ({ caller }) func updateDriver(id : Text, updatedDriver : Driver) : async Driver {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update drivers");
    };
    let currentDriver = switch (drivers.get(id)) {
      case (null) { Runtime.trap("Driver not found") };
      case (?driver) { driver };
    };
    let newDriver : Driver = {
      currentDriver with
      name = updatedDriver.name;
      phone = updatedDriver.phone;
      licenseNumber = updatedDriver.licenseNumber;
      assignedTruckId = updatedDriver.assignedTruckId;
      salaryUSD = updatedDriver.salaryUSD;
      isActive = updatedDriver.isActive;
    };
    drivers.add(id, newDriver);
    newDriver;
  };

  public shared ({ caller }) func deleteDriver(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete drivers");
    };
    switch (drivers.get(id)) {
      case (null) { Runtime.trap("Driver not found") };
      case (?_) {
        drivers.remove(id);
      };
    };
  };

  public query ({ caller }) func getDriver(id : Text) : async Driver {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view drivers");
    };
    switch (drivers.get(id)) {
      case (null) { Runtime.trap("Driver not found") };
      case (?driver) { driver };
    };
  };

  public query ({ caller }) func listDrivers() : async [Driver] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view drivers");
    };
    drivers.values().toArray();
  };

  // ORDER OPERATIONS (Admin-only for write, User for read)
  public shared ({ caller }) func addOrder(order : Order) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add orders");
    };
    if (order.id == "" or order.customerName == "" or order.customerPhone == "") {
      Runtime.trap("Missing required order fields: id, customerName or customerPhone.");
    };
    orders.add(order.id, order);
  };

  public shared ({ caller }) func updateOrder(id : Text, updatedOrder : Order) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update orders");
    };
    let currentOrder = switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };
    let newOrder : Order = {
      currentOrder with
      customerName = updatedOrder.customerName;
      customerPhone = updatedOrder.customerPhone;
      cargoType = updatedOrder.cargoType;
      pickupLocation = updatedOrder.pickupLocation;
      deliveryLocation = updatedOrder.deliveryLocation;
      priceUSD = updatedOrder.priceUSD;
      assignedTruckId = updatedOrder.assignedTruckId;
      assignedDriverId = updatedOrder.assignedDriverId;
      status = updatedOrder.status;
    };
    orders.add(id, newOrder);
    newOrder;
  };

  public shared ({ caller }) func deleteOrder(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete orders");
    };
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?_) {
        orders.remove(id);
      };
    };
  };

  public query ({ caller }) func getOrder(id : Text) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };
  };

  public query ({ caller }) func listOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    orders.values().toArray().sort(OrderModule.compareByStatusAndCreatedAt);
  };

  // TRIP OPERATIONS (Admin-only for write, User for read)
  public shared ({ caller }) func addTrip(trip : Trip) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add trips");
    };
    if (trip.id == "" or trip.orderId == "" or trip.truckId == "" or trip.driverId == "") {
      Runtime.trap("Missing required trip fields: id, orderId, truckId or driverId.");
    };
    trips.add(trip.id, trip);
  };

  public shared ({ caller }) func updateTrip(id : Text, updatedTrip : Trip) : async Trip {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update trips");
    };
    let currentTrip = switch (trips.get(id)) {
      case (null) { Runtime.trap("Trip not found") };
      case (?trip) { trip };
    };
    let newTrip : Trip = {
      currentTrip with
      startLocation = updatedTrip.startLocation;
      destination = updatedTrip.destination;
      distanceKm = updatedTrip.distanceKm;
      cargoType = updatedTrip.cargoType;
      tripPriceUSD = updatedTrip.tripPriceUSD;
      fuelCostUSD = updatedTrip.fuelCostUSD;
      endDate = updatedTrip.endDate;
      status = updatedTrip.status;
    };
    trips.add(id, newTrip);
    newTrip;
  };

  public shared ({ caller }) func deleteTrip(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete trips");
    };
    switch (trips.get(id)) {
      case (null) { Runtime.trap("Trip not found") };
      case (?_) {
        trips.remove(id);
      };
    };
  };

  public query ({ caller }) func getTrip(id : Text) : async Trip {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view trips");
    };
    switch (trips.get(id)) {
      case (null) { Runtime.trap("Trip not found") };
      case (?trip) { trip };
    };
  };

  public query ({ caller }) func listTrips() : async [Trip] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view trips");
    };
    trips.values().toArray().sort(Trip.compareByStatusAndStartDate);
  };

  // FINANCE ENTRY OPERATIONS (Admin-only for write, User for read)
  public shared ({ caller }) func addFinanceEntry(entry : FinanceEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add finance entries");
    };
    if (entry.id == "" or entry.entryType == "" or entry.category == "") {
      Runtime.trap("Missing required finance entry fields: id, type or category.");
    };
    financeEntries.add(entry.id, entry);
  };

  public shared ({ caller }) func updateFinanceEntry(id : Text, updatedEntry : FinanceEntry) : async FinanceEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update finance entries");
    };
    let currentEntry = switch (financeEntries.get(id)) {
      case (null) { Runtime.trap("Finance entry not found") };
      case (?entry) { entry };
    };
    let newEntry : FinanceEntry = {
      currentEntry with
      entryType = updatedEntry.entryType;
      category = updatedEntry.category;
      amountUSD = updatedEntry.amountUSD;
      description = updatedEntry.description;
      relatedTripId = updatedEntry.relatedTripId;
    };
    financeEntries.add(id, newEntry);
    newEntry;
  };

  public shared ({ caller }) func deleteFinanceEntry(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete finance entries");
    };
    switch (financeEntries.get(id)) {
      case (null) { Runtime.trap("Finance entry not found") };
      case (?_) {
        financeEntries.remove(id);
      };
    };
  };

  public query ({ caller }) func getFinanceEntry(id : Text) : async FinanceEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view finance entries");
    };
    switch (financeEntries.get(id)) {
      case (null) { Runtime.trap("Finance entry not found") };
      case (?entry) { entry };
    };
  };

  public query ({ caller }) func listFinanceEntries() : async [FinanceEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view finance entries");
    };
    financeEntries.values().toArray().sort(FinanceEntry.compareByTypeAndDate);
  };

  public query ({ caller }) func getMonthlyReport(month : Nat, year : Nat) : async MonthlyReport {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view reports");
    };

    var totalIncome : Float = 0.0;
    var totalExpenses : Float = 0.0;

    for ((_, entry) in financeEntries.entries()) {
      let entryTime = entry.date;
      let entryYear = (entryTime / 1_000_000_000) / (365 * 24 * 3600) + 1970;
      let entryMonth = ((entryTime / 1_000_000_000) % (365 * 24 * 3600)) / (30 * 24 * 3600) + 1;

      if (entryYear == year and entryMonth == month) {
        if (entry.entryType == "Income") {
          totalIncome += entry.amountUSD;
        } else {
          totalExpenses += entry.amountUSD;
        };
      };
    };

    {
      totalIncome = totalIncome;
      totalExpenses = totalExpenses;
      profit = totalIncome - totalExpenses;
    };
  };

  public query ({ caller }) func getAnnualReport(year : Nat) : async MonthlyReport {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view reports");
    };

    var totalIncome : Float = 0.0;
    var totalExpenses : Float = 0.0;

    for ((_, entry) in financeEntries.entries()) {
      let entryTime = entry.date;
      let entryYear = (entryTime / 1_000_000_000) / (365 * 24 * 3600) + 1970;

      if (entryYear == year) {
        if (entry.entryType == "Income") {
          totalIncome += entry.amountUSD;
        } else {
          totalExpenses += entry.amountUSD;
        };
      };
    };

    {
      totalIncome = totalIncome;
      totalExpenses = totalExpenses;
      profit = totalIncome - totalExpenses;
    };
  };

  // MAINTENANCE RECORD OPERATIONS (Admin-only for write, User for read)
  public shared ({ caller }) func addMaintenanceRecord(record : MaintenanceRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add maintenance records");
    };
    if (record.id == "" or record.truckId == "" or record.serviceType == "" or record.mechanicName == "") {
      Runtime.trap("Missing required maintenance record fields: id, truckId, serviceType or mechanicName.");
    };
    maintenanceRecords.add(record.id, record);
  };

  public shared ({ caller }) func updateMaintenanceRecord(id : Text, updatedRecord : MaintenanceRecord) : async MaintenanceRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update maintenance records");
    };
    let currentRecord = switch (maintenanceRecords.get(id)) {
      case (null) { Runtime.trap("Maintenance record not found") };
      case (?record) { record };
    };
    let newRecord : MaintenanceRecord = {
      currentRecord with
      costUSD = updatedRecord.costUSD;
      serviceType = updatedRecord.serviceType;
      mechanicName = updatedRecord.mechanicName;
      kmAtService = updatedRecord.kmAtService;
    };
    maintenanceRecords.add(id, newRecord);
    newRecord;
  };

  public shared ({ caller }) func deleteMaintenanceRecord(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete maintenance records");
    };
    switch (maintenanceRecords.get(id)) {
      case (null) { Runtime.trap("Maintenance record not found") };
      case (?_) {
        maintenanceRecords.remove(id);
      };
    };
  };

  public query ({ caller }) func getMaintenanceRecord(id : Text) : async MaintenanceRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view maintenance records");
    };
    switch (maintenanceRecords.get(id)) {
      case (null) { Runtime.trap("Maintenance record not found") };
      case (?record) { record };
    };
  };

  public query ({ caller }) func listMaintenanceRecords() : async [MaintenanceRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view maintenance records");
    };
    maintenanceRecords.values().toArray().sort(MaintenanceRecord.compareByServiceDate);
  };

  public query ({ caller }) func listMaintenanceByTruck(truckId : Text) : async [MaintenanceRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view maintenance records");
    };
    let filtered = maintenanceRecords.values().toArray().filter(
      func(record) { record.truckId == truckId }
    );
    filtered.sort(MaintenanceRecord.compareByServiceDate);
  };

  public query ({ caller }) func getTrucksNeedingMaintenance() : async [Truck] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view trucks");
    };
    let sixMonthsInNanos : Time.Time = 6 * 30 * 24 * 60 * 60 * 1_000_000_000;
    let currentTime = Time.now();

    let filtered = trucks.values().toArray().filter(
      func(truck) {
        (currentTime - truck.lastServiceDate) > sixMonthsInNanos
      }
    );
    filtered;
  };

  // NOTIFICATION OPERATIONS (Admin-only for write, User for read)
  public shared ({ caller }) func addNotification(notification : Notification) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add notifications");
    };
    notifications.add(notification.id, notification);
  };

  public shared ({ caller }) func markNotificationRead(notificationId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };
    let notification = switch (notifications.get(notificationId)) {
      case (null) { Runtime.trap("Notification not found") };
      case (?n) { n };
    };
    let updatedNotification : Notification = {
      notification with
      isRead = true;
    };
    notifications.add(notificationId, updatedNotification);
  };

  public shared ({ caller }) func markAllNotificationsRead() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };
    for ((notificationId, notification) in notifications.entries()) {
      let updatedNotification : Notification = {
        notification with
        isRead = true;
      };
      notifications.add(notificationId, updatedNotification);
    };
  };

  public query ({ caller }) func getNotification(id : Text) : async Notification {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };
    switch (notifications.get(id)) {
      case (null) { Runtime.trap("Notification not found") };
      case (?notification) { notification };
    };
  };

  public query ({ caller }) func listNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };
    notifications.values().toArray().sort(Notification.compareByCreatedAtAndType);
  };

  // SETTINGS OPERATIONS (Admin-only for write, User for read)
  public shared ({ caller }) func updateSettings(newSettings : Settings) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update settings");
    };
    settings := newSettings;
  };

  public query ({ caller }) func getSettings() : async Settings {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view settings");
    };
    settings;
  };

  // DASHBOARD STATS (User-level access)
  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view dashboard stats");
    };

    var availableTrucks : Nat = 0;
    var trucksOnTrip : Nat = 0;
    var trucksInMaintenance : Nat = 0;

    for ((_, truck) in trucks.entries()) {
      if (truck.status == "Available") {
        availableTrucks += 1;
      } else if (truck.status == "OnTrip") {
        trucksOnTrip += 1;
      } else if (truck.status == "Maintenance") {
        trucksInMaintenance += 1;
      };
    };

    var pendingOrders : Nat = 0;
    for ((_, order) in orders.entries()) {
      if (order.status == "Pending") {
        pendingOrders += 1;
      };
    };

    let currentTime = Time.now();
    let monthStart = currentTime - (30 * 24 * 60 * 60 * 1_000_000_000);

    var monthlyIncome : Float = 0.0;
    var monthlyExpenses : Float = 0.0;

    for ((_, entry) in financeEntries.entries()) {
      if (entry.date >= monthStart) {
        if (entry.entryType == "Income") {
          monthlyIncome += entry.amountUSD;
        } else {
          monthlyExpenses += entry.amountUSD;
        };
      };
    };

    {
      availableTrucks = availableTrucks;
      trucksOnTrip = trucksOnTrip;
      trucksInMaintenance = trucksInMaintenance;
      pendingOrders = pendingOrders;
      monthlyIncome = monthlyIncome;
      monthlyExpenses = monthlyExpenses;
    };
  };
};
