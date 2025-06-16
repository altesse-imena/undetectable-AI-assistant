import { useState } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = ({ userData, onBirthdateChange }) => {
  const [birthdate, setBirthdate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onBirthdateChange(birthdate);
  };

  return (
    <div className="container">
      {/* Hero Section */}
      <section className="section-fullwidth fade-in" style={{ 
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        height: '70vh'
      }}>
        <div className="container">
          <h1 style={{ marginBottom: '20px' }}>ASTROTRIP</h1>
          <p className="text-xl">YOUR PERSONAL SPACE EXPLORATION COMPANION</p>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="section">
        <div className="content-center">
          <h2 className="h2-left">EXPLORE SPACE</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="card" style={{ padding: '25px' }}>
              <h3 style={{ marginBottom: '15px', textAlign: 'left' }}>BIRTHDAY IN SPACE</h3>
              <p>Discover what the universe looked like on your special day.</p>
              <form onSubmit={handleSubmit} className="mb-4" style={{ marginTop: '20px' }}>
                <input
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  style={{ 
                    width: '100%',
                    padding: '12px 15px',
                    marginBottom: '15px',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    fontFamily: '"Roboto Condensed", Arial, Verdana, sans-serif',
                    boxSizing: 'border-box'
                  }}
                  required
                />
                <button 
                  type="submit" 
                  className="btn"
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
                  EXPLORE
                </button>
              </form>
              {userData.birthdate && (
                <Link to="/birthday" className="text-sm">
                  VIEW YOUR BIRTHDAY IN SPACE →
                </Link>
              )}
            </div>

            <div className="card" style={{ padding: '25px' }}>
              <h3 style={{ marginBottom: '15px', textAlign: 'left' }}>ISS TRACKER</h3>
              <p>Track the International Space Station in real-time as it orbits Earth.</p>
              <div style={{ marginTop: '20px' }}>
                <Link 
                  to="/iss-tracker" 
                  className="btn"
                  style={{
                    width: 'auto',
                    maxWidth: '100%',
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
                  TRACK ISS
                </Link>
              </div>
            </div>

            <div className="card" style={{ padding: '25px' }}>
              <h3 style={{ marginBottom: '15px', textAlign: 'left' }}>PLANET TRIP</h3>
              <p>Plan your virtual journey to other planets in our solar system.</p>
              <div style={{ marginTop: '20px' }}>
                <Link 
                  to="/planet-trip" 
                  className="btn"
                  style={{
                    width: 'auto',
                    maxWidth: '100%',
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
                  START JOURNEY
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section">
        <div className="content-center">
          <h2>ABOUT ASTROTRIP</h2>
          <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '25px' }}>
            <p>
              AstroTrip brings the wonders of space closer to you. Using NASA's open APIs, we provide real-time space data,
              beautiful astronomical images, and interactive experiences to satisfy your curiosity about the cosmos.
            </p>
            <p className="text-sm" style={{ marginTop: '20px', opacity: '0.6' }}>
              All data is provided by NASA's open APIs. This is a non-commercial project for educational purposes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
