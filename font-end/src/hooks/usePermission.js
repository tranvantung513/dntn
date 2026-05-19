import { useAuth } from '../contexts/AuthContext';

export const usePermission = () => {
  const { hasPermission, userRole, userPermissions } = useAuth();

  return {
    hasPermission,
    userRole,
    userPermissions
  };
};
