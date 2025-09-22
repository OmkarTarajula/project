const API_KEY = 'eea67c7fdbf4a33763174e12e6a32d63';

document.getElementById('searchBtn').addEventListener('click', () => {
  const city = document.getElementById('cityInput').value.trim();
  if (!city) {
    showMessage('Please enter a city name to search.');
    return;
  }
  getWeather(city);
});

function getWeather(city) {
  const spinner = document.getElementById('loadingSpinner');
  spinner.style.display = 'block';
  clearWeatherInfo();

  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
  )
    .then((response) => response.json())
    .then((data) => {
      spinner.style.display = 'none';
      if (data.cod === 200) {
        updateWeatherUI(data);
      } else {
        showMessage('City not found. Please try another name!');
      }
    })
    .catch(() => {
      spinner.style.display = 'none';
      showMessage('API error. Please check your internet or API key.');
    });
}

function updateWeatherUI(data) {
  const temp = Math.round(data.main.temp);
  const condition = data.weather[0].main.toLowerCase();

  document.getElementById('temperature').textContent = temp + '°C';
  document.getElementById('location').textContent = data.name;
  document.getElementById('date').textContent = new Date().toLocaleString();
  document.getElementById('weatherIcon').src = getIconForCondition(condition);
  document.getElementById('weatherIcon').alt = condition;
  document.getElementById('description').textContent = data.weather[0].description;

  document.getElementById('feelsLike').textContent = `Feels like: ${Math.round(data.main.feels_like)}°C`;
  document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
  document.getElementById('wind').textContent = `Wind: ${Math.round(data.wind.speed)} m/s`;
  document.getElementById('visibility').textContent = `Visibility: ${data.visibility / 1000} km`;
  document.getElementById('uv').textContent = `UV Index: -`; // Optional extension
  document.getElementById('pressure').textContent = `Pressure: ${data.main.pressure} hPa`;

  showMessage(getMessageForCondition(condition, temp));
}

function clearWeatherInfo() {
  document.getElementById('temperature').textContent = '--°C';
  document.getElementById('location').textContent = 'Searching...';
  document.getElementById('date').textContent = '';
  document.getElementById('weatherIcon').src = 'https://cdn-icons-png.flaticon.com/512/482/482292.png'; // Default icon
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

// Icon and message functions same as before
function getIconForCondition(condition) {
  switch (condition) {
    case 'clear':
      return 'https://cdn-icons-png.flaticon.com/512/4814/4814716.png';
    case 'clouds':
      return 'https://cdn-icons-png.flaticon.com/512/414/414825.png';
    case 'rain':
      return 'https://cdn-icons-png.flaticon.com/512/1163/1163624.png';
    case 'drizzle':
      return 'https://cdn-icons-png.flaticon.com/512/4984/4984363.png';
    case 'thunderstorm':
      return 'https://cdn-icons-png.flaticon.com/512/1146/1146869.png';
    case 'snow':
      return 'https://cdn-icons-png.flaticon.com/512/642/642102.png';
    case 'mist':
    case 'fog':
      return 'https://cdn-icons-png.flaticon.com/512/4005/4005901.png';
    default:
      return 'https://cdn-icons-png.flaticon.com/512/4814/4814716.png';
  }
}

function getMessageForCondition(condition, temp) {
  switch (condition) {
    case 'rain':
      return "Hey dear, it's rainy! Carry your umbrella and be safe.";
    case 'clouds':
      return "Hello! It's a cloudy day, enjoy the calm vibes.";
    case 'clear':
      return "Hi! It's sunny! Wear your shades and smile.";
    case 'drizzle':
      return "It's a light drizzle—maybe bring a jacket, stay cozy.";
    case 'thunderstorm':
      return "Caution! Thunderstorm ahead, please stay indoors.";
    case 'snow':
      return "Enjoy the snow! Warm clothes and hot chocolate recommended.";
    case 'mist':
    case 'fog':
      return "Drive slow, it's misty outside! Take care.";
    default:
      if (temp >= 35) return 'Whew, it\'s hot! Hydrate and rest well.';
      if (temp <= 10) return 'Brr! It\'s chilly. Keep warm!';
      return 'Enjoy the weather!';
  }
}
