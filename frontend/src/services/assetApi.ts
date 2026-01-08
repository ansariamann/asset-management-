import api from "./api";
import {
  Asset,
  CreateAssetRequest,
  UpdateAssetRequest,
  AssetListResponse,
  AssetFilters,
  ApiException,
} from "../types";

export class AssetApi {
  private static readonly BASE_PATH = "/api/assets";

  /**
   * Get all assets with optional filtering and pagination
   */
  static async getAssets(filters?: AssetFilters): Promise<AssetListResponse> {
    try {
      const params = new URLSearchParams();

      if (filters?.search) {
        params.append("search", filters.search);
      }
      if (filters?.category) {
        params.append("category", filters.category);
      }
      if (filters?.status) {
        params.append("status", filters.status);
      }
      if (filters?.page) {
        params.append("page", filters.page.toString());
      }
      if (filters?.pageSize) {
        params.append("page_size", filters.pageSize.toString());
      }

      const queryString = params.toString();
      const url = queryString
        ? `${this.BASE_PATH}?${queryString}`
        : this.BASE_PATH;

      const response = await api.get<AssetListResponse>(url);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Get a specific asset by ID
   */
  static async getAsset(id: number): Promise<Asset> {
    try {
      const response = await api.get<Asset>(`${this.BASE_PATH}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Create a new asset
   */
  static async createAsset(asset: CreateAssetRequest): Promise<Asset> {
    try {
      const response = await api.post<Asset>(this.BASE_PATH, asset);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Update an existing asset
   */
  static async updateAsset(
    id: number,
    asset: UpdateAssetRequest
  ): Promise<Asset> {
    try {
      const response = await api.put<Asset>(`${this.BASE_PATH}/${id}`, asset);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Delete an asset
   */
  static async deleteAsset(id: number): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/${id}`);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Get available asset categories
   */
  static async getCategories(): Promise<string[]> {
    try {
      const response = await api.get<string[]>(`${this.BASE_PATH}/categories`);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Get available asset statuses
   */
  static async getStatuses(): Promise<string[]> {
    try {
      const response = await api.get<string[]>(`${this.BASE_PATH}/statuses`);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Search assets by query string
   */
  static async searchAssets(
    query: string,
    filters?: Omit<AssetFilters, "search">
  ): Promise<AssetListResponse> {
    return this.getAssets({ ...filters, search: query });
  }

  /**
   * Get assets by category
   */
  static async getAssetsByCategory(
    category: string,
    filters?: Omit<AssetFilters, "category">
  ): Promise<AssetListResponse> {
    return this.getAssets({ ...filters, category });
  }

  /**
   * Get assets by status
   */
  static async getAssetsByStatus(
    status: string,
    filters?: Omit<AssetFilters, "status">
  ): Promise<AssetListResponse> {
    return this.getAssets({ ...filters, status });
  }

  /**
   * Check if an asset exists by ID
   */
  static async assetExists(id: number): Promise<boolean> {
    try {
      await this.getAsset(id);
      return true;
    } catch (error) {
      if (error instanceof ApiException && error.status === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Validate asset data before submission
   */
  static validateAssetData(
    asset: CreateAssetRequest | UpdateAssetRequest
  ): string[] {
    const errors: string[] = [];

    if (!asset.name?.trim()) {
      errors.push("Asset name is required");
    }
    if (!asset.category?.trim()) {
      errors.push("Category is required");
    }
    if (!asset.serialNumber?.trim()) {
      errors.push("Serial number is required");
    }
    if (!asset.purchaseDate) {
      errors.push("Purchase date is required");
    }
    if (asset.purchasePrice <= 0) {
      errors.push("Purchase price must be greater than 0");
    }
    if (!asset.status) {
      errors.push("Status is required");
    }

    return errors;
  }

  /**
   * Handle API errors and convert them to ApiException
   */
  private static handleApiError(error: any): ApiException {
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage =
        data?.error?.message || data?.detail || "An error occurred";
      const errorCode = data?.error?.code || `HTTP_${status}`;
      const errorDetails = data?.error?.details || data;

      return new ApiException(status, errorCode, errorMessage, errorDetails);
    } else if (error.request) {
      return new ApiException(
        0,
        "NETWORK_ERROR",
        "Network error - unable to reach server"
      );
    } else {
      return new ApiException(
        0,
        "REQUEST_ERROR",
        error.message || "Request setup error"
      );
    }
  }
}
