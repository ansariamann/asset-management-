import React from "react";
import { useNavigate } from "react-router-dom";
import { AssetForm } from "../components/AssetForm";
import { CreateAssetRequest } from "../types/asset";
import { useCreateAsset } from "../hooks/useAssets";
import "./CreateAssetPage.css";

export const CreateAssetPage: React.FC = () => {
  const navigate = useNavigate();
  const { createAsset, loading, error } = useCreateAsset();

  const handleSubmit = async (data: CreateAssetRequest) => {
    const result = await createAsset(data);
    if (result) {
      // Navigate to the asset detail page after successful creation
      navigate(`/assets/${result.id}`);
    }
  };

  const handleCancel = () => {
    navigate("/assets");
  };

  return (
    <div className="create-asset-page">
      <div className="page-header">
        <h1>Create New Asset</h1>
        <p>Add a new asset to your inventory</p>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
        </div>
      )}

      <AssetForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        submitButtonText="Create Asset"
      />
    </div>
  );
};
