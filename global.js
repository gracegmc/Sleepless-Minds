// This is a global JavaScript file that runs on every page
console.log("JS IS RUNNING");

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Scroll indicator functionality
function scrollToNextSection() {
    const brainSection = document.getElementById('intro-data'); // linking arrow to intro data page
    const brainSectionTop = brainSection.offsetTop;
    window.scrollTo({
        top: brainSectionTop,
        behavior: 'auto'
    });
}

// Smooth scrolling
document.addEventListener('DOMContentLoaded', function() {
    // Make scroll indicator clickable - MOVED INSIDE DOMContentLoaded
    const scrollIndicator = document.getElementById('scroll-down');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', scrollToNextSection);
    }

    // Add scroll-triggered animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

    document.querySelectorAll('.section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(50px)';
        section.style.transition = 'all 0.8s ease';
        observer.observe(section);
    });
});

// cantab_chart.js
fetch('data/cantab_summary_data.json')
  .then(response => response.json())
  .then(data => {
    const ctx = document.getElementById('cantabChart').getContext('2d');

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          label: '% Change After Sleep Deprivation',
          data: data.map(d => d.value),
          backgroundColor: data.map(d =>
            d.value < -25 ? '#ff6b6b' : d.value < 0 ? '#ffa94d' : '#66d9e8'
          ),
          borderRadius: 5
        }]
      },
      options: {
        responsive: true,
        scales: {
  y: {
    beginAtZero: true,
    grid: {
      color: function(ctx) {
        // Highlight the zero line
        return ctx.tick.value === 0 ? '#ffffff' : 'rgba(255,255,255,0.1)';
      },
      lineWidth: function(ctx) {
        return ctx.tick.value === 0 ? 2 : 1;
      }
    },
    ticks: {
      color: '#ffffff',
      callback: val => val + '%'
    },
    title: {
      display: true,
      text: '% Change in Cognitive Performance',
      color: '#ffffff'
    }
  },
  x: {
    grid: {
      display: false
    },
    ticks: {
      color: '#ffffff'
    }
  }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.raw}%`;
              }
            }
          }
        }
      }
    });
  })
  .catch(error => console.error('Error loading JSON:', error));
