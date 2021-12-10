import { API_WEATHER_URL, API_LOCATION_URL, KEY, LAT, LON, UNITS, API_IMG_URL } from './config.js';

export let state = {};

class App {
  _loaderEl = document.querySelector('.loader');
  _cardsEl = document.querySelector('.cards');

  async _getData(url) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error(err + '💥');
    }
  }

  async _setData(position) {
    try {
      const { latitude } = position.coords;
      const { longitude } = position.coords;

      this._renderSpinner(this._loaderEl);

      const location = await this._getData(
        `${API_LOCATION_URL}?lat=${latitude}&lon=${longitude}&appid=${KEY}`
      );
      const weather = await this._getData(
        `${API_WEATHER_URL}?lat=${latitude}&lon=${longitude}&units=${UNITS}&appid=${KEY}`
      );

      const data = [location, weather];

      state = this._createStateObject(data);
      this._renderData(state);
    } catch (err) {
      console.error(err);
    }
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._setData.bind(this), () => {
        alert('Could not get your position');
      });
    }
  }

  _createStateObject(data) {
    const [location, weather] = data;
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
        dateAndTime: this._getCurrentDateAndTime(),
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
      daily: days,
    };
  }

  _renderData(state) {
    const currentHTML = `
      <div class="main-card">
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

      <div class="daily-cards">
        ${state.daily
          .slice(1)
          .map(day => this._generateDailyHTML(day))
          .join('')}
      </div>
    `;

    this._loaderEl.innerHTML = '';
    this._cardsEl.insertAdjacentHTML('afterbegin', currentHTML);
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

  _getCurrentDateAndTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = now.getDate();
    const day = now.getDay();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return {
      date: `${date < 10 ? '0' + date : date}.${month < 10 ? '0' + month : month}.${year}`,
      time: `${hour}:${minutes < 10 ? '0' + minutes : minutes}:${
        seconds < 10 ? '0' + seconds : seconds
      }`,
      day: days[day],
    };
  }

  _getFutureDate(date) {
    const day = date.getDay();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return days[day];
  }

  _renderSpinner(parentEl) {
    const markup = `
    <div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
    `;

    parentEl.insertAdjacentHTML('afterbegin', markup);
  }

  init() {
    this._getPosition();
  }
}

export default new App();
