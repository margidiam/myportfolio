# OpenWeatherMap API Setup Guide

## Getting Your API Key

Follow these steps to get a free API key from OpenWeatherMap:

### Step 1: Visit OpenWeatherMap
Go to https://openweathermap.org/api

### Step 2: Create an Account
- Click "Sign Up"
- Fill in your email and create a password
- Verify your email address
- Log in to your account

### Step 3: Get Free API Key
- After logging in, go to your API keys page
- You'll see a default API key
- Copy this key (you'll need it for the dashboard)

### Step 4: Enable APIs (Optional)
The free plan includes:
- Current Weather Data API ✅
- 5 Day Weather Forecast API ✅
- Other APIs may require activation

## Using Your API Key

### In the Weather Dashboard

1. Open `index.html` in your browser
2. A modal will appear asking for your API key
3. Paste your API key into the input field
4. Click "Save API Key"
5. The dashboard will save it locally and you won't need to enter it again

## API Limitations

### Free Tier
- **Requests:** 60 calls/minute, 1,000,000 calls/month
- **Data Points:** Current weather, 5-day forecast
- **Update Frequency:** Every 10 minutes

### Tips for Staying Within Limits
- Don't search too rapidly
- Geolocation is cached
- Favorites are stored locally

## Troubleshooting

### "API key not valid"
- ✓ Check you copied the key correctly
- ✓ Wait 10 minutes after creating a new API key (it takes time to activate)
- ✓ Ensure the key is from your account's API keys page

### "City not found"
- ✓ Try a larger city
- ✓ Use full city name (e.g., "New York" instead of "NY")
- ✓ Try adding country code (e.g., "London,GB")

### Forecast not showing
- ✓ Ensure 5 Day Weather Forecast API is enabled in your account
- ✓ Check your API plan includes forecast data
- ✓ Refresh the browser

### Too many requests error
- ✓ Wait a few minutes before searching again
- ✓ You've exceeded the free tier limits
- ✓ Upgrade to a paid plan if needed

## API Endpoints Used

This dashboard uses two main endpoints:

### Current Weather
```
GET https://api.openweathermap.org/data/2.5/weather
```

**Parameters:**
- `q` - City name
- `appid` - Your API key
- `units` - metric (Celsius) or imperial (Fahrenheit)

**Response includes:**
- Temperature, feels like, humidity
- Wind speed, pressure, visibility
- Weather description

### 5-Day Forecast
```
GET https://api.openweathermap.org/data/2.5/forecast
```

**Parameters:**
- `lat` - Latitude
- `lon` - Longitude
- `appid` - Your API key
- `units` - metric or imperial

**Response includes:**
- 5-day forecast with 3-hour intervals
- Temperature, weather, humidity, wind

## Free API Plan Details

See official docs: https://openweathermap.org/api

### What's Included:
- Current weather for any location
- 5-day weather forecast
- UV index (API v3)
- Geolocation support

### What's NOT Included:
- Historical weather data
- Satellite imagery
- Advanced weather alerts
- Priority support

## Next Steps

1. ✅ Get your API key (5 minutes)
2. ✅ Enter it in the dashboard
3. ✅ Start checking weather!
4. ✅ Add favorite cities
5. ✅ Switch between Celsius/Fahrenheit

## Security Note

Your API key is stored in your browser's local storage. This is safe because:
- Free tier API keys have limited requests
- No sensitive data is exposed
- Clear the browser data to remove the key

For production apps, use a backend server to securely handle API keys.

---

**Happy weather checking! 🌤️**
