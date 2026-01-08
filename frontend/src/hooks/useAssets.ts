import { useState, useEffect, useCallback } from "react";
import { AssetApi } from "../services/assetApi";
import {
  Asset,
  CreateAssetRequest,
  UpdateAssetRequest,
  AssetListResponse,
  AssetFilters,
  ApiException,
} from "../types";

export interface UseAssetsResult {
  assets: Asset[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  refetch: (filters?: AssetFilters) => Promise<void>;
}

/**
 * Custom hook for managing asset list with filtering and pagination
 */
export const useAssets = (initialFilters?: AssetFilters): UseAssetsResult => {
  const [data, setData] = useState<AssetListResponse>({
    assets: [],
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async (filters?: AssetFilters) => {
    setLoading(true);
    setError(null);

    try {
      const response = await AssetApi.getAssets(filters);
      setData(response);
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.message);
      } else {
        setError("Failed to fetch assets");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets(initialFilters);
  }, [fetchAssets, initialFilters]);

  return {
    assets: data.assets,
    total: data.total,
    page: data.page,
    pageSize: data.pageSize,
    totalPages: data.totalPages,
    loading,
    error,
    refetch: fetchAssets,
  };
};
export interface UseAssetResult {
  asset: Asset | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching a single asset by ID
 */
export const useAsset = (id: number): UseAssetResult => {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAsset = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await AssetApi.getAsset(id);
      setAsset(response);
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.message);
      } else {
        setError("Failed to fetch asset");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchAsset();
    }
  }, [fetchAsset, id]);

  return {
    asset,
    loading,
    error,
    refetch: fetchAsset,
  };
};

export interface UseCreateAssetResult {
  createAsset: (asset: CreateAssetRequest) => Promise<Asset | null>;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for creating assets
 */
export const useCreateAsset = (): UseCreateAssetResult => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createAsset = useCallback(
    async (asset: CreateAssetRequest): Promise<Asset | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await AssetApi.createAsset(asset);
        return response;
      } catch (err) {
        if (err instanceof ApiException) {
          if (err.details && Array.isArray(err.details)) {
            const messages = err.details.map((d: any) => d.msg).join(", ");
            setError(`${err.message}: ${messages}`);
          } else {
            setError(err.message);
          }
        } else {
          setError("Failed to create asset");
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    createAsset,
    loading,
    error,
  };
};

export interface UseUpdateAssetResult {
  updateAsset: (id: number, asset: UpdateAssetRequest) => Promise<Asset | null>;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for updating assets
 */
export const useUpdateAsset = (): UseUpdateAssetResult => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateAsset = useCallback(
    async (id: number, asset: UpdateAssetRequest): Promise<Asset | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await AssetApi.updateAsset(id, asset);
        return response;
      } catch (err) {
        if (err instanceof ApiException) {
          if (err.details && Array.isArray(err.details)) {
            const messages = err.details.map((d: any) => d.msg).join(", ");
            setError(`${err.message}: ${messages}`);
          } else {
            setError(err.message);
          }
        } else {
          setError("Failed to update asset");
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    updateAsset,
    loading,
    error,
  };
};

export interface UseDeleteAssetResult {
  deleteAsset: (id: number) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for deleting assets
 */
export const useDeleteAsset = (): UseDeleteAssetResult => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const deleteAsset = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await AssetApi.deleteAsset(id);
      return true;
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.message);
      } else {
        setError("Failed to delete asset");
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteAsset,
    loading,
    error,
  };
};

export interface UseCategoriesResult {
  categories: string[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching asset categories
 */
export const useCategories = (): UseCategoriesResult => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await AssetApi.getCategories();
      setCategories(response);
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.message);
      } else {
        setError("Failed to fetch categories");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
};

export interface UseStatusesResult {
  statuses: string[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching asset statuses
 */
export const useStatuses = (): UseStatusesResult => {
  const [statuses, setStatuses] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatuses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await AssetApi.getStatuses();
      setStatuses(response);
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.message);
      } else {
        setError("Failed to fetch statuses");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  return {
    statuses,
    loading,
    error,
    refetch: fetchStatuses,
  };
};
