import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'owner')) {
    return <Navigate to="/owner/login" replace />;
  }
  return <>{children}</>;
}
