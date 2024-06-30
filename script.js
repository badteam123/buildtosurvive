const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.01, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.shadowMap.enabled = false;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = false;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add directional light

const sunLight = new THREE.DirectionalLight(0xffffff, 0.5);
sunLight.position.set(40, 100, 16);
//sunLight.castShadow = true;
scene.add(sunLight);
scene.add(sunLight.target);
sunLight.target.position.set(0, 0, 0);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const skyboxLoader = new THREE.CubeTextureLoader();
skyboxLoader.setPath('https://cdn.jsdelivr.net/gh/badteam123/assets@567fe90f85f0ec5a7873dfe5b346438b7cc90afb/skybox/');

const skybox = skyboxLoader.load([
  'Front-min.png', 'Back-min.png',
  'Top-min.png', 'Bottom-min.png',
  'Left-min.png', 'Right-min.png'
]);

scene.background = skybox;

var world = new World();

const perlin2D = new PerlinNoise2D(world.seed);
const perlin3D = new PerlinNoise3D(world.seed);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

const generator = new Worker('generateThread.js');
var generatorReady = true;
var ignoreGen1 = false;

const generator2 = new Worker('generateThread.js');
var generator2Ready = true;
var ignoreGen2 = false;

const playerHeight = 1.8;
const playerWidth = playerHeight * 0.3;
const halfHeight = playerHeight * 0.5;
const halfWidth = playerWidth * 0.5;
const stepHeight = 0.6;

const speed = 0.00007;
const gravity = 0.000024;
const jumpHeight = 0.008;
const dampening = 0.012;

var mouse = {
  l: false,
  r: false,
  m: false
}

var player = {
  x: world.chunkSize / 2,
  y: perlin2D.noise((world.chunkSize / 2) * world.ground.scale + 100, (world.chunkSize / 2) * world.ground.scale + 100) * world.ground.height,
  z: world.chunkSize / 2,
  xVel: 0,
  yVel: 0,
  zVel: 0,
  r: 0,
  t: 0,

  facing: {
    x: 0,
    y: 0,
    z: 0,
    place: {
      x: 0,
      y: 0,
      z: 0
    },
    block: false,
    ray: null
  },

  camera: {
    x: 0,
    y: 0,
    z: 0,
  },

  health: {
    current: 100,
    max: 100,
    shown: 100
  },

  resources: {
    wood: 100,
    stone: 100
  }
};

var smoothFps = 0;

function preload() {
  hudsprites.image = loadImage('https://cdn.jsdelivr.net/gh/badteam123/assets@ef9adc24840dd4b3299a203a73c71ff8fc649d6d/pixelart/hudspritesheet.png');
}

var blockTex;
var grassTex;
var platformTex;

function setup() {
  defineImages(); // needed cause it can't run in preload (cringe)

  var cnv = createCanvas(window.innerWidth, window.innerHeight);
  cnv.position(0, 0);
  pixelDensity(1);
  noSmooth();
  frameRate(999999);

  blockTex = new THREE.TextureLoader().load(`https://cdn.jsdelivr.net/gh/badteam123/assets@3954b72ff0df391a017a3fd0e952babc5013de4d/texsheet.png`);
  blockTex.magFilter = THREE.NearestFilter;
  blockTex.minFilter = THREE.NearestFilter;
  blockTex.wrapS = THREE.RepeatWrapping;
  blockTex.wrapT = THREE.RepeatWrapping;

  world.generateNearby();

}

