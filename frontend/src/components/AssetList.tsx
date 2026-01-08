import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAssets, useCategories, useStatuses } from "../hooks/useAssets";
import { Asset, AssetFilters } from "../types/asset";
import SearchFilter from "./SearchFilter";
import "./AssetList.css";

interface AssetListProps {
  initialFilters?: AssetFilters;
}

const AssetList: React.FC<AssetListProps> = ({ initialFilters }) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<AssetFilters>(
    initialFilters || {
      page: 1,
      pageSize: 20,
    }
  );
  const { assets, total, page, pageSize, totalPages, loading, error, refetch } =
    useAssets(filters);
  const { categories } = useCategories();
  const { statuses } = useStatuses();

  const handleFiltersChange = useCallback(
    (newFilters: AssetFilters) => {
      setFilters(newFilters);
      refetch(newFilters);
    },
    [refetch]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      const newFilters = { ...filters, page: newPage };
      setFilters(newFilters);
      refetch(newFilters);
    },
    [filters, refetch]
  );

  const handleAssetClick = useCallback(
    (asset: Asset) => {
      navigate(`/assets/${asset.id}`);
    },
    [navigate]
  );

  const handleAssetKeyDown = useCallback(
    (event: React.KeyboardEvent, asset: Asset) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleAssetClick(asset);
      }
    },
    [handleAssetClick]
  );

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case "active":
        return "status-badge status-active";
      case "inactive":
        return "status-badge status-inactive";
      case "maintenance":
        return "status-badge status-maintenance";
      case "disposed":
        return "status-badge status-disposed";
      default:
        return "status-badge";
    }
  };

  if (error) {
    return (
      <div className="asset-list-error">
        <h3>Error Loading Assets</h3>
        <p>{error}</p>
        <button onClick={() => refetch(filters)} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="asset-list-container">
      {/* Search and Filter Component */}
      <SearchFilter
        filters={filters}
        categories={categories}
        statuses={statuses}
        onFiltersChange={handleFiltersChange}
        loading={loading}
      />

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading assets...</p>
        </div>
      )}

      {/* Assets Table */}
      {!loading && (
        <>
          <div className="asset-table-container">
            <table
              className="asset-table"
              role="table"
              aria-label="Assets list"
            >
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Category</th>
                  <th scope="col">Serial Number</th>
                  <th scope="col">Status</th>
                  <th scope="col">Purchase Date</th>
                  <th scope="col">Purchase Price</th>
                </tr>
              </thead>
              <tbody>
                {!assets || assets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="no-assets">
                      No assets found
                    </td>
                  </tr>
                ) : (
                  assets.map((asset) => (
                    <tr
                      key={asset.id}
                      onClick={() => handleAssetClick(asset)}
                      onKeyDown={(e) => handleAssetKeyDown(e, asset)}
                      className="asset-row"
                      tabIndex={0}
                      role="button"
                      aria-label={`View details for ${asset.name}`}
                    >
                      <td className="asset-name">{asset.name}</td>
                      <td>{asset.category}</td>
                      <td className="serial-number">{asset.serialNumber}</td>
                      <td>
                        <span className={getStatusBadgeClass(asset.status)}>
                          {asset.status}
                        </span>
                      </td>
                      <td>{formatDate(asset.purchaseDate)}</td>
                      <td>{formatCurrency(asset.purchasePrice)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {(page - 1) * pageSize + 1} to{" "}
                {Math.min(page * pageSize, total)} of {total} assets
              </div>

              <div className="pagination-controls">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="pagination-button"
                >
                  Previous
                </button>

                <div className="page-numbers">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`page-number ${
                          page === pageNum ? "active" : ""
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="pagination-button"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AssetList;
