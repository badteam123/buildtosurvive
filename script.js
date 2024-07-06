const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.01, 1000);
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

var placementPreview = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0x222222, transparent: true, opacity: 0.8, visible: false}));
scene.add(placementPreview);

var world;

var build = new Build();

// if seed in cache then
// world = new World(seed);
// else
world = new World();

const perlin2D = new PerlinNoise2D(world.seed);
const perlin3D = new PerlinNoise3D(world.seed);

var finishedGenerating = false;

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

const generator = new Worker('generateThread.js');
var generatorReady = true;

const generator2 = new Worker('generateThread.js');
var generator2Ready = true;

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
    wood: {
      a: 500,
      i: "🪵",
    },
    stone: {
      a: 100,
      i: "🪨",
    },
    gold: {
      a: 100,
      i: "🪙",
    }
  },

  placedCore: false
};

var smoothFps = 0;
var blockTexp5;

function preload() {
  hudsprites.image = loadImage('https://cdn.jsdelivr.net/gh/badteam123/assets@ef9adc24840dd4b3299a203a73c71ff8fc649d6d/pixelart/hudspritesheet.png');
  blockTexp5 = loadImage(`https://cdn.jsdelivr.net/gh/badteam123/assets@af86e142be1ffb3b055c1954bb14c1970705978b/texsheet.png`);
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

  blockTex = new THREE.TextureLoader().load(`https://cdn.jsdelivr.net/gh/badteam123/assets@af86e142be1ffb3b055c1954bb14c1970705978b/texsheet.png`);
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

  player.onGround = false;

  world.collideFloor();
  build.collideFloor();

  world.collide();
  build.collide();

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

  if (generatorReady && generator2Ready && world.update.length === 0) {
    finishedGenerating = true;
  }

  camera.rotateX(-player.t);
  camera.rotateY(-player.r);

  let rotateCam = 0;
  let tiltCam = 0;

  rotateCam = (round(-movedX, 4) * 0.003 * options.sensitivity);
  tiltCam = (round(movedY, 4) * 0.003 * options.sensitivity);

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

  for (let p in players) {
    if (players[p].pos != undefined && players[p].bos != undefined) {
      players[p].bos[0] += players[p].vel[0] * deltaTime;
      players[p].bos[1] += players[p].vel[1] * deltaTime;
      players[p].bos[2] += players[p].vel[2] * deltaTime;
      try {
        displayedPlayers[p].position.set(players[p].bos[0], players[p].bos[1], players[p].bos[2]);
      } catch (err) { }
    }
  }

  hud();

}

function updateBlockFacing() {

  player.facing.ray = new THREE.Raycaster();
  player.facing.ray.setFromCamera(new THREE.Vector2(0, 0), camera);
  let intersects = player.facing.ray.intersectObjects(scene.children, true);

    try{

      for(let i = 0; i < intersects.length; i++){
        if (intersects[i].object === placementPreview) {
          intersects.shift();
        }
      }
      
      var intersectionPoint = intersects[0].point;

      const newPosition = {
        x: Math.round(intersectionPoint.x + intersects[0].face.normal.x * .5),
        y: Math.round(intersectionPoint.y + intersects[0].face.normal.y * .5),
        z: Math.round(intersectionPoint.z + intersects[0].face.normal.z * .5)
      };

      placementPreview.position.x = Math.round(newPosition.x);
      placementPreview.position.y = Math.round(newPosition.y);
      placementPreview.position.z = Math.round(newPosition.z);
      placementPreview.material.opacity = (((sin(a) + 1) * .5) * 0.5) + 0.3;
      placementPreview.renderOrder = 9999999;

      if(buildMenu.open && intersects[0].distance <= 5){
        placementPreview.material.visible = true; 
      } else {
        placementPreview.material.visible = false;
      }
    } catch (err){}



  if (intersects.length >= 1) {
    if (intersects[0].distance <= 5) {
      player.facing.x = Math.round(intersects[0].point.x - (intersects[0].face.normal.x * 0.5));
      player.facing.y = Math.round(intersects[0].point.y - (intersects[0].face.normal.y * 0.5));
      player.facing.z = Math.round(intersects[0].point.z - (intersects[0].face.normal.z * 0.5));
      player.facing.place.x = Math.round(intersects[0].point.x + (intersects[0].face.normal.x * 0.5));
      player.facing.place.y = Math.round(intersects[0].point.y + (intersects[0].face.normal.y * 0.5));
      player.facing.place.z = Math.round(intersects[0].point.z + (intersects[0].face.normal.z * 0.5));
      player.facing.block = true;
    } else {
      player.facing.block = false;
    }
  } else {
    player.facing.block = false;
  }

}

