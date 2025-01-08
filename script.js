const WEATHER_API_KEY = '50862f77476612b51d5a7c51ed5832a8';
const GEO_API_KEY = '2d3e26179e194b9ca20cdb8c34c0039c';
const errorMsg = document.getElementById('errorMsg');
const weatherInfo = document.getElementById('weatherInfo');


const searchBtn = document.getElementById('searchBtn');
const getLocationBtn = document.getElementById('getLocationBtn');
const cityInput = document.getElementById('cityInput');


// Event listeners for city search and location fetch
searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) {
        fetchWeatherByCity(city);
    } else {
        showError("Please enter a city name.");
    }
});


getLocationBtn.addEventListener('click', getLocation);


// Function to get weather based on city name
async function fetchWeatherByCity(city) {
    try {
        errorMsg.classList.add('hidden');
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`);
        const weatherData = await weatherResponse.json();

        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${WEATHER_API_KEY}&units=metric`);
        const forecastData = await forecastResponse.json();

        displayWeather(weatherData);
        displayForecast(forecastData.list.slice(0, 8));
    } catch (error) {
        showError("Unable to fetch weather data. Please try again later.");
        console.log(error);
    }
}



// async function getLocation() {
//     try {
//         const response = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${GEO_API_KEY}`);
//         const data = await response.json();
//         fetchWeatherByCoords(data.latitude, data.longitude);
//     } catch (error) {
//         showError("Unable to detect location. Please try again later.");
//     }
// }


function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoords(latitude, longitude); // Pass coordinates to fetch weather data
            },
            error => {
                let errorMessage = "Unable to retrieve your location.";
                if (error.code === error.PERMISSION_DENIED) {
                    errorMessage = "Permission denied. Please allow location access.";
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    errorMessage = "Position unavailable. Please check your device settings.";
                } else if (error.code === error.TIMEOUT) {
                    errorMessage = "Request timed out. Please try again.";
                }
                showError(errorMessage);
            }
        );
    } else {
        showError("Geolocation is not supported by your browser.");
    }
}

async function fetchWeatherByCoords(lat, lon) {
    try {
        errorMsg.classList.add('hidden');
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`);
        const weatherData = await weatherResponse.json();

        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`);
        const forecastData = await forecastResponse.json();

        displayWeather(weatherData);
        displayForecast(forecastData.list.slice(0, 8));


    } catch (error) {
        showError("Unable to fetch weather data. Please try again later.");
    }
}





function displayWeather(data) {
    document.getElementById('cityName').textContent = data.name;
    document.getElementById('weatherIcon').src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('weatherDescription').textContent = data.weather[0].description;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('wind').textContent = `${data.wind.speed} m/s`;
    document.getElementById('sunrise').textContent = formatTime(data.sys.sunrise);
    document.getElementById('sunset').textContent = formatTime(data.sys.sunset);
}

let forecastChart = null; // Store the chart instance globally

function displayForecast(forecastData) {
    const ctx = document.getElementById('forecastChart').getContext('2d');
    
    // Destroy the old chart if it exists
    if (forecastChart) {
        forecastChart.destroy();
    }

    // Create the new chart
    forecastChart = new Chart(ctx, {
        type: 'line', // or 'bar', 'radar', etc., depending on your use case
        data: {
            labels: forecastData.map(item => item.dt_txt), // Format time for labels
            datasets: [{
                label: 'Temperature (°C)',
                data: forecastData.map(item => item.main.temp),
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'category', // This may vary depending on your chart type
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                }
            }
        }
    });

    // Render the detailed forecast
    const detailedForecast = document.getElementById('detailedForecast');
    detailedForecast.innerHTML = forecastData.map(item => `
        <div class="text-center bg-white p-4 rounded-lg shadow-sm">
            <p class="font-semibold text-gray-700">${new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}" class="mx-auto">
            <p class="text-2xl font-bold text-gray-800">${Math.round(item.main.temp)}°C</p>
            <p class="text-sm text-gray-600 capitalize">${item.weather[0].description}</p>
        </div>
    `).join('');

}

function formatTime(timestamp) {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function showError(message) {
    errorMsg.textContent = message;
    errorMsg.classList.remove('hidden');
}




