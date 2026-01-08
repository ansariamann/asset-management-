import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Layout from "./components/Layout";
import AssetListPage from "./pages/AssetListPage";
import AssetDetailPage from "./pages/AssetDetailPage";
import { CreateAssetPage } from "./pages/CreateAssetPage";
import { EditAssetPage } from "./pages/EditAssetPage";
import { ToastProvider, useToast } from "./contexts/ToastContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { initGlobalErrorHandler } from "./utils/globalErrorHandler";
import "./App.css";

// AppContent component to use hooks inside the ToastProvider
const AppContent = () => {
  const { showError } = useToast();

  // Initialize global error handler
  useEffect(() => {
    initGlobalErrorHandler(showError);
  }, [showError]);

  return (
    <div className="App">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <ErrorBoundary>
        <Layout>
          <main id="main-content" role="main">
            <Routes>
              <Route path="/" element={<AssetListPage />} />
              <Route path="/assets" element={<AssetListPage />} />
              <Route path="/assets/create" element={<CreateAssetPage />} />
              <Route path="/assets/:id" element={<AssetDetailPage />} />
              <Route path="/assets/:id/edit" element={<EditAssetPage />} />
            </Routes>
          </main>
        </Layout>
      </ErrorBoundary>
    </div>
  );
};

function App() {
  return (
    <Router>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </Router>
  );
}

export default App;
