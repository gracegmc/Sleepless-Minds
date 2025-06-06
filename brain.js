import * as THREE from 'https://esm.sh/three@0.155.0';
import { GLTFLoader } from 'https://esm.sh/three@0.155.0/examples/jsm/loaders/GLTFLoader.js';


const canvas = document.getElementById('brainCanvas');
const tooltip = document.getElementById('tooltip');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 2, 3);
scene.add(light);

// Load brain model
const loader = new GLTFLoader();
let brainModel;
loader.load('brain.glb', function (gltf) {
  brainModel = gltf.scene;
  scene.add(brainModel);
}, undefined, function (error) {
  console.error(error);
});

// Camera
camera.position.z = 2;

// Mouse move listener
let lastMouseEvent;
window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  lastMouseEvent = event;
});

// Initialize brain visualization
function initBrainViz() {
  // render a 3D brain
  // call addNodes()
}

function addNodes(){
  // adds highlighted nodes based on dataset
}

function updateBrainVisuals(isDeprived) {
  if (!brainModel) return;
  brainModel.traverse((child) => {
    if (child.isMesh) {
      child.material.color.set(isDeprived ? 0x888888 : 0x4a90e2);
    }
  });
}

// State switching functionality
function switchBrainState(isDeprived) {
  const brainContainer = document.getElementById('brain-viz');
  const insightText = document.getElementById('insight-text');
  const bars = document.querySelectorAll('.bar-fill');
  const values = document.querySelectorAll('.metric-value');

  if (isDeprived) {
      brainContainer.classList.add('sleep-deprived');
      insightText.textContent = "After 24 hours of sleep deprivation, neural activity becomes irregular and diminished. Neurovascular coupling responses are impaired, functional connectivity between brain regions weakens, and the prefrontal cortex shows reduced activation during cognitive tasks.";
      
      // Update cognitive performance bars
      bars.forEach((bar, index) => {
          const deprivedValue = bar.getAttribute('data-deprived');
          bar.style.width = deprivedValue + '%';
          values[index].textContent = deprivedValue + '%';
      });
      updateBrainVisuals(isDeprived);
  } else {
      brainContainer.classList.remove('sleep-deprived');
      insightText.textContent = "The well-rested brain shows robust neural activity across the prefrontal cortex, with strong connections between different brain regions. Neural oscillations are synchronized, and neurovascular coupling responses are optimal for cognitive tasks.";
      
      // Update cognitive performance bars
      bars.forEach((bar, index) => {
          const restedValue = bar.getAttribute('data-rested');
          bar.style.width = restedValue + '%';
          values[index].textContent = restedValue + '%';
      });
  }
}

// Event listeners
document.getElementById('rested-btn').addEventListener('click', function() {
  document.querySelectorAll('.state-button').forEach(btn => btn.classList.remove('active'));
  this.classList.add('active');
  switchBrainState(false);
});

document.getElementById('deprived-btn').addEventListener('click', function() {
  document.querySelectorAll('.state-button').forEach(btn => btn.classList.remove('active'));
  this.classList.add('active');
  switchBrainState(true);
});

// Animate
function animate() {
  requestAnimationFrame(animate);
  if (brainModel) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(brainModel.children, true);
    
    if (intersects.length > 0 && lastMouseEvent) {
      tooltip.style.display = 'block';
      tooltip.style.left = lastMouseEvent.clientX + 10 + 'px';
      tooltip.style.top = lastMouseEvent.clientY + 10 + 'px';
      tooltip.innerHTML = intersects[0].object.name || 'Brain Region';
    } else {
      tooltip.style.display = 'none';
    }    
  }

  renderer.render(scene, camera);
}
animate();
