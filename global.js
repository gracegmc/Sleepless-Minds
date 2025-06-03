// This is a global JavaScript file that runs on every page
console.log("JS IS RUNNING");

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Scroll indicator functionality
function scrollToNextSection() {
    const brainSection = document.getElementById('brain-section');
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