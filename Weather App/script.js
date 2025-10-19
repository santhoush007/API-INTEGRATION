const API_KEY = 'a895334773a05f51e54c1bf0e4b1c95f';
const els = {
  cityInput: document.getElementById('cityInput'),
  searchBtn: document.getElementById('searchBtn'),
  status: document.getElementById('status'),
  weather: document.getElementById('weather'),
  location: document.getElementById('location'),
  temperature: document.getElementById('temperature'),
  condition: document.getElementById('condition'),
  wind: document.getElementById('wind'),
  humidity: document.getElementById('humidity'),
  forecastCards: document.getElementById('forecastCards'),
};

function setStatus(msg){
  els.status.textContent = msg;
}

function showError(msg){
  setStatus('Error: ' + msg);
  els.weather.classList.add('hidden');
}

async function fetchWeatherData(city) {
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
  const currentRes = await fetch(currentUrl);
  if (!currentRes.ok) throw new Error('City not found');
  const currentData = await currentRes.json();

  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
  const forecastRes = await fetch(forecastUrl);
  if (!forecastRes.ok) throw new Error('Forecast data failed');
  const forecastData = await forecastRes.json();

  return {
    current: currentData,
    forecast: forecastData
  };
}

function kToC(k){return Math.round(k);} 

function clearWeather(){
  els.location.textContent = '';
  els.temperature.textContent = '';
  els.condition.textContent = '';
  els.wind.textContent = '';
  els.humidity.textContent = '';
  els.forecastCards.innerHTML = '';
}

function updateBackground(weatherCode) {
  const body = document.body;
  body.className = ''; // Reset classes

  // Simplified weather conditions
  if (weatherCode === 800) {
    body.classList.add('sunny'); // Clear sky
  } else if (weatherCode >= 200 && weatherCode < 600) {
    body.classList.add('rainy'); // Rain, thunderstorm, and drizzle
  } else if (weatherCode > 800) {
    body.classList.add('rainy'); // Cloudy conditions
  }
}

function renderWeather(weatherData) {
  els.weather.classList.remove('hidden');
  
  const current = weatherData.current;
  els.location.textContent = `${current.name}, ${current.sys.country}`;
  els.temperature.textContent = `${Math.round(current.main.temp)}°C`;
  els.condition.textContent = current.weather[0].description.charAt(0).toUpperCase() + 
                             current.weather[0].description.slice(1);
  els.wind.textContent = `Wind: ${Math.round(current.wind.speed)} m/s`;
  els.humidity.textContent = `Humidity: ${current.main.humidity}%`;

  // Update background based on weather
  updateBackground(current.weather[0].id);

  els.forecastCards.innerHTML = '';
  const forecast = weatherData.forecast.list;
  const dailyForecasts = new Map();
  
  forecast.forEach(item => {
    const date = new Date(item.dt * 1000).toLocaleDateString();
    if (!dailyForecasts.has(date)) {
      dailyForecasts.set(date, {
        maxTemp: item.main.temp_max,
        minTemp: item.main.temp_min,
        description: item.weather[0].description,
        date: item.dt * 1000
      });
    } else {
      const existing = dailyForecasts.get(date);
      existing.maxTemp = Math.max(existing.maxTemp, item.main.temp_max);
      existing.minTemp = Math.min(existing.minTemp, item.main.temp_min);
    }
  });

  [...dailyForecasts.values()].slice(1, 4).forEach(forecast => {
    const card = document.createElement('div');
    card.className = 'card';
    const day = new Date(forecast.date);
    const dayName = day.toLocaleDateString(undefined, {weekday:'short', month:'short', day:'numeric'});
    card.innerHTML = `<div>
        <div class="day">${dayName}</div>
        <div class="small">${Math.round(forecast.minTemp)}°C - ${Math.round(forecast.maxTemp)}°C</div>
      </div>
      <div class="small">${forecast.description}</div>`;
    els.forecastCards.appendChild(card);
  });
}

async function doSearch(){
  const q = els.cityInput.value.trim();
  if(!q) return setStatus('Type a city name and press Search');
  setStatus('Loading weather data...');
  clearWeather();
  try{
    const weatherData = await fetchWeatherData(q);
    setStatus('Weather data loaded');
    renderWeather(weatherData);
  } catch(err){
    showError(err.message || String(err));
  }
}

els.searchBtn.addEventListener('click', doSearch);
els.cityInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') doSearch(); });

// Optional: try a default city on load
window.addEventListener('DOMContentLoaded', ()=>{
  els.cityInput.value = 'New York';
  //doSearch();
});
