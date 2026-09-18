import axios from 'axios';

const OPENAQ_API_KEY = import.meta.env.VITE_OPENAQ_API_KEY;

// City coordinates mapping 
const cityCoordinates = {
  'new york': { lat: 40.7128, lon: -74.0060 },
  'los angeles': { lat: 34.0522, lon: -118.2437 },
  'chicago': { lat: 41.8781, lon: -87.6298 },
  'houston': { lat: 29.7604, lon: -95.3698 },
  'miami': { lat: 25.7617, lon: -80.1918 },
  'phoenix': { lat: 33.4484, lon: -112.0740 },
  'philadelphia': { lat: 39.9526, lon: -75.1652 },
  'seattle': { lat: 47.6062, lon: -122.3321 },
  'boston': { lat: 42.3601, lon: -71.0589 },
  'atlanta': { lat: 33.7490, lon: -84.3880 },
  'toronto': { lat: 43.6532, lon: -79.3832 },
  'montreal': { lat: 45.5017, lon: -73.5673 },
  'vancouver': { lat: 49.2827, lon: -123.1207 },
  'london': { lat: 51.5074, lon: -0.1278 },
  'paris': { lat: 48.8566, lon: 2.3522 },
  'berlin': { lat: 52.5200, lon: 13.4050 },
  'madrid': { lat: 40.4168, lon: -3.7038 },
  'rome': { lat: 41.9028, lon: 12.4964 },
  'tokyo': { lat: 35.6762, lon: 139.6503 },
  'beijing': { lat: 39.9042, lon: 116.4074 },
  'shanghai': { lat: 31.2304, lon: 121.4737 },
  'delhi': { lat: 28.6139, lon: 77.2090 },
  'mumbai': { lat: 19.0760, lon: 72.8777 },
  'bangalore': { lat: 12.9716, lon: 77.5946 },
  'seoul': { lat: 37.5665, lon: 126.9780 },
  'singapore': { lat: 1.3521, lon: 103.8198 },
  'sydney': { lat: -33.8688, lon: 151.2093 },
  'dubai': { lat: 25.2048, lon: 55.2708 },
  'mexico city': { lat: 19.4326, lon: -99.1332 },
  'são paulo': { lat: -23.5505, lon: -46.6333 },
};

// Search cities (disabled - not reliable)
export const searchCities = async (query) => {
  return []; // Disabled - returns empty
};

// Get by coordinates
export const getAirQualityByCoords = async (lat, lon) => {
  try {
    const response = await axios.get(`https://api.waqi.info/feed/geo:${lat};${lon}/?token=demo`);
    
    console.log(`✅ Geo API Status: ${response.status}`);
    
    if (response.data.status === 'ok') {
      const data = response.data.data;
      
      const pollutants = {
        pm25: data.iaqi?.pm25?.v || 0,
        pm10: data.iaqi?.pm10?.v || 0,
        no2: data.iaqi?.no2?.v || 0,
        o3: data.iaqi?.o3?.v || 0,
        so2: data.iaqi?.so2?.v || 0,
        co: data.iaqi?.co?.v || 0,
        no: data.iaqi?.no?.v || 0,
        nh3: data.iaqi?.nh3?.v || 0,
      };
      
      const aqi = data.aqi || 0;
      const aqiInfo = getAQICategory(aqi);
      
      return {
        success: true,
        statusCode: response.status,
        city: data.city?.name || 'Unknown',
        coords: { lat, lon },
        aqi,
        category: aqiInfo.category,
        color: aqiInfo.color,
        textColor: aqiInfo.textColor,
        pollutants,
        stationCount: 1,
        timestamp: new Date(),
        lastUpdate: data.time?.iso || new Date().toISOString(),
        source: 'WAQI',
      };
    }
    
    return { success: false };
  } catch (error) {
    console.error('Geo API Error:', error);
    return { success: false, error: error.message };
  }
};

// Calculate AQI
export const calculateAQI = (pollutants) => {
  const { pm25 } = pollutants;
  
  const pm25Breakpoints = [
    { cLow: 0, cHigh: 12, iLow: 0, iHigh: 50 },
    { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
    { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
    { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
    { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
    { cLow: 250.5, cHigh: 500, iLow: 301, iHigh: 500 },
  ];

  if (!pm25) return 0;
  
  for (let bp of pm25Breakpoints) {
    if (pm25 >= bp.cLow && pm25 <= bp.cHigh) {
      return Math.round(((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (pm25 - bp.cLow) + bp.iLow);
    }
  }
  return 500;
};

// Get AQI category
export const getAQICategory = (aqi) => {
  if (aqi <= 50) return { category: 'Good', color: '#10b981', textColor: '#065f46' };
  if (aqi <= 100) return { category: 'Moderate', color: '#f59e0b', textColor: '#92400e' };
  if (aqi <= 150) return { category: 'Unhealthy for Sensitive', color: '#f97316', textColor: '#9a3412' };
  if (aqi <= 200) return { category: 'Unhealthy', color: '#ef4444', textColor: '#991b1b' };
  if (aqi <= 300) return { category: 'Very Unhealthy', color: '#dc2626', textColor: '#7f1d1d' };
  return { category: 'Hazardous', color: '#991b1b', textColor: '#450a0a' };
};

// MAIN FUNCTION - Uses coordinates!
export const getCityAirQuality = async (cityName) => {
  console.log(`\n🔄 getCityAirQuality: "${cityName}"`);
  
  const cleanCity = cityName.toLowerCase().trim();
  const coords = cityCoordinates[cleanCity];
  
  if (coords) {
    console.log(`📍 Using coordinates: ${coords.lat}, ${coords.lon}`);
    const result = await getAirQualityByCoords(coords.lat, coords.lon);
    
    if (result.success) {
      result.city = cityName; // Override with searched city name
      console.log(`✅ Got data for ${cityName}: AQI ${result.aqi}`);
      return result;
    }
  }
  
  console.error(`❌ No coordinates for "${cleanCity}"`);
  
  return {
    success: false,
    city: cityName,
    coords: { lat: 0, lon: 0 },
    aqi: 0,
    category: 'No Data',
    color: '#6b7280',
    textColor: '#374151',
    pollutants: { pm25: 0, pm10: 0, no2: 0, o3: 0, so2: 0, co: 0, no: 0, nh3: 0 },
    stationCount: 0,
    timestamp: new Date(),
    source: 'N/A',
  };
};