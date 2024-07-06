
    const skyboxLoader = new THREE.CubeTextureLoader();
    skyboxLoader.setPath('https://cdn.jsdelivr.net/gh/badteam123/assets@1e44434dc9a08e01d90c658f89e512a19bdffc5d/skybox/');

    const skybox1 = skyboxLoader.load([
      'Front-min.png', 'Back-min.png',
      'Top-min.png', 'Bottom-min.png',
      'Left-min.png', 'Right-min.png'
    ]);
    
    const skybox2 = skyboxLoader.load([
      'Dark-front-min.png', 'Dark-left-min.png',
      'Dark-top-min.png', 'Dark-bottom-min.png',
      'Dark-right-min.png', 'Dark-back-min.png'
    ]);
    
    scene.background = skybox1;
const vertexShader = `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform samplerCube skybox1;
  uniform samplerCube skybox2;
  uniform float transitionFactor;
  varying vec3 vWorldPosition;

  void main() {
    vec3 texCoords = normalize(vWorldPosition);
    vec4 tex1 = textureCube(skybox1, texCoords);
    vec4 tex2 = textureCube(skybox2, texCoords);
    gl_FragColor = mix(tex1, tex2, transitionFactor);
  }
`;

const uniforms = {
  skybox1: { value: skybox1 },
  skybox2: { value: skybox2 },
  transitionFactor: { value: 0.0 }
};

const skyboxMaterial = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: uniforms,
  side: THREE.BackSide
});

const skyboxGeometry = new THREE.BoxGeometry(1, 1, 1);
const skyboxMesh = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
scene.add(skyboxMesh);

const transitionDuration = 3.0; // Duration in seconds
let transitionStartTime = null;

function startTransition() {
  transitionStartTime = performance.now();
}

function updateTransition() {
  if (transitionStartTime === null) return;

  const elapsed = (performance.now() - transitionStartTime) / 1000;
  const factor = Math.min(elapsed / transitionDuration, 1.0);

  skyboxMaterial.uniforms.transitionFactor.value = factor;

  if (factor >= 1.0) {
    // Transition completed, stop updating and set the final skybox
    transitionStartTime = null;
    scene.background = skybox2; // Set the final skybox
    scene.remove(skyboxMesh); // Remove the blending mesh
  }
}

// Call startTransition() to begin the transition
startTransition();

// Update the transition in your animation loop
function animate() {
  requestAnimationFrame(animate);
  updateTransition();
  renderer.render(scene, camera);
}

animate();