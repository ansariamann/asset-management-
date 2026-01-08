# Asset Management API Client Usage Guide

This document explains how to use the TypeScript interfaces, API client, and custom hooks for the Asset Management System.

## TypeScript Interfaces

### Core Asset Types

```typescript
import {
  Asset,
  CreateAssetRequest,
  UpdateAssetRequest,
  AssetStatus,
} from "../types";

// Main asset interface
interface Asset {
  id: number;
  name: string;
  description: string;
  category: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  status: AssetStatus;
  createdAt: string;
  updatedAt: string;
}

// Asset creation request
interface CreateAssetRequest {
  name: string;
  description: string;
  category: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  status: AssetStatus;
}

// Asset update request
interface UpdateAssetRequest {
  name: string;
  description: string;
  category: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  status: AssetStatus;
}
```

### Response and Filter Types

```typescript
import { AssetListResponse, AssetFilters } from "../types";

// Paginated asset list response
interface AssetListResponse {
  assets: Asset[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filtering and search parameters
interface AssetFilters {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}
```

## API Client (AssetApi)

The `AssetApi` class provides static methods for all CRUD operations:

### Basic CRUD Operations

```typescript
import { AssetApi } from "../services/assetApi";

// Get all assets with optional filtering
const assets = await AssetApi.getAssets({
  search: "laptop",
  category: "Electronics",
  status: "active",
  page: 1,
  pageSize: 20,
});

// Get a specific asset by ID
const asset = await AssetApi.getAsset(123);

// Create a new asset
const newAsset = await AssetApi.createAsset({
  name: "MacBook Pro",
  description: "16-inch laptop",
  category: "Electronics",
  serialNumber: "MBP2024001",
  purchaseDate: "2024-01-15",
  purchasePrice: 2499.99,
  status: "active",
});

// Update an existing asset
const updatedAsset = await AssetApi.updateAsset(123, {
  name: "MacBook Pro (Updated)",
  description: "16-inch laptop - updated",
  category: "Electronics",
  serialNumber: "MBP2024001",
  purchaseDate: "2024-01-15",
  purchasePrice: 2499.99,
  status: "maintenance",
});

// Delete an asset
await AssetApi.deleteAsset(123);

// Get available categories
const categories = await AssetApi.getCategories();
```

### Utility Methods

```typescript
// Search assets by query
const searchResults = await AssetApi.searchAssets("laptop");

// Get assets by category
const electronicsAssets = await AssetApi.getAssetsByCategory("Electronics");

// Get assets by status
const activeAssets = await AssetApi.getAssetsByStatus("active");

// Check if asset exists
const exists = await AssetApi.assetExists(123);

// Validate asset data before submission
const errors = AssetApi.validateAssetData(assetData);
if (errors.length > 0) {
  console.log("Validation errors:", errors);
}
```

## Custom Hooks

### useAssets - Asset List Management

```typescript
import { useAssets } from "../hooks/useAssets";

function AssetListComponent() {
  const { assets, total, page, pageSize, totalPages, loading, error, refetch } =
    useAssets({
      page: 1,
      pageSize: 20,
      category: "Electronics",
    });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Assets ({total} total)</h2>
      {assets.map((asset) => (
        <div key={asset.id}>{asset.name}</div>
      ))}
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

### useAsset - Single Asset Management

```typescript
import { useAsset } from "../hooks/useAssets";

function AssetDetailComponent({ assetId }: { assetId: number }) {
  const { asset, loading, error, refetch } = useAsset(assetId);

  if (loading) return <div>Loading asset...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!asset) return <div>Asset not found</div>;

  return (
    <div>
      <h2>{asset.name}</h2>
      <p>Category: {asset.category}</p>
      <p>Status: {asset.status}</p>
      <p>Price: ${asset.purchasePrice}</p>
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

### useCreateAsset - Asset Creation

```typescript
import { useCreateAsset } from "../hooks/useAssets";

function CreateAssetComponent() {
  const { createAsset, loading, error } = useCreateAsset();

  const handleSubmit = async (formData: CreateAssetRequest) => {
    const newAsset = await createAsset(formData);
    if (newAsset) {
      console.log("Asset created:", newAsset);
      // Handle success (e.g., redirect, show message)
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // Extract form data and call handleSubmit
      }}
    >
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Asset"}
      </button>
      {error && <div>Error: {error}</div>}
    </form>
  );
}
```

### useUpdateAsset - Asset Updates

```typescript
import { useUpdateAsset } from "../hooks/useAssets";

function EditAssetComponent({ assetId }: { assetId: number }) {
  const { updateAsset, loading, error } = useUpdateAsset();

  const handleUpdate = async (formData: UpdateAssetRequest) => {
    const updatedAsset = await updateAsset(assetId, formData);
    if (updatedAsset) {
      console.log("Asset updated:", updatedAsset);
      // Handle success
    }
  };

  return (
    <div>
      {/* Update form */}
      <button onClick={() => handleUpdate(formData)} disabled={loading}>
        {loading ? "Updating..." : "Update Asset"}
      </button>
      {error && <div>Error: {error}</div>}
    </div>
  );
}
```

### useDeleteAsset - Asset Deletion

```typescript
import { useDeleteAsset } from "../hooks/useAssets";

function DeleteAssetComponent({ assetId }: { assetId: number }) {
  const { deleteAsset, loading, error } = useDeleteAsset();

  const handleDelete = async () => {
    const success = await deleteAsset(assetId);
    if (success) {
      console.log("Asset deleted successfully");
      // Handle success (e.g., redirect, refresh list)
    }
  };

  return (
    <div>
      <button onClick={handleDelete} disabled={loading}>
        {loading ? "Deleting..." : "Delete Asset"}
      </button>
      {error && <div>Error: {error}</div>}
    </div>
  );
}
```

### useCategories - Category Management

```typescript
import { useCategories } from "../hooks/useAssets";

function CategoryFilterComponent() {
  const { categories, loading, error, refetch } = useCategories();

  if (loading) return <div>Loading categories...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <select>
      <option value="">All Categories</option>
      {categories.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>
  );
}
```

## Error Handling

All API operations use the `ApiException` class for consistent error handling:

```typescript
import { ApiException } from "../types";

try {
  const asset = await AssetApi.getAsset(123);
} catch (error) {
  if (error instanceof ApiException) {
    console.log("API Error:", {
      status: error.status,
      code: error.code,
      message: error.message,
      details: error.details,
    });

    // Handle specific error types
    if (error.status === 404) {
      console.log("Asset not found");
    } else if (error.status === 400) {
      console.log("Validation error:", error.details);
    }
  } else {
    console.log("Unexpected error:", error);
  }
}
```

## Best Practices

1. **Use hooks in React components** for automatic state management and re-rendering
2. **Use the API client directly** in utility functions or non-React contexts
3. **Always handle loading and error states** in your UI components
4. **Validate data client-side** using `AssetApi.validateAssetData()` before submission
5. **Use TypeScript interfaces** to ensure type safety throughout your application
6. **Implement proper error boundaries** to catch and handle unexpected errors
7. **Use the refetch functions** to refresh data after mutations

## Configuration

The API client uses the base URL from the environment variable `REACT_APP_API_URL` or defaults to `http://localhost:8000/api`. Make sure to set this in your `.env` file:

```
REACT_APP_API_URL=http://localhost:8000/api
```
