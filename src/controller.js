import app from './app.js';
import { state } from './app.js';

const localBtn = document.getElementById('localBtn');
const buttons = document.querySelectorAll('.btn');

localBtn.addEventListener('click', app._getPosition.bind(app));
setInterval(() => {
  state.current.dateAndTime = app._getCurrentDateAndTime();
  const time = document.getElementById('local-time');
  time.textContent = state.current.dateAndTime.time;
}, 1000);
app._getPosition();

buttons.forEach(button => {
  button.addEventListener('click', () => {
    toggleCards(button);
  });
});

function toggleCards(button) {
  const dailyCards = document.querySelector('.daily-cards');
  const hourlyCards = document.querySelector('.hourly-cards');
  const dailyBtn = document.getElementById('daily-btn');
  const hourlyBtn = document.getElementById('hourly-btn');
  if (button.id === 'daily-btn') {
    hourlyBtn.classList.remove('btn-active');
    dailyBtn.classList.toggle('btn-active');
    dailyCards.classList.toggle('hidden');
    hourlyCards.classList.add('hidden');
  }
  if (button.id === 'hourly-btn') {
    dailyBtn.classList.remove('btn-active');
    hourlyBtn.classList.toggle('btn-active');
    dailyCards.classList.add('hidden');
    hourlyCards.classList.toggle('hidden');
  }
}
