import axios from 'axios';

// We created the backend to run on port 3000
const API_BASE_URL = 'https://farmersapp-333z.onrender.com/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;
