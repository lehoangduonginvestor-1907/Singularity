import React, { useState, useEffect, useRef } from 'react';

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
      <div className="flex items-center border border-red-900 bg-[#0a0a0a] p-1 shadow-[0_0_10px_rgba(220,38,38,0.05)]">
        <span className="text-red-600 px-3 opacity-70 animate-pulse">{'>'}</span>
        <input
          type="text"
          className="flex-1 bg-transparent text-red-500 placeholder-red-900/50 outline-none p-2 focus:ring-0"
          placeholder="ENTER NAME OR COORDS (e.g. 75.0, 43.0)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSearch}
          disabled={isScanning}
          className={`px-6 py-2 uppercase font-bold tracking-widest transition-colors ${
            isScanning 
              ? 'text-red-400 bg-red-950/30 border-l border-red-900/50 cursor-wait' 
              : 'text-red-500 hover:bg-red-900/20 hover:text-red-400 border-l border-red-900'
          }`}
        >
          {isScanning ? 'SCANNING...' : 'LOCK'}
        </button>
      </div>

      {/* Dropdown Results */}
      {isOpen && (results.length > 0 || isScanning) && (
        <div className="absolute top-full left-0 right-0 mt-1 border border-red-900 bg-[#0a0a0a] z-50 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
          {isScanning ? (
            <div className="p-4 text-red-500/50 text-sm animate-pulse uppercase tracking-widest">
              [ACQUIRING GEOLOCATION DATA...]
            </div>
          ) : (
            <ul className="max-h-60 overflow-y-auto">
              {results.map((item) => (
                <li
                  key={item.place_id}
                  onClick={() => handleSelect(item)}
                  className="p-3 text-sm text-red-400/80 border-b border-red-900/30 cursor-pointer hover:bg-red-900/20 hover:text-red-400 transition-all"
                >
                  <div className="font-bold tracking-wider truncate uppercase">
                    {item.display_name.split(',')[0]}
                  </div>
                  <div className="text-xs text-red-900/80 truncate mt-1">
                    {item.display_name}
                  </div>
                  <div className="text-[10px] text-red-500/40 mt-2 font-mono flex gap-4">
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
