import { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import { Search, Wind, Droplets, Cloud, Activity, MapPin, Bell, Settings, User, Loader } from 'lucide-react';
import * as THREE from 'three';
import { getCityAirQuality, searchCities } from './services/airQualityAPI';

function Earth({ selectedCity, selectedCoords, onCitySelect }) {
  const meshRef = useRef();

  const createRealisticEarth = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 4096;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    oceanGrad.addColorStop(0, '#0a1929');
    oceanGrad.addColorStop(0.3, '#1e40af');
    oceanGrad.addColorStop(0.5, '#2563eb');
    oceanGrad.addColorStop(0.7, '#1e40af');
    oceanGrad.addColorStop(1, '#0a1929');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const drawLand = (x, y, w, h, points) => {
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      points.forEach((pt, i) => {
        const px = x + pt[0] * w;
        const py = y + pt[1] * h;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.fill();
    };
    
    drawLand(400, 300, 600, 500, [[0.1, 0.2], [0.3, 0.1], [0.5, 0.15], [0.7, 0.2], [0.85, 0.3], [0.9, 0.5], [0.85, 0.7], [0.7, 0.85], [0.5, 0.9], [0.3, 0.85], [0.15, 0.7], [0.05, 0.4], [0.1, 0.2]]);
    drawLand(700, 900, 400, 700, [[0.3, 0.1], [0.5, 0.05], [0.7, 0.15], [0.8, 0.35], [0.85, 0.6], [0.75, 0.85], [0.5, 0.95], [0.3, 0.9], [0.2, 0.7], [0.25, 0.4], [0.3, 0.1]]);
    drawLand(1900, 600, 500, 800, [[0.3, 0.1], [0.6, 0.15], [0.75, 0.25], [0.85, 0.45], [0.8, 0.7], [0.6, 0.9], [0.35, 0.95], [0.2, 0.8], [0.15, 0.5], [0.25, 0.2], [0.3, 0.1]]);
    drawLand(1850, 250, 450, 400, [[0.2, 0.3], [0.5, 0.2], [0.7, 0.25], [0.85, 0.4], [0.8, 0.6], [0.6, 0.75], [0.4, 0.8], [0.2, 0.7], [0.15, 0.5], [0.2, 0.3]]);
    drawLand(2400, 250, 900, 650, [[0.15, 0.25], [0.4, 0.15], [0.6, 0.2], [0.8, 0.25], [0.9, 0.4], [0.85, 0.6], [0.7, 0.75], [0.5, 0.8], [0.3, 0.75], [0.2, 0.6], [0.1, 0.4], [0.15, 0.25]]);
    drawLand(2900, 1100, 450, 350, [[0.3, 0.3], [0.6, 0.25], [0.8, 0.4], [0.85, 0.65], [0.7, 0.85], [0.4, 0.9], [0.2, 0.75], [0.15, 0.5], [0.3, 0.3]]);
    
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(0, 0, canvas.width, 80);
    ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
    
    return new THREE.CanvasTexture(canvas);
  };

  const earthTexture = createRealisticEarth();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  const latLonToVector3 = (lat, lon, radius = 2.1) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return [x, y, z];
  };

  return (
    <group>
      <Sphere ref={meshRef} args={[2, 128, 128]}>
        <meshStandardMaterial map={earthTexture} roughness={0.9} metalness={0.1} />
      </Sphere>
      {selectedCoords && (
        <mesh 
          position={latLonToVector3(selectedCoords.lat, selectedCoords.lon)}
        >
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={1}
          />
        </mesh>
      )}
    </group>
  );
}

function PollutantCard({ label, value = 0, unit, max, icon: Icon }) {
  const safeValue = value || 0;
  const percent = (safeValue / max) * 100;
  const getColor = () => {
    if (percent <= 33) return { bg: '#065f46', border: '#10b981', text: '#34d399' };
    if (percent <= 66) return { bg: '#78350f', border: '#f59e0b', text: '#fbbf24' };
    return { bg: '#7f1d1d', border: '#ef4444', text: '#f87171' };
  };
  const colors = getColor();

  return (
    <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-5 border border-slate-700 hover:border-slate-600 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} className="text-slate-400" />}
          <span className="text-sm font-medium text-slate-300">{label}</span>
        </div>
        <span className="text-xs text-slate-500">{unit}</span>
      </div>
      <div className="relative h-2 bg-slate-900 rounded-full overflow-hidden mb-3">
        <div 
          className="absolute h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: colors.border }}
        />
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-3xl font-bold" style={{ color: colors.text }}>{safeValue.toFixed(1)}</span>
        <div 
          className="px-3 py-1 rounded-full text-xs font-medium border"
          style={{ backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }}
        >
          {Math.min(percent, 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('New York');
  const [suggestions, setSuggestions] = useState([]);
  const [airQualityData, setAirQualityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);

  // Popular cities as fallback
  const popularCities = [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami', 'Phoenix', 'Philadelphia',
    'London', 'Paris', 'Tokyo', 'Beijing', 'Mumbai', 'Delhi', 'Sydney', 'Toronto',
    'Vancouver', 'Montreal', 'Mexico City', 'São Paulo', 'Berlin', 'Madrid', 'Rome',
    'Singapore', 'Hong Kong', 'Dubai', 'Bangkok', 'Seoul', 'Shanghai', 'Moscow'
  ];

  useEffect(() => {
    console.log(`⚡ useEffect triggered - City: ${selectedCity}, Refresh: ${forceRefresh}`);
    loadCityData(selectedCity);
  }, [selectedCity, forceRefresh]);

  // Simple local search + API search
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim().length > 1) {
        // ONLY local filter - disable broken API search
        const localResults = popularCities.filter(city =>
          city.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 10);

        setSuggestions(localResults.map(city => ({ 
          name: city, 
          aqi: 0, 
          isLocal: true 
        })));
        
        console.log('🔍 Local search results:', localResults);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const performSearch = async (query) => {
    setIsSearching(true);
    console.log('🔍 API search for:', query);
    try {
      const results = await searchCities(query);
      console.log('📍 API results:', results);
      
      if (results.length > 0) {
        // Combine local + API results, remove duplicates
        setSuggestions(prev => {
          const combined = [...prev.filter(p => p.isLocal), ...results];
          const unique = combined.filter((item, index, self) =>
            index === self.findIndex(t => t.name.toLowerCase() === item.name.toLowerCase())
          );
          return unique.slice(0, 10);
        });
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const loadCityData = async (city) => {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🔍 LOADING DATA FOR: "${city}"`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
    setLoading(true);
    try {
      const data = await getCityAirQuality(city);
      
      console.log(`\n📊 RECEIVED DATA:`);
      console.log(`   City: ${data.city}`);
      console.log(`   AQI: ${data.aqi}`);
      console.log(`   Status: ${data.category}`);
      console.log(`   Success: ${data.success}`);
      console.log(`   Pollutants:`, data.pollutants);
      
      if (data.success) {
        setAirQualityData(data);
        console.log(`✅ Data loaded successfully for ${data.city}`);
      } else {
        console.error(`❌ Failed to load data for ${city}:`, data.error);
        setAirQualityData(data); // Still set it to show error state
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    console.log('🔍 Search input:', query);
    setSearchQuery(query);
  };

  const selectCity = (cityName) => {
    console.log(`\n🎯 USER SELECTED: "${cityName}"`);
    console.log(`   Previous city: "${selectedCity}"`);
    
    const cleanCity = cityName.trim();
    
    if (cleanCity) {
      // Force complete reset
      setAirQualityData(null);
      setLoading(true);
      setSearchQuery('');
      setSuggestions([]);
      
      // Update city and force refresh
      setSelectedCity(cleanCity);
      setForceRefresh(prev => prev + 1);
      
      console.log(`   ✅ Forcing reload for: "${cleanCity}"`);
    }
  };

  if (loading || !airQualityData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
          <p className="text-slate-400">Loading air quality data...</p>
        </div>
      </div>
    );
  }

  const data = airQualityData;
  
  // Safety check
  if (!data || !data.pollutants) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error loading data</p>
          <button 
            onClick={() => loadCityData('New York')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const aqiColor = data.color || '#6b7280';

  return (
    <div className="min-h-screen bg-black">
      <nav className="bg-slate-800/90 backdrop-blur-xl border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Cloud className="text-white" size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <span className="text-xl font-semibold text-white">Clear Skies</span>
                  <p className="text-xs text-slate-400">Live Air Quality Monitoring</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && suggestions.length > 0) {
                        selectCity(suggestions[0].name);
                      }
                    }}
                    placeholder="Search any city worldwide..."
                    className="pl-10 pr-4 py-2 w-64 rounded-xl border border-slate-600 bg-slate-700/50 backdrop-blur-sm text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                  {isSearching && (
                    <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-blue-500" size={16} />
                  )}
                </div>
                
                {suggestions.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-slate-800 rounded-xl shadow-xl border border-slate-700 overflow-hidden max-h-96 overflow-y-auto z-50">
                    {suggestions.map((result, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectCity(result.name)}
                        className="w-full px-4 py-3 text-left text-sm text-white hover:bg-slate-700 transition-colors flex items-center justify-between border-b border-slate-700 last:border-0"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <MapPin size={16} className="text-blue-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">
                              {result.name}
                              {result.isLocal && <span className="ml-2 text-xs text-blue-400">⭐</span>}
                            </p>
                            {result.fullName && result.fullName !== result.name && (
                              <p className="text-xs text-slate-500 mt-0.5 truncate">{result.fullName}</p>
                            )}
                          </div>
                        </div>
                        {result.aqi > 0 && (
                          <span className="text-xs px-2 py-1 rounded flex-shrink-0 ml-2" style={{ 
                            backgroundColor: result.aqi <= 50 ? '#065f46' : result.aqi <= 100 ? '#78350f' : '#7f1d1d',
                            color: result.aqi <= 50 ? '#10b981' : result.aqi <= 100 ? '#f59e0b' : '#ef4444'
                          }}>
                            {result.aqi}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                
                {searchQuery.length > 2 && suggestions.length === 0 && !isSearching && (
                  <div className="absolute top-full mt-2 w-full bg-slate-800 rounded-xl shadow-xl border border-slate-700 p-4 text-center text-slate-400 text-sm">
                    No cities found. Try a different search.
                  </div>
                )}
              </div>
              <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <Bell size={20} className="text-slate-400 hover:text-white transition-colors" />
              </button>
              <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <Settings size={20} className="text-slate-400 hover:text-white transition-colors" />
              </button>
              <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <User size={20} className="text-slate-400 hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1800px] mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-md rounded-3xl p-8 border border-slate-700 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-slate-400 mb-1">Air Quality</p>
                <h2 className="text-4xl font-bold" style={{ color: aqiColor }}>{data.category}</h2>
              </div>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ backgroundColor: aqiColor + '15' }}>
                <Activity size={36} style={{ color: aqiColor }} strokeWidth={2.5} />
              </div>
            </div>
                          <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">AQI Level</span>
                <span className="text-2xl font-bold text-white">{data.aqi || 0}</span>
              </div>
              <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ width: `${((data.aqi || 0) / 300) * 100}%`, backgroundColor: aqiColor }}
                />
              </div>
              <div className="pt-2 text-xs text-slate-500">
                {data.stationCount || 0} monitoring stations
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={20} />
                  <span className="text-sm opacity-90">Current Location</span>
                </div>
                <h1 className="text-5xl font-bold mb-2">{data.city || selectedCity}</h1>
                <p className="text-blue-100">{data.source || 'Loading...'} • Updated {data.lastUpdate ? new Date(data.lastUpdate).toLocaleTimeString() : 'now'}</p>
                {data.statusCode && (
                  <p className="text-xs text-blue-200 mt-1">API Status: {data.statusCode} ✓</p>
                )}
                {!data.success && (
                  <p className="text-xs text-red-300 mt-2">⚠️ No data available for this location</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm opacity-80 mb-1">Current Time</p>
                <p className="text-3xl font-bold">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="xl:col-span-3 bg-slate-800/50 backdrop-blur-md rounded-3xl p-6 border border-slate-700 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Global Air Quality Map</h3>
            <div className="h-[550px] rounded-2xl overflow-hidden bg-gradient-to-b from-slate-950 to-black">
              <Canvas camera={{ position: [0, 0, 5.5], fov: 50 }}>
                <ambientLight intensity={0.8} />
                <pointLight position={[10, 10, 10]} intensity={1.5} />
                <pointLight position={[-10, 5, -10]} intensity={0.8} />
                <Earth selectedCity={selectedCity} selectedCoords={airQualityData?.coords} onCitySelect={selectCity} />
                <OrbitControls enableZoom={true} enablePan={false} minDistance={4} maxDistance={10} />
              </Canvas>
            </div>
            <p className="text-center text-slate-500 text-sm mt-4">Interactive 3D Earth • Click markers for real-time city data</p>
          </div>

          <div className="xl:col-span-2 space-y-4">
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Live Pollutant Levels</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                      <Wind size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">PM2.5</p>
                      <p className="font-semibold text-white">Fine Particles</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{(data?.pollutants?.pm25 || 0).toFixed(1)}</p>
                    <p className="text-xs text-slate-500">μg/m³</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                      <Cloud size={20} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">NO₂</p>
                      <p className="font-semibold text-white">Nitrogen Dioxide</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{(data?.pollutants?.no2 || 0).toFixed(1)}</p>
                    <p className="text-xs text-slate-500">μg/m³</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                      <Droplets size={20} className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">O₃</p>
                      <p className="font-semibold text-white">Ozone</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{(data?.pollutants?.o3 || 0).toFixed(1)}</p>
                    <p className="text-xs text-slate-500">μg/m³</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Data Source</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <div>
                    <p className="text-sm font-medium text-blue-400">OpenAQ Network</p>
                    <p className="text-xs text-blue-600 mt-1">Real-time data from {data.stationCount} monitoring stations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <PollutantCard label="PM2.5" value={data?.pollutants?.pm25 || 0} unit="μg/m³" max={100} icon={Wind} />
          <PollutantCard label="PM10" value={data?.pollutants?.pm10 || 0} unit="μg/m³" max={100} icon={Wind} />
          <PollutantCard label="NO₂" value={data?.pollutants?.no2 || 0} unit="μg/m³" max={200} icon={Cloud} />
          <PollutantCard label="O₃" value={data?.pollutants?.o3 || 0} unit="μg/m³" max={180} icon={Activity} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <PollutantCard label="SO₂" value={data?.pollutants?.so2 || 0} unit="μg/m³" max={100} icon={Cloud} />
          <PollutantCard label="CO" value={data?.pollutants?.co || 0} unit="mg/m³" max={10} icon={Wind} />
          <PollutantCard label="NO" value={data?.pollutants?.no || 0} unit="μg/m³" max={100} icon={Cloud} />
          <PollutantCard label="NH₃" value={data?.pollutants?.nh3 || 0} unit="μg/m³" max={50} icon={Droplets} />
        </div>
      </main>

      <footer className="bg-slate-900 mt-16 py-8 border-t border-slate-800">
        <div className="max-w-[1800px] mx-auto px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Cloud size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">Clear Skies</p>
                <p className="text-xs text-slate-500">OpenAQ Real-Time Data</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm">
              Built by <span className="text-blue-400 font-medium">Faisal</span>, <span className="text-indigo-400 font-medium">Neftalem</span> & <span className="text-purple-400 font-medium">Utkarsh</span>
              <span className="mx-2">•</span>
              <span className="text-slate-500">Because breathing is kinda important 🌱</span>
            </p>
            <p className="text-slate-600 text-xs">© 2025 Clear Skies</p>
          </div>
        </div>
      </footer>
    </div>
  );
}