function keyPressed() {
  switch (keyCode) {
    case 72:
      server.beginHost();
      break;
    case 81://q - Texture Menu
      buildMenu.open = !buildMenu.open;
      break;
  }
}

function windowResized() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  resizeCanvas(window.innerWidth, window.innerHeight);
}

function placeChecks() {
  let insideBlock = true;
  let insideBlockNext = true;
  let canAfford = false;

  if (player.resources.wood.a >= buildMenu.items[buildMenu.selection].cost.wood && player.resources.gold.a >= buildMenu.items[buildMenu.selection].cost.gold && player.resources.stone.a >= buildMenu.items[buildMenu.selection].cost.stone) {
    canAfford = true;
  }


  if (player.x <= player.facing.place.x - 0.5 - halfWidth || player.x >= player.facing.place.x + 0.5 + halfWidth) {
    insideBlock = false;
  }

  if (player.y <= player.facing.place.y - 0.5 - halfHeight || player.y >= player.facing.place.y + 0.5 + halfHeight) {
    insideBlock = false;
  }

  if (player.z <= player.facing.place.z - 0.5 - halfWidth || player.z >= player.facing.place.z + 0.5 + halfWidth) {
    insideBlock = false;
  }

  if (player.x + (player.xVel*deltaTime) <= player.facing.place.x - 0.5 - halfWidth || player.x + (player.xVel*deltaTime) >= player.facing.place.x + 0.5 + halfWidth) {
    insideBlockNext = false;
  }

  if (player.y + (player.yVel*deltaTime) <= player.facing.place.y - 0.5 - halfHeight || player.y + (player.yVel*deltaTime) >= player.facing.place.y + 0.5 + halfHeight) {
    insideBlockNext = false;
  }

  if (player.z + (player.zVel*deltaTime) <= player.facing.place.z - 0.5 - halfWidth || player.z + (player.zVel*deltaTime) >= player.facing.place.z + 0.5 + halfWidth) {
    insideBlockNext = false;
  }

  if (canAfford && !insideBlock && !insideBlockNext) {
    return true;
  }
  return false;
}

function mouseWheel(event) {
  if (buildMenu.open) {
    buildMenu.selection += Math.sign(event.delta);
    buildMenu.selection = Math.min(Math.max(buildMenu.selection, 0), buildMenu.items.length - 1);
    buildMenu.selectionName = buildMenu.items[buildMenu.selection].name;
  }
}

document.addEventListener("mousedown", function (event) {
  if (event.button === 0) { // Left mouse button
    requestPointerLock();
    mouse.l = true;
  }
  if (event.button === 2) { // Right mouse button
    if (player.facing.block && buildMenu.open) {
      if (placeChecks()) {
        build.addBlock(player.facing.place.x, player.facing.place.y, player.facing.place.z, buildMenu.selectionName);
        player.resources.gold.a -= buildMenu.items[buildMenu.selection].cost.gold;
        player.resources.wood.a -= buildMenu.items[buildMenu.selection].cost.wood;
        player.resources.stone.a -= buildMenu.items[buildMenu.selection].cost.stone;
      }
      build.compile();
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
  world.processChunk(e.data);
  generatorReady = true;
}

generator2.onmessage = function (e) {
  world.processChunk(e.data);
  generator2Ready = true;
}