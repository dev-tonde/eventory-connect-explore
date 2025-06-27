
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { useAuth } from "@/contexts/AuthContext";

const AdminPanel = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin (you'll need to implement role checking)
    if (!user || profile?.role !== 'admin') {
      navigate('/');
    }
  }, [user, profile, navigate]);

  if (!user || profile?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage platform content, users, and system settings</p>
        </div>
        <AdminDashboard />
      </div>
    </div>
  );
};

export default AdminPanel;
