import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from './Nav';
import YHKLoader from './Yhkloader';
import { API_CONFIG } from '../../config/api';
import './MenuCard.css';

const API_URL = API_CONFIG.API_URL;

// ── Ornamental divider ───────────────────────────────────────────────────────
const Divider = () => (
  <div className="menucard-divider">
    <div className="menucard-divider-dot" />
    <div className="menucard-divider-gem" />
    <div className="menucard-divider-dot" />
    <div className="menucard-divider-gem" />
    <div className="menucard-divider-dot" />
  </div>
);

// ── Category rule (thin line with leaf) ─────────────────────────────────────
const CategoryRule = () => (
  <div className="category-rule">
    <div className="category-rule-line" />
    <span className="category-rule-leaf">🌿</span>
    <div className="category-rule-line" style={{ maxWidth: 40 }} />
  </div>
);

const MenuCard = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesRes, itemsRes] = await Promise.all([
          fetch(`${API_URL}/categories?isActive=true`),
          fetch(`${API_URL}/items?isAvailable=true`),
        ]);
        const categoriesData = await categoriesRes.json();
        const itemsData      = await itemsRes.json();
        if (categoriesData.success) setCategories(categoriesData.data);
        if (itemsData.success)      setItems(itemsData.data);
      } catch (error) {
        console.error('Error fetching menu data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getItemsByCategory = (categoryId) => {
    if (!categoryId) return [];
    return items.filter(item => {
      if (!item?.categoryId) return false;
      const itemCategoryId = typeof item.categoryId === 'object'
        ? item.categoryId._id
        : item.categoryId;
      if (!itemCategoryId) return false;
      const matches = String(itemCategoryId) === String(categoryId);
      if (selectedType === 'all') return matches;
      return matches && item.type === selectedType;
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'veg':     return '🟢';
      case 'non-veg': return '🔴';
      case 'vegan':   return '🟢';
      case 'egg':     return '🟡';
      default:        return '⚪';
    }
  };

  if (loading) {
    return (
      <>
        <Nav />
        <YHKLoader message="Preparing the menu…" fullPage />
      </>
    );
  }

  const visibleCategories = categories
    .filter(c => c?._id)
    .filter(c => getItemsByCategory(c._id).length > 0);

  return (
    <>
      <Nav />
      <div className="menucard-page">
        <div className="menucard-shell">

          {/* Corner ornaments */}
          <div className="menucard-corners">
            <span>❧</span>
            <span>❧</span>
            <span>❧</span>
            <span>❧</span>
          </div>

          <div className="menucard-inner">

            {/* ── Header ── */}
            <div className="menucard-header">
              <span className="menucard-crest">🪔</span>

              <div className="menucard-title">
                <h1>Yeswanth's</h1>
                <div className="menucard-subtitle-line">
                  <span>Healthy Kitchen</span>
                </div>
                <p>Pure Vegetarian · South Indian Cuisine</p>
              </div>

              <Divider />

              {/* Type Filter */}
              <div className="menucard-filters">
                {[
                  { value: 'all',     label: 'Full Menu' },
                  { value: 'veg',     label: '🟢 Vegetarian' },
                  { value: 'non-veg', label: '🔴 Non-Veg' },
                ].map(f => (
                  <button
                    key={f.value}
                    className={`filter-pill ${selectedType === f.value ? 'active' : ''}`}
                    onClick={() => setSelectedType(f.value)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Menu Categories ── */}
            <div className="menucard-container">
              {visibleCategories.map((category, catIndex) => {
                const categoryItems = getItemsByCategory(category._id);
                const categoryKey = category._id
                  ? `category-${category._id}`
                  : `category-${catIndex}-${(category.slug || category.name || '').replace(/\s+/g, '-').substring(0, 30)}`;

                return (
                  <div key={categoryKey} className="menucard-category">

                    {catIndex > 0 && <Divider />}

                    {/* Category heading */}
                    <div className="category-header">
                      <div className="category-icon">{category.icon || '🍽️'}</div>
                      <div className="category-header-text">
                        <div className="category-name-row">
                          <h2>{category.name}</h2>
                        </div>
                        {category.description && (
                          <p>{category.description}</p>
                        )}
                      </div>
                    </div>

                    <CategoryRule />

                    {/* Items */}
                    <div className="menucard-items">
                      {categoryItems.map((item, index) => {
                        const itemKey = item._id
                          ? `menucard-item-${item._id}`
                          : `menucard-item-${index}-${(item.name || '').replace(/\s+/g, '-').substring(0, 30)}`;

                        return (
                          <div
                            key={itemKey}
                            className="menucard-item"
                            onClick={() => navigate('/menu?id=' + item._id)}
                          >
                            {/* Left: type dot + name + description */}
                            <div className="item-left">
                              <span className="item-type">{getTypeIcon(item.type)}</span>
                              <div className="item-details">
                                <h3>{item.name}</h3>
                                {item.description && (
                                  <p className="item-description">{item.description}</p>
                                )}
                                {item.spiceLevel && item.spiceLevel !== 'none' && (
                                  <span className="spice-indicator">
                                    {item.spiceLevel === 'mild'   && '🌶️'}
                                    {item.spiceLevel === 'medium' && '🌶️🌶️'}
                                    {item.spiceLevel === 'hot'    && '🌶️🌶️🌶️'}
                                  </span>
                                )}
                              </div>
                            </div>
                            {/* Right: price + badge */}
                            <div className="item-right">
                              {item.discountPrice && item.discountPrice < item.price ? (
                                <>
                                  <span className="price-original">₹{item.discountPrice}</span>
                                  <span className="price-strike">₹{item.price}</span>
                                </>
                              ) : (
                                <span className="price-original">₹{item.price}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Empty state */}
              {visibleCategories.length === 0 && (
                <div className="menucard-empty">
                  No items available for the selected filter.
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            <Divider />
            <div className="menucard-footer">
              <p>🟢 Vegetarian &nbsp;|&nbsp; 🔴 Non-Vegetarian &nbsp;|&nbsp; 🟡 Contains Egg &nbsp;|&nbsp; 🌶️ Spicy</p>
              <p>All prices are inclusive of taxes &nbsp;·&nbsp; Subject to availability</p>
            </div>

          </div>{/* /menucard-inner */}
        </div>{/* /menucard-shell */}
      </div>
    </>
  );
};

export default MenuCard;