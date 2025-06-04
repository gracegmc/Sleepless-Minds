const rtiOptions = document.querySelectorAll('.rti-option');
const startBtn = document.getElementById('start-rti-btn');
const resultBox = document.getElementById('rti-results');

// Identify extra elements inside the five-choice-test section to hide
const elementsToHide = document.querySelectorAll('#five-choice-test h2, #five-choice-test p, #start-rti-btn');

let totalRounds = 10;
let currentRound = 0;
let reactionTimes = [];
let errorsIncorrect = 0;
let errorsPremature = 0;
let errorsNoResponse = 0;
let currentKey = null;
let startTime = null;
let acceptingInput = false;
let timeoutId = null;

// Hardcoded equation parameters from generate_equation.py
const equationData = {
    coefficients: [0.2019567619160461,-0.11159644698692867,0.047276699318253394,0.04475002759484142,0.07457922918787746],
    intercept: 0.08787269382473206, // Paste intercept here
    feature_means: [0.2, 0.15, 350.525, 359.830985, 40.967735000000005], // Paste feature_means here
    feature_stds: [0.4,0.3570714214271425,41.11735491249407,44.188320991041,17.57232964322816], // Paste feature_stds here
    threshold: 0.5 // Paste threshold here
};

/*
FIRST SET OF EQUATION, NOT WEIGHTED 
const equationData = {
    coefficients: [0.5816567338115513,-0.4235715031234685,0.5597676483241671,0.45972478468901623,0.6106034118455002],
    intercept: 0.06747081312862788, // Paste intercept here
    feature_means: [0.2, 0.15, 350.525, 359.830985, 40.967735000000005], // Paste feature_means here
    feature_stds: [0.4,0.3570714214271425,41.11735491249407,44.188320991041,17.57232964322816], // Paste feature_stds here
    threshold: 0.5 // Paste threshold here
};
 */

function hideGameText() {
    elementsToHide.forEach(el => el.style.display = 'none');
    resultBox.style.display = 'none';
}

function showGameText() {
    elementsToHide.forEach(el => el.style.display = '');
    startBtn.style.display = '';
}

function showCountdown(callback) {
    const existing = document.getElementById('countdown');
    if (existing) existing.remove();

    const countdownDiv = document.createElement('div');
    countdownDiv.id = 'countdown';
    countdownDiv.textContent = '3';
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
    }, 50);
}

function highlightRandomOption() {
    rtiOptions.forEach(opt => opt.classList.remove('active'));
    const index = Math.floor(Math.random() * rtiOptions.length);
    const target = rtiOptions[index];
    target.classList.add('active');
    currentKey = target.getAttribute('data-key');
    startTime = new Date().getTime();
    acceptingInput = true;

    // Set timeout for no-response error (2 seconds)
    timeoutId = setTimeout(() => {
        if (acceptingInput) {
            errorsNoResponse++;
            acceptingInput = false;
            currentRound++;
            rtiOptions.forEach(opt => opt.classList.remove('active'));
            runNextRound();
        }
    }, 2000);
}

function calculateMetrics() {
    const validRTs = reactionTimes.filter(rt => rt > 0);
    const medianRT = validRTs.length
        ? validRTs.sort((a, b) => a - b)[Math.floor(validRTs.length / 2)]
        : 0;
    const meanRT = validRTs.length
        ? validRTs.reduce((sum, rt) => sum + rt, 0) / validRTs.length
        : 0;
    const rtStd = validRTs.length
        ? Math.sqrt(
            validRTs.reduce((sum, rt) => sum + Math.pow(rt - meanRT, 2), 0) /
            validRTs.length
        )
        : 0;
    return {
        simple_errors_incorrect: errorsIncorrect,
        simple_errors_premature: errorsPremature,
        simple_errors_no_response: errorsNoResponse,
        median_reaction_time: medianRT,
        mean_reaction_time: meanRT,
        reaction_time_std: rtStd
    };
}

function classifySleepDeprivation(metrics) {
    const features = [
        metrics.simple_errors_incorrect,
        metrics.simple_errors_premature,
        metrics.median_reaction_time,
        metrics.mean_reaction_time,
        metrics.reaction_time_std
    ];
    const standardized = features.map((val, i) =>
        (val - equationData.feature_means[i]) / equationData.feature_stds[i]
    );
    let logit = equationData.intercept;
    for (let i = 0; i < standardized.length; i++) {
        logit += equationData.coefficients[i] * standardized[i];
    }
    const probability = 1 / (1 + Math.exp(-logit));
    const prediction = probability >= equationData.threshold ? 1 : 0;
    return {
        probability: probability,
        prediction: prediction,
        status: prediction === 1 ? "You are 1, sleep deprived" : "You are 0, NOT sleep deprived"
    };
}

