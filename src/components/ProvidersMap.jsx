import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const PRECISION = 6; // 6 decimal places ≈ 11cm accuracy

const ExactMarker = ({ position, children, isActive }) => {
  const map = useMap();
  const markerRef = useRef(null);

  useEffect(() => {
    if (markerRef.current && isActive) {
      map.flyTo(position, 17, { duration: 0.8 });
    }
  }, [isActive, map, position]);

  return (
    <Marker
      position={position}
      ref={markerRef}
      icon={L.divIcon({
        className: 'exact-marker',
        html: `
          <div style="
            position: relative;
            width: ${isActive ? '24px' : '18px'};
            height: ${isActive ? '24px' : '18px'};
            background: ${isActive ? '#22d3ee' : '#3b82f6'};
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            transform: translate(-50%, -50%);
          ">
            <div style="
              position: absolute;
              bottom: -6px;
              left: 50%;
              width: 2px;
              height: 6px;
              background: ${isActive ? '#22d3ee' : '#3b82f6'};
              transform: translateX(-50%);
            "></div>
          </div>
        `,
        iconSize: [isActive ? 24 : 18, isActive ? 30 : 24],
        iconAnchor: [isActive ? 12 : 9, isActive ? 30 : 24]
      })}
    >
      {children}
    </Marker>
  );
};

const ProvidersMap = ({ providers, activeProvider }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const extractCoordinates = useCallback((link) => {
    if (!link) return null;

    // Try multiple coordinate patterns
    const patterns = [
      /@([-+]?\d+\.\d+),([-+]?\d+\.\d+)/,              // Google Maps format
      /[?&]q=([-+]?\d+\.\d+),([-+]?\d+\.\d+)/,         // Google Maps query format
      /!3d([-+]?\d+\.\d+)!4d([-+]?\d+\.\d+)/,          // New Google Maps format
      /lat=([-+]?\d+\.\d+)&lng=([-+]?\d+\.\d+)/,       // Direct parameters
      /latitude=([-+]?\d+\.\d+)&longitude=([-+]?\d+\.\d+)/ // Full words
    ];

    for (const pattern of patterns) {
      const match = link.match(pattern);
      if (match) {
        return {
          lat: parseFloat(match[1]),
          lng: parseFloat(match[2])
        };
      }
    }
    return null;
  }, []);

  useEffect(() => {
    const processLocations = async () => {
      try {
        setLoading(true);
        const validLocations = [];

        for (const provider of providers) {
          try {
            // First check for direct coordinates
            if (provider.lat && provider.lng) {
              validLocations.push({
                ...provider,
                coordinates: {
                  lat: parseFloat(provider.lat),
                  lng: parseFloat(provider.lng)
                }
              });
              continue;
            }

            // Extract from link
            const coords = extractCoordinates(provider.location_link);
            if (!coords) continue;

            validLocations.push({
              ...provider,
              coordinates: coords
            });
          } catch (err) {
            console.error(`Error processing provider ${provider.id}:`, err);
          }
        }

        setLocations(validLocations);
      } catch (err) {
        setError(err.message || "Error processing locations");
      } finally {
        setLoading(false);
      }
    };

    processLocations();
  }, [providers, extractCoordinates]);

  const center = useMemo(() => {
    if (!locations.length) return [30.0444, 31.2357]; // Default Cairo
    
    if (activeProvider) {
      const activeLoc = locations.find(l => l.id === activeProvider);
      if (activeLoc) return activeLoc.coordinates;
    }

    // Calculate bounds
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    locations.forEach(loc => {
      minLat = Math.min(minLat, loc.coordinates.lat);
      maxLat = Math.max(maxLat, loc.coordinates.lat);
      minLng = Math.min(minLng, loc.coordinates.lng);
      maxLng = Math.max(maxLng, loc.coordinates.lng);
    });

    return [
      (minLat + maxLat) / 2,
      (minLng + maxLng) / 2
    ];
  }, [locations, activeProvider]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  if (!locations.length) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        No valid locations found
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={locations.length === 1 ? 16 : 12}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {locations.map(location => (
        <ExactMarker
          key={location.id}
          position={location.coordinates}
          isActive={activeProvider === location.id}
        >
          <Popup>
            <div className="min-w-[200px]">
              <div className="flex items-center gap-3 mb-2">
                {location.avatar && (
                  <img 
                    src={location.avatar} 
                    alt={location.name} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="font-semibold">{location.name}</h3>
                  <p className="text-sm text-gray-600">{location.profession}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div>
                  <span className="font-medium">Exp:</span> {location.years_of_experience} yrs
                </div>
                <div>
                  <span className="font-medium">Rating:</span> {location.rating?.toFixed(1) || 'N/A'}
                </div>
              </div>
              
              <div className="text-xs text-gray-500 mb-2">
                {location.coordinates.lat.toFixed(PRECISION)}, {location.coordinates.lng.toFixed(PRECISION)}
              </div>
              
              {location.location_link && (
                <a
                  href={location.location_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline flex items-center"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-3 w-3 mr-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Open in Maps
                </a>
              )}
            </div>
          </Popup>
        </ExactMarker>
      ))}
    </MapContainer>
  );
};

export default ProvidersMap;