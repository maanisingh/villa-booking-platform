import axios from 'axios';

// Auto-detect environment and set API URL
const getBaseURL = () => {
  // If running in development (Vite dev server)
  if (import.meta.env.DEV) {
    return 'http://localhost:9000/api';
  }
  // If environment variable is set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Default: use relative path (works when behind reverse proxy)
  return '/api';
};

const API = axios.create({
  baseURL: getBaseURL()
});

export default API;