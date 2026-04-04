// Simple standalone search controller - doesn't modify existing logic
const simpleSearchItems = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.json({ success: true, data: [] });
    }

    console.log('🔍 Simple search query:', q);

    // Use existing items endpoint to get data, then filter in memory
    try {
      // Fetch items using the existing working items API
      const itemsResponse = await fetch(`http://localhost:50017/api/items`);
      const itemsData = await itemsResponse.json();
      
      if (itemsData.success && itemsData.data) {
        const searchRegex = new RegExp(q, 'i');
        const filteredItems = itemsData.data.filter(item => {
          // Handle null/undefined items and fields
          if (!item) return false;
          
          const name = item.name || '';
          const description = item.description || '';
          
          return name.match(searchRegex) || description.match(searchRegex);
        });

        console.log('📦 Simple search found:', filteredItems.length, 'items');

        // Map to search result format with null checks
        const searchResults = filteredItems.map(item => ({
          _id: item._id,
          name: item.name || 'Unknown Item',
          description: (item.description || '').substring(0, 100) + '...' || 'Delicious food item',
          price: item.price || 0,
          discountPrice: item.discountPrice || null,
          image: item.image || (item.images && item.images[0] ? item.images[0].url : null) || null,
          category: 'Food',
          categorySlug: 'food',
          rating: item.ratings?.average || 4.5,
          prepTime: item.preparationTime || '15-20 min'
        }));

        res.json({ 
          success: true, 
          data: searchResults,
          count: searchResults.length 
        });
      } else {
        res.json({ success: true, data: [], count: 0 });
      }
    } catch (fetchError) {
      console.error('Error fetching items:', fetchError);
      res.json({ success: true, data: [], count: 0 });
    }
  } catch (error) {
    console.error('Simple search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const simpleGetItemById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Use existing items endpoint to get item details
    try {
      const itemsResponse = await fetch(`http://localhost:50017/api/items`);
      const itemsData = await itemsResponse.json();
      
      if (itemsData.success && itemsData.data) {
        const item = itemsData.data.find(item => item._id === id);
        
        if (item) {
          res.json({ success: true, data: item });
        } else {
          res.status(404).json({ success: false, message: 'Item not found' });
        }
      } else {
        res.status(404).json({ success: false, message: 'Items not found' });
      }
    } catch (fetchError) {
      console.error('Error fetching item:', fetchError);
      res.status(500).json({ success: false, message: 'Error fetching item' });
    }
  } catch (error) {
    console.error('Simple get item error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { simpleSearchItems, simpleGetItemById };
