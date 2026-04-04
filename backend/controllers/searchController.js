import Item from '../models/Item.js';

// Search items by name, description, or tags
const searchItems = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.json({ success: true, data: [] });
    }

    console.log('🔍 Search query:', q);

    // Use .lean() to get plain JavaScript objects without population
    const items = await Item.find({}).lean().limit(20);
    console.log('📦 Total items found:', items.length);
    
    if (items.length > 0) {
      console.log('📝 Sample item fields:', Object.keys(items[0]));
      console.log('📝 Sample item name:', items[0].name || items[0].itemName || items[0].title || 'No name field');
    }

    // Filter items manually
    const searchRegex = new RegExp(q, 'i');
    const filteredItems = items.filter(item => {
      // Try different possible field names
      const name = item.name || item.itemName || item.title || '';
      const description = item.description || '';
      
      console.log(`🔍 Checking item: "${name}" against "${q}"`);
      
      return name.match(searchRegex) || description.match(searchRegex);
    });
    
    console.log('🔍 Filtered items:', filteredItems.length);

    // Return the filtered items without category dependency
    const searchResults = filteredItems.map(item => ({
      _id: item._id,
      name: item.name || item.itemName || item.title || 'Unknown Item',
      description: (item.description || '').substring(0, 100) + '...' || 'Delicious food item',
      price: item.price || 0,
      discountPrice: item.discountPrice || null,
      image: item.image || (item.images && item.images[0] ? item.images[0].url : null) || null,
      category: 'Food', // Simple fallback instead of trying to populate category
      categorySlug: 'food',
      rating: item.ratings?.average || item.avgRating || 4.5,
      prepTime: item.preparationTime || item.prepTime || '15-20 min'
    }));

    res.json({ 
      success: true, 
      data: searchResults,
      count: searchResults.length 
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single item details by ID
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await Item.findById(id)
      .populate('category', 'name slug')
      .select('-__v');

    if (!item || !item.isActive) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get popular/recommended items (for search suggestions)
const getPopularItems = async (req, res) => {
  try {
    const items = await Item.find({ isActive: true })
      .populate('category', 'name')
      .sort({ avgRating: -1, orderCount: -1 })
      .limit(10)
      .select('name image price avgRating category');

    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Popular items error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { 
  searchItems, 
  getItemById, 
  getPopularItems 
};
