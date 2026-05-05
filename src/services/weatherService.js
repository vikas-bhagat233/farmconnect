import axios from 'axios';

// Mock weather data if API key is not available, but structured for real use
export const getWeatherData = async (lat, lon) => {
  try {
    // If you have an OpenWeatherMap API key, use it here:
    // const API_KEY = 'YOUR_API_KEY';
    // const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    // return response.data;

    // Premium Mock Data for demonstration
    return {
      temp: 28,
      condition: 'Sunny',
      humidity: 45,
      windSpeed: 12,
      forecast: [
        { day: 'Mon', temp: 28, icon: '☀️' },
        { day: 'Tue', temp: 30, icon: '☀️' },
        { day: 'Wed', temp: 26, icon: '⛅' },
        { day: 'Thu', temp: 25, icon: '🌧️' },
        { day: 'Fri', temp: 27, icon: '☀️' },
      ]
    };
  } catch (error) {
    console.error('Weather fetch error:', error);
    return null;
  }
};