function draw() {

  if (deltaTime > 60) {
    deltaTime = 60;
  }

  switch (-keyIsDown(87) + keyIsDown(83) + (keyIsDown(65) * 10) + -(keyIsDown(68) * 10) + 11) {
    case 11://no
      break;
    case 10://W
      player.zVel -= (Math.cos(player.r) * speed) * deltaTime;
      player.xVel -= (Math.sin(player.r) * speed) * deltaTime;
      break;
    case 20://WD
      player.zVel -= (Math.cos(player.r + (PI * 0.25)) * speed) * deltaTime;
      player.xVel -= (Math.sin(player.r + (PI * 0.25)) * speed) * deltaTime;
      break;
    case 21://D
      player.zVel -= (Math.cos(player.r + (PI * 0.5)) * speed) * deltaTime;
      player.xVel -= (Math.sin(player.r + (PI * 0.5)) * speed) * deltaTime;
      break;
    case 22://SD
      player.zVel -= (Math.cos(player.r + (PI * 0.75)) * speed) * deltaTime;
      player.xVel -= (Math.sin(player.r + (PI * 0.75)) * speed) * deltaTime;
      break;
    case 12://S
      player.zVel -= (Math.cos(player.r + (PI)) * speed) * deltaTime;
      player.xVel -= (Math.sin(player.r + (PI)) * speed) * deltaTime;
      break;
    case 2://SA
      player.zVel -= (Math.cos(player.r + (PI * 1.25)) * speed) * deltaTime;
      player.xVel -= (Math.sin(player.r + (PI * 1.25)) * speed) * deltaTime;
      break;
    case 1://A
      player.zVel -= (Math.cos(player.r + (PI * 1.5)) * speed) * deltaTime;
      player.xVel -= (Math.sin(player.r + (PI * 1.5)) * speed) * deltaTime;
      break;
    case 0://WA
      player.zVel -= (Math.cos(player.r + (PI * 1.75)) * speed) * deltaTime;
      player.xVel -= (Math.sin(player.r + (PI * 1.75)) * speed) * deltaTime;
      break;
  }

  if (keyIsDown(32) && player.onGround) {
    player.yVel += jumpHeight;
    player.onGround = false;
  }

  if (Math.abs(player.yVel) > 0.02) {
    player.yVel = lerp(player.yVel, 0, 0.01 * deltaTime);
  }

  world.collide();

  if (player.xVel != 0) {
    player.x += (player.xVel) * deltaTime;
  }
  if (player.zVel != 0) {
    player.z += (player.zVel) * deltaTime;
  }
  if (player.yVel != 0) {
    player.y += (player.yVel) * deltaTime;
  }

  player.xVel = lerp(player.xVel, 0, (deltaTime * dampening));
  player.zVel = lerp(player.zVel, 0, (deltaTime * dampening));

  if (!isNaN(gravity * deltaTime)) {
    if (Math.abs(player.yVel - (gravity * deltaTime)) <= 0.000005) {
      player.yVel = 0;
    } else if (Math.abs(gravity * deltaTime) > 0.000006) {
      player.yVel -= gravity * deltaTime;
    }
  }

  if (generatorReady) {
    if (world.update.length >= 1) {
      if (!world.doesChunkExist(world.update[0][0], world.update[0][1])) {
        generatorReady = false;
        generator.postMessage({
          chunkSize: world.chunkSize,
          x: world.update[0][0],
          z: world.update[0][1],
          ground: world.ground,
          seed: world.seed
        });
        world.update.shift();
      } else {
        world.update.shift();
      }
    }
  }

  if (generator2Ready) {
    if (world.update.length >= 1) {
      if (!world.doesChunkExist(world.update[0][0], world.update[0][1])) {
        generator2Ready = false;
        generator2.postMessage({
          chunkSize: world.chunkSize,
          x: world.update[0][0],
          z: world.update[0][1],
          ground: world.ground,
          seed: world.seed
        });
        world.update.shift();
      } else {
        world.update.shift();
      }
    }
  }

  camera.rotateX(-player.t);
  camera.rotateY(-player.r);

  let rotateCam = 0;
  let tiltCam = 0;

  rotateCam = (round(-movedX, 4) * 0.003);
  tiltCam = (round(movedY, 4) * 0.003);

  player.r += (rotateCam * deltaTime) / 8;
  player.t -= (tiltCam * deltaTime) / 8;

  if (player.t >= 1.45) {
    player.t = 1.45;
  } else if (player.t <= -1.45) {
    player.t = -1.45;
  }

  if (player.r > Math.PI) {
    player.r -= Math.PI * 2;
  } else if (player.r < -Math.PI) {
    player.r += Math.PI * 2;
  }
  camera.rotateY(player.r);
  camera.rotateX(player.t);

  if (isNaN(smoothFps)) {
    smoothFps = 60;
  }
  if (deltaTime != undefined) {
    smoothFps = lerp(smoothFps, (1000 / deltaTime), 0.005 * deltaTime);
  }

  player.camera = {
    x: player.x,
    y: player.y + (halfHeight / 2),
    z: player.z
  }

  camera.position.x = player.camera.x;
  camera.position.y = player.camera.y;
  camera.position.z = player.camera.z;
  camera.aspect = window.innerWidth / window.innerHeight;

  updateBlockFacing();

  camera.updateProjectionMatrix();

  for (let p = 0; p < players.length; p++) {
    if(players[p].pos != undefined && players[p].bos != undefined){
      players[p].bos[0] += players[p].vel[0] * deltaTime;
      players[p].bos[1] += players[p].vel[1] * deltaTime;
      players[p].bos[2] += players[p].vel[2] * deltaTime;
      displayedPlayers[players[p].pid].position.set(players[p].bos[0], players[p].bos[1], players[p].bos[2]);
    }
  }

  hud();

}

