import React, { useState } from "react";
import {
  useAssets,
  useAsset,
  useCreateAsset,
  useUpdateAsset,
  useDeleteAsset,
  useCategories,
} from "../hooks/useAssets";
import { CreateAssetRequest, UpdateAssetRequest, AssetFilters } from "../types";

/**
 * Example component demonstrating how to use the asset API hooks
 * This is for documentation purposes and shows all available operations
 */
export const AssetApiUsageExample: React.FC = () => {
  const [selectedAssetId, setSelectedAssetId] = useState<number>(1);
  const [filters, setFilters] = useState<AssetFilters>({
    page: 1,
    pageSize: 10,
  });

  // Hook for fetching asset list with filters
  const {
    assets,
    total,
    loading: assetsLoading,
    error: assetsError,
    refetch: refetchAssets,
  } = useAssets(filters);

  // Hook for fetching a single asset
  const {
    asset,
    loading: assetLoading,
    error: assetError,
    refetch: refetchAsset,
  } = useAsset(selectedAssetId);

  // Hook for creating assets
  const {
    createAsset,
    loading: createLoading,
    error: createError,
  } = useCreateAsset();

  // Hook for updating assets
  const {
    updateAsset,
    loading: updateLoading,
    error: updateError,
  } = useUpdateAsset();

  // Hook for deleting assets
  const {
    deleteAsset,
    loading: deleteLoading,
    error: deleteError,
  } = useDeleteAsset();

  // Hook for fetching categories
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  // Example handlers
  const handleCreateAsset = async () => {
    const newAsset: CreateAssetRequest = {
      name: "New Asset",
      description: "Asset created via API",
      category: "Electronics",
      serialNumber: `SN${Date.now()}`,
      purchaseDate: new Date().toISOString().split("T")[0],
      purchasePrice: 299.99,
      status: "active",
    };

    const result = await createAsset(newAsset);
    if (result) {
      console.log("Asset created:", result);
      refetchAssets(); // Refresh the list
    }
  };

  const handleUpdateAsset = async () => {
    if (!asset) return;

    const updatedAsset: UpdateAssetRequest = {
      ...asset,
      name: `${asset.name} (Updated)`,
      status: "maintenance",
    };

    const result = await updateAsset(asset.id, updatedAsset);
    if (result) {
      console.log("Asset updated:", result);
      refetchAsset(); // Refresh the single asset
      refetchAssets(); // Refresh the list
    }
  };

  const handleDeleteAsset = async () => {
    if (!asset) return;

    const success = await deleteAsset(asset.id);
    if (success) {
      console.log("Asset deleted");
      refetchAssets(); // Refresh the list
      setSelectedAssetId(0); // Clear selection
    }
  };

  const handleFilterChange = (newFilters: Partial<AssetFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Asset API Usage Example</h2>

      {/* Categories Section */}
      <section>
        <h3>Categories</h3>
        {categoriesLoading && <p>Loading categories...</p>}
        {categoriesError && <p>Error: {categoriesError}</p>}
        {categories.length > 0 && (
          <ul>
            {categories.map((category) => (
              <li key={category}>{category}</li>
            ))}
          </ul>
        )}
      </section>

      {/* Filters Section */}
      <section>
        <h3>Filters</h3>
        <div>
          <input
            type="text"
            placeholder="Search assets..."
            onChange={(e) => handleFilterChange({ search: e.target.value })}
          />
          <select
            onChange={(e) => handleFilterChange({ category: e.target.value })}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            onChange={(e) => handleFilterChange({ status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
            <option value="disposed">Disposed</option>
          </select>
        </div>
      </section>

      {/* Asset List Section */}
      <section>
        <h3>Asset List ({total} total)</h3>
        {assetsLoading && <p>Loading assets...</p>}
        {assetsError && <p>Error: {assetsError}</p>}
        {assets.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id}>
                  <td>{asset.id}</td>
                  <td>{asset.name}</td>
                  <td>{asset.category}</td>
                  <td>{asset.status}</td>
                  <td>
                    <button onClick={() => setSelectedAssetId(asset.id)}>
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Single Asset Section */}
      <section>
        <h3>Selected Asset (ID: {selectedAssetId})</h3>
        {assetLoading && <p>Loading asset...</p>}
        {assetError && <p>Error: {assetError}</p>}
        {asset && (
          <div>
            <p>
              <strong>Name:</strong> {asset.name}
            </p>
            <p>
              <strong>Description:</strong> {asset.description}
            </p>
            <p>
              <strong>Category:</strong> {asset.category}
            </p>
            <p>
              <strong>Serial Number:</strong> {asset.serialNumber}
            </p>
            <p>
              <strong>Status:</strong> {asset.status}
            </p>
            <p>
              <strong>Purchase Price:</strong> ${asset.purchasePrice}
            </p>
          </div>
        )}
      </section>

      {/* Actions Section */}
      <section>
        <h3>Actions</h3>
        <div>
          <button onClick={handleCreateAsset} disabled={createLoading}>
            {createLoading ? "Creating..." : "Create Asset"}
          </button>
          {createError && <p>Create Error: {createError}</p>}

          <button
            onClick={handleUpdateAsset}
            disabled={updateLoading || !asset}
          >
            {updateLoading ? "Updating..." : "Update Asset"}
          </button>
          {updateError && <p>Update Error: {updateError}</p>}

          <button
            onClick={handleDeleteAsset}
            disabled={deleteLoading || !asset}
          >
            {deleteLoading ? "Deleting..." : "Delete Asset"}
          </button>
          {deleteError && <p>Delete Error: {deleteError}</p>}
        </div>
      </section>
    </div>
  );
};
