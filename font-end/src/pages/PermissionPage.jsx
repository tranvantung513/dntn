import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Box, ShoppingCart, Layers, Users, Tag, CalendarDays, Banknote, Check } from 'lucide-react';
import { roleApi } from '../api/roleApi';
import { useToast } from '../contexts/ToastContext';
import './PermissionPage.css';

const MODULE_ICONS = {
  'Dashboard': <LayoutDashboard size={18} />,
  'Sản phẩm': <Box size={18} />,
  'Đơn hàng': <ShoppingCart size={18} />,
  'Danh mục': <Layers size={18} />,
  'Người dùng': <Users size={18} />,
  'Mã giảm giá': <Tag size={18} />,
  'Đặt bàn': <CalendarDays size={18} />,
  'Tiền lương': <Banknote size={18} />,
  'Mặc định': <Check size={18} />
};

const getModuleIcon = (moduleName) => {
  return MODULE_ICONS[moduleName] || MODULE_ICONS['Mặc định'];
};

const ACTIONS = [
  { key: 'VIEW', label: 'XEM' },
  { key: 'CREATE', label: 'THÊM' },
  { key: 'UPDATE', label: 'SỬA' },
  { key: 'DELETE', label: 'XÓA' }
];

const PermissionPage = () => {
  const toast = useToast();
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  
  // Grouped permissions from backend
  const [groupedPermissions, setGroupedPermissions] = useState([]);
  
  // Current granted permissions for the selected role
  // Mảng chứa các permission code, vd: ['ORDER_VIEW', 'PRODUCT_CREATE']
  const [grantedPermissions, setGrantedPermissions] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedRoleId) {
      fetchRolePermissions(selectedRoleId);
    } else {
      setGrantedPermissions([]);
    }
  }, [selectedRoleId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [rolesRes, groupedRes] = await Promise.all([
        roleApi.getAll(),
        roleApi.getGroupedPermissions().catch(e => {
           console.warn("Could not fetch grouped permissions. Using fallback.");
           return { data: getFallbackGroupedPermissions() };
        })
      ]);

      let fetchedRoles = rolesRes.data?.data || rolesRes.data?.content || rolesRes.data || [];
      if (!Array.isArray(fetchedRoles)) fetchedRoles = [];
      setRoles(fetchedRoles);
      
      let fetchedGrouped = groupedRes.data?.data || groupedRes.data?.content || groupedRes.data;
      
      // BE trả về Map<String, List<PermissionResponse>>
      // VD: { "ORDER": [{id, code:"ORDER_VIEW", name, module}, ...], "PRODUCT": [...] }
      if (fetchedGrouped && !Array.isArray(fetchedGrouped) && typeof fetchedGrouped === 'object') {
        fetchedGrouped = Object.keys(fetchedGrouped).map(key => ({
          moduleName: key,
          permissions: (fetchedGrouped[key] || []).map(p => ({
            ...p,
            // Derive action from code: "ORDER_VIEW" -> action = "VIEW"
            action: p.code ? p.code.substring(p.code.lastIndexOf('_') + 1) : ''
          }))
        }));
      }
      
      if (!Array.isArray(fetchedGrouped)) fetchedGrouped = [];
      setGroupedPermissions(fetchedGrouped);

      if (fetchedRoles.length > 0) {
        setSelectedRoleId(fetchedRoles[0].id);
      }
    } catch (error) {
      toast.error('Không thể tải dữ liệu phân quyền.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRolePermissions = async (roleId) => {
    try {
      setLoading(true);
      const res = await roleApi.getPermissionMatrix(roleId);
      // BE trả về Map<String, Map<String, Boolean>>
      // VD: { "ORDER": { "VIEW": true, "CREATE": false }, "PRODUCT": { "VIEW": true } }
      const raw = res.data?.data || res.data?.content || res.data || {};

      if (Array.isArray(raw)) {
        // Fallback: nếu trả về mảng object có field code
        const perms = raw.map(p => p.code || p.name || p.permissionCode).filter(Boolean);
        setGrantedPermissions(perms);
      } else if (typeof raw === 'object' && raw !== null) {
        // Đây là định dạng đúng: { MODULE: { ACTION: true/false } }
        const granted = [];
        for (const [module, actions] of Object.entries(raw)) {
          for (const [action, enabled] of Object.entries(actions)) {
            if (enabled) {
              granted.push(`${module}_${action}`);
            }
          }
        }
        setGrantedPermissions(granted);
      } else {
        setGrantedPermissions([]);
      }
    } catch (error) {
      toast.error('Không thể tải quyền của nhóm này.');
      console.error(error);
      setGrantedPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = (permissionCode) => {
    if (!permissionCode) return;
    
    setGrantedPermissions(prev => {
      if (prev.includes(permissionCode)) {
        return prev.filter(p => p !== permissionCode);
      } else {
        return [...prev, permissionCode];
      }
    });
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;
    try {
      setSaving(true);

      // BE POST nhận Map<String, List<String>>
      // VD: { "ORDER": ["VIEW", "CREATE"], "PRODUCT": ["VIEW"] }
      // grantedPermissions là mảng code dạng "MODULE_ACTION"
      const matrixPayload = {};
      for (const code of grantedPermissions) {
        const lastUnderscore = code.lastIndexOf('_');
        if (lastUnderscore === -1) continue;
        const module = code.substring(0, lastUnderscore);
        const action = code.substring(lastUnderscore + 1);
        if (!matrixPayload[module]) matrixPayload[module] = [];
        matrixPayload[module].push(action);
      }

      await roleApi.updatePermissionMatrix(selectedRoleId, matrixPayload);
      toast.success('Đã lưu phân quyền thành công!');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi lưu phân quyền.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Nếu API grouped fail, dùng dữ liệu giả lập cho đến khi BE làm xong
  const getFallbackGroupedPermissions = () => {
    const modules = [
      { name: 'Dashboard', code: 'DASHBOARD' },
      { name: 'Sản phẩm', code: 'PRODUCT' },
      { name: 'Đơn hàng', code: 'ORDER' },
      { name: 'Danh mục', code: 'CATEGORY' },
      { name: 'Người dùng', code: 'USER' },
      { name: 'Mã giảm giá', code: 'DISCOUNT' },
      { name: 'Đặt bàn', code: 'RESERVATION' },
      { name: 'Tiền lương', code: 'SALARY' },
    ];
    
    return modules.map(m => ({
      moduleName: m.name,
      moduleCode: m.code,
      permissions: ACTIONS.map(a => ({
        code: `${m.code}_${a.key}`,
        action: a.key,
        name: `${a.label} ${m.name}`
      }))
    }));
  };

  return (
    <div className="permission-page">
      <div className="header-top">
        <div className="page-title-area">
          <h1>Phân quyền chi tiết</h1>
        </div>
        <div className="header-actions">
          <div className="role-selector-container">
            <label>CHỌN NHÓM QUYỀN</label>
            <select 
              className="role-select"
              value={selectedRoleId || ''}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              disabled={loading}
            >
              {Array.isArray(roles) && roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name || role.roleName || role.code || `Role ${role.id}`}
                </option>
              ))}
            </select>
          </div>
          <button className="btn-save" onClick={handleSave} disabled={saving || !selectedRoleId}
            style={{ height: 44, padding: '0 24px', borderRadius: 99, display: 'flex', alignItems: 'center' }}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      <div className="permission-content">
      <div className="permission-card">
        <div className="card-header">
          <div className="card-title">
            <div className="indicator-bar"></div>
            <h2>Ma trận quyền hạn</h2>
          </div>
          <div className="legend">
            <div className="legend-item">
              <span className="checkbox-mock"></span> Chưa cấp
            </div>
            <div className="legend-item">
              <span className="checkbox-mock checked"><Check size={12}/></span> Đã cấp
            </div>
          </div>
        </div>

        <div className="matrix-container">
          <table className="matrix-table">
            <thead>
              <tr>
                <th className="th-module">MODULE / TÍNH NĂNG</th>
                {ACTIONS.map(action => (
                  <th key={action.key} className="th-action">{action.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && groupedPermissions.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : (
                groupedPermissions.map((group, idx) => (
                  <tr key={idx}>
                    <td className="td-module">
                      <div className="module-info">
                        <div className="module-icon">
                          {getModuleIcon(group.moduleName)}
                        </div>
                        <span className="module-name">{group.moduleName}</span>
                      </div>
                    </td>
                    {ACTIONS.map(action => {
                      // Tìm permission tương ứng với action trong group này
                      const perm = group.permissions?.find(p => p.action === action.key || p.code?.includes(action.key));
                      
                      if (!perm) {
                        return <td key={action.key} className="td-checkbox"></td>; // Không hỗ trợ action này
                      }

                      const safeGranted = Array.isArray(grantedPermissions) ? grantedPermissions : [];
                      const isChecked = safeGranted.includes(perm.code);

                      return (
                        <td key={action.key} className="td-checkbox">
                          <label className="custom-checkbox">
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={() => handleTogglePermission(perm.code)}
                            />
                            <span className="checkmark">
                              {isChecked && <Check size={14} strokeWidth={3} />}
                            </span>
                          </label>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="permission-footer">
        <div className="footer-info">
          Lần cuối cập nhật bởi <strong>Admin</strong> vào {new Date().toLocaleDateString('vi-VN')}
        </div>
        <div className="footer-actions">
          <button className="btn-cancel" onClick={() => fetchRolePermissions(selectedRoleId)}>Hoàn tác</button>
        </div>
      </div>
      </div>{/* end permission-content */}
    </div>
  );
};

export default PermissionPage;
