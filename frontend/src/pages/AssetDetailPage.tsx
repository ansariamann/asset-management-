import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAsset, useDeleteAsset } from "../hooks/useAssets";
import AssetDetail from "../components/AssetDetail";
import ConfirmDialog from "../components/ConfirmDialog";
import LoadingIndicator from "../components/LoadingIndicator";
import ErrorDisplay from "../components/ErrorDisplay";
import { useToast } from "../contexts/ToastContext";
import "./AssetDetailPage.css";

const AssetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Convert id to number, handle invalid id
  const assetId = id ? parseInt(id, 10) : 0;
  const isValidId = !isNaN(assetId) && assetId > 0;

  const { asset, loading, error, refetch } = useAsset(isValidId ? assetId : 0);
  const {
    deleteAsset,
    loading: deleteLoading,
    error: deleteError,
  } = useDeleteAsset();

  // Show error toast if delete fails
  useEffect(() => {
    if (deleteError) {
      showError(deleteError);
    }
  }, [deleteError, showError]);

  // Handle invalid ID
  if (!isValidId) {
    const errorObj = {
      message: "The asset ID provided is not valid.",
      code: "INVALID_ID",
      status: 400,
    };

    return (
      <div className="asset-detail-container">
        <ErrorDisplay
          error={errorObj}
          title="Invalid Asset ID"
          onBack={() => navigate("/assets")}
          backText="Back to Assets"
        />
      </div>
    );
  }

  // Handle loading state
  if (loading) {
    return (
      <div className="asset-detail-container">
        <LoadingIndicator text="Loading asset information..." size="large" />
      </div>
    );
  }

  // Handle error state (including 404)
  if (error || !asset) {
    const isNotFound =
      error?.includes("404") || error?.includes("not found") || !asset;

    const errorObj = {
      message: isNotFound
        ? `The asset with ID ${assetId} could not be found. It may have been deleted or the ID may be incorrect.`
        : error || "An unexpected error occurred while loading the asset.",
      code: isNotFound ? "NOT_FOUND" : "FETCH_ERROR",
      status: isNotFound ? 404 : 500,
    };

    return (
      <div className="asset-detail-container">
        <ErrorDisplay
          error={errorObj}
          title={isNotFound ? "Asset Not Found" : "Error Loading Asset"}
          onBack={() => navigate("/assets")}
          backText="Back to Assets"
          onRetry={!isNotFound ? refetch : undefined}
          retryText="Retry"
        />
      </div>
    );
  }

  // Handle edit action
  const handleEdit = () => {
    navigate(`/assets/${assetId}/edit`);
  };

  // Handle delete action
  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    try {
      const success = await deleteAsset(assetId);
      if (success) {
        // Show success toast notification
        showSuccess(`Asset "${asset.name}" has been successfully deleted.`);
        // Navigate back to the asset list
        navigate("/assets");
      } else {
        setShowDeleteDialog(false);
        // Show generic error if no specific error was caught
        if (!deleteError) {
          showError("Failed to delete asset due to an unknown error.");
        }
      }
    } catch (err) {
      setShowDeleteDialog(false);
      showError(err);
    }
  };

  // Handle delete cancellation
  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  return (
    <>
      <AssetDetail asset={asset} onEdit={handleEdit} onDelete={handleDelete} />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Asset"
        message={`Are you sure you want to delete "${asset.name}"? This action cannot be undone.`}
        confirmText={deleteLoading ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDestructive={true}
      />
    </>
  );
};

export default AssetDetailPage;
