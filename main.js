const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherResult = document.getElementById("weatherResult");
const message = document.getElementById("message");

async function getWeather(city) {
    const geoUrl =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const geoResponse = await fetch(geoUrl);

    if (!geoResponse.ok) {
        throw new Error("Unable to find city.");
    }

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
        throw new Error("City not found. Please try again.");
    }

    const location = geoData.results[0];

    const weatherUrl =
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;

    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
        throw new Error("Unable to fetch weather data.");
    }

    const weatherData = await weatherResponse.json();

    return {
        city: location.name,
        country: location.country,
        temperature: weatherData.current.temperature_2m,
        humidity: weatherData.current.relative_humidity_2m,
        windSpeed: weatherData.current.wind_speed_10m
    };
}

async function searchWeather() {
    const city = cityInput.value.trim();

    if (city === "") {
        message.textContent = "Please enter a city name.";
        return;
    }

    message.textContent = "";
    weatherResult.innerHTML = "<h2>Loading weather...</h2>";
    searchBtn.disabled = true;

    try {
        const weather = await getWeather(city);

        weatherResult.innerHTML = `
            <h2>📍 ${weather.city}, ${weather.country}</h2>

            <div class="weather-info">
                <div class="weather-item">
                    <p>🌡️ Temperature</p>
                    <h3>${weather.temperature} °C</h3>
                </div>

                <div class="weather-item">
                    <p>💧 Humidity</p>
                    <h3>${weather.humidity}%</h3>
                </div>

                <div class="weather-item">
                    <p>💨 Wind Speed</p>
                    <h3>${weather.windSpeed} km/h</h3>
                </div>
            </div>
        `;

    } catch (error) {
        weatherResult.innerHTML = "<h2>Weather Unavailable</h2>";
        message.textContent = error.message;
    } finally {
        searchBtn.disabled = false;
    }
}

searchBtn.addEventListener("click", searchWeather);

cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchWeather();
    }
});