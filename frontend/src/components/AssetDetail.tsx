import React from "react";
import { useNavigate } from "react-router-dom";
import { Asset } from "../types";
import "./AssetDetail.css";

interface AssetDetailProps {
  asset: Asset;
  onEdit: () => void;
  onDelete: () => void;
}

const AssetDetail: React.FC<AssetDetailProps> = ({
  asset,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusBadgeClass = (status: string) => {
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

  return (
    <div className="asset-detail">
      <div className="asset-detail-header">
        <button
          className="back-button"
          onClick={() => navigate("/assets")}
          aria-label="Back to asset list"
        >
          ← Back to Assets
        </button>
        <div className="asset-detail-actions">
          <button
            className="edit-button"
            onClick={onEdit}
            aria-label={`Edit ${asset.name}`}
          >
            Edit
          </button>
          <button
            className="delete-button"
            onClick={onDelete}
            aria-label={`Delete ${asset.name}`}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="asset-detail-content">
        <div className="asset-detail-title">
          <h1>{asset.name}</h1>
          <span className={getStatusBadgeClass(asset.status)}>
            {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
          </span>
        </div>

        <div className="asset-detail-grid">
          <div className="detail-section">
            <h2>Basic Information</h2>
            <div className="detail-row">
              <label>Name:</label>
              <span>{asset.name}</span>
            </div>
            <div className="detail-row">
              <label>Description:</label>
              <span>{asset.description || "No description provided"}</span>
            </div>
            <div className="detail-row">
              <label>Category:</label>
              <span>{asset.category}</span>
            </div>
            <div className="detail-row">
              <label>Serial Number:</label>
              <span className="serial-number">{asset.serialNumber}</span>
            </div>
            <div className="detail-row">
              <label>Status:</label>
              <span className={getStatusBadgeClass(asset.status)}>
                {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="detail-section">
            <h2>Financial Information</h2>
            <div className="detail-row">
              <label>Purchase Date:</label>
              <span>{formatDate(asset.purchaseDate)}</span>
            </div>
            <div className="detail-row">
              <label>Purchase Price:</label>
              <span className="price">
                {formatCurrency(asset.purchasePrice)}
              </span>
            </div>
          </div>

          <div className="detail-section">
            <h2>System Information</h2>
            <div className="detail-row">
              <label>Asset ID:</label>
              <span>{asset.id}</span>
            </div>
            <div className="detail-row">
              <label>Created:</label>
              <span>{formatDate(asset.createdAt)}</span>
            </div>
            <div className="detail-row">
              <label>Last Updated:</label>
              <span>{formatDate(asset.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetail;
