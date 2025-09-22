const API_KEY = 'eea67c7fdbf4a33763174e12e6a32d63';

// Search button click
document.getElementById('searchBtn').addEventListener('click', () => {
  const city = document.getElementById('cityInput').value.trim();
  if (!city) {
    showMessage('Please enter a place name to search.');
    return;
  }
  getCoordinates(city);
});

// 1️⃣ Use OpenWeatherMap Geocoding API to get coordinates
function getCoordinates(place) {
  const spinner = document.getElementById('loadingSpinner');
  spinner.style.display = 'block';
  clearWeatherInfo();

  fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(place)}&limit=1&appid=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      spinner.style.display = 'none';
      if (data && data.length > 0) {
        const { lat, lon, name, state, country } = data[0];
        getWeather(lat, lon, `${name}${state ? ', ' + state : ''}, ${country}`);
      } else {
        showMessage('Place not found. Please try another name!');
      }
    })
    .catch(() => {
      spinner.style.display = 'none';
      showMessage('API error. Check internet or API key.');
    });
}

// 2️⃣ Get weather by coordinates
function getWeather(lat, lon, displayName) {
  const spinner = document.getElementById('loadingSpinner');
  spinner.style.display = 'block';
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
    .then(res => res.json())
    .then(data => {
      spinner.style.display = 'none';
      if (data.cod === 200) {
        updateWeatherUI(data, displayName);
      } else {
        showMessage('Weather data not found!');
      }
    })
    .catch(() => {
      spinner.style.display = 'none';
      showMessage('API error. Check internet or API key.');
    });
}

function updateWeatherUI(data, placeName) {
  const temp = Math.round(data.main.temp);
  const condition = data.weather[0].main.toLowerCase();

  document.getElementById('temperature').textContent = temp + '°C';
  document.getElementById('location').textContent = placeName;
  document.getElementById('date').textContent = new Date().toLocaleString();
  document.getElementById('weatherIcon').src = getIconForCondition(condition);
  document.getElementById('weatherIcon').alt = condition;
  document.getElementById('description').textContent = data.weather[0].description;

  document.getElementById('feelsLike').textContent = `Feels like: ${Math.round(data.main.feels_like)}°C`;
  document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
  document.getElementById('wind').textContent = `Wind: ${Math.round(data.wind.speed)} m/s`;
  document.getElementById('visibility').textContent = `Visibility: ${data.visibility / 1000} km`;
  document.getElementById('uv').textContent = `UV Index: -`; // Optional
  document.getElementById('pressure').textContent = `Pressure: ${data.main.pressure} hPa`;

  showMessage(getMessageForCondition(condition, temp));
}

function clearWeatherInfo() {
  document.getElementById('temperature').textContent = '--°C';
  document.getElementById('location').textContent = 'Searching...';
  document.getElementById('date').textContent = '';
  document.getElementById('weatherIcon').src = 'https://cdn-icons-png.flaticon.com/512/482/482292.png';
  document.getElementById('weatherIcon').alt = 'Default weather icon';
  document.getElementById('description').textContent = '';
  document.getElementById('feelsLike').textContent = '';
  document.getElementById('humidity').textContent = '';
  document.getElementById('wind').textContent = '';
  document.getElementById('visibility').textContent = '';
  document.getElementById('uv').textContent = '';
  document.getElementById('pressure').textContent = '';
}

function showMessage(message) {
  document.getElementById('messageBox').textContent = message;
}

// Icon and message helpers
function getIconForCondition(condition) {
  switch (condition) {
    case 'clear': return 'https://cdn-icons-png.flaticon.com/512/4814/4814716.png';
    case 'clouds': return 'https://cdn-icons-png.flaticon.com/512/414/414825.png';
    case 'rain': return 'https://cdn-icons-png.flaticon.com/512/1163/1163624.png';
    case 'drizzle': return 'https://cdn-icons-png.flaticon.com/512/4984/4984363.png';
    case 'thunderstorm': return 'https://cdn-icons-png.flaticon.com/512/1146/1146869.png';
    case 'snow': return 'https://cdn-icons-png.flaticon.com/512/642/642102.png';
    case 'mist': case 'fog': return 'https://cdn-icons-png.flaticon.com/512/4005/4005901.png';
    default: return 'https://cdn-icons-png.flaticon.com/512/4814/4814716.png';
  }
}

function getMessageForCondition(condition, temp) {
  switch (condition) {
    case 'rain': return "It's rainy! Carry umbrella and stay safe.";
    case 'clouds': return "Cloudy day, enjoy calm vibes.";
    case 'clear': return "Sunny! Wear shades and smile.";
    case 'drizzle': return "Light drizzle—maybe a jacket.";
    case 'thunderstorm': return "Thunderstorm ahead! Stay indoors.";
    case 'snow': return "Enjoy snow! Warm clothes advised.";
    case 'mist': case 'fog': return "Drive slow, misty outside!";
    default:
      if (temp >= 35) return "It's hot! Hydrate well.";
      if (temp <= 10) return "It's cold! Keep warm.";
      return "Enjoy the weather!";
  }
}
