const formInputLocation = document.querySelector('#formInputLocation');
const cityNameInput = document.querySelector('#cityNameInput');
const cardContainer = document.querySelector('.weather-cards');

formInputLocation.addEventListener('submit', renderWeatherInfo);

async function renderWeatherInfo(e) {
    //!Попробуй тут удавить старые карточки, я сейчас хуй знает сработает или нет

    e.preventDefault();

    const key = '61421fe7402aefb8c509652d22397967';

    const cityName = cityNameInput.value;

    if (cityName == '') return;

    try {
        const geocodingResponse = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${key}&limit=${5}`);
        if (!geocodingResponse.ok) {
            throw new Error('Geocoding API request failed');
        }
        const geocodingData = await geocodingResponse.json();
        console.log(geocodingData);

        // Итерируем по массиву геокодированных данных и для каждого города создаем карточку погоды
        geocodingData.forEach(async (cityData) => {
            const { lat, lon } = cityData;

            const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric&lang=ru`);
            if (!weatherResponse.ok) {
                throw new Error('Weather API request failed');
            }
            const weatherData = await weatherResponse.json();

            updateWeatherCard(weatherData);
        });
    } catch (error) {
        console.error('There was a problem with your fetch operation:', error);
        displayErrorMessage();
    }
}

function updateWeatherCard(weatherData) {
    const sunriseTime = new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const weatherCardHTML = `
        <li class="weather-card">
        <div class="weather-card__icon">
                <img src="/" alt="Иконка погоды" class="icon__image">
            </div>
            <div class="weather-card__info">
                <div class="weather-card__city-name">${weatherData.name}</div>
                <div class="weather-card__temperature">${Math.round(weatherData.main.temp)}&deg;C/${Math.round(weatherData.main.feels_like)}&deg;C</div>
                <div class="weather-card__feels-like-temperature"></div>
                <div class="weather-card__additional-weather-data">
                    <div class="weather-card__wind-speed cntr"><img class="weather-card__addit-image" src="src/images/svg/wind.svg"> ${weatherData.wind.speed}км/ч</div>
                    <div class="weather-card__humidity cntr"><img class="weather-card__addit-image" src="src/images/svg/humidity.svg"> ${weatherData.main.humidity}%</div>
                    <div class="weather-card__sunrise cntr"><img class="weather-card__addit-image" src="src/images/svg/sunrise.svg"> ${sunriseTime}</div>
                </div>
            </div>
        </li>`;

    cardContainer.insertAdjacentHTML('beforeend', weatherCardHTML);
}

function displayErrorMessage() {
    const weatherCardHTML = `
        <li class="weather-card">
            Такой город не найден
        </li>`;

    cardContainer.insertAdjacentHTML('beforeend', weatherCardHTML);
}