function updateBlockFacing() {

  player.facing.ray = new THREE.Raycaster();
  player.facing.ray.setFromCamera(new THREE.Vector2(0, 0), camera);
  let intersects = player.facing.ray.intersectObjects(scene.children, true);

  if (intersects.length >= 1) {
    player.facing.x = Math.floor(intersects[0].point.x - (intersects[0].face.normal.x * 0.5));
    player.facing.y = Math.floor(intersects[0].point.y - (intersects[0].face.normal.y * 0.5));
    player.facing.z = Math.floor(intersects[0].point.z - (intersects[0].face.normal.z * 0.5));
    player.facing.place.x = Math.floor(intersects[0].point.x + (intersects[0].face.normal.x * 0.5));
    player.facing.place.y = Math.floor(intersects[0].point.y + (intersects[0].face.normal.y * 0.5));
    player.facing.place.z = Math.floor(intersects[0].point.z + (intersects[0].face.normal.z * 0.5));
    player.facing.block = true;
  } else {
    player.facing.block = false;
  }

}

function keyPressed() {
  switch (keyCode) {
    case 69:
      player.health.current -= random(1, 10);
      break;
  }
}

function reloadGame(){
  world.seed = serverData.seed;
  perlin2D = new PerlinNoise2D(world.seed);
  perlin3D = new PerlinNoise3D(world.seed);
  player.x = world.chunkSize / 2;
  player.y = perlin2D.noise((world.chunkSize / 2) * world.ground.scale + 100, (world.chunkSize / 2) * world.ground.scale + 100) * world.ground.height;
  player.z = world.chunkSize / 2;
  player.xVel = 0;
  player.yVel = 0;
  player.zVel = 0;
  world.unloadAll();
  world.update = [];
  world.generateNearby();
  if(!generatorReady){
    ignoreGen1 = true;
  }
  if(!generator2Ready){
    ignoreGen2 = true;
  }
}

function windowResized() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  resizeCanvas(window.innerWidth, window.innerHeight);
}

document.addEventListener("mousedown", function (event) {
  if (event.button === 0) { // Left mouse button
    requestPointerLock();
    mouse.l = true;
  }
  if (event.button === 2) { // Right mouse button
    if (player.facing.block) {
      world.addBlock(player.facing.place.x, player.facing.place.y, player.facing.place.z, "grass");
    }
    mouse.r = true;
  }
  if (event.button === 1) { // Middle mouse button
    mouse.m = true;
  }
});

document.addEventListener("mouseup", function (event) {
  if (event.button === 0) { // Left mouse button
    mouse.l = false;
  }
  if (event.button === 2) { // Right mouse button
    mouse.r = false;
  }
  if (event.button === 1) { // Middle mouse button
    mouse.m = false;
  }
});

generator.onmessage = function (e) {
  if(!ignoreGen1){
    world.processChunk(e.data);
  }
  ignoreGen1 = false;
  generatorReady = true;
}

generator2.onmessage = function (e) {
  if(!ignoreGen2){
    world.processChunk(e.data);
  }
  ignoreGen2 = false;
  generator2Ready = true;
}