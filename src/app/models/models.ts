// Shared models and interfaces for the Pharmacy Stock application

// Pagination
export interface PaginatedResult<T> {
  items: T[];
  pageIndex: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Category models
export interface Category {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface CreateCategory {
  name: string;
  description?: string;
}

export interface UpdateCategory {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

// Medicine models
export interface Medicine {
  id: number;
  categoryId: number;
  categoryName: string;
  medicineCode: string;
  name: string;
  genericName?: string;
  manufacturer?: string;
  storageCondition?: string;
  unitOfMeasure: string;
  lowStockThreshold: number;
  isActive: boolean;
}

export interface CreateMedicine {
  categoryId: number;
  medicineCode: string;
  name: string;
  genericName?: string;
  manufacturer?: string;
  storageCondition?: string;
  unitOfMeasure: string;
  lowStockThreshold?: number;
}

export interface UpdateMedicine {
  id: number;
  categoryId: number;
  medicineCode: string;
  name: string;
  genericName?: string;
  manufacturer?: string;
  storageCondition?: string;
  unitOfMeasure: string;
  lowStockThreshold: number;
  isActive: boolean;
}

// Supplier models
export interface Supplier {
  id: number;
  supplierCode: string;
  name: string;
  contactInfo?: string;
  isActive: boolean;
}

export interface CreateSupplier {
  supplierCode: string;
  name: string;
  contactInfo?: string;
}

export interface UpdateSupplier {
  id: number;
  supplierCode: string;
  name: string;
  contactInfo?: string;
  isActive: boolean;
}

// API Response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Auth models
export interface LoginRequest {
  username?: string;
  password?: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  id: number;
  username: string;
  role: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface Notification {
  id: number;
  userId?: number;
  isSystemAlert: boolean;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: number; // NotificationType enum (0=Info, 1=Warning, 2=Critical, 3=StockAlert, 4=ExpiryAlert)
  priority: number; // 1-5 priority level
  relatedEntityId?: number;
  relatedEntityType?: string;
}

export interface CreateNotification {
  userId?: number;
  isSystemAlert?: boolean;
  title: string;
  message: string;
  type?: number;
  priority?: number;
  relatedEntityId?: number;
  relatedEntityType?: string;
}

// Dashboard models
export interface DashboardAlerts {
  critical: AlertItem[];
  warning: AlertItem[];
}

export interface AlertItem {
  medicineId: number;
  medicineName: string;
  batchNumber: string;
  expiryDate: string;
  daysRemaining: number;
  currentQuantity: number;
  message?: string; // Added for system alerts
}

export interface InventoryValuation {
  totalValue: number;
  totalItems: number;
  activeBatches: number;
}

export interface DashboardStats {
  totalMedicines: number;
  totalInventoryValue: number;
  criticalAlerts: number;
  warningAlerts: number;
  activeBatches: number;
  lowStockItems: number;
}

export interface LowStockAlert {
  medicineId: number;
  medicineName: string;
  medicineCode: string;
  totalQuantity: number;
  minimumLevel: number;
  categoryName: string;
}

export interface RecentMovement {
  id: number;
  medicineName: string;
  batchNumber: string;
  movementType: string;
  quantity: number;
  reason?: string;
  performedAt: string;
  performedBy: string;
}



// Inventory models

// Batch Status enum matching backend
export enum BatchStatus {
  Active = 0,       // Ready for sale
  Quarantined = 1,  // Stopped manually (Recall, Damage, Inspection)
  Expired = 2,      // Date passed, still has quantity (Needs Disposal)
  Depleted = 3,     // Quantity is 0 (History only)
  Closed = 4        // Closed
}

export interface StockCheck {
  medicineId: number;
  medicineName: string;
  totalQuantity: number;
  batches: MedicineBatch[];
}

export interface MedicineBatch {
  id: number;
  medicineId: number;
  medicineName: string;
  supplierId: number;
  supplierName: string;
  batchNumber: string;
  expiryDate: string;
  receivedDate: string;
  initialQuantity: number;
  currentQuantity: number;
  purchasePrice: number;
  status: BatchStatus;
  isActive: boolean;
  sellingPrice: number;
  warning?: string;
}
export interface StockMovementDto {
  id: number;
  medicineBatchId: number;
  medicineName: string;
  batchNumber: string;
  movementType: string;
  quantity: number;
  reason?: string;
  performedAt: Date;
  performedByUserId: number;
  performedByUserName?: string;
}

export interface AlternativeMedicineDto {
  medicineId: number;
  medicineName: string;
  medicineCode: string;
  manufacturer?: string;
  totalAvailableStock: number;
}

export interface ExpiryManagementDto {
  id: number;
  medicineId: number;
  medicineName: string;
  categoryName: string;
  supplierId: number;
  supplierName: string;
  batchNumber: string;
  expiryDate: string;
  currentQuantity: number;
  purchasePrice: number;
  sellingPrice: number;
  status: number; // 0=Active, 1=Quarantined, 2=Expired, 3=Depleted
  daysUntilExpiry: number;
  expiryStatus: string; // Expired, Critical, Warning, Normal
}

export interface CreateMedicineBatch {
  medicineId: number;
  supplierId: number;
  batchNumber: string;
  expiryDate: string;
  initialQuantity: number;
  purchasePrice: number;
  sellingPrice: number;
}

// Dispense visibility models
export interface BatchAllocation {
  batchId: number;
  batchNumber: string;
  expiryDate: string;
  quantityAllocated: number;
  remainingAfter: number;
}

export interface DispensePreview {
  medicineId: number;
  medicineName: string;
  requestedQuantity: number;
  totalAvailable: number;
  canDispense: boolean;
  message?: string;
  batchAllocations: BatchAllocation[];
}

export interface DispenseResult {
  medicineId: number;
  medicineName: string;
  totalDispensed: number;
  batchAllocations: BatchAllocation[];
  performedAt: string;
  performedBy: string;
}

export interface UpdateMedicineBatch {
  id: number;
  batchNumber: string;
  expiryDate: string;
  status: BatchStatus;
  isActive: boolean;
  purchasePrice: number;
  sellingPrice: number;
}

// User models
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roleId: number;
  roleName: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUser {
  username: string;

  email: string;
  fullName: string;
  roleId: number;
}

export interface UpdateUser {
  id: number;
  email?: string;
  fullName?: string;
  roleId?: number;
  isActive?: boolean;
}

export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
}
