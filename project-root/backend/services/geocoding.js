// 📍 Geocoding Service - Converts addresses to coordinates using Nominatim
// FREE OpenStreetMap service - no API key required

/**
 * Get predefined coordinates for Indian states (guaranteed fallback)
 * @param {string} state - State name
 * @returns {Object} - Coordinates {lat, lng} or null
 */
const getStateCoordinates = (state) => {
  const stateCoords = {
    'Andhra Pradesh': { lat: 15.9129, lng: 79.7400 },
    'Arunachal Pradesh': { lat: 28.6667, lng: 94.6500 },
    'Assam': { lat: 26.2006, lng: 92.9376 },
    'Bihar': { lat: 25.0961, lng: 85.3131 },
    'Chhattisgarh': { lat: 21.2787, lng: 81.8661 },
    'Goa': { lat: 15.2993, lng: 74.1240 },
    'Gujarat': { lat: 23.2156, lng: 72.6369 },
    'Haryana': { lat: 29.0588, lng: 76.0856 },
    'Himachal Pradesh': { lat: 31.1048, lng: 77.1734 },
    'Jharkhand': { lat: 23.6102, lng: 85.2799 },
    'Karnataka': { lat: 12.9716, lng: 77.5946 },
    'Kerala': { lat: 10.8505, lng: 76.2711 },
    'Madhya Pradesh': { lat: 23.2599, lng: 77.4126 },
    'Maharashtra': { lat: 19.0760, lng: 72.8777 },
    'Manipur': { lat: 24.6637, lng: 93.9063 },
    'Meghalaya': { lat: 25.4670, lng: 91.3662 },
    'Mizoram': { lat: 23.1645, lng: 92.9376 },
    'Nagaland': { lat: 26.1584, lng: 94.5624 },
    'Odisha': { lat: 20.9517, lng: 85.0985 },
    'Punjab': { lat: 31.1471, lng: 75.3412 },
    'Rajasthan': { lat: 26.9124, lng: 75.7873 },
    'Sikkim': { lat: 27.5330, lng: 88.5122 },
    'Tamil Nadu': { lat: 13.0827, lng: 80.2707 },
    'Telangana': { lat: 17.3850, lng: 78.4867 },
    'Tripura': { lat: 23.8315, lng: 91.2868 },
    'Uttar Pradesh': { lat: 26.8467, lng: 80.9462 },
    'Uttarakhand': { lat: 30.0668, lng: 79.0193 },
    'West Bengal': { lat: 22.9868, lng: 87.8550 },
    'Delhi': { lat: 28.7041, lng: 77.1025 },
    'Jammu & Kashmir': { lat: 33.7782, lng: 76.5762 },
    'Ladakh': { lat: 34.1526, lng: 77.5770 },
    'Puducherry': { lat: 11.9416, lng: 79.8083 }
  };
  
  // Handle common variations and normalize state name
  const normalizedState = state?.trim().toLowerCase();
  for (const [key, coords] of Object.entries(stateCoords)) {
    if (key.toLowerCase() === normalizedState) {
      return coords;
    }
  }
  
  return null;
};

/**
 * Geocode an address to get coordinates using Nominatim
 * @param {Object} address - Address object with street, city, state, zipCode
 * @returns {Object} - Coordinates object with lat, lng, and metadata
 */
