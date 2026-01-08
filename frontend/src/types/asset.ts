export interface Asset {
  id: number;
  name: string;
  description: string;
  category: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  status: "active" | "inactive" | "maintenance" | "disposed";
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetRequest {
  name: string;
  description: string;
  category: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  status: "active" | "inactive" | "maintenance" | "disposed";
}

export interface UpdateAssetRequest {
  name: string;
  description: string;
  category: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  status: "active" | "inactive" | "maintenance" | "disposed";
}

export interface AssetListResponse {
  assets: Asset[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AssetFilters {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export type AssetStatus = "active" | "inactive" | "maintenance" | "disposed";

// Utility types for better type safety
export interface AssetFormData
  extends Omit<CreateAssetRequest, "purchaseDate"> {
  purchaseDate: Date | string;
}

export interface AssetUpdateFormData
  extends Omit<UpdateAssetRequest, "purchaseDate"> {
  purchaseDate: Date | string;
}

// Search and filter types
export interface AssetSearchParams {
  query?: string;
  category?: string;
  status?: AssetStatus;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface AssetQueryParams extends AssetSearchParams, PaginationParams {}

// Response wrapper types
export interface AssetResponse {
  asset: Asset;
}

export interface CategoriesResponse {
  categories: string[];
}
