import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const ProvidersMap = ({ providers }) => {
  const [mapReady, setMapReady] = useState(false);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    L.Marker.prototype.options.icon = DefaultIcon;
    setMapReady(true);
    extractCoordinatesFromProviders();
  }, [providers]);

  const extractCoordinatesFromLink = (link) => {
    try {
      // Case 1: Direct coordinates in URL (e.g., https://maps.google.com/?q=30.0444,31.2357)
      const coordsRegex1 = /[?&]q=([-+]?\d+\.\d+),([-+]?\d+\.\d+)/;
      const match1 = link.match(coordsRegex1);
      if (match1) return { lat: parseFloat(match1[1]), lng: parseFloat(match1[2]) };

      // Case 2: Coordinates in @ format (e.g., https://maps.google.com/@30.0444,31.2357,15z)
      const coordsRegex2 = /@([-+]?\d+\.\d+),([-+]?\d+\.\d+)/;
      const match2 = link.match(coordsRegex2);
      if (match2) return { lat: parseFloat(match2[1]), lng: parseFloat(match2[2]) };

      // Case 3: Google Maps short URL (need to follow redirect)
      if (link.includes('goo.gl/maps') || link.includes('maps.app.goo.gl')) {
        return extractFromShortUrl(link);
      }

      console.warn('Unsupported link format:', link);
      return null;
    } catch (error) {
      console.error('Error parsing link:', link, error);
      return null;
    }
  };

  // For short URLs, we need to follow the redirect to get final URL
  const extractFromShortUrl = async (shortUrl) => {
    try {
      const response = await fetch(shortUrl, { method: 'HEAD', redirect: 'follow' });
      const finalUrl = response.url;
      return extractCoordinatesFromLink(finalUrl);
    } catch (error) {
      console.error('Error resolving short URL:', error);
      return null;
    }
  };

  const extractCoordinatesFromProviders = async () => {
    const extractedLocations = [];
    
    for (const provider of providers) {
      try {
        if (!provider.location_link) continue;
        
        const coordinates = await extractCoordinatesFromLink(provider.location_link);
        if (coordinates) {
          extractedLocations.push({
            ...provider,
            coordinates
          });
        }
      } catch (error) {
        console.error(`Error processing provider ${provider.id}:`, error);
      }
    }

    setLocations(extractedLocations);
  };

  const calculateCenter = () => {
    if (locations.length === 0) return { lat: 30.0444, lng: 31.2357 }; // Cairo default
    
    const avgLat = locations.reduce((sum, loc) => sum + loc.coordinates.lat, 0) / locations.length;
    const avgLng = locations.reduce((sum, loc) => sum + loc.coordinates.lng, 0) / locations.length;
    return { lat: avgLat, lng: avgLng };
  };

  if (!mapReady) return (
    <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
      Initializing map...
    </div>
  );

  if (locations.length === 0) return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-100 rounded-lg p-4">
      <p className="text-center mb-2">No valid locations found</p>
      <p className="text-sm text-gray-500 text-center">
        Couldn't extract coordinates from: 
        {providers[0]?.location_link && (
          <a href={providers[0].location_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 block mt-2 truncate">
            {providers[0].location_link}
          </a>
        )}
      </p>
    </div>
  );

  const center = calculateCenter();

  return (
    <MapContainer 
      center={center} 
      zoom={12} 
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {locations.map((location) => (
        <Marker key={location.id} position={location.coordinates}>
          <Popup>
            <div className="font-semibold"><Link to={`/provider/${location.id}`}>{location.name}</Link></div>
            <div className="text-sm">{location.profession}</div>
            <a 
              href={location.location_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 text-sm hover:underline"
            >
              View on Google Maps
            </a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default ProvidersMap;