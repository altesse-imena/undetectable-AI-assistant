import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config';

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
        const response = await axios.get(API_ENDPOINTS.ISS_POSITION);
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
          `${API_ENDPOINTS.REVERSE_GEOCODE}?format=json&lat=${currentLocation.lat}&lon=${currentLocation.lng}&zoom=10&addressdetails=1`
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
          `${API_ENDPOINTS.ISS_PASS}?lat=${currentLocation.lat}&lon=${currentLocation.lng}`
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
    <div className="container">
      <section className="section">
        <div className="content-center">
          <h2>ISS TRACKER</h2>
          <p className="mb-8">
            TRACK THE INTERNATIONAL SPACE STATION AS IT ORBITS EARTH
          </p>
          
          <div className="mb-6" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Link to="/" className="btn">
              BACK TO DASHBOARD
            </Link>
          </div>
          
          {error && (
            <div style={{ maxWidth: '1200px', margin: '0 auto 20px', border: '1px solid rgba(255, 0, 0, 0.3)', padding: '20px', backgroundColor: 'rgba(0, 0, 0, 0.5)' }} role="alert">
              <strong className="font-bold">ERROR: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="card">
            <h3>CURRENT LOCATION</h3>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-700 w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 w-1/2"></div>
              </div>
            ) : (
              <div>
                <p>{locationName}</p>
                {currentLocation && (
                  <p style={{ opacity: '0.7', fontSize: '14px', marginTop: '10px' }}>
                    {currentLocation.lat.toFixed(4)}° N, {currentLocation.lng.toFixed(4)}° E
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="card">
            <h3>NEXT ISS PASS</h3>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-700 w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 w-1/2"></div>
              </div>
            ) : nextPass ? (
              <div>
                <p>{formatDate(nextPass.time)}</p>
                <p style={{ opacity: '0.7', fontSize: '14px', marginTop: '10px' }}>
                  VISIBLE FOR ~{nextPass.duration} MINUTES
                </p>
              </div>
            ) : (
              <p style={{ opacity: '0.7' }}>NO UPCOMING PASSES FOUND</p>
            )}
          </div>

          <div className="card">
            <h3>CURRENT ISS POSITION</h3>
            {issPosition ? (
              <div>
                <p>
                  {Math.abs(issPosition.lat).toFixed(2)}° {issPosition.lat >= 0 ? 'N' : 'S'}, 
                  {Math.abs(issPosition.lng).toFixed(2)}° {issPosition.lng >= 0 ? 'E' : 'W'}
                </p>
                <p style={{ opacity: '0.7', fontSize: '14px', marginTop: '10px' }}>
                  UPDATED: {new Date().toLocaleTimeString()}
                </p>
              </div>
            ) : (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-700 w-3/4"></div>
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ height: '600px', padding: '0', overflow: 'hidden', maxWidth: '1200px', margin: '0 auto' }}>
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

        <div style={{ maxWidth: '1200px', margin: '30px auto', textAlign: 'center' }}>
          <p style={{ opacity: '0.7', fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}>
            THE ISS ORBITS EARTH APPROXIMATELY EVERY 90 MINUTES AT AN ALTITUDE OF ABOUT 400 KILOMETERS (250 MILES).
            IT TRAVELS AT A SPEED OF ROUGHLY 28,000 KILOMETERS PER HOUR (17,500 MPH).
          </p>
        </div>
      </section>
    </div>
  );
};

export default ISSTracker;
