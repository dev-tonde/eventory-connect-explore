import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { useAuth } from "@/contexts/AuthContext";

const AdminPanel = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || profile?.role !== "admin") {
      navigate("/", { replace: true });
    }
  }, [user, profile, navigate]);

  // Optionally, show a loading spinner while checking auth
  if (!user || profile?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-gray-500">Checking admin access...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage platform content, users, and system settings
          </p>
        </div>
        <AdminDashboard />
      </div>
    </div>
  );
};

export default AdminPanel;
// This component checks if the user is authenticated and has admin privileges.
// If not, it redirects to the home page. If the user is an admin, it displays the admin dashboard with management features.
