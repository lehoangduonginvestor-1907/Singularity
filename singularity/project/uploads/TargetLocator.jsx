import React, { useState, useEffect, useRef } from 'react';
import { Lock } from 'lucide-react';

const TargetLocator = ({ onLocationSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
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
            name: `[RAW COORDS] LAT: ${parsedLat.toFixed(4)}, LON: ${parsedLon.toFixed(4)}` 
          });
        }
        return; // Bypass Geocoding API completely
      }
    }
    
    setIsScanning(true);
    setIsOpen(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Geocoding error:', error);
      setResults([]);
    } finally {
      setIsScanning(false);
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
    <div className="relative font-mono w-full max-w-2xl mx-auto" ref={dropdownRef}>
      {/* Input Group */}
      <div className="flex items-center border border-cyan-500/40 bg-white/5 backdrop-blur-md rounded-lg p-1 transition-all duration-300 hover:border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
        <span className="text-cyan-400 px-3 opacity-80 animate-pulse font-bold">{'>'}</span>
        <input
          type="text"
          className="flex-1 bg-transparent text-cyan-50 placeholder-cyan-200/40 outline-none p-2 focus:ring-0 text-sm tracking-widest"
          placeholder="ENTER LOCATION (e.g. 75.6, 48.0)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="h-6 w-px bg-cyan-500/30 mx-2"></div>
        <button
          onClick={handleSearch}
          disabled={isScanning}
          className={`px-4 py-2 uppercase font-bold tracking-widest transition-colors flex items-center gap-2 rounded-md ${
            isScanning 
              ? 'text-cyan-600 cursor-wait' 
              : 'text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300'
          }`}
        >
          <Lock size={16} />
          {isScanning ? 'SCAN...' : 'LOCK'}
        </button>
      </div>

      {/* Dropdown Results */}
      {isOpen && (results.length > 0 || isScanning) && (
        <div className="absolute top-full left-0 right-0 mt-2 border border-cyan-500/30 bg-[#0a1526]/90 backdrop-blur-xl rounded-lg z-50 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          {isScanning ? (
            <div className="p-4 text-cyan-400/60 text-sm animate-pulse uppercase tracking-widest">
              [ACQUIRING GEOLOCATION DATA...]
            </div>
          ) : (
            <ul className="max-h-60 overflow-y-auto custom-scrollbar">
              {results.map((item) => (
                <li
                  key={item.place_id}
                  onClick={() => handleSelect(item)}
                  className="p-3 text-sm text-cyan-100/80 border-b border-cyan-500/10 cursor-pointer hover:bg-cyan-500/20 hover:text-cyan-300 transition-all"
                >
                  <div className="font-bold tracking-wider truncate uppercase">
                    {item.display_name.split(',')[0]}
                  </div>
                  <div className="text-xs text-cyan-400/50 truncate mt-1">
                    {item.display_name}
                  </div>
                  <div className="text-[10px] text-cyan-500/60 mt-2 font-mono flex gap-4">
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
  );
};

export default TargetLocator;
