// Simple standalone search controller - doesn't modify existing logic
import Item from '../models/Item.js';

const simpleSearchItems = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.json({ success: true, data: [] });
    }

    console.log('🔍 Simple search query:', q);

    try {
      // Direct database query instead of HTTP request
      const searchRegex = new RegExp(q, 'i');
      const items = await Item.find({
        $or: [
          { name: { $regex: searchRegex } },
          { description: { $regex: searchRegex } }
        ]
      }).populate('category', 'name');

      console.log('📦 Simple search found:', items.length, 'items');

      // Map to search result format with null checks
      const searchResults = items.map(item => ({
        _id: item._id,
        name: item.name || 'Unknown Item',
        description: (item.description || '').substring(0, 100) + (item.description && item.description.length > 100 ? '...' : '') || 'Delicious food item',
        price: item.price || 0,
        discountPrice: item.discountPrice || null,
        image: item.image || (item.images && item.images[0] ? item.images[0].url : null) || null,
        category: item.category?.name || 'Food',
        categorySlug: item.category?.slug || 'food',
        rating: item.ratings?.average || 4.5,
        prepTime: item.preparationTime || '15-20 min'
      }));

      res.json({ 
        success: true, 
        data: searchResults,
        count: searchResults.length 
      });
    } catch (dbError) {
      console.error('Error querying database:', dbError);
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
    
    // Direct database query instead of HTTP request
    try {
      const item = await Item.findById(id).populate('category', 'name slug');
      
      if (item) {
        res.json({ success: true, data: item });
      } else {
        res.status(404).json({ success: false, message: 'Item not found' });
      }
    } catch (dbError) {
      console.error('Error querying database:', dbError);
      res.status(500).json({ success: false, message: 'Error fetching item' });
    }
  } catch (error) {
    console.error('Simple get item error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { simpleSearchItems, simpleGetItemById };
