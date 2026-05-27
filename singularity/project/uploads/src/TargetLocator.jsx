import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Compass, Globe, Check, AlertCircle, Loader } from 'lucide-react';

const PRESET_SITES = [
  { name: "Sa Pa Observatory", region: "Lào Cai", lat: 22.337, lon: 103.844, score: 8.6, bortle: 2, alt: "1,650m" },
  { name: "Tam Đảo Plateau",   region: "Vĩnh Phúc", lat: 21.467, lon: 105.642, score: 6.4, bortle: 4, alt: "1,140m" },
  { name: "Mộc Châu Highland", region: "Sơn La",    lat: 20.836, lon: 104.638, score: 5.4, bortle: 5, alt: "1,050m" },
  { name: "Cúc Phương · Bãi Trống", region: "Ninh Bình", lat: 20.255, lon: 105.722, score: 4.1, bortle: 6, alt: "350m" },
  { name: "Đà Lạt Observatory", region: "Lâm Đồng",  lat: 11.945, lon: 108.479, score: 7.8, bortle: 3, alt: "1,500m" },
];

export default function TargetLocator({ onLocationSelect, lang = 'en' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('place'); // 'place', 'coords'
  const [gpsError, setGpsError] = useState('');
  const [geocoderSpeed, setGeocoderSpeed] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    const startTime = performance.now();
    setGpsError('');

    // Check if the query is a raw coordinate pair (e.g. "75.0000, 43.0000" or "75.0 43.0")
    const coordMatch = trimmedQuery.match(/^([-+]?\d{1,2}(?:\.\d+)?)(?:\s*,\s*|\s+)([-+]?\d{1,3}(?:\.\d+)?)$/);
    if (coordMatch) {
      const parsedLat = parseFloat(coordMatch[1]);
      const parsedLon = parseFloat(coordMatch[2]);
      
      // Validate lat/lon ranges
      if (parsedLat >= -90 && parsedLat <= 90 && parsedLon >= -180 && parsedLon <= 180) {
        setIsOpen(false);
        if (onLocationSelect) {
          onLocationSelect({ 
            lat: parsedLat, 
            lon: parsedLon, 
            name: `LAT: ${parsedLat.toFixed(4)}, LON: ${parsedLon.toFixed(4)}` 
          });
        }
        return;
      }
    }
    
    setIsScanning(true);
    setIsOpen(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setResults(data);
      const duration = Math.round(performance.now() - startTime);
      setGeocoderSpeed(duration);
    } catch (error) {
      console.error('Geocoding error:', error);
      setResults([]);
    } finally {
      setIsScanning(false);
    }
  };

  const handleGPSClick = () => {
    setGpsError('');
    if (navigator.geolocation) {
      setIsScanning(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLat = position.coords.latitude;
          const newLon = position.coords.longitude;
          setIsScanning(false);
          if (onLocationSelect) {
            onLocationSelect({
              lat: newLat,
              lon: newLon,
              name: lang === 'en' ? `GPS Coordinates (${newLat.toFixed(4)}°N, ${newLon.toFixed(4)}°E)` : `Tọa độ GPS (${newLat.toFixed(4)}°B, ${newLon.toFixed(4)}°Đ)`
            });
          }
        },
        (err) => {
          console.error("GPS Error:", err);
          setGpsError(lang === 'en' ? 'Could not access GPS. Please search manually.' : 'Không thể truy cập GPS. Vui lòng nhập tay.');
          setIsScanning(false);
        }
      );
    } else {
      setGpsError(lang === 'en' ? 'GPS is not supported.' : 'Không hỗ trợ GPS.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelect = (item) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    setQuery(item.display_name);
    setIsOpen(false);
    if (onLocationSelect) {
      onLocationSelect({ lat, lon, name: item.display_name });
    }
  };

  return (
    <div className="w-full max-w-xl" ref={dropdownRef}>
      {/* Mode selectors */}
      <div className="flex gap-2 mb-3">
        <button 
          onClick={() => setMode('place')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
            mode === 'place' 
              ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' 
              : 'bg-white/3 border-white/5 text-white/50 hover:text-white/80'
          }`}
        >
          <Search size={12} />
          {lang === 'en' ? 'Place name' : 'Tên địa danh'}
        </button>
        <button 
          onClick={() => setMode('coords')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
            mode === 'coords' 
              ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' 
              : 'bg-white/3 border-white/5 text-white/50 hover:text-white/80'
          }`}
        >
          <Compass size={12} />
          {lang === 'en' ? 'Coordinates' : 'Tọa độ'}
        </button>
        <button 
          onClick={handleGPSClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-white/3 border-white/5 text-white/50 hover:text-white/80 hover:bg-white/5 cursor-pointer"
        >
          <MapPin size={12} />
          {lang === 'en' ? 'Use GPS' : 'Dùng GPS'}
        </button>
      </div>

      {/* Input Group */}
      <div className="relative">
        <div 
          className="flex items-stretch rounded-2xl bg-[#0a0a10]/55 border border-white/10 backdrop-blur-2xl shadow-[0_24px_60px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden transition-all duration-300 focus-within:border-purple-500/50"
        >
          <div className="flex items-center px-4 text-white/40">
            {isScanning ? <Loader size={18} className="animate-spin text-purple-400" /> : <Search size={18} />}
          </div>
          <input
            type="text"
            className="flex-1 py-4.5 bg-transparent border-none outline-none text-white text-base font-sans font-medium placeholder-white/35 focus:ring-0"
            placeholder={
              mode === 'place' 
                ? (lang === 'en' ? "Search city, observatory, mount..." : "Tìm thành phố, trạm quan sát...") 
                : "22.337, 103.844"
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center gap-2 px-2.5 border-l border-white/6">
            <button 
              onClick={handleGPSClick}
              title={lang === 'en' ? "Use browser GPS" : "Dùng GPS thiết bị"}
              className="w-10 h-10 rounded-xl bg-white/3 border border-white/8 text-white/70 hover:bg-white/8 flex items-center justify-center cursor-pointer transition-colors"
            >
              <MapPin size={15} />
            </button>
            <button 
              onClick={handleSearch}
              disabled={isScanning}
              className="btn btn-primary py-2.5 px-4.5 text-xs tracking-wider font-bold hover:scale-105 active:scale-95 transition-all"
            >
              {lang === 'en' ? 'LOCK SITE' : 'KHOÁ VỊ TRÍ'}
            </button>
          </div>
        </div>

        {/* Dropdown Results */}
        {isOpen && (results.length > 0 || isScanning) && (
          <div className="absolute top-full left-0 right-0 mt-2 border border-white/8 bg-[#0c0c14]/92 backdrop-blur-3xl rounded-2xl z-50 overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.65)]">
            {isScanning ? (
              <div className="p-4 text-purple-400/80 text-xs font-mono animate-pulse tracking-widest uppercase flex items-center gap-2">
                <Loader size={12} className="animate-spin" />
                {lang === 'en' ? '[ACQUIRING GEOLOCATION DATA...]' : '[ĐANG CẬP NHẬT TỌA ĐỘ...]'}
              </div>
            ) : (
              <ul className="max-h-60 overflow-y-auto custom-scrollbar">
                {results.map((item) => (
                  <li
                    key={item.place_id}
                    onClick={() => handleSelect(item)}
                    className="p-3.5 text-sm border-b border-white/5 cursor-pointer hover:bg-purple-500/10 transition-all"
                  >
                    <div className="font-semibold text-white/95 truncate">
                      {item.display_name.split(',')[0]}
                    </div>
                    <div className="text-xs text-white/40 truncate mt-0.5">
                      {item.display_name}
                    </div>
                    <div className="text-[10px] text-purple-300/50 mt-1.5 font-mono flex gap-4">
                      <span>LAT: {parseFloat(item.lat).toFixed(4)}</span>
                      <span>LON: {parseFloat(item.lon).toFixed(4)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Helpers info bar */}
      <div className="flex justify-between items-center mt-3 text-[11px] text-white/35 font-mono">
        <div className="flex gap-4">
          <span><span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/8 text-white/60">Enter</span> lock</span>
          <span><span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/8 text-white/60">GPS</span> detection</span>
        </div>
        {gpsError ? (
          <span className="text-red-400 flex items-center gap-1"><AlertCircle size={10} /> {gpsError}</span>
        ) : geocoderSpeed ? (
          <span className="flex items-center gap-1.5 text-purple-400/85">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
            {lang === 'en' ? `Geocoder online · ${geocoderSpeed} ms` : `Địa lý trực tuyến · ${geocoderSpeed} ms`}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-white/25">
            <span className="w-1.5 h-1.5 rounded-full bg-white/20"/>
            {lang === 'en' ? 'Geocoder status nominal' : 'Hệ thống định vị ổn định'}
          </span>
        )}
      </div>
    </div>
  );
}
