import { Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BirthdateSpace from './components/BirthdateSpace';
import ISSTracker from './components/ISSTracker';
import PlanetTrip from './components/PlanetTrip';
import Dashboard from './components/Dashboard';

function App() {
  const [userData, setUserData] = useState({
    birthdate: '',
    location: null,
  });

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserData(prev => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const handleBirthdateChange = (date) => {
    setUserData(prev => ({
      ...prev,
      birthdate: date
    }));
  };

  return (
      <div className="min-h-screen flex flex-col">
        <header className="bg-space-blue bg-opacity-80 backdrop-blur-md fixed w-full z-10">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="text-xl font-bold text-white">AstroTrip</Link>
              </div>
              <div className="flex space-x-4 items-center">
                <Link to="/birthday" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Birthday in Space</Link>
                <Link to="/iss-tracker" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">ISS Tracker</Link>
                <Link to="/planet-trip" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Planet Trip</Link>
              </div>
            </div>
          </nav>
        </header>

        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<Dashboard userData={userData} onBirthdateChange={handleBirthdateChange} />} />
            <Route path="/birthday" element={<BirthdateSpace birthdate={userData.birthdate} />} />
            <Route path="/iss-tracker" element={<ISSTracker location={userData.location} />} />
            <Route path="/planet-trip" element={<PlanetTrip />} />
          </Routes>
        </main>

        <footer className="bg-space-blue bg-opacity-50 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400 text-sm">
            <p>Powered by NASA APIs | Made with ❤️ for space enthusiasts</p>
          </div>
        </footer>
      </div>
  );
}

export default App;
