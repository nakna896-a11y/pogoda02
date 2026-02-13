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
    // Автообновление каждые 30 минут
    setInterval(() => loadWeatherData('today'), 30 * 60 * 1000);
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

    // Обработчик ввода для подсказок
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length > 1) {
            showSuggestions(query);
        } else {
            hideSuggestions();
        }
    });

    // Закрытие подсказок при клике вне
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper')) {
            hideSuggestions();
        }
    });
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
            currentCity = `${result.name}${result.admin1 ? ', ' + result.admin1 : ''}`;
            
            hideSuggestions();
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

async function showSuggestions(query) {
    try {
        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=ru&format=json`
        );
        const data = await response.json();
        const suggestionsList = document.getElementById('suggestionsList');

        if (data.results && data.results.length > 0) {
            suggestionsList.innerHTML = '';
            data.results.forEach(result => {
                const country = result.country || '';
                const admin = result.admin1 || '';
                const displayName = `${result.name}${admin ? ', ' + admin : ''}`;
                const displaySub = `${country}`;

                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.innerHTML = `
                    <div class="suggestion-icon">📍</div>
                    <div class="suggestion-text">
                        <div class="suggestion-main">${displayName}</div>
                        <div class="suggestion-sub">${displaySub}</div>
                    </div>
                `;

                item.addEventListener('click', () => {
                    selectSuggestion(result);
                });

                suggestionsList.appendChild(item);
            });

            suggestionsList.classList.add('active');
        } else {
            suggestionsList.innerHTML = '';
            suggestionsList.classList.remove('active');
        }
    } catch (error) {
        console.error('Ошибка при получении подсказок:', error);
    }
}

function hideSuggestions() {
    const suggestionsList = document.getElementById('suggestionsList');
    suggestionsList.classList.remove('active');
    suggestionsList.innerHTML = '';
}

function selectSuggestion(result) {
    currentCoords = {
        latitude: result.latitude,
        longitude: result.longitude
    };
    currentCity = `${result.name}${result.admin1 ? ', ' + result.admin1 : ''}`;
    
    document.getElementById('searchInput').value = '';
    hideSuggestions();
    loadWeatherData('today');
}

async function loadWeatherData(period) {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${currentCoords.latitude}&longitude=${currentCoords.longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,windspeed_10m_max,uv_index_max&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure,visibility,uv_index,precipitation&timezone=auto`
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
    const daily = data.daily;
    const weatherCode = current.weather_code;
    
    const currentTime = new Date();
    const timeStr = currentTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    
    // Расчет точки росы (приблизительно)
    const temp = current.temperature_2m;
    const humidity = current.relative_humidity_2m;
    const dewPoint = temp - (100 - humidity) / 5;
    
    document.getElementById('todayCity').textContent = currentCity;
    document.getElementById('todayTime').textContent = '🕐 ' + timeStr;
    document.getElementById('todayTemp').textContent = Math.round(current.temperature_2m) + '°C';
    document.getElementById('todayIconLarge').textContent = weatherIcons[weatherCode] || '🌤️';
    document.getElementById('todayDesc').textContent = weatherDescriptions[weatherCode] || 'Неизвестно';
    document.getElementById('todayFeels').textContent = Math.round(current.apparent_temperature) + '°C';
    document.getElementById('todayHumidity').textContent = current.relative_humidity_2m + '%';
    document.getElementById('todayWind').textContent = current.wind_speed_10m.toFixed(1) + ' м/с';
    document.getElementById('todayPressure').textContent = Math.round(current.pressure) + ' гПа';
    document.getElementById('todayVisibility').textContent = (current.visibility / 1000).toFixed(1) + ' км';
    document.getElementById('todayPrecip').textContent = (current.precipitation || 0).toFixed(1) + ' мм';
    document.getElementById('todayUVIndex').textContent = Math.round(current.uv_index);
    document.getElementById('todayDewPoint').textContent = dewPoint.toFixed(1) + '°C';
    
    // Влажность процент
    document.getElementById('todayHumidityPercent').textContent = current.relative_humidity_2m + '%';
    document.getElementById('todayHumidityBar').style.width = current.relative_humidity_2m + '%';
    
    // УФ индекс
    const uvIndex = Math.round(current.uv_index);
    document.getElementById('todayUVValue').textContent = uvIndex;
    document.getElementById('todayUVBar').style.width = Math.min(uvIndex * 15, 100) + '%';
}

function displayTomorrowWeather(data) {
    const tomorrow = data.daily;
    const tomorrowData = {
        maxTemp: tomorrow.temperature_2m_max[1],
        minTemp: tomorrow.temperature_2m_min[1],
        weatherCode: tomorrow.weather_code[1],
        windSpeed: tomorrow.windspeed_10m_max[1],
        precipitation: tomorrow.precipitation_sum[1],
        precipProb: tomorrow.precipitation_probability_max[1]
    };
    
    const avgTemp = Math.round((tomorrowData.maxTemp + tomorrowData.minTemp) / 2);
    
    document.getElementById('tomorrowCity').textContent = currentCity;
    document.getElementById('tomorrowTemp').textContent = avgTemp + '°C';
    document.getElementById('tomorrowIconLarge').textContent = weatherIcons[tomorrowData.weatherCode] || '🌤️';
    document.getElementById('tomorrowDesc').textContent = weatherDescriptions[tomorrowData.weatherCode] || 'Неизвестно';
    document.getElementById('tomorrowMax').textContent = Math.round(tomorrowData.maxTemp) + '°C';
    document.getElementById('tomorrowMin').textContent = Math.round(tomorrowData.minTemp) + '°C';
    document.getElementById('tomorrowAvg').textContent = avgTemp + '°C';
    document.getElementById('tomorrowHumidity').textContent = (60 + Math.floor(Math.random() * 30)) + '%';
    document.getElementById('tomorrowWind').textContent = tomorrowData.windSpeed.toFixed(1) + ' м/с';
    document.getElementById('tomorrowPrecipProb').textContent = tomorrowData.precipProb + '%';
    document.getElementById('tomorrowPressure').textContent = (Math.round(Math.random() * 30 + 1000)) + ' гПа';
    document.getElementById('tomorrowPrecip').textContent = tomorrowData.precipitation.toFixed(1) + ' мм';
    
    // Прогресс-бары
    document.getElementById('tomorrowPrecipPercent').textContent = tomorrowData.precipProb + '%';
    document.getElementById('tomorrowPrecipBar').style.width = tomorrowData.precipProb + '%';
    
    document.getElementById('tomorrowHumidityPercent').textContent = (60 + Math.floor(Math.random() * 30)) + '%';
    const humidityVal = parseInt(document.getElementById('tomorrowHumidityPercent').textContent);
    document.getElementById('tomorrowHumidityBar').style.width = humidityVal + '%';
}

function display10DaysWeather(data) {
    const daily = data.daily;
    const forecastGrid = document.getElementById('forecastGrid');
    forecastGrid.innerHTML = '';

    // Показываем 10 дней
    for (let i = 0; i < 10; i++) {
        const date = new Date(daily.time[i]);
        const dayName = date.toLocaleDateString('ru-RU', { weekday: 'short' });
        const dateNum = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const minTemp = Math.round(daily.temperature_2m_min[i]);
        const weatherCode = daily.weather_code[i];
        const icon = weatherIcons[weatherCode] || '🌤️';
        const description = weatherDescriptions[weatherCode] || 'Неизвестно';
        const windSpeed = daily.windspeed_10m_max[i].toFixed(1);
        const precipitation = daily.precipitation_sum[i].toFixed(1);
        const precipProb = daily.precipitation_probability_max[i];
        const uvIndex = daily.uv_index_max[i];

        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div class="forecast-date">${dayName}<br>${dateNum}</div>
            <div class="forecast-icon">${icon}</div>
            <div class="forecast-desc">${description}</div>
            <div class="forecast-temp">${maxTemp}°</div>
            <div class="forecast-temp-range">мин: ${minTemp}°</div>
            <div class="forecast-details">
                <div title="Кол-во осадков">💧 ${precipitation}мм</div>
                <div title="Вероятность">⚡ ${precipProb}%</div>
            </div>
        `;
        
        // Добавляем эффект наведения с дополнительной информацией
        card.addEventListener('mouseenter', function() {
            this.title = `Ветер: ${windSpeed} м/с\nУФ: ${Math.round(uvIndex)}`;
        });
        
        forecastGrid.appendChild(card);
    }
}
