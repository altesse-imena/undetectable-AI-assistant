import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { NASA_API_KEY, API_ENDPOINTS } from '../config';

// Planet data with some basic information
const PLANETS = [
  {
    id: 'mercury',
    name: 'Mercury',
    distance: 77, // in millions of km from Earth (average)
    travelTime: '3-4 months',
    description: 'The smallest planet in our solar system and closest to the Sun.',
    image: 'https://solarsystem.nasa.gov/system/feature_items/images/18_mercury_new.png'
  },
  {
    id: 'venus',
    name: 'Venus',
    distance: 41.4,
    travelTime: '4-6 months',
    description: 'Similar in size to Earth but with a toxic atmosphere of carbon dioxide.',
    image: 'https://solarsystem.nasa.gov/system/feature_items/images/43_venus_jg.png'
  },
  {
    id: 'mars',
    name: 'Mars',
    distance: 225,
    travelTime: '7-9 months',
    description: 'The most explored planet with a thin atmosphere and evidence of water.',
    image: 'https://solarsystem.nasa.gov/system/feature_items/images/20_mars.png'
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    distance: 628,
    travelTime: '2-5 years',
    description: 'The largest planet with a Great Red Spot and 79 known moons.',
    image: 'https://solarsystem.nasa.gov/system/feature_items/images/16_jupiter_new.png'
  },
  {
    id: 'saturn',
    name: 'Saturn',
    distance: 1275,
    travelTime: '7 years',
    description: 'Famous for its beautiful ring system made of ice and rock.',
    image: 'https://solarsystem.nasa.gov/system/feature_items/images/38_saturn_1600x900.jpg'
  },
  {
    id: 'uranus',
    name: 'Uranus',
    distance: 2724,
    travelTime: '9-12 years',
    description: 'An ice giant that rotates on its side with a tilted magnetic field.',
    image: 'https://solarsystem.nasa.gov/system/feature_items/images/88_carousel_uranus.jpg'
  },
  {
    id: 'neptune',
    name: 'Neptune',
    distance: 4347,
    travelTime: '12 years',
    description: 'The windiest planet with the strongest winds in the solar system.',
    image: 'https://solarsystem.nasa.gov/system/feature_items/images/82_carousel_neptune_1.jpg'
  },
  {
    id: 'pluto',
    name: 'Pluto',
    distance: 5800,
    travelTime: '9.5 years',
    description: 'A dwarf planet in the Kuiper belt with a heart-shaped glacier.',
    image: 'https://solarsystem.nasa.gov/system/feature_items/images/92_pluto_1.jpg'
  }
];

