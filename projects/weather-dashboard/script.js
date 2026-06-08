// ==================== Weather Dashboard JavaScript ====================

// API Configuration
const API_KEY_STORAGE = 'weather_api_key';
const FAVORITES_STORAGE = 'weather_favorites';
const UNITS_STORAGE = 'weather_units';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const currentLocationBtn = document.getElementById('currentLocationBtn');
const favoritesList = document.getElementById('favoritesList');
const unitSelect = document.getElementById('unitSelect');
const apiKeyModal = document.getElementById('apiKeyModal');
const apiKeyInput = document.getElementById('apiKeyInput');
const apiKeySubmit = document.getElementById('apiKeySubmit');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorToast = document.getElementById('errorToast');
const favoriteBtn = document.getElementById('favoriteBtn');

// State
let currentCity = null;
let currentWeatherData = null;
let currentForecastData = null;
let apiKey = localStorage.getItem(API_KEY_STORAGE);
let favorites = JSON.parse(localStorage.getItem(FAVORITES_STORAGE)) || [];
let units = localStorage.getItem(UNITS_STORAGE) || 'metric';

// ==================== Initialization ====================
function init() {
    if (!apiKey) {
        showApiKeyModal();
    } else {
        hideApiKeyModal();
        loadUserPreferences();
        requestGeolocation();
    }
    
    setupEventListeners();
    renderFavorites();
}

function setupEventListeners() {
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    currentLocationBtn.addEventListener('click', requestGeolocation);
    unitSelect.addEventListener('change', handleUnitChange);
    apiKeySubmit.addEventListener('click', handleApiKeySubmit);
}

// ==================== API Key Management ====================
function showApiKeyModal() {
    apiKeyModal.classList.remove('hidden');
}

function hideApiKeyModal() {
    apiKeyModal.classList.add('hidden');
}

function handleApiKeySubmit() {
    const key = apiKeyInput.value.trim();
    if (!key) {
        showError('Please enter a valid API key');
        return;
    }
    
    apiKey = key;
    localStorage.setItem(API_KEY_STORAGE, apiKey);
    hideApiKeyModal();
    requestGeolocation();
}

// ==================== User Preferences ====================
function loadUserPreferences() {
    unitSelect.value = units;
}

function handleUnitChange(e) {
    units = e.target.value;
    localStorage.setItem(UNITS_STORAGE, units);
    
    if (currentCity) {
        fetchWeather(currentCity);
    }
}

// ==================== Geolocation ====================
function requestGeolocation() {
    if (!navigator.geolocation) {
        showError('Geolocation not supported');
        return;
    }
    
    showLoading();
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeatherByCoordinates(latitude, longitude);
        },
        (error) => {
            hideLoading();
            showError('Unable to get location: ' + error.message);
        }
    );
}

// ==================== Search ====================
function handleSearch() {
    const city = searchInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    
    fetchWeather(city);
    searchInput.value = '';
}

