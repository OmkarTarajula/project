const PRIMARY_API_KEY = '49240382e83b4bdbabc70751252309'; 
const SECONDARY_API_KEY = 'eea67c7fdbf4a33763174e12e6a32d63'; 

let locationsData = { countries: {}, continents: {} };

const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');

searchBtn.disabled = true;
cityInput.disabled = true;


fetch('locations.json')
  .then(res => res.json())
  .then(data => {
    locationsData = data;
    searchBtn.disabled = false;
    cityInput.disabled = false;
    searchBtn.addEventListener('click', () => handleSearch());
    cityInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') handleSearch();
    });
  })
  .catch(() => {
    showMessage('Failed to load locations data.');
  });

function handleSearch() {
  const place = cityInput.value.trim();
  if (!place) {
    showMessage('Please enter a place name to search.');
    return;
  }
  const lowerPlace = place.toLowerCase();

  if (isContinentName(lowerPlace)) {
    const cities = locationsData.continents[lowerPlace];
    getMultipleLocationsWeather(cities, place);
  } else if (isCountryName(lowerPlace)) {
    const capital = getCapital(lowerPlace);
    if (capital) {
      getWeatherDataPrimary(`${capital},${place}`, place);
    } else {
      getWeatherDataPrimary(place, place);
    }
  } else {
    getWeatherDataPrimary(place, place);
  }
}

function isCountryName(name) {
  return locationsData.countries.hasOwnProperty(name);
}

function isContinentName(name) {
  return locationsData.continents.hasOwnProperty(name);
}

function getCapital(country) {
  return locationsData.countries[country] || null;
}

function getMultipleLocationsWeather(locations, locationName) {
  if (!locations || locations.length === 0) {
    showMessage(`No data for continent: ${locationName}`);
    return;
  }
  clearWeatherInfo();
  const spinner = document.getElementById('loadingSpinner');
  spinner.style.display = 'block';

  const fetches = locations.map(loc =>
    fetch(`https://api.worldweatheronline.com/premium/v1/weather.ashx?key=${PRIMARY_API_KEY}&q=${encodeURIComponent(loc)}&format=json`)
      .then(res => res.json())
  );

  Promise.all(fetches)
    .then(results => {
      spinner.style.display = 'none';
      const validResults = results.filter(
        r => r.data && r.data.current_condition && r.data.current_condition.length > 0
      );
      if (validResults.length === 0) {
        showMessage('Weather data not found for selected locations.');
        return;
      }
      const avgTemp = Math.round(
        validResults.reduce((sum, r) => sum + parseInt(r.data.current_condition[0].temp_C), 0) / validResults.length
      );
      const avgHumidity = Math.round(
        validResults.reduce((sum, r) => sum + parseInt(r.data.current_condition[0].humidity), 0) / validResults.length
      );

      document.getElementById('temperature').textContent = `${avgTemp}°C (Avg)`;
      document.getElementById('location').textContent = `${locationName} (Average Climate)`;
      document.getElementById('date').textContent = new Date().toLocaleString();
      document.getElementById('description').textContent = `Humidity: ${avgHumidity}%`;

      setDynamicBackground('clouds', avgTemp);
      showMessage(`Showing average weather of ${locationName}.`);
    })
    .catch(() => {
      spinner.style.display = 'none';
      showMessage('API error. Check internet or API key.');
    });
}


function getWeatherDataPrimary(place, displayName) {
  clearWeatherInfo();
  const spinner = document.getElementById('loadingSpinner');
  spinner.style.display = 'block';

  fetch(`https://api.worldweatheronline.com/premium/v1/weather.ashx?key=${PRIMARY_API_KEY}&q=${encodeURIComponent(place)}&format=json`)
    .then(res => res.json())
    .then(data => {
      spinner.style.display = 'none';
      if (data.data && data.data.current_condition && data.data.current_condition.length > 0) {
        updateWeatherUIWorldWeather(data.data.current_condition[0], displayName);
      } else {
       
        getWeatherDataSecondary(place);
      }
    })
    .catch(() => {
      spinner.style.display = 'none';
      getWeatherDataSecondary(place);
    });
}


