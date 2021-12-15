import {
  API_WEATHER_URL,
  API_GEOREV_URL,
  API_GEOFOR_URL,
  WEATHER_KEY,
  GEO_KEY,
  UNITS,
  API_IMG_URL,
} from './config.js';

export let state = {};

class App {
  // _locale = navigator.language;
  _locale = 'en-GB';

  _loaderEl = document.querySelector('.loader');
  _cardsEl = document.querySelector('.cards');
  _initialEl = document.querySelector('.initial');
  _buttonsEl = document.querySelector('.buttons');

  async _getData(url) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error(err + '💥');
    }
  }

  async _getLocalData(location) {
    try {
      this._renderSpinner(this._loaderEl);

      const { latitude } = location.coords;
      const { longitude } = location.coords;

      this._setData(latitude, longitude);
    } catch (err) {
      console.error(err);
    }
  }

  async _getSearchData(location) {
    try {
      this._renderSpinner(this._loaderEl);

      const data = await this._getData(`${API_GEOFOR_URL}?q=${location}&key=${GEO_KEY}`);

      const latitude = data.results[0].geometry.lat;
      const longitude = data.results[0].geometry.lng;

      this._setData(latitude, longitude);
    } catch (err) {
      console.error(err);
    }
  }

  async _setData(latitude, longitude) {
    const location = await this._getData(
      `${API_GEOREV_URL}?lat=${latitude}&lon=${longitude}&appid=${WEATHER_KEY}`
    );
    const weather = await this._getData(
      `${API_WEATHER_URL}?lat=${latitude}&lon=${longitude}&units=${UNITS}&appid=${WEATHER_KEY}`
    );

    const data = [location, weather];

    state = this._createStateObject(data);

    this._renderData(state);
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._getLocalData.bind(this), () => {
        alert('Could not get your position :(');
      });
    }
  }

  _createStateObject(data) {
    const [location, weather] = data;

    const hours = weather.hourly.map(hour => {
      return {
        dt: hour.dt,
        temp: hour.temp,
        icon: hour.weather[0].icon,
      };
    });

    const days = weather.daily.map(day => {
      return {
        dt: day.dt,
        maxTemp: day.temp.max,
        minTemp: day.temp.min,
        description: day.weather[0].description,
        icon: day.weather[0].icon,
        id: day.weather[0].id,
        main: day.weather[0].main,
      };
    });

    return {
      name: location[0].name,
      current: {
        dateAndTime: this._getCurrentDateAndTime(weather.timezone),
        temp: weather.current.temp,
        feelsLike: weather.current.feels_like,
        humidity: weather.current.humidity,
        visibility: weather.current.visibility,
        windSpeed: weather.current.wind_speed,
        description: weather.current.weather[0].description,
        icon: weather.current.weather[0].icon,
        id: weather.current.weather[0].id,
        main: weather.current.weather[0].main,
      },
      hourly: hours,
      daily: days,
    };
  }

  _renderMainCard(state) {
    const currentHTML = `
      <div class="main-card">
      <button id="back-btn">Back</button>
        <div class="local-time item">
          <p id="location-name">${state.name}</p>
          <p id="local-time">${state.current.dateAndTime.time}</p>
          <div></div>
        </div>
        <div class="current">
          <p class="item" id="description">${state.current.description
            .split(' ')
            .map(word => word[0].toUpperCase() + word.substring(1))
            .join(' ')}</p>
          <div class="img-temp">
            <div class="current-img item">
              <img src="${API_IMG_URL}${state.current.icon}@4x.png" alt="icon" />
            </div>
            <p class="item" id="temp">${state.current.temp.toFixed(1)}°C</p>
            <p class="item" id="feels-like">feels like&nbsp;<span>${state.current.feelsLike.toFixed(
              1
            )}°C</span></p>
          </div>
          <div class="info">
            <p class="item" id="humidity">humidity:&nbsp;<span>${state.current.humidity}%</span></p>
            <p class="item" id="wind">wind:&nbsp;<span>${state.current.windSpeed} m/s</span></p>
          </div>
        </div>
        <div class="current-date item">
          <p id="current-day">${state.current.dateAndTime.day}</p>
          <p id="current-date">${state.current.dateAndTime.date}</p>
        </div>
      </div>
    `;

    this._loaderEl.innerHTML = '';
    this._cardsEl.insertAdjacentHTML('afterbegin', currentHTML);

    const backBtn = document.getElementById('back-btn');
    backBtn.addEventListener('click', () => {
      location.reload();
    });
  }

  _renderDailyCards(state) {
    const markup = `
      <div class="daily-cards hidden">
        ${state.daily
          .slice(1)
          .map(day => this._generateDailyHTML(day))
          .join('')}
      </div>
    `;

    this._cardsEl.insertAdjacentHTML('afterend', markup);
  }

  _renderHourlyCards(state) {
    const mapped = state.hourly.map(hour =>
      Number(
        new Date(hour.dt * 1000)
          .toLocaleString(this._locale, {
            timeZone: state.current.dateAndTime.timeZone,
          })
          .split(',')
          .pop()
          .split(':')
          .shift()
          .trim()
      )
    );

    const markup = `
      <div class="hourly-cards hidden">
      ${state.hourly
        .slice(1, 25)
        .map(hour => this._generateHourlyHTML(hour))
        .join('')}
      </div>
    `;

    this._cardsEl.insertAdjacentHTML('afterend', markup);
  }

  _renderData(state) {
    this._renderMainCard(state);
    this._renderDailyCards(state);
    this._renderHourlyCards(state);
  }

  _generateHourlyHTML(hour) {
    const now = new Date(hour.dt * 1000).toLocaleString(this._locale, {
      timeZone: state.current.dateAndTime.timeZone,
    });

    return `
      <div class="hourly-card">
        <div class="hour item">
          <p>${this._getFutureHour(now)}:00</p>
        </div>
        <div class="img item">
          <img src="${API_IMG_URL}${hour.icon}.png" alt="icon" />
        </div>
        <div class="temp item">
          <p>${hour.temp.toFixed(1)}°C</p>
        </div>
      </div>
    `;
  }

  _generateDailyHTML(day) {
    const now = new Date(day.dt * 1000);

    return `
      <div class="daily-card">
        <div class="day item">
          <p>${this._getFutureDate(now)}</p>
        </div>
        <div class="img item">
          <img src="${API_IMG_URL}${day.icon}@2x.png" alt="icon" />
        </div>
        <div class="description item">
          <p>${day.description
            .split(' ')
            .map(word => word[0].toUpperCase() + word.substring(1))
            .join(' ')}</p>
        </div>
        <div class="max item">
          <p>H: ${day.maxTemp.toFixed(1)}°C</p>
        </div>
        <div class="min item">
          <p>L: ${day.minTemp.toFixed(1)}°C</p>
        </div>
      </div>
    `;
  }

  _getCurrentDateAndTime(timeZone) {
    const now = new Date();

    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    };

    const dateObj = now.toLocaleString(this._locale, options);
    const timeObj = now.toLocaleString(this._locale, { timeZone });

    const day = dateObj.split(',').shift().trim();
    const date = dateObj.split(',').pop().trim();
    const time = timeObj.split(',').pop().trim();

    return {
      timeZone,
      date,
      day,
      time,
    };
  }

  _getFutureDate(date) {
    const day = date.getDay();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return days[day];
  }

  _getFutureHour(date) {
    const hour = date.split(',').pop().split(':').shift().trim();
    return hour;
  }

  _renderSpinner(parentEl) {
    const markup = `
    <div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
    `;

    parentEl.insertAdjacentHTML('afterbegin', markup);
  }

  initLocal() {
    this._initialEl.classList.add('hidden');
    this._buttonsEl.classList.remove('hidden');
    this._getPosition();
  }

  initSearch(location) {
    this._initialEl.classList.add('hidden');
    this._buttonsEl.classList.remove('hidden');
    this._getSearchData(location);
  }
}

export default new App();
