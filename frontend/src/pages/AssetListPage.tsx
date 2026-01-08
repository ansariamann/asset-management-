import React from "react";
import { useNavigate } from "react-router-dom";
import AssetList from "../components/AssetList";

const AssetListPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateAsset = () => {
    navigate("/assets/create");
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 20px 0 20px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h1 style={{ margin: 0, color: "#343a40" }}>Asset Management</h1>
        <button
          onClick={handleCreateAsset}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            transition: "background-color 0.2s ease",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#0056b3")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#007bff")
          }
        >
          Create New Asset
        </button>
      </div>
      <AssetList />
    </div>
  );
};

export default AssetListPage;