const PlanetTrip = () => {
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [launchDate, setLaunchDate] = useState('');
  const [tripDetails, setTripDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apodData, setApodData] = useState(null);

  // Set default selected planet to Mars on component mount
  useEffect(() => {
    const mars = PLANETS.find(planet => planet.id === 'mars');
    if (mars) {
      setSelectedPlanet(mars);
    }
  }, []);

  // Fetch a random space image from APOD
  useEffect(() => {
    const fetchRandomApod = async () => {
      try {
        // Get a random date between 1995-06-16 (APOD start date) and today
        const startDate = new Date('1995-06-16');
        const endDate = new Date();
        const randomDate = new Date(
          startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
        );
        
        const formattedDate = randomDate.toISOString().split('T')[0];
        const response = await axios.get(
          `${API_ENDPOINTS.NASA_APOD}?api_key=${NASA_API_KEY}&date=${formattedDate}`
        );
        
        if (response.data.media_type === 'image') {
          setApodData(response.data);
        }
      } catch (err) {
        console.error('Error fetching APOD:', err);
      }
    };

    fetchRandomApod();
  }, []);

  const handlePlanetSelect = (planet) => {
    setSelectedPlanet(planet);
    setTripDetails(null); // Reset trip details when changing planet
  };

  const handleLaunch = (e) => {
    e.preventDefault();
    
    if (!selectedPlanet || !launchDate) {
      setError('Please select a planet and launch date');
      return;
    }

    setLoading(true);
    setError(null);
    
    // Simulate API call with timeout
    setTimeout(() => {
      try {
        // Calculate arrival date based on travel time
        const travelTimeStr = selectedPlanet.travelTime;
        let months = 0;
        let years = 0;
        
        if (travelTimeStr.includes('month')) {
          const match = travelTimeStr.match(/(\d+)-?(\d+)?/);
          if (match) {
            if (match[2]) {
              // Range like "3-4 months"
              months = (parseInt(match[1]) + parseInt(match[2])) / 2;
            } else {
              // Single value like "6 months"
              months = parseInt(match[1]);
            }
          }
        } else if (travelTimeStr.includes('year')) {
          const match = travelTimeStr.match(/(\d+)-?(\d+)?/);
          if (match) {
            if (match[2]) {
              // Range like "2-5 years"
              years = (parseInt(match[1]) + parseInt(match[2])) / 2;
            } else {
              // Single value like "7 years"
              years = parseInt(match[1]);
            }
          }
        }
        
        const launch = new Date(launchDate);
        const arrival = new Date(launch);
        arrival.setMonth(arrival.getMonth() + months);
        arrival.setFullYear(arrival.getFullYear() + years);
        
        setTripDetails({
          planet: selectedPlanet,
          launchDate: launch,
          arrivalDate: arrival,
          distance: selectedPlanet.distance,
          travelTime: selectedPlanet.travelTime,
          status: 'IN TRANSIT',
          fuelRequired: Math.round(selectedPlanet.distance * 1000), // Just a mock calculation
          supplies: {
            food: Math.round(selectedPlanet.distance * 2) + ' KG',
            water: Math.round(selectedPlanet.distance * 1.5) + ' L',
            oxygen: Math.round(selectedPlanet.distance * 5) + ' KG'
          }
        });
      } catch (err) {
        setError('Error calculating trip details. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="container">
      <section className="section">
        <div className="content-center">
          <h2>PLANET TRIP</h2>
          <p className="mb-8">
            PLAN YOUR VIRTUAL JOURNEY TO OTHER PLANETS IN OUR SOLAR SYSTEM
          </p>
          
          {/* Back to Dashboard button moved to bottom */}
          
          {error && (
            <div style={{ maxWidth: '1200px', margin: '0 auto 20px', border: '1px solid rgba(255, 0, 0, 0.3)', padding: '20px', backgroundColor: 'rgba(0, 0, 0, 0.5)' }} role="alert">
              <strong className="font-bold">ERROR: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="md:col-span-1">
              <div className="card">
                <h3>SELECT DESTINATION</h3>
                <div className="space-y-2" style={{ marginTop: '20px' }}>
                  {PLANETS.map(planet => (
                    <button
                      key={planet.id}
                      style={{
                        width: '100%', 
                        textAlign: 'left', 
                        padding: '12px 15px',
                        marginBottom: '8px',
                        color: '#ffffff',
                        background: selectedPlanet && selectedPlanet.id === planet.id ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.5)',
                        border: selectedPlanet && selectedPlanet.id === planet.id ? '1px solid rgba(255, 255, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => handlePlanetSelect(planet)}
                    >
                      {planet.name.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {selectedPlanet && (
                <div className="card mt-6" style={{ padding: '25px' }}>
                  <h3 style={{ marginBottom: '15px', textAlign: 'left' }}>TRIP DETAILS</h3>
                  <form onSubmit={handleLaunch} style={{ width: '100%' }}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '10px', 
                        textTransform: 'uppercase', 
                        fontSize: '14px', 
                        letterSpacing: '1px' 
                      }}>
                        LAUNCH DATE
                      </label>
                      <input
                        type="date"
                        value={launchDate}
                        onChange={(e) => setLaunchDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        style={{ 
                          width: 'calc(100% - 2px)', /* Account for border */
                          padding: '12px 15px',
                          marginBottom: '20px',
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#ffffff',
                          fontFamily: '"Roboto Condensed", Arial, Verdana, sans-serif',
                          boxSizing: 'border-box' /* Ensure padding is included in width */
                        }}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn"
                      disabled={loading}
                      style={{
                        width: '100%',
                        backgroundColor: '#000000',
                        color: '#ffffff',
                        border: '2px solid #ffffff',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.color = '#000000';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#000000';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                    >
                      {loading ? 'CALCULATING...' : 'LAUNCH MISSION'}
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              {selectedPlanet && (
                <div className="card mb-6">
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="md:w-1/3 mb-4 md:mb-0 md:mr-6">
                      <img 
                        src={selectedPlanet.image} 
                        alt={selectedPlanet.name}
                        style={{ width: '100%', height: 'auto', maxHeight: '300px', objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300?text=Planet+Image';
                        }}
                      />
                    </div>
                    <div className="md:w-2/3">
                      <h3 style={{ textAlign: 'left', marginTop: '0' }}>{selectedPlanet.name.toUpperCase()}</h3>
                      <p style={{ marginBottom: '20px' }}>{selectedPlanet.description}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', opacity: '0.7', marginBottom: '5px' }}>DISTANCE FROM EARTH</p>
                          <p style={{ fontSize: '18px' }}>{selectedPlanet.distance} MILLION KM</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', opacity: '0.7', marginBottom: '5px' }}>ESTIMATED TRAVEL TIME</p>
                          <p style={{ fontSize: '18px' }}>{selectedPlanet.travelTime.toUpperCase()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tripDetails ? (
                <div className="card">
                  <h3>MISSION TO {tripDetails.planet.name.toUpperCase()}</h3>
                  <div style={{ marginTop: '20px' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div style={{ marginBottom: '20px' }}>
                          <p style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', opacity: '0.7', marginBottom: '5px' }}>LAUNCH DATE</p>
                          <p style={{ fontSize: '18px' }}>{tripDetails.launchDate.toLocaleDateString()}</p>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                          <p style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', opacity: '0.7', marginBottom: '5px' }}>ESTIMATED ARRIVAL</p>
                          <p style={{ fontSize: '18px' }}>{tripDetails.arrivalDate.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', opacity: '0.7', marginBottom: '5px' }}>FUEL REQUIRED</p>
                          <p style={{ fontSize: '18px' }}>{tripDetails.fuelRequired.toLocaleString()} UNITS</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 style={{ fontSize: '16px', textTransform: 'uppercase', marginBottom: '15px' }}>MISSION SUPPLIES</h4>
                        <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', padding: '10px 0', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ opacity: '0.7' }}>FOOD SUPPLY:</span>
                          <span>{tripDetails.supplies.food}</span>
                        </div>
                        <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', padding: '10px 0', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ opacity: '0.7' }}>WATER SUPPLY:</span>
                          <span>{tripDetails.supplies.water}</span>
                        </div>
                        <div style={{ padding: '10px 0', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ opacity: '0.7' }}>OXYGEN SUPPLY:</span>
                          <span>{tripDetails.supplies.oxygen}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: '30px' }}>
                      <h4 style={{ fontSize: '16px', textTransform: 'uppercase', marginBottom: '15px' }}>MISSION PROGRESS</h4>
                      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '12px', padding: '5px 10px', textTransform: 'uppercase', letterSpacing: '1px', backgroundColor: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                            {tripDetails.status}
                          </span>
                        </div>
                        <div>
                          <span style={{ fontSize: '12px', opacity: '0.7' }}>
                            0%
                          </span>
                        </div>
                      </div>
                      <div style={{ height: '8px', backgroundColor: 'rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}>
                        <div 
                          style={{ width: '0%', height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.5)', transition: 'all 1s ease-in-out' }}
                        ></div>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: '30px' }}>
                      <h4 style={{ fontSize: '16px', textTransform: 'uppercase', marginBottom: '15px' }}>MISSION BRIEFING</h4>
                      <p style={{ marginBottom: '15px' }}>
                        YOUR MISSION TO {tripDetails.planet.name.toUpperCase()} WILL BE ONE OF THE MOST AMBITIOUS SPACE JOURNEYS EVER ATTEMPTED. 
                        THE {tripDetails.distance} MILLION KILOMETER JOURNEY WILL TAKE APPROXIMATELY {tripDetails.travelTime.toUpperCase()}.
                      </p>
                      <p>
                        DURING YOUR MISSION, YOU'LL CONDUCT EXPERIMENTS, TAKE SAMPLES, AND DOCUMENT YOUR FINDINGS. 
                        GOOD LUCK, ASTRONAUT!
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card h-full flex flex-col items-center justify-center text-center" style={{ padding: '40px 20px' }}>
                  {apodData ? (
                    <>
                      <div style={{ width: '120px', height: '120px', margin: '0 auto 30px', overflow: 'hidden', borderRadius: '50%', border: '2px solid rgba(255, 255, 255, 0.2)' }}>
                        <img 
                          src={apodData.url} 
                          alt={apodData.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/200?text=Space';
                          }}
                        />
                      </div>
                      <h3 style={{ textTransform: 'uppercase', marginBottom: '15px' }}>READY FOR LAUNCH</h3>
                      <p style={{ opacity: '0.7', marginBottom: '30px' }}>
                        SELECT A DESTINATION AND LAUNCH DATE TO BEGIN PLANNING YOUR SPACE MISSION.
                      </p>
                      <div style={{ fontSize: '12px', opacity: '0.5' }}>
                        <p>"{apodData.title.toUpperCase()}"</p>
                        <p>NASA ASTRONOMY PICTURE OF THE DAY</p>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: '120px', height: '120px', margin: '0 auto 30px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '50%' }}></div>
                      <div style={{ height: '20px', width: '200px', margin: '0 auto 15px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
                      <div style={{ height: '15px', width: '250px', margin: '0 auto', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-12" style={{ maxWidth: '1200px', margin: '40px auto 60px' }}>
            <Link 
              to="/" 
              className="btn" 
              style={{
                backgroundColor: '#000000',
                color: '#ffffff',
                border: '2px solid #ffffff',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#000000';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#000000';
                e.currentTarget.style.color = '#ffffff';
              }}
            >
              BACK TO DASHBOARD
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PlanetTrip;
