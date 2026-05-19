import React, { useState, useEffect } from 'react';
import { menuItemApi } from '../../api/menuItemApi';
import { categoryApi } from '../../api/categoryApi';
import CustomerProductCard from '../../components/customer/CustomerProductCard';
import CustomerProductModal from '../../components/customer/CustomerProductModal';
import { ChevronDown, ChevronLeft, ChevronRight, Grid, DollarSign, Filter } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { cartApi } from '../../api/cartApi';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import './CustomerProductsPage.css';

const CategoryTreeItem = ({ cat, level, selectedCategory, setSelectedCategory, setCurrentPage, expandedCats, toggleExpand, getCategoryCount }) => {
  const isSelected = selectedCategory === cat.id;
  const hasChildren = cat.children && cat.children.length > 0;
  const isExpanded = expandedCats[cat.id];

  return (
    <div className="tree-node">
      <button 
        className={`category-btn tree-btn ${isSelected ? 'active' : ''}`}
        style={{ 
          paddingLeft: `${ level * 16 + 20 }px`,
          fontWeight: level === 0 ? 700 : 500
        }}
        onClick={() => { 
          setSelectedCategory(cat.id); 
          setCurrentPage(1);
          if (hasChildren && !isExpanded) toggleExpand(cat.id);
        }}
      >
        <span>{cat.name} ({getCategoryCount ? getCategoryCount(cat.id) : 0})</span>
        {hasChildren && (
          <span 
            className="tree-toggle" 
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(cat.id);
            }}
          >
            {isExpanded ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
          </span>
        )}
      </button>
      
      {hasChildren && isExpanded && (
        <div className="tree-children">
          {cat.children.map(child => (
            <CategoryTreeItem 
              key={child.id}
              cat={child}
              level={level + 1}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              setCurrentPage={setCurrentPage}
              expandedCats={expandedCats}
              toggleExpand={toggleExpand}
              getCategoryCount={getCategoryCount}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CustomerProductsPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [priceRange, setPriceRange] = useState('ALL');
  const [sortBy, setSortBy] = useState('POPULAR');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [expandedCats, setExpandedCats] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { refreshCartCount } = useCart();
  const toast = useToast();

  const toggleExpand = (id) => {
    setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // 2 hàng x 4 cột

  useEffect(() => {
    fetchData();
  }, []);

  // Reset trang về 1 khi có bộ lọc mới
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, priceRange, sortBy]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch menu items
      const itemsRes = await menuItemApi.getAll();
      let fetchedItems = Array.isArray(itemsRes.data) ? itemsRes.data : 
                         (itemsRes.data?.data || itemsRes.data?.content || []);
      setItems(fetchedItems.filter(item => item.isActive !== false)); // Only active items

      // Fetch categories
      const catRes = await categoryApi.getWithCount();
      let resData = catRes.data;
      let fetchedCategories = Array.isArray(resData) ? resData : 
                              (resData?.data || resData?.content || []);
      
      // Filter out nested to get only roots
      const childIds = new Set();
      const findChildrenIds = (nodes) => {
        nodes.forEach(node => {
          if (node.children && node.children.length > 0) {
            node.children.forEach(child => childIds.add(child.id));
            findChildrenIds(node.children);
          }
        });
      };
      findChildrenIds(fetchedCategories);
      setCategories(fetchedCategories.filter(cat => !childIds.has(cat.id)));
      
    } catch (err) {
      console.error("Lỗi tải dữ liệu khách hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleModalAddToCart = async (item, qty) => {
    try {
      await cartApi.addItem({
        productId: item.id,
        quantity: qty
      });
      refreshCartCount();
      toast.success(`Đã thêm món "${item.name}" vào giỏ hàng!`);
      setSelectedProduct(null);
    } catch (err) {
      console.error(err);
      toast.error(`Thêm món "${item.name}" thất bại!`);
    }
  };

  // Filter Logic
  let filteredItems = [...items];
  
  if (searchQuery) {
    const normalizedQuery = searchQuery.toLowerCase().normalize('NFC').trim();
    filteredItems = filteredItems.filter(item => {
      const name = item.name ? item.name.toLowerCase().normalize('NFC') : '';
      const desc = item.description ? item.description.toLowerCase().normalize('NFC') : '';
      return name.includes(normalizedQuery) || desc.includes(normalizedQuery);
    });
  }

  // Helper to get all category IDs recursively
  const getSubcategoryIds = (catId, nodes) => {
    let ids = [];
    const findDeep = (list) => {
      for (const node of list) {
        if (node.id === catId) {
          const traverse = (n) => {
            ids.push(n.id);
            if (n.children) n.children.forEach(traverse);
          };
          traverse(node);
          return true;
        }
        if (node.children && findDeep(node.children)) return true;
      }
      return false;
    };
    findDeep(nodes);
    return ids;
  };

  const getCategoryCount = (catId) => {
    const validIds = getSubcategoryIds(catId, categories);
    return items.filter(item => {
      const cId = item.category?.id || item.categoryId;
      return validIds.includes(cId);
    }).length;
  };

  if (selectedCategory !== 'ALL') {
    const validIds = getSubcategoryIds(selectedCategory, categories);
    filteredItems = filteredItems.filter(item => {
      const catId = item.category?.id || item.categoryId;
      return validIds.includes(catId);
    });
  }

  if (priceRange === 'UNDER_100') {
    filteredItems = filteredItems.filter(item => item.price < 100000);
  } else if (priceRange === '100_300') {
    filteredItems = filteredItems.filter(item => item.price >= 100000 && item.price <= 300000);
  } else if (priceRange === 'ABOVE_300') {
    filteredItems = filteredItems.filter(item => item.price > 300000);
  }

  // Sort Logic
  if (sortBy === 'PRICE_ASC') {
    filteredItems.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sortBy === 'PRICE_DESC') {
    filteredItems.sort((a, b) => (b.price || 0) - (a.price || 0));
  }

  // Pagination Logic
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getCategoryName = () => {
    if (searchQuery) return `Kết quả cho "${searchQuery}"`;
    if (selectedCategory === 'ALL') return 'Tất cả món';
    
    let foundName = 'Danh mục';
    const findDeep = (nodes) => {
      for (const node of nodes) {
        if (node.id === selectedCategory) {
           foundName = node.name;
           return true; 
        }
        if (node.children && findDeep(node.children)) return true;
      }
      return false;
    };
    findDeep(categories);
    return foundName;
  };

  // Removed catIcons as per request

  return (
    <div className="customer-page-container">
      {/* Sidebar Layout */}
      <div className="layout-grid">
        
        {/* Left Sidebar */}
        <aside className="customer-sidebar">
          <div className="filter-group">
            <h3 className="filter-title">
              <Grid size={18} /> KHÁM PHÁ THỰC ĐƠN
            </h3>
            <div className="category-list">
              <button 
                className={`category-btn ${selectedCategory === 'ALL' ? 'active' : ''}`}
                style={{ fontWeight: 700 }}
                onClick={() => { setSelectedCategory('ALL'); setCurrentPage(1); }}
              >
                Tất cả món
              </button>
              {(showAllCategories ? categories : categories.slice(0, 5)).map((cat) => (
                <CategoryTreeItem 
                   key={cat.id} 
                   cat={cat} 
                   level={0}
                   selectedCategory={selectedCategory}
                   setSelectedCategory={setSelectedCategory}
                   setCurrentPage={setCurrentPage}
                   expandedCats={expandedCats}
                   toggleExpand={toggleExpand}
                   getCategoryCount={getCategoryCount}
                />
              ))}
              {categories.length > 5 && (
                <button 
                  className="category-toggle-btn"
                  onClick={() => setShowAllCategories(!showAllCategories)}
                >
                  {showAllCategories ? 'Ẩn bớt' : 'Xem thêm...'}
                </button>
              )}
            </div>
          </div>

          <div className="filter-group mt-8">
            <h3 className="filter-title">
              <DollarSign size={18} /> KHOẢNG GIÁ
            </h3>
            <div className="price-list">
              <button 
                className={`price-btn ${priceRange === 'ALL' ? 'active' : ''}`}
                onClick={() => { setPriceRange('ALL'); setCurrentPage(1); }}
              >
                Tất cả mức giá
              </button>
              <button 
                className={`price-btn ${priceRange === 'UNDER_100' ? 'active' : ''}`}
                onClick={() => { setPriceRange('UNDER_100'); setCurrentPage(1); }}
              >
                Dưới 100.000 VNĐ
              </button>
              <button 
                className={`price-btn ${priceRange === '100_300' ? 'active' : ''}`}
                onClick={() => { setPriceRange('100_300'); setCurrentPage(1); }}
              >
                100.000 - 300.000 VNĐ
              </button>
              <button 
                className={`price-btn ${priceRange === 'ABOVE_300' ? 'active' : ''}`}
                onClick={() => { setPriceRange('ABOVE_300'); setCurrentPage(1); }}
              >
                Trên 300.000 VNĐ
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="main-feed">

          <div className="feed-header">
            <div className="feed-title-area">
              <h2 className="feed-title">{getCategoryName()}</h2>
              <span className="item-count">{totalItems} món</span>
            </div>
            <div className="feed-sort">
              <span className="sort-label"><Filter size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> Sắp xếp:</span>
              <select 
                className="sort-dropdown"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="POPULAR">Phổ biến nhất</option>
                <option value="PRICE_ASC">Giá: Thấp - Cao</option>
                <option value="PRICE_DESC">Giá: Cao - Thấp</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
               <div className="loader-circle"></div>
               Đang tải món ăn...
            </div>
          ) : currentItems.length === 0 ? (
            <div className="empty-state">
               <i>🍽️</i>
               <p>Không tìm thấy món ăn nào phù hợp.</p>
            </div>
          ) : (
            <div className="product-grid">
              {currentItems.map(item => (
                <CustomerProductCard 
                  key={item.id} 
                  item={{...item, onViewDetails: (p) => setSelectedProduct(p)}} 
                />
              ))}
            </div>
          )}

          {/* Product Detail Modal */}
          {selectedProduct && (
            <CustomerProductModal 
              item={selectedProduct} 
              onClose={() => setSelectedProduct(null)} 
              onAddToCart={handleModalAddToCart}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="customer-pagination">
               <button 
                 className="page-nav-btn"
                 disabled={currentPage === 1}
                 onClick={() => setCurrentPage(p => p - 1)}
               >
                 <ChevronLeft size={16} />
               </button>
               
               {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                 <button 
                   key={page}
                   className={`page-num-btn ${currentPage === page ? 'active' : ''}`}
                   onClick={() => setCurrentPage(page)}
                 >
                   {page}
                 </button>
               ))}

               <button 
                 className="page-nav-btn"
                 disabled={currentPage === totalPages}
                 onClick={() => setCurrentPage(p => p + 1)}
               >
                 <ChevronRight size={16} />
               </button>
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default CustomerProductsPage;
