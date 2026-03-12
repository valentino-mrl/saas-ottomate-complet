import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * AdminRoute checks if the current user is an admin.
 * Uses the profile.is_admin from AuthContext (fetched from public.profiles table).
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { user, profile, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
          <p className="text-sm text-gray-500 mb-4">
            {profile ? 'Your account is not marked as admin.' : 'Profile not found. Please contact support.'}
          </p>
          <Navigate to="/app" replace />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

