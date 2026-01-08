import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AssetForm } from "../components/AssetForm";
import { UpdateAssetRequest } from "../types/asset";
import { useAsset, useUpdateAsset } from "../hooks/useAssets";
import "./EditAssetPage.css";

export const EditAssetPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const assetId = parseInt(id || "0", 10);

  const { asset, loading: assetLoading, error: assetError } = useAsset(assetId);
  const {
    updateAsset,
    loading: updateLoading,
    error: updateError,
  } = useUpdateAsset();

  const handleSubmit = async (data: UpdateAssetRequest) => {
    const result = await updateAsset(assetId, data);
    if (result) {
      // Navigate back to the asset detail page after successful update
      navigate(`/assets/${assetId}`);
    }
  };

  const handleCancel = () => {
    navigate(`/assets/${assetId}`);
  };

  // Show loading state while fetching asset
  if (assetLoading) {
    return (
      <div className="edit-asset-page">
        <div className="loading-state">
          <p>Loading asset...</p>
        </div>
      </div>
    );
  }

  // Show error if asset not found or failed to load
  if (assetError || !asset) {
    return (
      <div className="edit-asset-page">
        <div className="error-state">
          <h1>Asset Not Found</h1>
          <p>{assetError || "The requested asset could not be found."}</p>
          <button
            onClick={() => navigate("/assets")}
            className="btn btn-primary"
          >
            Back to Assets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-asset-page">
      <div className="page-header">
        <h1>Edit Asset</h1>
        <p>Update information for {asset.name}</p>
      </div>

      {updateError && (
        <div className="error-banner">
          <p>{updateError}</p>
        </div>
      )}

      <AssetForm
        asset={asset}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={updateLoading}
        submitButtonText="Update Asset"
      />
    </div>
  );
};
