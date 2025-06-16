import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { NASA_API_KEY, API_ENDPOINTS } from '../config';

const BirthdateSpace = ({ birthdate: propBirthdate }) => {
  const [birthdate, setBirthdate] = useState(propBirthdate || '');
  const [apodData, setApodData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchApod = async (date) => {
    if (!date) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Format date to YYYY-MM-DD
      const formattedDate = new Date(date).toISOString().split('T')[0];
      const response = await axios.get(
        `${API_ENDPOINTS.NASA_APOD}?api_key=${NASA_API_KEY}&date=${formattedDate}`
      );
      
      setApodData(response.data);
    } catch (err) {
      console.error('Error fetching APOD:', err);
      setError('Failed to fetch data. The date might be in the future or invalid.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (birthdate) {
      fetchApod(birthdate);
    }
  }, [birthdate]);

  const handleDateChange = (e) => {
    setBirthdate(e.target.value);
  };

  return (
    <div className="container">
      <section className="section">
        <div className="content-center">
          <h2>YOUR BIRTHDAY IN SPACE</h2>
          <p className="mb-8">
            See what the universe looked like on your special day
          </p>
        
          <div className="flex flex-col sm:flex-row gap-4 mb-6" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <input
              type="date"
              value={birthdate}
              onChange={handleDateChange}
              max={new Date().toISOString().split('T')[0]}
              style={{ 
                maxWidth: '300px',
                padding: '12px 15px',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontFamily: '"Roboto Condensed", Arial, Verdana, sans-serif',
                boxSizing: 'border-box'
              }}
            />
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

        {loading && (
          <div className="text-center py-12" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
            <p className="mt-4">LOADING COSMIC DATA...</p>
          </div>
        )}

        {error && (
          <div style={{ maxWidth: '800px', margin: '0 auto', border: '1px solid rgba(255, 0, 0, 0.3)', padding: '20px', backgroundColor: 'rgba(0, 0, 0, 0.5)' }} role="alert">
            <strong className="font-bold">ERROR: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {apodData && !loading && !error && (
          <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '25px' }}>
            <h3 style={{ marginBottom: '15px', textAlign: 'left' }}>{apodData.title}</h3>
            
            {apodData.media_type === 'image' ? (
              <img 
                src={apodData.url} 
                alt={apodData.title} 
                className="w-full h-auto mb-6"
                style={{ maxHeight: '600px', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/800x450?text=Image+Not+Available';
                }}
              />
            ) : (
              <div className="mb-6">
                <iframe
                  src={apodData.url}
                  title={apodData.title}
                  className="w-full"
                  style={{ height: '500px' }}
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
            )}
            
            <div className="space-y-4">
              <p style={{ opacity: '0.7', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                DATE: {new Date(apodData.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              
              <p style={{ lineHeight: '1.8' }}>{apodData.explanation}</p>
              
              {apodData.copyright && (
                <p style={{ opacity: '0.7', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  © {apodData.copyright}
                </p>
              )}
            </div>
          </div>
        )}
        </div>
      </section>
    </div>
  );
};

export default BirthdateSpace;
