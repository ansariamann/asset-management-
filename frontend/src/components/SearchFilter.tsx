import React, { useState, useCallback, useEffect } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { AssetFilters } from "../types/asset";
import "./SearchFilter.css";

interface SearchFilterProps {
  filters: AssetFilters;
  categories: string[];
  statuses: string[];
  onFiltersChange: (filters: AssetFilters) => void;
  loading?: boolean;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  filters,
  categories,
  statuses,
  onFiltersChange,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>(filters.search || "");

  // Debounce search term to reduce API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Effect to handle debounced search
  useEffect(() => {
    if (debouncedSearchTerm !== (filters.search || "")) {
      const newFilters = {
        ...filters,
        search: debouncedSearchTerm || undefined,
        page: 1, // Reset to first page when search changes
      };
      onFiltersChange(newFilters);
    }
  }, [debouncedSearchTerm, filters, onFiltersChange]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleCategoryFilter = useCallback(
    (category: string) => {
      const newFilters = {
        ...filters,
        category: category || undefined,
        page: 1, // Reset to first page when filter changes
      };
      onFiltersChange(newFilters);
    },
    [filters, onFiltersChange]
  );

  const handleStatusFilter = useCallback(
    (status: string) => {
      const newFilters = {
        ...filters,
        status: status || undefined,
        page: 1, // Reset to first page when filter changes
      };
      onFiltersChange(newFilters);
    },
    [filters, onFiltersChange]
  );

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    const clearedFilters = {
      page: 1,
      pageSize: filters.pageSize || 20,
    };
    onFiltersChange(clearedFilters);
  }, [filters.pageSize, onFiltersChange]);

  const hasActiveFilters = !!(
    filters.search ||
    filters.category ||
    filters.status
  );

  return (
    <div className="search-filter-container">
      <div className="search-filter-header">
        <h3 className="search-filter-title">Search & Filter Assets</h3>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="clear-filters-button"
            disabled={loading}
            aria-label="Clear all filters"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="search-filter-controls">
        {/* Search Input */}
        <div className="search-section">
          <label htmlFor="asset-search" className="search-label">
            Search Assets
          </label>
          <div className="search-input-container">
            <input
              id="asset-search"
              type="text"
              placeholder="Search by name, description, or serial number..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="search-input"
              disabled={loading}
              aria-describedby="search-help"
            />
            <div id="search-help" className="search-help">
              Search across asset names, descriptions, and serial numbers
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="filter-section">
          <div className="filter-group">
            <label htmlFor="category-filter" className="filter-label">
              Category
            </label>
            <select
              id="category-filter"
              value={filters.category || ""}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="filter-select"
              disabled={loading}
              aria-describedby="category-help"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <div id="category-help" className="filter-help">
              Filter assets by category
            </div>
          </div>

          <div className="filter-group">
            <label htmlFor="status-filter" className="filter-label">
              Status
            </label>
            <select
              id="status-filter"
              value={filters.status || ""}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="filter-select"
              disabled={loading}
              aria-describedby="status-help"
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <div id="status-help" className="filter-help">
              Filter assets by current status
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="active-filters">
          <span className="active-filters-label">Active filters:</span>
          <div className="active-filters-list">
            {filters.search && (
              <span className="active-filter-tag">
                Search: "{filters.search}"
                <button
                  onClick={() => {
                    setSearchTerm("");
                    const newFilters = {
                      ...filters,
                      search: undefined,
                      page: 1,
                    };
                    onFiltersChange(newFilters);
                  }}
                  className="remove-filter-button"
                  aria-label="Remove search filter"
                >
                  ×
                </button>
              </span>
            )}
            {filters.category && (
              <span className="active-filter-tag">
                Category: {filters.category}
                <button
                  onClick={() => handleCategoryFilter("")}
                  className="remove-filter-button"
                  aria-label="Remove category filter"
                >
                  ×
                </button>
              </span>
            )}
            {filters.status && (
              <span className="active-filter-tag">
                Status: {filters.status}
                <button
                  onClick={() => handleStatusFilter("")}
                  className="remove-filter-button"
                  aria-label="Remove status filter"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
