import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../../config/api';
import './SearchComponent.css';

const SearchComponent = ({ placeholder = "Search for food items..." }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [popularItems, setPopularItems] = useState([]);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Fetch popular items on mount
  useEffect(() => {
    const fetchPopularItems = async () => {
      try {
        // Use existing items endpoint to get popular items
        const response = await fetch(`${API_CONFIG.API_URL}/items`);
        const data = await response.json();
        if (data.success && data.data) {
          // Filter out items with null names and get first 10 items as "popular"
          const validItems = data.data.filter(item => item && item.name);
          const popularItems = validItems.slice(0, 10);
          setPopularItems(popularItems);
        }
      } catch (error) {
        console.error('Error fetching popular items:', error);
      }
    };
    fetchPopularItems();
  }, []);

  // Search API call with debouncing
  const handleSearch = async (searchQuery) => {
    console.log('🔍 Frontend search for:', searchQuery);
    
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      // Use simple search endpoint that doesn't modify existing logic
      const response = await fetch(`${API_CONFIG.API_URL}/simple-search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      console.log('📦 Search results:', data);
      if (data.success) {
        setResults(data.data);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        handleSearch(query);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (item) => {
    if (item && item._id) {
      // Navigate to menu page with item info (Menu.jsx expects 'id' parameter)
      navigate(`/menu?id=${item._id}`);
      setShowResults(false);
      setQuery('');
    }
  };

  const handleInputFocus = () => {
    if (!query.trim() && popularItems.length > 0) {
      setShowResults(true);
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="search-component" ref={searchRef}>
      <div className="search-input-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="search-input"
        />
        {query && (
          <button 
            className="search-clear-btn"
            onClick={handleClearSearch}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
        <div className="search-icon">
          🔍
        </div>
      </div>

      {showResults && (
        <div className="search-results">
          {loading ? (
            <div className="search-loading">
              <div className="search-spinner"></div>
              Searching...
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="search-results-header">
                <span>Results ({results.length})</span>
              </div>
              {results.filter(item => item && item.name).map(item => (
                <div
                  key={item._id}
                  className="search-result-item"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="search-result-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name || 'Food item'} loading="lazy" />
                    ) : (
                      <div className="search-result-placeholder">
                        🍽️
                      </div>
                    )}
                  </div>
                  <div className="search-result-info">
                    <h4 className="search-result-name">{item.name || 'Unknown Item'}</h4>
                    <p className="search-result-description">{item.description || 'Delicious food item'}</p>
                    <div className="search-result-meta">
                      <span className="search-result-category">{item.category || 'Food'}</span>
                      <span className="search-result-rating">⭐ {item.rating || 4.5}</span>
                      <span className="search-result-time">⏱️ {item.prepTime || '15-20 min'}</span>
                    </div>
                    <div className="search-result-price">
                      {item.discountPrice ? (
                        <>
                          <span className="original-price">₹{item.price || 0}</span>
                          <span className="discounted-price">₹{item.discountPrice}</span>
                        </>
                      ) : (
                        <span className="price">₹{item.price || 0}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : query.trim() ? (
            <div className="search-no-results">
              <div className="search-no-results-icon">🔍</div>
              <h4>No results found</h4>
              <p>Try searching for something else</p>
            </div>
          ) : popularItems.length > 0 ? (
            <>
              <div className="search-results-header">
                <span>Popular Items</span>
              </div>
              {popularItems.filter(item => item && item.name).map(item => (
                <div
                  key={item._id}
                  className="search-result-item popular-item"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="search-result-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name || 'Food item'} loading="lazy" />
                    ) : (
                      <div className="search-result-placeholder">
                        🍽️
                      </div>
                    )}
                  </div>
                  <div className="search-result-info">
                    <h4 className="search-result-name">{item.name || 'Unknown Item'}</h4>
                    <span className="search-result-category">{item.category || 'Food'}</span>
                    <div className="search-result-price">
                      <span className="price">₹{item.price || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
