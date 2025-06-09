// plotly_plots.js - JavaScript for handling Plotly plot integration

// Available subjects and plot types
const SUBJECTS = ['001', '003', '004', '005', '006', '007', '008', '009'];
const PLOT_TYPES = {
    'single_channel': {
        name: 'Single Channel Analysis',
        description: 'Hemodynamic response from a single fNIRS channel (Channel 1), showing raw HbO and HbR changes.',
        badge: 'Channel 1'
    },
    'frontal': {
        name: 'Frontal Cortex',
        description: 'Average hemodynamic response across all frontal cortex channels, related to executive function and decision-making.',
        badge: '24 channels'
    },
    'motor': {
        name: 'Motor Cortex', 
        description: 'Average hemodynamic response across motor cortex channels, related to movement control and coordination.',
        badge: '24 channels'
    },
    'parietal': {
        name: 'Parietal Cortex',
        description: 'Average hemodynamic response across parietal cortex channels, related to spatial processing and attention.',
        badge: '1 channel'
    }
};

// Current selections
let currentSubject = '001';
let currentPlotType = 'single_channel';

// DOM elements
let subjectSelector, /*plotTypeSelector,*/ mainIframe, plotLoading, plotError, plotDescription;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    setupEventListeners();
    updateThumbnails();
    updatePlotDescription();
});

function initializeElements() {
    subjectSelector = document.getElementById('subject-selector');
    // plotTypeSelector = document.getElementById('plot-type-selector');
    mainIframe = document.getElementById('main-plot-iframe');
    plotLoading = document.getElementById('plot-loading');
    plotError = document.getElementById('plot-error');
    plotDescription = document.getElementById('plot-description-text');
    
    // Validate that all elements exist
    if (!subjectSelector || !mainIframe) {
        console.error('Required DOM elements not found');
        return;
    }
    
    console.log('Plotly plots interface initialized');
}

function setupEventListeners() {
    // Subject selector change
    if (subjectSelector) {
        subjectSelector.addEventListener('change', (e) => {
            currentSubject = e.target.value;
            console.log(`Selected subject: ${currentSubject}`);
            loadMainPlot();
            updateThumbnails();
        });
    }
    
    // // Plot type selector change
    // if (plotTypeSelector) {
    //     plotTypeSelector.addEventListener('change', (e) => {
    //         currentPlotType = e.target.value;
    //         console.log(`Selected plot type: ${currentPlotType}`);
    //         loadMainPlot();
    //         updatePlotDescription();
    //         highlightActiveThumbnail();
    //     });
    // }
    
    // Thumbnail click handlers
    setupThumbnailClickHandlers();
}

function setupThumbnailClickHandlers() {
    const thumbnails = document.querySelectorAll('.plot-thumbnail');
    
    thumbnails.forEach(thumbnail => {
        // thumbnail.addEventListener('click', () => {
        //     const plotType = thumbnail.dataset.type;
        //     if (plotType && PLOT_TYPES[plotType]) {
        //         currentPlotType = plotType;
        //         plotTypeSelector.value = plotType;
        //         loadMainPlot();
        //         updatePlotDescription();
        //         highlightActiveThumbnail();
        //     }
        // });
        
        // Add hover effects
        thumbnail.addEventListener('mouseenter', () => {
            thumbnail.style.transform = 'translateY(-5px)';
            thumbnail.style.boxShadow = '0 8px 25px rgba(74, 144, 226, 0.3)';
        });
        
        thumbnail.addEventListener('mouseleave', () => {
            thumbnail.style.transform = 'translateY(0)';
            thumbnail.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
        });
    });
}

function loadMainPlot() {
    if (!mainIframe) return;
    
    // Show loading state
    showLoading(true);
    
    // Construct the plot file path
    const fileName = getPlotFileName(currentSubject, currentPlotType);
    const plotPath = `website_plots/${fileName}`;
    
    console.log(`Loading plot: ${plotPath}`);
    
    // Create a temporary iframe to test if the file exists
    const testIframe = document.createElement('iframe');
    testIframe.style.display = 'none';
    testIframe.src = plotPath;
    
    testIframe.onload = () => {
        // File exists, load it in the main iframe
        mainIframe.src = plotPath;
        showLoading(false);
        showError(false);
        document.body.removeChild(testIframe);
    };
    
    testIframe.onerror = () => {
        // File doesn't exist, show error
        console.error(`Plot file not found: ${plotPath}`);
        showLoading(false);
        showError(true);
        document.body.removeChild(testIframe);
    };
    
    // Add test iframe to document
    document.body.appendChild(testIframe);
    
    // Fallback timeout
    setTimeout(() => {
        if (document.body.contains(testIframe)) {
            console.warn(`Timeout loading plot: ${plotPath}`);
            mainIframe.src = plotPath; // Load anyway
            showLoading(false);
            document.body.removeChild(testIframe);
        }
    }, 3000);
}

function getPlotFileName(subject, plotType) {
    if (plotType === 'single_channel') {
        return `subject_${subject}_single_channel.html`;
    } else {
        return `subject_${subject}_${plotType}_region.html`;
    }
}

function updateThumbnails() {
    const thumbnails = document.querySelectorAll('.plot-thumbnail');
    
    thumbnails.forEach(thumbnail => {
        const plotType = thumbnail.dataset.type;
        if (plotType) {
            const iframe = thumbnail.querySelector('.thumbnail-iframe');
            if (iframe) {
                const fileName = getPlotFileName(currentSubject, plotType);
                iframe.src = `website_plots/${fileName}`;
            }
            
            // Update badge with current subject info
            const badge = thumbnail.querySelector('.thumbnail-badge');
            if (badge && currentPlotType) {
                badge.textContent = currentPlotType.badge;
            }
        }
    });
    
    highlightActiveThumbnail();
}

function highlightActiveThumbnail() {
    const thumbnails = document.querySelectorAll('.plot-thumbnail');
    
    thumbnails.forEach(thumbnail => {
        const plotType = thumbnail.dataset.type;
        if (plotType === currentPlotType) {
            thumbnail.classList.add('active');
        } else {
            thumbnail.classList.remove('active');
        }
    });
}

function updatePlotDescription() {
    if (!plotDescription || !PLOT_TYPES[currentPlotType]) return;
    
    const plotInfo = PLOT_TYPES[currentPlotType];
    plotDescription.innerHTML = `
        <strong>${plotInfo.name}:</strong> ${plotInfo.description}<br>
        <em>Blue lines = Before sleep deprivation, Red lines = After sleep deprivation</em><br>
        Hover over lines for exact values, zoom in/out, and click legend items to toggle traces.
    `;
}

function showLoading(show) {
    if (plotLoading) {
        plotLoading.style.display = show ? 'flex' : 'none';
    }
    if (mainIframe) {
        mainIframe.style.display = show ? 'none' : 'block';
    }
}

function showError(show) {
    if (plotError) {
        plotError.style.display = show ? 'flex' : 'none';
    }
    if (mainIframe) {
        mainIframe.style.display = show ? 'none' : 'block';
    }
}

// Export functions for debugging
window.plotlyPlotsDebug = {
    loadMainPlot,
    updateThumbnails,
    currentSubject: () => currentSubject,
    currentPlotType: () => currentPlotType,
    availableSubjects: SUBJECTS,
    availablePlotTypes: Object.keys(PLOT_TYPES)
};

console.log('Plotly plots JavaScript loaded successfully');
console.log('Available subjects:', SUBJECTS);
console.log('Available plot types:', Object.keys(PLOT_TYPES));