import app from './app.js';
import { state } from './app.js';

const localBtn = document.getElementById('localBtn');

localBtn.addEventListener('click', app._getPosition.bind(app));
setInterval(() => {
  state.current.dateAndTime = app._getCurrentDateAndTime();
  const time = document.getElementById('local-time');
  time.textContent = state.current.dateAndTime.time;
}, 1000);
app._getPosition();
