const rtiOptions = document.querySelectorAll('.rti-option');
const startBtn = document.getElementById('start-rti-btn');
const resultBox = document.getElementById('rti-results');

// Identify extra elements inside the five-choice-test section to hide
const elementsToHide = document.querySelectorAll('#five-choice-test h2, #five-choice-test p, #start-rti-btn');

let totalRounds = 10;
let currentRound = 0;
let reactionTimes = [];
let errors = 0;
let currentKey = null;
let startTime = null;
let acceptingInput = false;

function hideGameText() {
  elementsToHide.forEach(el => el.style.display = 'none');
  resultBox.style.display = 'none';
}

function showGameText() {
  elementsToHide.forEach(el => el.style.display = '');
  startBtn.style.display = '';
}

function showCountdown(callback) {
  // Remove if already exists
  const existing = document.getElementById('countdown');
  if (existing) existing.remove();

  // Create countdown div
  const countdownDiv = document.createElement('div');
  countdownDiv.id = 'countdown';
  countdownDiv.textContent = '3';

  // Style it inline to avoid any stylesheet interference
  countdownDiv.style.position = 'fixed';
  countdownDiv.style.top = '50%';
  countdownDiv.style.left = '50%';
  countdownDiv.style.transform = 'translate(-50%, -50%)';
  countdownDiv.style.fontSize = '4rem';
  countdownDiv.style.fontWeight = 'bold';
  countdownDiv.style.color = '#333';
  countdownDiv.style.backgroundColor = 'white';
  countdownDiv.style.padding = '1rem 2rem';
  countdownDiv.style.borderRadius = '12px';
  countdownDiv.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
  countdownDiv.style.zIndex = '9999';

  // Delay appending slightly to let other elements hide first
  setTimeout(() => {
    document.body.appendChild(countdownDiv);

    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        countdownDiv.textContent = count;
      } else {
        clearInterval(interval);
        countdownDiv.remove();
        callback();
      }
    }, 1000);
  }, 50); // allow previous UI hiding to complete
}


function highlightRandomOption() {
  rtiOptions.forEach(opt => opt.classList.remove('active'));
  const index = Math.floor(Math.random() * rtiOptions.length);
  const target = rtiOptions[index];
  target.classList.add('active');
  currentKey = target.getAttribute('data-key');
  startTime = new Date().getTime();
  acceptingInput = true;
}

function startTest() {
  reactionTimes = [];
  errors = 0;
  currentRound = 0;
  resultBox.style.display = 'none';
  resultBox.innerHTML = '';
  startBtn.disabled = true;

  runNextRound();
}

function runNextRound() {
  if (currentRound >= totalRounds) {
    endTest();
    return;
  }

  setTimeout(() => {
    highlightRandomOption();
    acceptingInput = true;
  }, 600 + Math.random() * 1000);
}

function endTest() {
  acceptingInput = false;
  rtiOptions.forEach(opt => opt.classList.remove('active'));
  const median = reactionTimes.length
    ? reactionTimes.sort((a, b) => a - b)[Math.floor(reactionTimes.length / 2)]
    : 0;

  resultBox.style.display = 'block';
  resultBox.innerHTML = `
    <h3>Your Results</h3>
    <p>Median Reaction Time: <strong>${median} ms</strong></p>
    <p>Correct Trials: <strong>${reactionTimes.length}</strong></p>
    <p>Errors: <strong>${errors}</strong></p>
  `;

  showGameText();
  startBtn.disabled = false;
}

function handleKeyPress(e) {
  const key = e.key.toLowerCase();
  const validKeys = ['s', 'd', 'f', 'j', 'k'];
  if (!validKeys.includes(key) || !acceptingInput) return;

  acceptingInput = false;
  const rt = new Date().getTime() - startTime;
  if (key === currentKey) {
    reactionTimes.push(rt);
  } else {
    errors++;
  }
  currentRound++;
  rtiOptions.forEach(opt => opt.classList.remove('active'));
  runNextRound();
}

window.addEventListener('keydown', handleKeyPress);
startBtn.addEventListener('click', () => {
  hideGameText();
  showCountdown(() => {
    startTest();
  });
});