function getWeatherDataSecondary(place) {
  const spinner = document.getElementById('loadingSpinner');
  spinner.style.display = 'block';

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(place)}&appid=${SECONDARY_API_KEY}&units=metric`)
    .then(res => res.json())
    .then(data => {
      spinner.style.display = 'none';
      if (data.cod === 200) {
        updateWeatherUIOpenWeatherMap(data, place);
      } else {
        showMessage('Place not found in both APIs.');
      }
    })
    .catch(() => {
      spinner.style.display = 'none';
      showMessage('Both weather API requests failed.');
    });
}

function updateWeatherUIWorldWeather(conditionData, placeName) {
  const temp = Math.round(conditionData.temp_C);
  const humidity = conditionData.humidity;
  const desc = conditionData.weatherDesc[0].value.toLowerCase();

  document.getElementById('temperature').textContent = `${temp}°C`;
  document.getElementById('location').textContent = placeName;
  document.getElementById('date').textContent = new Date().toLocaleString();
  document.getElementById('description').textContent = conditionData.weatherDesc[0].value;

  document.getElementById('feelsLike').textContent = `Feels like: ${Math.round(conditionData.FeelsLikeC)}°C`;
  document.getElementById('humidity').textContent = `Humidity: ${humidity}%`;
  document.getElementById('wind').textContent = `Wind: ${conditionData.windspeedKmph} km/h`;
  document.getElementById('visibility').textContent = `Visibility: ${conditionData.visibility} km`;
  document.getElementById('uv').textContent = `UV Index: ${conditionData.uvIndex}`;
  document.getElementById('pressure').textContent = `Pressure: ${conditionData.pressure} mb`;

  setDynamicBackground(desc, temp);
  showMessage(getMessageForCondition(desc, temp));
}

function updateWeatherUIOpenWeatherMap(data, placeName) {
  const temp = Math.round(data.main.temp);
  const condition = data.weather[0].main.toLowerCase();

  document.getElementById('temperature').textContent = `${temp}°C`;
  document.getElementById('location').textContent = placeName;
  document.getElementById('date').textContent = new Date().toLocaleString();
  document.getElementById('weatherIcon').src = getIconForCondition(condition);
  document.getElementById('weatherIcon').alt = condition;
  document.getElementById('description').textContent = capitalize(data.weather[0].description);

  document.getElementById('feelsLike').textContent = `Feels like: ${Math.round(data.main.feels_like)}°C`;
  document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
  document.getElementById('wind').textContent = `Wind: ${Math.round(data.wind.speed)} m/s`;
  document.getElementById('visibility').textContent = `Visibility: ${(data.visibility / 1000).toFixed(1)} km`;
  document.getElementById('uv').textContent = `UV Index: -`;
  document.getElementById('pressure').textContent = `Pressure: ${data.main.pressure} hPa`;

  setDynamicBackground(condition, temp);
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

function showMessage(msg) {
  document.getElementById('messageBox').textContent = msg;
}

function setDynamicBackground(condition, temp) {
  const bg = document.querySelector('.modern-bg');
  switch (condition) {
    case 'clear':
      bg.style.background = 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)';
      break;
    case 'clouds':
      bg.style.background = 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)';
      break;
    case 'rain':
      bg.style.background = 'linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%)';
      break;
    case 'drizzle':
      bg.style.background = 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)';
      break;
    case 'thunderstorm':
      bg.style.background = 'linear-gradient(135deg, #373B44 0%, #4286f4 100%)';
      break;
    case 'snow':
      bg.style.background = 'linear-gradient(135deg, #e6dada 0%, #274046 100%)';
      break;
    case 'mist':
    case 'fog':
      bg.style.background = 'linear-gradient(135deg, #757F9A 0%, #D7DDE8 100%)';
      break;
    default:
      bg.style.background =
        'linear-gradient(135deg, #43155c 0%, #a367dc 55%, #ff70a6 100%)';
  }
}

function getMessageForCondition(condition, temp) {
  switch (condition) {
    case 'rain':
      return "It's rainy! Carry umbrella and stay safe.";
    case 'clouds':
      return 'Cloudy day, enjoy calm vibes.';
    case 'clear':
      return 'Sunny! Wear shades and smile.';
    case 'drizzle':
      return 'Light drizzle—maybe a jacket.';
    case 'thunderstorm':
      return 'Thunderstorm ahead! Stay indoors.';
    case 'snow':
      return 'Enjoy snow! Warm clothes advised.';
    case 'mist':
    case 'fog':
      return 'Drive slow, misty outside!';
    default:
      if (temp >= 35) return "It's hot! Hydrate well.";
      if (temp <= 10) return "It's cold! Keep warm.";
      return 'Enjoy the weather!';
  }
}

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

function capitalize(text) {
  return text
    .split(' ')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}
