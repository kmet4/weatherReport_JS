// Получаем ссылки на HTML-элементы
const formInputLocation = document.querySelector('#formInputLocation');
const cityNameInput = document.querySelector('#cityNameInput');
const cardContainer = document.querySelector('.weather-cards');

// Добавляем слушатель события submit на форму для отображения информации о погоде
formInputLocation.addEventListener('submit', renderWeatherInfo);

// Функция для отображения информации о погоде
async function renderWeatherInfo(event) {
    event.preventDefault();

    // API-ключ для доступа к OpenWeatherMap API
    const apiKey = '61421fe7402aefb8c509652d22397967';

    // Получаем введенное название города из текстового поля
    const cityName = cityNameInput.value;

    // Проверяем, что введено название города
    if (cityName === '') return;

    // Удаляем старые карточки с предыдущими данными о погоде
    removeOldCards();
    
    try {
        // Получаем геокодированные данные для введенного города
        const geocodingResponse = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${apiKey}&limit=${5}`);
        
        // Проверяем успешность запроса к Geocoding API
        if (!geocodingResponse.ok) {
            throw new Error('Geocoding API request failed');
        }

        // Преобразуем ответ в формат JSON
        const geocodingData = await geocodingResponse.json(); 

        // Проверяем, что найдены города с таким названием
        if (geocodingData.length === 0) {
            throw new Error('No matching cities found');
        }
        
        // Итерируем по массиву геокодированных данных и получаем данные о погоде для каждого города
        for (const cityData of geocodingData) {
            const { lat, lon } = cityData;

            // Получаем данные о погоде для конкретного города
            const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ru`);

            // Проверяем успешность запроса к Weather API
            if (!weatherResponse.ok) {
                throw new Error('Weather API request failed');
            }

            // Преобразуем ответ в формат JSON
            const weatherData = await weatherResponse.json();

            // Обновляем карточку с данными о погоде на странице
            updateWeatherCard(weatherData);
        }
    } catch (error) {
        // В случае ошибки выводим сообщение в консоль и отображаем сообщение об ошибке на странице
        console.error('There was a problem with your fetch operation:', error);
        displayErrorMessage();
    }
}

// Функция для обновления карточки с данными о погоде
function updateWeatherCard(weatherData) {
    // Преобразуем время восхода солнца из формата timestamp в строку времени
    const sunriseTime = new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Генерируем HTML-код для карточки погоды
    const weatherCardHTML = `
        <li class="weather-card">
            <div class="weather-card__icon">
                <img src="/" alt="Иконка погоды" class="icon__image">
            </div>
            <div class="weather-card__info">
                <div class="weather-card__city-name">${weatherData.name}, ${weatherData.sys.country}</div>
                <div class="weather-card__temperature">${Math.round(weatherData.main.temp)}&deg;C/${Math.round(weatherData.main.feels_like)}&deg;C</div>
                <div class="weather-card__feels-like-temperature"></div>
                <div class="weather-card__additional-weather-data">
                    <div class="weather-card__wind-speed cntr"><img class="weather-card__addit-image" src="src/images/svg/wind.svg"> ${weatherData.wind.speed}км/ч</div>
                    <div class="weather-card__humidity cntr"><img class="weather-card__addit-image" src="src/images/svg/humidity.svg"> ${weatherData.main.humidity}%</div>
                    <div class="weather-card__sunrise cntr"><img class="weather-card__addit-image" src="src/images/svg/sunrise.svg"> ${sunriseTime}</div>
                </div>
            </div>
        </li>`;

    // Вставляем сгенерированный HTML-код в контейнер для карточек погоды
    cardContainer.insertAdjacentHTML('beforeend', weatherCardHTML);
}

// Функция для отображения сообщения об ошибке
function displayErrorMessage() {
    const weatherCardHTML = `
        <li class="weather-card">
            Такой город не найден
        </li>`;

    cardContainer.insertAdjacentHTML('beforeend', weatherCardHTML);
}

// Функция для удаления старых карточек погоды
function removeOldCards() {
    const oldWeatherCards = document.querySelectorAll('.weather-card');
    if (oldWeatherCards.length === 0) return;
    oldWeatherCards.forEach(card => card.remove());
}
