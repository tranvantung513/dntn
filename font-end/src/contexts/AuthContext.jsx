import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userFullName, setUserFullName] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hàm tiện ích giải mã JWT an toàn (hỗ trợ Base64Url và UTF-8)
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Lỗi giải mã JWT:", e);
      return {};
    }
  };

  // Kiểm tra trạng thái lúc ứng dụng vừa khởi động
  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    const name = sessionStorage.getItem('userFullName');
    const uid = sessionStorage.getItem('userId');
    
    if (token) {
      setIsAuthenticated(true);
      if (name) setUserFullName(name);
      
      const storedRole = sessionStorage.getItem('userRole');
      const storedPerms = sessionStorage.getItem('userPermissions');
      if (storedRole) setUserRole(storedRole);
      if (storedPerms) {
        try { setUserPermissions(JSON.parse(storedPerms)); } catch(e) {}
      }

      if (uid) {
        setUserId(uid);
      } else {
        // Fallback giải mã JWT nếu chưa có thông tin
        try {
           const payload = parseJwt(token);
           const extId = payload.id || payload.userId || payload.sub;
           if (extId) {
             setUserId(extId);
             sessionStorage.setItem('userId', extId);
           }
           
           // Backend có thể trả về 'role', 'roles', 'authority', hoặc 'authorities'
           const extractedRole = payload.role || (payload.roles && payload.roles[0]) || payload.authority || (payload.authorities && payload.authorities[0]?.authority);
           if (extractedRole) {
             setUserRole(extractedRole);
             sessionStorage.setItem('userRole', extractedRole);
           }
           if (payload.permissions) {
             setUserPermissions(payload.permissions);
             sessionStorage.setItem('userPermissions', JSON.stringify(payload.permissions));
           }
        } catch(e) {}
      }
    }
    
    setLoading(false);
  }, []);

  const login = (accessToken, fullName, passedUserId) => {
    sessionStorage.setItem('accessToken', accessToken);
    if (fullName) {
      sessionStorage.setItem('userFullName', fullName);
      setUserFullName(fullName);
    }
    
    let extId = passedUserId;
    let decodedRole = null;
    let decodedPerms = [];

    const payload = parseJwt(accessToken);
    if (!extId) extId = payload.id || payload.userId || payload.sub;
    
    // Xử lý các trường hợp key của Role từ Backend
    decodedRole = payload.role || (payload.roles && payload.roles[0]) || payload.authority || (payload.authorities && payload.authorities[0]?.authority);
    if (payload.permissions) decodedPerms = payload.permissions;

    if (extId) {
      sessionStorage.setItem('userId', extId);
      setUserId(extId);
    }
    
    if (decodedRole) {
      sessionStorage.setItem('userRole', decodedRole);
      setUserRole(decodedRole);
    }
    
    if (decodedPerms.length > 0) {
      sessionStorage.setItem('userPermissions', JSON.stringify(decodedPerms));
      setUserPermissions(decodedPerms);
    }

    setIsAuthenticated(true);
    
    // Trả về role để Component đăng nhập có thể điều hướng
    return { role: decodedRole, permissions: decodedPerms };
  };

  const logout = async () => {
    try {
      await authApi.logout(); 
      console.log('Đăng xuất thành công ở Frontend và Backend.');
    } catch (e) {
      console.error('Lỗi khi logout:', e);
    } finally {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('userFullName');
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('userPermissions');
      setIsAuthenticated(false);
      setUserFullName(null);
      setUserId(null);
      setUserRole(null);
      setUserPermissions([]);
      window.location.href = '/login';
    }
  };

  // Helper tiện ích xuất ra cho các Component
  const hasPermission = (permission) => {
    return userPermissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, userFullName, userId, userRole, userPermissions, 
      login, logout, loading, hasPermission 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
