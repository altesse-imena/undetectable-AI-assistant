import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Fix for default marker icons in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const ISSTracker = ({ location: userLocation }) => {
  const [issPosition, setIssPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextPass, setNextPass] = useState(null);
  const mapRef = useRef(null);
  
  // Default to New York if location access is denied
  const [currentLocation] = useState(userLocation || { lat: 40.7128, lng: -74.0060 });
  const [locationName, setLocationName] = useState('Your Location');
  
  // Initialize Leaflet icon
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: icon,
      iconRetinaUrl: icon,
      shadowUrl: iconShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }, []);

  // Fetch ISS position
  useEffect(() => {
    const fetchISSPosition = async () => {
      try {
        const response = await axios.get('https://api.wheretheiss.at/v1/satellites/25544');
        const { latitude, longitude } = response.data;
        setIssPosition({ lat: parseFloat(latitude), lng: parseFloat(longitude) });
      } catch (err) {
        console.error('Error fetching ISS position:', err);
        setError('Failed to fetch ISS position. Please try again later.');
      }
    };

    // Initial fetch
    fetchISSPosition();

    // Update position every 5 seconds
    const interval = setInterval(fetchISSPosition, 5000);

    return () => clearInterval(interval);
  }, []);

  // Get location name
  useEffect(() => {
    const getLocationName = async () => {
      if (!currentLocation) return;
      
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLocation.lat}&lon=${currentLocation.lng}&zoom=10&addressdetails=1`
        );
        
        const { address } = response.data;
        const name = [
          address.city,
          address.state,
          address.country
        ].filter(Boolean).join(', ');
        
        setLocationName(name || 'Your Location');
      } catch (err) {
        console.error('Error getting location name:', err);
        setLocationName('Your Location');
      }
    };

    getLocationName();
  }, [currentLocation]);

  // Get next ISS pass
  useEffect(() => {
    if (!currentLocation) return;
    
    const fetchNextPass = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://iss-pass.herokuapp.com/json/?lat=${currentLocation.lat}&lon=${currentLocation.lng}`
        );
        
        if (response.data && response.data.response && response.data.response.length > 0) {
          const nextPassTime = new Date(response.data.response[0].risetime * 1000);
          const duration = response.data.response[0].duration;
          
          setNextPass({
            time: nextPassTime,
            duration: Math.round(duration / 60), // Convert to minutes
          });
        }
      } catch (err) {
        console.error('Error fetching next pass:', err);
        setError('Failed to fetch next ISS pass time.');
      } finally {
        setLoading(false);
      }
    };

    fetchNextPass();
  }, [currentLocation]);

  // Map controller component to update view when ISS position changes
  const MapController = ({ position }) => {
    const map = useMap();
    
    useEffect(() => {
      if (position) {
        map.flyTo([position.lat, position.lng], 3, {
          duration: 2
        });
      }
    }, [map, position]);
    
    return null;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">ISS Tracker</h1>
        <p className="text-gray-300">
          Track the International Space Station in real-time
        </p>
      </div>

      <div className="mb-6">
        <Link to="/" className="btn bg-gray-700 hover:bg-gray-600 text-white inline-block mb-6">
          Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-100 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Current Location</h2>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          ) : (
            <div>
              <p className="text-gray-300">{locationName}</p>
              {currentLocation && (
                <p className="text-sm text-gray-400 mt-1">
                  {currentLocation.lat.toFixed(4)}° N, {currentLocation.lng.toFixed(4)}° E
                </p>
              )}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Next ISS Pass Overhead</h2>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          ) : nextPass ? (
            <div>
              <p className="text-gray-300">{formatDate(nextPass.time)}</p>
              <p className="text-sm text-gray-400 mt-1">
                Visible for ~{nextPass.duration} minutes
              </p>
            </div>
          ) : (
            <p className="text-gray-400">No upcoming passes found</p>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Current ISS Position</h2>
          {issPosition ? (
            <div>
              <p className="text-gray-300">
                {Math.abs(issPosition.lat).toFixed(2)}° {issPosition.lat >= 0 ? 'N' : 'S'}, 
                {Math.abs(issPosition.lng).toFixed(2)}° {issPosition.lng >= 0 ? 'E' : 'W'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          ) : (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            </div>
          )}
        </div>
      </div>

      <div className="card p-0 overflow-hidden" style={{ height: '500px' }}>
        <MapContainer 
          center={[0, 0]} 
          zoom={2} 
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          attributionControl={false}
        >
          <MapController position={issPosition} />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {issPosition && (
            <Marker position={[issPosition.lat, issPosition.lng]}>
              <Popup>
                <div className="text-center">
                  <div className="font-bold mb-1">International Space Station</div>
                  <div className="text-sm">
                    {issPosition.lat > 0 ? '↑ North' : '↓ South'} {Math.abs(issPosition.lat).toFixed(2)}°
                    <br />
                    {issPosition.lng > 0 ? '→ East' : '← West'} {Math.abs(issPosition.lng).toFixed(2)}°
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
          {currentLocation && (
            <Marker 
              position={[currentLocation.lat, currentLocation.lng]}
              icon={L.divIcon({
                html: '📍',
                className: 'text-2xl',
                iconSize: [24, 24],
                iconAnchor: [12, 24]
              })}
            >
              <Popup>{locationName}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      <div className="mt-6 text-sm text-gray-400">
        <p>
          The ISS orbits Earth approximately every 90 minutes at an altitude of about 400 kilometers (250 miles).
          It travels at a speed of roughly 28,000 kilometers per hour (17,500 mph).
        </p>
      </div>
    </div>
  );
};

export default ISSTracker;
