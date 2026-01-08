import React, { useState, useEffect } from "react";
import {
  Asset,
  CreateAssetRequest,
  UpdateAssetRequest,
  AssetStatus,
} from "../types/asset";
import { useCategories } from "../hooks/useAssets";
import "./AssetForm.css";

interface AssetFormProps {
  asset?: Asset;
  onSubmit: (data: CreateAssetRequest | UpdateAssetRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  submitButtonText?: string;
}

interface FormData {
  name: string;
  description: string;
  category: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: string;
  status: AssetStatus;
}

interface FormErrors {
  name?: string;
  description?: string;
  category?: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchasePrice?: string;
  status?: string;
}

const ASSET_STATUSES: AssetStatus[] = [
  "active",
  "inactive",
  "maintenance",
  "disposed",
];

export const AssetForm: React.FC<AssetFormProps> = ({
  asset,
  onSubmit,
  onCancel,
  loading = false,
  submitButtonText = "Save Asset",
}) => {
  const { categories, loading: categoriesLoading } = useCategories();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    category: "",
    serialNumber: "",
    purchaseDate: "",
    purchasePrice: "",
    status: "active",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Initialize form data when asset prop changes
  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name,
        description: asset.description,
        category: asset.category,
        serialNumber: asset.serialNumber,
        purchaseDate: asset.purchaseDate.split("T")[0], // Convert to YYYY-MM-DD format
        purchasePrice: asset.purchasePrice.toString(),
        status: asset.status,
      });
    }
  }, [asset]);

  const validateField = (
    name: keyof FormData,
    value: string
  ): string | undefined => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Asset name is required";
        if (value.length > 255)
          return "Asset name must be less than 255 characters";
        break;

      case "category":
        if (!value.trim()) return "Category is required";
        if (value.length > 100)
          return "Category must be less than 100 characters";
        break;

      case "serialNumber":
        if (!value.trim()) return "Serial number is required";
        if (value.length > 100)
          return "Serial number must be less than 100 characters";
        break;

      case "purchaseDate":
        if (!value) return "Purchase date is required";
        const date = new Date(value);
        if (isNaN(date.getTime())) return "Please enter a valid date";
        if (date > new Date()) return "Purchase date cannot be in the future";
        break;

      case "purchasePrice":
        if (!value.trim()) return "Purchase price is required";
        const price = parseFloat(value);
        if (isNaN(price)) return "Please enter a valid price";
        if (price <= 0) return "Purchase price must be greater than 0";
        if (price > 999999.99) return "Purchase price is too large";
        break;

      case "status":
        if (!value) return "Status is required";
        if (!ASSET_STATUSES.includes(value as AssetStatus))
          return "Please select a valid status";
        break;
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate all fields
    Object.keys(formData).forEach((key) => {
      const fieldName = key as keyof FormData;
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    const fieldName = name as keyof FormData;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: undefined,
      }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    const fieldName = name as keyof FormData;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate field on blur
    const error = validateField(fieldName, value);
    setErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce(
      (acc, key) => ({
        ...acc,
        [key]: true,
      }),
      {}
    );
    setTouched(allTouched);

    if (!validateForm()) {
      return;
    }

    try {
      const submitData: CreateAssetRequest | UpdateAssetRequest = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        serialNumber: formData.serialNumber.trim(),
        purchaseDate: formData.purchaseDate,
        purchasePrice: parseFloat(formData.purchasePrice),
        status: formData.status,
      };

      await onSubmit(submitData);
    } catch (error) {
      // Error handling is managed by parent component
      console.error("Form submission error:", error);
    }
  };

  const handleReset = () => {
    if (asset) {
      // Reset to original asset data
      setFormData({
        name: asset.name,
        description: asset.description,
        category: asset.category,
        serialNumber: asset.serialNumber,
        purchaseDate: asset.purchaseDate.split("T")[0],
        purchasePrice: asset.purchasePrice.toString(),
        status: asset.status,
      });
    } else {
      // Reset to empty form
      setFormData({
        name: "",
        description: "",
        category: "",
        serialNumber: "",
        purchaseDate: "",
        purchasePrice: "",
        status: "active",
      });
    }
    setErrors({});
    setTouched({});
  };

  const getFieldError = (fieldName: keyof FormData): string | undefined => {
    return touched[fieldName] ? errors[fieldName] : undefined;
  };

  return (
    <div className="asset-form">
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="name" className="form-label required">
            Asset Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`form-input ${getFieldError("name") ? "error" : ""}`}
            placeholder="Enter asset name"
            disabled={loading}
            required
          />
          {getFieldError("name") && (
            <span className="error-message">{getFieldError("name")}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`form-textarea ${
              getFieldError("description") ? "error" : ""
            }`}
            placeholder="Enter asset description (optional)"
            rows={3}
            disabled={loading}
          />
          {getFieldError("description") && (
            <span className="error-message">
              {getFieldError("description")}
            </span>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category" className="form-label required">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`form-select ${
                getFieldError("category") ? "error" : ""
              }`}
              disabled={loading || categoriesLoading}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {getFieldError("category") && (
              <span className="error-message">{getFieldError("category")}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="status" className="form-label required">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`form-select ${
                getFieldError("status") ? "error" : ""
              }`}
              disabled={loading}
              required
            >
              {ASSET_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            {getFieldError("status") && (
              <span className="error-message">{getFieldError("status")}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="serialNumber" className="form-label required">
            Serial Number
          </label>
          <input
            type="text"
            id="serialNumber"
            name="serialNumber"
            value={formData.serialNumber}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`form-input ${
              getFieldError("serialNumber") ? "error" : ""
            }`}
            placeholder="Enter serial number"
            disabled={loading}
            required
          />
          {getFieldError("serialNumber") && (
            <span className="error-message">
              {getFieldError("serialNumber")}
            </span>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="purchaseDate" className="form-label required">
              Purchase Date
            </label>
            <input
              type="date"
              id="purchaseDate"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`form-input ${
                getFieldError("purchaseDate") ? "error" : ""
              }`}
              disabled={loading}
              required
            />
            {getFieldError("purchaseDate") && (
              <span className="error-message">
                {getFieldError("purchaseDate")}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="purchasePrice" className="form-label required">
              Purchase Price
            </label>
            <input
              type="number"
              id="purchasePrice"
              name="purchasePrice"
              value={formData.purchasePrice}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`form-input ${
                getFieldError("purchasePrice") ? "error" : ""
              }`}
              placeholder="0.00"
              min="0"
              step="0.01"
              disabled={loading}
              required
            />
            {getFieldError("purchasePrice") && (
              <span className="error-message">
                {getFieldError("purchasePrice")}
              </span>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-secondary"
            disabled={loading}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : submitButtonText}
          </button>
        </div>
      </form>
    </div>
  );
};
