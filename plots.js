// Channel numbers to display
const CHANNELS = [0, 1, 2, 3, 13, 16, 18, 19, 21, 32, 33, 34, 35, 36, 37, 45];

// Initialize plots when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializePlots();
    setupModal();
});

function initializePlots() {
    const plotsGrid = document.getElementById('plots-grid');
    
    CHANNELS.forEach(channel => {
        // Create preview container
        const previewContainer = document.createElement('div');
        previewContainer.className = 'plot-preview';
        previewContainer.dataset.channel = channel;
        
        // Create canvas for the preview
        const canvas = document.createElement('canvas');
        previewContainer.appendChild(canvas);
        
        // Add click event to show modal
        previewContainer.addEventListener('click', () => showPlotModal(channel));
        
        // Add to grid
        plotsGrid.appendChild(previewContainer);
        
        // Create and render the preview plot
        createPlot(canvas, channel, true);
    });
}

function setupModal() {
    const modal = document.getElementById('plot-modal');
    const closeBtn = modal.querySelector('.close-modal');
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function showPlotModal(channel) {
    const modal = document.getElementById('plot-modal');
    const modalContainer = document.getElementById('modal-plot-container');
    
    // Clear previous plot
    modalContainer.innerHTML = '';
    
    // Create new canvas for the modal
    const canvas = document.createElement('canvas');
    modalContainer.appendChild(canvas);
    
    // Create and render the full-size plot
    createPlot(canvas, channel, false);
    
    // Show modal
    modal.style.display = 'block';
}

// Generate more realistic hemoglobin data that matches typical fNIRS patterns
function generateHemoglobinData(length, type, condition) {
    const data = [];
    let baseline, amplitude, noiseLevel;
    
    if (type === 'HbO') {
        // HbO typically has larger changes and more variability
        baseline = condition === 'before' ? 0.01 : 0.005;
        amplitude = condition === 'before' ? 0.03 : 0.025;
        noiseLevel = 0.008;
    } else { // HbR
        // HbR typically has smaller, opposite changes
        baseline = condition === 'before' ? -0.005 : -0.008;
        amplitude = condition === 'before' ? 0.015 : 0.012;
        noiseLevel = 0.004;
    }
    
    for (let i = 0; i < length; i++) {
        // Add some realistic temporal structure
        const timeComponent = Math.sin(i * 0.01) * amplitude * 0.3;
        const trendComponent = (i / length) * amplitude * 0.2;
        const noise = (Math.random() - 0.5) * noiseLevel;
        
        data.push(baseline + timeComponent + trendComponent + noise);
    }
    
    return data;
}

// Calculate dynamic y-axis ranges based on data
function calculateYRange(datasets) {
    let allValues = [];
    datasets.forEach(dataset => {
        allValues = allValues.concat(dataset.data);
    });
    
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const range = max - min;
    const padding = range * 0.1; // 10% padding
    
    return {
        min: min - padding,
        max: max + padding
    };
}

function createPlot(canvas, channel, isPreview) {
    const ctx = canvas.getContext('2d');
    
    // Create a container for both plots
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '20px';
    container.style.width = '100%';
    container.style.height = isPreview ? '200px' : '600px';
    
    // Create canvases for both plots
    const hboCanvas = document.createElement('canvas');
    const hbrCanvas = document.createElement('canvas');
    hboCanvas.style.width = '100%';
    hbrCanvas.style.width = '100%';
    hboCanvas.style.height = isPreview ? '90px' : '280px';
    hbrCanvas.style.height = isPreview ? '90px' : '280px';
    
    container.appendChild(hboCanvas);
    container.appendChild(hbrCanvas);
    canvas.parentNode.replaceChild(container, canvas);
    
    // Generate realistic data for this channel
    const hboBeforeData = generateHemoglobinData(1000, 'HbO', 'before');
    const hboAfterData = generateHemoglobinData(1000, 'HbO', 'after');
    const hbrBeforeData = generateHemoglobinData(1000, 'HbR', 'before');
    const hbrAfterData = generateHemoglobinData(1000, 'HbR', 'after');
    
    // Create datasets
    const hboDatasets = [
        {
            label: 'Before SD',
            data: hboBeforeData,
            borderColor: 'rgba(0, 123, 255, 1)',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            tension: 0.1,
            borderWidth: isPreview ? 1 : 2,
            pointRadius: 0
        },
        {
            label: 'After SD',
            data: hboAfterData,
            borderColor: 'rgba(255, 0, 0, 1)',
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            tension: 0.1,
            borderWidth: isPreview ? 1 : 2,
            pointRadius: 0
        }
    ];
    
    const hbrDatasets = [
        {
            label: 'Before SD',
            data: hbrBeforeData,
            borderColor: 'rgba(0, 123, 255, 1)',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            tension: 0.1,
            borderWidth: isPreview ? 1 : 2,
            pointRadius: 0
        },
        {
            label: 'After SD',
            data: hbrAfterData,
            borderColor: 'rgba(255, 0, 0, 1)',
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            tension: 0.1,
            borderWidth: isPreview ? 1 : 2,
            pointRadius: 0
        }
    ];
    
    // Calculate dynamic ranges
    const hboRange = calculateYRange(hboDatasets);
    const hbrRange = calculateYRange(hbrDatasets);
    
    // Create HbO plot
    new Chart(hboCanvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: Array.from({length: 1000}, (_, i) => i),
            datasets: hboDatasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                title: {
                    display: true,
                    text: `ΔHbO (Oxyhemoglobin) - Channel ${channel}`,
                    color: '#000',
                    font: {
                        size: isPreview ? 12 : 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: !isPreview,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: hboRange.min,
                    max: hboRange.max,
                    title: {
                        display: !isPreview,
                        text: 'Concentration (a.u.)',
                        font: {
                            size: 12
                        }
                    },
                    ticks: {
                        font: {
                            size: isPreview ? 8 : 10
                        }
                    }
                },
                x: {
                    min: 0,
                    max: 1000,
                    title: {
                        display: !isPreview,
                        text: 'Time (samples)',
                        font: {
                            size: 12
                        }
                    },
                    ticks: {
                        font: {
                            size: isPreview ? 8 : 10
                        }
                    }
                }
            },
            elements: {
                line: {
                    tension: 0.1
                }
            }
        }
    });
    
    // Create HbR plot
    new Chart(hbrCanvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: Array.from({length: 1000}, (_, i) => i),
            datasets: hbrDatasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                title: {
                    display: true,
                    text: `ΔHbR (Deoxyhemoglobin) - Channel ${channel}`,
                    color: '#000',
                    font: {
                        size: isPreview ? 12 : 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: !isPreview,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: hbrRange.min,
                    max: hbrRange.max,
                    title: {
                        display: !isPreview,
                        text: 'Concentration (a.u.)',
                        font: {
                            size: 12
                        }
                    },
                    ticks: {
                        font: {
                            size: isPreview ? 8 : 10
                        }
                    }
                },
                x: {
                    min: 0,
                    max: 1000,
                    title: {
                        display: !isPreview,
                        text: 'Time (samples)',
                        font: {
                            size: 12
                        }
                    },
                    ticks: {
                        font: {
                            size: isPreview ? 8 : 10
                        }
                    }
                }
            },
            elements: {
                line: {
                    tension: 0.1
                }
            }
        }
    });
}