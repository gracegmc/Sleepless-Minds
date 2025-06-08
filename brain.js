//Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// To allow for importing the .gltf file
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Get the container element
const container = document.getElementById("container3D");
const containerWidth = container.clientWidth;
const containerHeight = container.clientHeight;

//Create a Three.JS Scene
const scene = new THREE.Scene();
//create a new camera with positions and angles - use container dimensions
const camera = new THREE.PerspectiveCamera(35, containerWidth / containerHeight, 0.1, 1000);

//Keep track of the mouse position, so we can make the eye move
let mouseX = containerWidth / 2;
let mouseY = containerHeight / 2;

//Keep the 3D object on a global variable so we can access it later
let object;

//OrbitControls allow the camera to move around the scene
let controls;

//Set which object to render
let objToRender = 'brain_hologram';

//Instantiate a loader for the .gltf file
const loader = new GLTFLoader();

//Load the file
loader.load(
  `assets/${objToRender}/scene.gltf`,
  function (gltf) {
    //If the file is loaded, add it to the scene
    object = gltf.scene;
    //Scale the object to make it bigger
    object.scale.set(2, 2, 2);
    //Position the brain lower in the container
    object.position.y = -1;
    scene.add(object);
  },
  function (xhr) {
    //While it is loading, log the progress
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function (error) {
    //If there is an error, log it
    console.error(error);
  }
);

//Instantiate a new renderer and set its size to container dimensions
const renderer = new THREE.WebGLRenderer({ alpha: true }); //Alpha: true allows for the transparent background
renderer.setSize(containerWidth, containerHeight);

//Add the renderer to the DOM
container.appendChild(renderer.domElement);

//Set how far the camera will be from the 3D model - moved closer to make brain bigger
camera.position.z = objToRender === "brain_hologram" ? 5 : 500;

//Add lights to the scene, so we can actually see the 3D model
const topLight = new THREE.DirectionalLight(0xffffff, 1); // (color, intensity)
topLight.position.set(500, 500, 500) //top-left-ish
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, objToRender === "brain_hologram" ? 2.5 : 1);
scene.add(ambientLight);

//This adds controls to the camera, so we can rotate / zoom it with the mouse  
if (objToRender === "brain_hologram") {
  controls = new OrbitControls(camera, renderer.domElement);
  // Configure OrbitControls for better interaction
  controls.enableDamping = true; // Smooth camera movement
  controls.dampingFactor = 0.05;
  controls.enableZoom = true; // Allow zoom with scroll wheel
  controls.enableRotate = true; // Allow rotation with mouse drag
  controls.enablePan = false; // Disable panning to keep brain centered
  controls.autoRotate = false; // Disable auto rotation
}

//Render the scene
function animate() {
  requestAnimationFrame(animate);
  
  // Update controls for smooth damping
  if (controls) {
    controls.update();
  }
  
  renderer.render(scene, camera);
}

//Add a listener to the window, so we can resize the window and the camera
window.addEventListener("resize", function () {
  const newWidth = container.clientWidth;
  const newHeight = container.clientHeight;
  
  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(newWidth, newHeight);
});

//Start the 3D rendering
animate();