import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface OwnerRouteProps {
  children: ReactNode;
}

export const OwnerRoute = ({ children }: OwnerRouteProps) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'owner') {
    toast.error('You do not have permission to access this page');
    return <Navigate to="/galleries" replace />;
  }

  return <>{children}</>;
};
