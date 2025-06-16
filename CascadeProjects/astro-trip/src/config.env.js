// NASA API configuration using environment variables
const NASA_API_KEY = process.env.REACT_APP_NASA_API_KEY;

// API endpoints
const API_ENDPOINTS = {
  NASA_APOD: 'https://api.nasa.gov/planetary/apod',
  ISS_POSITION: 'https://api.wheretheiss.at/v1/satellites/25544',
  ISS_PASS: 'https://iss-pass.herokuapp.com/json/',
  REVERSE_GEOCODE: 'https://nominatim.openstreetmap.org/reverse'
};

export { NASA_API_KEY, API_ENDPOINTS };
