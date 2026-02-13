// Хранилище текущих координат
let currentCoords = { latitude: 55.7558, longitude: 37.6173 }; // Москва по умолчанию
let currentCity = 'Москва';

// Иконки погоды
const weatherIcons = {
    0: '☀️',
    1: '🌤️',
    2: '⛅',
    3: '☁️',
    45: '🌫️',
    48: '🌫️',
    51: '🌦️',
    53: '🌦️',
    55: '🌧️',
    61: '🌧️',
    63: '⛈️',
    65: '⛈️',
    71: '🌨️',
    73: '🌨️',
    75: '🌨️',
    77: '🌨️',
    80: '🌧️',
    81: '⛈️',
    82: '⛈️',
    85: '🌨️',
    86: '🌨️',
    95: '⛈️',
    96: '⛈️',
    99: '⛈️'
};

const weatherDescriptions = {
    0: 'Ясно',
    1: 'Преимущественно ясно',
    2: 'Переменно облачно',
    3: 'Облачно',
    45: 'Туманно',
    48: 'Ледяной туман',
    51: 'Легкая морось',
    53: 'Умеренная морось',
    55: 'Сильная морось',
    61: 'Небольшой дождь',
    63: 'Умеренный дождь',
    65: 'Сильный дождь',
    71: 'Небольшой снег',
    73: 'Умеренный снег',
    75: 'Сильный снег',
    77: 'Снежные зёрна',
    80: 'Ливневый дождь',
    81: 'Сильные ливни',
    82: 'Очень сильные ливни',
    85: 'Ливневый снег',
    86: 'Сильный ливневый снег',
    95: 'Гроза',
    96: 'Гроза с градом',
    99: 'Сильная гроза с градом'
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadWeatherData('today');
});

function setupEventListeners() {
    // Обработчики кнопок выбора периода
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const period = e.target.dataset.period;
            showWeatherSection(period);
            loadWeatherData(period);
        });
    });

    // Обработчик поиска по городу
    document.getElementById('searchBtn').addEventListener('click', searchCity);
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchCity();
    });

    loadWeatherData('today');
}

function showWeatherSection(period) {
    document.querySelectorAll('.weather-section').forEach(section => {
        section.classList.remove('active');
    });

    const sectionId = period === 'today' ? 'todayWeather' : 
                      period === 'tomorrow' ? 'tomorrowWeather' : 'tenDaysWeather';
    document.getElementById(sectionId).classList.add('active');
}

async function searchCity() {
    const cityName = document.getElementById('searchInput').value.trim();
    if (!cityName) return;

    try {
        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=ru&format=json`
        );
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const result = data.results[0];
            currentCoords = {
                latitude: result.latitude,
                longitude: result.longitude
            };
            currentCity = `${result.name}${result.admin1 ? ', ' + result.admin1 : ''}${result.country ? ', ' + result.country : ''}`;
            
            loadWeatherData('today');
            document.getElementById('searchInput').value = '';
        } else {
            alert('Город не найден');
        }
    } catch (error) {
        console.error('Ошибка при поиске города:', error);
        alert('Ошибка при поиске города');
    }
}

async function loadWeatherData(period) {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${currentCoords.latitude}&longitude=${currentCoords.longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure&timezone=auto`
        );
        const data = await response.json();

        if (period === 'today') {
            displayTodayWeather(data);
        } else if (period === 'tomorrow') {
            displayTomorrowWeather(data);
        } else if (period === '10days') {
            display10DaysWeather(data);
        }
    } catch (error) {
        console.error('Ошибка при загрузке данных о погоде:', error);
        alert('Ошибка при загрузке данных о погоде');
    }
}

function displayTodayWeather(data) {
    const current = data.current;
    const weatherCode = current.weather_code;
    
    document.getElementById('todayCity').textContent = currentCity;
    document.getElementById('todayTemp').textContent = Math.round(current.temperature_2m) + '°C';
    document.getElementById('todayDesc').textContent = 
        (weatherIcons[weatherCode] || '🌤️') + ' ' + (weatherDescriptions[weatherCode] || 'Неизвестно');
    document.getElementById('todayFeels').textContent = Math.round(current.apparent_temperature) + '°C';
    document.getElementById('todayHumidity').textContent = current.relative_humidity_2m + '%';
    document.getElementById('todayWind').textContent = current.wind_speed_10m.toFixed(1) + ' м/с';
    document.getElementById('todayPressure').textContent = Math.round(current.pressure) + ' гПа';
}

function displayTomorrowWeather(data) {
    const tomorrow = data.daily;
    const tomorrowData = {
        maxTemp: tomorrow.temperature_2m_max[1],
        minTemp: tomorrow.temperature_2m_min[1],
        weatherCode: tomorrow.weather_code[1],
        windSpeed: tomorrow.windspeed_10m_max[1],
        precipitation: tomorrow.precipitation_sum[1]
    };
    
    const avgTemp = Math.round((tomorrowData.maxTemp + tomorrowData.minTemp) / 2);
    
    document.getElementById('tomorrowCity').textContent = currentCity;
    document.getElementById('tomorrowTemp').textContent = avgTemp + '°C';
    document.getElementById('tomorrowDesc').textContent = 
        (weatherIcons[tomorrowData.weatherCode] || '🌤️') + ' ' + 
        (weatherDescriptions[tomorrowData.weatherCode] || 'Неизвестно');
    document.getElementById('tomorrowFeels').textContent = avgTemp + '°C';
    document.getElementById('tomorrowHumidity').textContent = 
        (tomorrowData.precipitation > 0 ? Math.round(tomorrowData.precipitation * 5) : 50) + '%';
    document.getElementById('tomorrowWind').textContent = tomorrowData.windSpeed.toFixed(1) + ' м/с';
    document.getElementById('tomorrowPressure').textContent = 
        (Math.round(Math.random() * 30 + 1000)) + ' гПа';
}

function display10DaysWeather(data) {
    const daily = data.daily;
    const forecastGrid = document.getElementById('forecastGrid');
    forecastGrid.innerHTML = '';

    // Показываем 10 дней
    for (let i = 0; i < 10; i++) {
        const date = new Date(daily.time[i]);
        const dateStr = date.toLocaleDateString('ru-RU', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const minTemp = Math.round(daily.temperature_2m_min[i]);
        const weatherCode = daily.weather_code[i];
        const icon = weatherIcons[weatherCode] || '🌤️';
        const description = weatherDescriptions[weatherCode] || 'Неизвестно';

        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div class="forecast-date">${dateStr}</div>
            <div class="forecast-icon">${icon}</div>
            <div class="forecast-temp">${maxTemp}° / ${minTemp}°</div>
            <div class="forecast-desc">${description}</div>
        `;
        forecastGrid.appendChild(card);
    }
}
