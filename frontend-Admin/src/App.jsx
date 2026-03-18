import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import MasterCrops from './pages/MasterCrops';
import AddEditCrop from './pages/AddEditCrop';
import NewsAdmin from './pages/NewsAdmin';
import AddEditNews from './pages/AddEditNews';
import LibraryAdmin from './pages/LibraryAdmin';
import AddEditArticle from './pages/AddEditArticle';
import MarketAdmin from './pages/MarketAdmin';
import AddEditProduct from './pages/AddEditProduct';
import Login from './pages/Login';

// A simple wrapper that checks localStorage for the token
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Layout wrapper for authenticated pages
const AdminLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Navigate to="/dashboard" replace />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AdminLayout><Dashboard /></AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/crops" element={
          <ProtectedRoute>
            <AdminLayout><MasterCrops /></AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/crops/add" element={
          <ProtectedRoute>
            <AdminLayout><AddEditCrop /></AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/crops/edit/:id" element={
          <ProtectedRoute>
            <AdminLayout><AddEditCrop isEdit={true} /></AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/news" element={
          <ProtectedRoute>
            <AdminLayout><NewsAdmin /></AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/news/add" element={
          <ProtectedRoute>
            <AdminLayout><AddEditNews /></AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/news/edit/:id" element={
          <ProtectedRoute>
            <AdminLayout><AddEditNews isEdit={true} /></AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/library" element={
          <ProtectedRoute>
            <AdminLayout><LibraryAdmin /></AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/library/add" element={
          <ProtectedRoute>
            <AdminLayout><AddEditArticle /></AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/library/edit/:id" element={
          <ProtectedRoute>
            <AdminLayout><AddEditArticle isEdit={true} /></AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/market" element={
          <ProtectedRoute>
            <AdminLayout><MarketAdmin /></AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/market/add" element={
          <ProtectedRoute>
            <AdminLayout><AddEditProduct /></AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/market/edit/:id" element={
          <ProtectedRoute>
            <AdminLayout><AddEditProduct isEdit={true} /></AdminLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
