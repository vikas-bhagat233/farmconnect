import axios from 'axios';

// Mock weather data if API key is not available, but structured for real use
export const getWeatherData = async (lat, lon) => {
  try {
    const API_KEY = 'bd97dc79c0609c3fe173fc85fc29eaaa';
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    // Map OpenWeatherMap data to your UI structure
    return {
      temp: Math.round(data.main.temp),
      condition: data.weather[0].main,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      // No forecast in current endpoint, so just show today
      forecast: [
        { day: new Date().toLocaleDateString('en-US', { weekday: 'short' }), temp: Math.round(data.main.temp), icon: '☀️' }
      ]
    };
  } catch (error) {
    console.error('Weather fetch error:', error);
    return null;
  }
};