// ==================== Weather API Calls ====================
async function fetchWeather(city) {
    showLoading();
    try {
        const response = await fetch(
            `${BASE_URL}/weather?q=${city}&appid=${apiKey}&units=${units}`
        );
        
        if (!response.ok) {
            throw new Error('City not found');
        }
        
        const data = await response.json();
        currentCity = data.name + ', ' + data.sys.country;
        currentWeatherData = data;
        
        await fetchForecast(data.coord.lat, data.coord.lon);
        displayCurrentWeather(data);
        
        hideLoading();
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

async function fetchWeatherByCoordinates(lat, lon) {
    showLoading();
    try {
        const response = await fetch(
            `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`
        );
        
        if (!response.ok) {
            throw new Error('Unable to fetch weather');
        }
        
        const data = await response.json();
        currentCity = data.name + ', ' + data.sys.country;
        currentWeatherData = data;
        
        await fetchForecast(data.coord.lat, data.coord.lon);
        displayCurrentWeather(data);
        
        hideLoading();
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

async function fetchForecast(lat, lon) {
    try {
        const response = await fetch(
            `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`
        );
        
        if (!response.ok) {
            throw new Error('Unable to fetch forecast');
        }
        
        const data = await response.json();
        currentForecastData = data;
        displayForecast(data);
        displayHourlyForecast(data);
    } catch (error) {
        showError(error.message);
    }
}

// ==================== Display Current Weather ====================
function displayCurrentWeather(data) {
    const unitSymbol = units === 'metric' ? '°C' : '°F';
    const windUnit = units === 'metric' ? 'm/s' : 'mph';
    
    // Update location info
    document.getElementById('cityName').textContent = data.name;
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
    
    // Update weather icon
    const iconElement = document.getElementById('weatherIcon');
    const weatherType = data.weather[0].main.toLowerCase();
    updateWeatherIcon(iconElement, weatherType);
    
    // Update temperature
    document.getElementById('temp').textContent = Math.round(data.main.temp);
    document.getElementById('description').textContent = data.weather[0].description;
    document.getElementById('feelsLike').textContent = `Feels like ${Math.round(data.main.feels_like)}${unitSymbol}`;
    
    // Update details
    document.getElementById('humidity').textContent = data.main.humidity + '%';
    document.getElementById('windSpeed').textContent = data.wind.speed + ' ' + windUnit;
    document.getElementById('pressure').textContent = data.main.pressure + ' hPa';
    document.getElementById('visibility').textContent = (data.visibility / 1000).toFixed(1) + ' km';
    document.getElementById('uvIndex').textContent = 'N/A';
    
    // Update background based on weather
    const currentWeatherSection = document.querySelector('.current-weather');
    currentWeatherSection.className = 'current-weather ' + getWeatherClass(weatherType);
    
    // Update favorite button
    updateFavoriteButton();
}

function getWeatherClass(weatherType) {
    if (weatherType.includes('clear') || weatherType.includes('sunny')) {
        return 'clear';
    } else if (weatherType.includes('cloud')) {
        return 'cloudy';
    } else if (weatherType.includes('rain') || weatherType.includes('drizzle')) {
        return 'rainy';
    } else if (weatherType.includes('snow')) {
        return 'snowy';
    } else if (weatherType.includes('thunder')) {
        return 'thunderstorm';
    }
    return 'cloudy';
}

function updateWeatherIcon(element, weatherType) {
    let iconClass = 'fas fa-cloud';
    
    if (weatherType.includes('clear') || weatherType.includes('sunny')) {
        iconClass = 'fas fa-sun';
    } else if (weatherType.includes('cloud')) {
        iconClass = 'fas fa-cloud';
    } else if (weatherType.includes('rain') || weatherType.includes('drizzle')) {
        iconClass = 'fas fa-cloud-rain';
    } else if (weatherType.includes('snow')) {
        iconClass = 'fas fa-snowflake';
    } else if (weatherType.includes('thunder')) {
        iconClass = 'fas fa-bolt';
    } else if (weatherType.includes('wind')) {
        iconClass = 'fas fa-wind';
    } else if (weatherType.includes('fog') || weatherType.includes('mist')) {
        iconClass = 'fas fa-smog';
    }
    
    element.className = iconClass;
}

// ==================== Display Forecast ====================
function displayForecast(data) {
    const forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = '';
    
    const dailyForecasts = {};
    
    data.list.forEach((item) => {
        const date = new Date(item.dt * 1000).toLocaleDateString('en-US');
        
        if (!dailyForecasts[date]) {
            dailyForecasts[date] = item;
        }
    });
    
    Object.values(dailyForecasts).slice(0, 5).forEach((item) => {
        const card = createForecastCard(item);
        forecastContainer.appendChild(card);
    });
}

function createForecastCard(item) {
    const card = document.createElement('div');
    card.className = 'forecast-card';
    
    const date = new Date(item.dt * 1000);
    const unitSymbol = units === 'metric' ? '°C' : '°F';
    
    const weatherType = item.weather[0].main.toLowerCase();
    const iconClass = getWeatherIconClass(weatherType);
    
    card.innerHTML = `
        <h4>${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</h4>
        <i class="fas ${iconClass} icon"></i>
        <p>${item.weather[0].main}</p>
        <p class="temp-range">${Math.round(item.main.temp_max)}${unitSymbol} / ${Math.round(item.main.temp_min)}${unitSymbol}</p>
        <p>💧 ${item.main.humidity}%</p>
    `;
    
    return card;
}

// ==================== Display Hourly Forecast ====================
function displayHourlyForecast(data) {
    const hourlyContainer = document.getElementById('hourlyContainer');
    hourlyContainer.innerHTML = '';
    
    data.list.slice(0, 8).forEach((item) => {
        const card = createHourlyCard(item);
        hourlyContainer.appendChild(card);
    });
}

function createHourlyCard(item) {
    const card = document.createElement('div');
    card.className = 'hourly-card';
    
    const time = new Date(item.dt * 1000);
    const unitSymbol = units === 'metric' ? '°C' : '°F';
    const weatherType = item.weather[0].main.toLowerCase();
    const iconClass = getWeatherIconClass(weatherType);
    
    card.innerHTML = `
        <h4>${time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</h4>
        <i class="fas ${iconClass} icon"></i>
        <p>${Math.round(item.main.temp)}${unitSymbol}</p>
        <p class="temp-range">${item.weather[0].main}</p>
        <p>💧 ${item.main.humidity}%</p>
    `;
    
    return card;
}

function getWeatherIconClass(weatherType) {
    if (weatherType.includes('clear') || weatherType.includes('sunny')) {
        return 'fa-sun';
    } else if (weatherType.includes('cloud')) {
        return 'fa-cloud';
    } else if (weatherType.includes('rain') || weatherType.includes('drizzle')) {
        return 'fa-cloud-rain';
    } else if (weatherType.includes('snow')) {
        return 'fa-snowflake';
    } else if (weatherType.includes('thunder')) {
        return 'fa-bolt';
    }
    return 'fa-cloud';
}

// ==================== Favorites Management ====================
function renderFavorites() {
    const favoritesList = document.getElementById('favoritesList');
    
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p class="empty-message">No favorites yet</p>';
        return;
    }
    
    favoritesList.innerHTML = '';
    favorites.forEach((city) => {
        const item = document.createElement('div');
        item.className = 'favorite-item';
        if (city === currentCity) {
            item.classList.add('active');
        }
        
        item.innerHTML = `
            <span>${city}</span>
            <button class="remove-favorite" data-city="${city}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        item.addEventListener('click', () => fetchWeather(city.split(',')[0]));
        item.querySelector('.remove-favorite').addEventListener('click', (e) => {
            e.stopPropagation();
            removeFavorite(city);
        });
        
        favoritesList.appendChild(item);
    });
}

function updateFavoriteButton() {
    const isFavorited = favorites.includes(currentCity);
    favoriteBtn.classList.toggle('favorited', isFavorited);
    favoriteBtn.innerHTML = isFavorited
        ? '<i class="fas fa-heart"></i> Remove from Favorites'
        : '<i class="far fa-heart"></i> Add to Favorites';
    
    favoriteBtn.onclick = () => {
        if (isFavorited) {
            removeFavorite(currentCity);
        } else {
            addFavorite(currentCity);
        }
    };
}

function addFavorite(city) {
    if (!favorites.includes(city)) {
        favorites.push(city);
        localStorage.setItem(FAVORITES_STORAGE, JSON.stringify(favorites));
        renderFavorites();
        updateFavoriteButton();
    }
}

function removeFavorite(city) {
    favorites = favorites.filter((c) => c !== city);
    localStorage.setItem(FAVORITES_STORAGE, JSON.stringify(favorites));
    renderFavorites();
    if (currentCity === city) {
        updateFavoriteButton();
    }
}

// ==================== UI Helpers ====================
function showLoading() {
    loadingSpinner.classList.remove('hidden');
}

function hideLoading() {
    loadingSpinner.classList.add('hidden');
}

function showError(message) {
    errorToast.textContent = message;
    errorToast.classList.remove('hidden');
    
    setTimeout(() => {
        errorToast.classList.add('hidden');
    }, 5000);
}

// ==================== Initialize App ====================
document.addEventListener('DOMContentLoaded', init);