export const geocodeAddress = async (address) => {
  try {
    // Build full address string from components
    const addressParts = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
      'India' // Add country for better accuracy
    ].filter(Boolean);

    const fullAddress = addressParts.join(', ');
    console.log('🔍 Geocoding address:', fullAddress);

    // Nominatim forward geocoding API
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`,
      {
        headers: {
          // Nominatim requires a User-Agent identifying your app
          'User-Agent': 'YHK-FoodApp/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📍 Nominatim geocoding response:', data);

    if (!data || data.length === 0) {
      // Try fallback with just city and state
      console.log('🔄 Trying fallback geocoding with city/state only...');
      const fallbackQuery = `${address.city}, ${address.state}, India`;
      const fallbackResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackQuery)}&limit=1`,
        {
          headers: {
            'User-Agent': 'YHK-FoodApp/1.0'
          }
        }
      );

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        console.log('📍 Fallback geocoding response:', fallbackData);
        
        if (fallbackData && fallbackData.length > 0) {
          const result = fallbackData[0];
          console.log('✅ Fallback geocoding successful:', result);
          return {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
            accuracy: null,
            provider: 'nominatim',
            rawResponse: { ...result, fallback: true },
            capturedAt: new Date()
          };
        }
      }
      
      // Try final fallback with just state
      console.log('🔄 Trying final fallback with state only...');
      const stateFallbackQuery = `${address.state}, India`;
      const stateFallbackResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(stateFallbackQuery)}&limit=1`,
        {
          headers: {
            'User-Agent': 'YHK-FoodApp/1.0'
          }
        }
      );

      if (stateFallbackResponse.ok) {
        const stateFallbackData = await stateFallbackResponse.json();
        console.log('📍 State fallback geocoding response:', stateFallbackData);
        
        if (stateFallbackData && stateFallbackData.length > 0) {
          const result = stateFallbackData[0];
          console.log('✅ State fallback geocoding successful:', result);
          return {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
            accuracy: null,
            provider: 'nominatim',
            rawResponse: { ...result, fallback: 'state' },
            capturedAt: new Date()
          };
        }
      }
      
      // Final guaranteed fallback - use predefined coordinates for Indian states
      console.log('🔄 Using guaranteed coordinates fallback...');
      const stateCoordinates = getStateCoordinates(address.state);
      
      if (stateCoordinates) {
        console.log(`✅ Using state coordinates for ${address.state}:`, stateCoordinates);
        return {
          latitude: stateCoordinates.lat,
          longitude: stateCoordinates.lng,
          accuracy: null,
          provider: 'nominatim',
          rawResponse: { 
            fallback: 'state_capital',
            state: address.state,
            note: 'Used predefined state coordinates'
          },
          capturedAt: new Date()
        };
      }
      
      // Ultimate fallback - use center of India
      console.log('🔄 Using ultimate fallback - center of India');
      const indiaCenter = { lat: 20.5937, lng: 78.9629 };
      return {
        latitude: indiaCenter.lat,
        longitude: indiaCenter.lng,
        accuracy: null,
        provider: 'nominatim',
        rawResponse: { 
          fallback: 'india_center',
          note: 'Used center of India coordinates'
        },
        capturedAt: new Date()
      };
    }

    const result = data[0];

    // Extract coordinates and metadata
    const coordinates = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      accuracy: null, // Nominatim doesn't provide accuracy for forward geocoding
      provider: 'nominatim',
      rawResponse: result,
      capturedAt: new Date()
    };

    console.log('✅ Geocoding successful:', coordinates);
    return coordinates;

  } catch (error) {
    console.error('❌ Geocoding failed:', error.message);
    
    // GUARANTEED: Always return coordinates, never null
    console.log('🔄 Using emergency coordinates due to complete failure');
    const emergencyCoords = { lat: 20.5937, lng: 78.9629 }; // Center of India
    
    return {
      latitude: emergencyCoords.lat,
      longitude: emergencyCoords.lng,
      accuracy: null,
      provider: 'nominatim',
      rawResponse: { 
        fallback: 'emergency',
        error: error.message,
        note: 'Used emergency coordinates due to complete failure'
      },
      capturedAt: new Date()
    };
  }
};

/**
 * Reverse geocode coordinates to get address (for validation/debugging)
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Object} - Address object
 */
export const reverseGeocode = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'YHK-FoodApp/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📍 Reverse geocoding response:', data);

    if (!data || !data.address) {
      throw new Error('No address found for these coordinates');
    }

    const a = data.address;
    
    return {
      street: [a.house_number, a.road].filter(Boolean).join(' ') || a.neighbourhood,
      city: a.city || a.town || a.village,
      state: a.state,
      zipCode: a.postcode,
      landmark: a.landmark || '',
      country: a.country
    };

  } catch (error) {
    console.error('❌ Reverse geocoding failed:', error.message);
    return null;
  }
};

/**
 * Validate coordinates are within reasonable bounds for India
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {boolean} - True if coordinates are valid
 */
export const validateIndianCoordinates = (lat, lon) => {
  // Rough bounds for India
  const INDIA_BOUNDS = {
    minLat: 6.0,
    maxLat: 38.0,
    minLon: 68.0,
    maxLon: 97.0
  };

  return lat >= INDIA_BOUNDS.minLat && 
         lat <= INDIA_BOUNDS.maxLat && 
         lon >= INDIA_BOUNDS.minLon && 
         lon <= INDIA_BOUNDS.maxLon;
};
