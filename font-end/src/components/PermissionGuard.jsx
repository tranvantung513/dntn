import React from 'react';
import { usePermission } from '../hooks/usePermission';

/**
 * Component dùng để bao bọc các element cần bảo vệ theo quyền
 * @param {string} permission - Quyền cần kiểm tra (vd: "ORDER_DELETE")
 * @param {ReactNode} children - Nội dung được render nếu có quyền
 * @param {ReactNode} fallback - Nội dung hiển thị nếu không có quyền (mặc định là null/ẩn đi)
 */
const PermissionGuard = ({ permission, children, fallback = null }) => {
  const { hasPermission } = usePermission();

  if (!hasPermission(permission)) {
    return fallback;
  }

  return <>{children}</>;
};

export default PermissionGuard;