function startTest() {
    // Clear all data on start
    reactionTimes = [];
    errorsIncorrect = 0;
    errorsPremature = 0;
    errorsNoResponse = 0;
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
    }, 600 + Math.random() * 1000);
}

function endTest() {
    acceptingInput = false;
    if (timeoutId) clearTimeout(timeoutId);
    rtiOptions.forEach(opt => opt.classList.remove('active'));
    const metrics = calculateMetrics();
    const classification = classifySleepDeprivation(metrics);

    // Prepare error messages
    let errorMessages = [];
    if (errorsIncorrect === 0 && errorsPremature === 0 && errorsNoResponse === 0) {
        errorMessages.push("No mistakes/typos, nice!");
    } else {
        if (errorsIncorrect > 0) {
            errorMessages.push(`Oops, pressed incorrect key <strong>${errorsIncorrect}</strong> times`);
        }
        if (errorsNoResponse > 0) {
            errorMessages.push(`Uhmmm, missed <strong>${errorsNoResponse}</strong> key(s)`);
        }
        if (errorsPremature > 0) {
            errorMessages.push(`Too excited, pressed <strong>${errorsPremature}</strong> key(s) early`);
        }
    }

    // Create canvas for scatter plot
    const canvasId = 'reactionTimeChart';
    const errorHTML = errorMessages.map(msg => `<p>${msg}</p>`).join('');
    resultBox.style.display = 'block';
    resultBox.innerHTML = `
        <h3>Your Results</h3>
        <p>Average Reaction Time: <strong>${metrics.mean_reaction_time.toFixed(2)} ms</strong></p>
        <p>Median Reaction Time: <strong>${metrics.median_reaction_time.toFixed(2)} ms</strong></p>
        ${errorHTML}
        <p>Correct Trials: <strong>${reactionTimes.length}</strong></p>
        <p><strong>${classification.status}</strong> (Probability: ${classification.probability.toFixed(4)})</p>
        <canvas id="${canvasId}" width="800" height="500"></canvas>
        <div class="fun-fact">
            <h4>Fun Fact</h4>
            <p>On average, F1 drivers have 250ms reaction time and Olympic sprinters have 160ms 🤯</p>
        </div>
    `;

    // Hardcoded group average reaction time (placeholder)
    const groupAvgRT = classification.prediction === 1 ? 350 : 300; // ms, adjust based on group

    // Create scatter plot with Chart.js
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Your Reaction Times',
                    data: reactionTimes.map((rt, i) => ({ x: i + 1, y: rt })),
                    backgroundColor: '#4a90e2',
                    borderColor: '#4a90e2',
                    showLine: true,
                    pointRadius: 5,
                    borderWidth: 2
                },
                {
                    label: `Group ${classification.prediction} Avg RT`,
                    data: [
                        { x: 1, y: groupAvgRT },
                        { x: reactionTimes.length, y: groupAvgRT }
                    ],
                    borderColor: '#ff6b6b',
                    borderWidth: 2,
                    showLine: true,
                    pointRadius: 0
                },
                {
                    label: 'Your Avg RT',
                    data: [
                        { x: 1, y: metrics.mean_reaction_time },
                        { x: reactionTimes.length, y: metrics.mean_reaction_time }
                    ],
                    borderColor: '#7b68ee',
                    borderWidth: 2,
                    showLine: true,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: false, // Set to false to use fixed dimensions
            scales: {
                x: {
                    title: { display: true, text: 'Key Press Order', color: '#ffffff' },
                    ticks: { color: '#ffffff' },
                    grid: { borderColor: '#ffffff' }
                },
                y: {
                    title: { display: true, text: 'Reaction Time (ms)', color: '#ffffff' },
                    ticks: { color: '#ffffff' },
                    grid: { borderColor: '#ffffff' },
                    suggestedMin: 0,
                    suggestedMax: Math.max(...reactionTimes, groupAvgRT, metrics.mean_reaction_time) + 50
                }
            },
            plugins: {
                legend: { labels: { color: '#ffffff' } }
            }
        }
    });

    showGameText();
    startBtn.disabled = false;

    // Log RT.json update (in-memory)
    console.log("RT.json update (in-memory):", { median_reaction_time: metrics.median_reaction_time });
}

function handleKeyPress(e) {
    const key = e.key.toLowerCase();
    const validKeys = ['s', 'd', 'f', 'j', 'k'];
    if (!validKeys.includes(key)) return;

    if (!acceptingInput && currentRound < totalRounds) {
        errorsPremature++;
        return;
    }

    if (!acceptingInput) return;

    clearTimeout(timeoutId);
    acceptingInput = false;
    const rt = new Date().getTime() - startTime;
    if (key === currentKey && rt >= 100) {
        reactionTimes.push(rt);
    } else {
        errorsIncorrect++;
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