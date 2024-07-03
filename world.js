class World {
  constructor() {
    this.chunk = {};
    this.chunkModel = {};
    this.chunkSize = 60;
    this.update = [];
    this.compileQueue = [];
    this.renderDistance = 3;
    this.seed = Math.floor(Math.random() * 65000);

    this.ground = {
      height: 6,
      offset: -5,
      scale: 0.03
    }

  }

  generate(xc, zc) {

    let alreadyExists = false;
    if (this.chunk[xc]) {
      if (Array.isArray(this.chunk[xc][zc])) {
        alreadyExists = true;
      }
    }

    if (!alreadyExists) {

      if (!this.chunk[xc]) {
        this.chunk[xc] = {};
      }
      if (!Array.isArray(this.chunk[xc][zc])) {
        this.chunk[xc][zc] = [];
      }
      if (!this.chunkModel[xc]) {
        this.chunkModel[xc] = {};
      }
      if (!this.chunkModel[xc][zc]) {
        this.chunkModel[xc][zc] = {};
      }

      for (let x = xc * this.chunkSize; x < (xc * this.chunkSize) + this.chunkSize; x++) {
        for (let z = zc * this.chunkSize; z < (zc * this.chunkSize) + this.chunkSize; z++) {
          this.addBlockRaw(x, Math.round(perlin2D.noise(x * this.ground.scale + 100, z * this.ground.scale + 100) * this.ground.height) + this.ground.offset, z, "grass");
        }
      }
    }

    this.compile(xc, zc);

  }

  collide() {

    //console.log(chunksToCheck.length)

    let chunksToCheck = [];

    for (let x = -1; x <= 1; x += 2) {
      for (let z = -1; z <= 1; z += 2) {
        let exists = false;
        let check = this.gc(player.x + (halfWidth * x), player.z + (halfWidth * z));

        for (let i = 0; i < chunksToCheck.length; i++) {
          if (check[0] === chunksToCheck[i][0] && check[1] === chunksToCheck[i][1]) {
            exists = true;
          }
        }

        if (!exists) {
          chunksToCheck.push([check[0], check[1]]);
        }
      }
    }

    for (let x = -1; x <= 1; x += 2) {
      for (let z = -1; z <= 1; z += 2) {
        let exists = false;
        let check = this.gc(player.x + (halfWidth * x) + (player.xVel * deltaTime), player.z + (halfWidth * z) + (player.zVel * deltaTime));

        for (let i = 0; i < chunksToCheck.length; i++) {
          if (check[0] === chunksToCheck[i][0] && check[1] === chunksToCheck[i][1]) {
            exists = true;
          }
        }

        if (!exists) {
          chunksToCheck.push([check[0], check[1]]);
        }
      }
    }

    //console.log(chunksToCheck.length)

    for (let c = 0; c < chunksToCheck.length; c++) {
      if (this.chunk[chunksToCheck[c][0]]) {
        if (Array.isArray(this.chunk[chunksToCheck[c][0]][chunksToCheck[c][1]])) {
          let lngth = this.chunk[chunksToCheck[c][0]][chunksToCheck[c][1]].length;
          for (let b = 0; b < lngth; b++) {
            this.chunk[chunksToCheck[c][0]][chunksToCheck[c][1]][b].collide();
          }
        }
      }
    }

  }

  collideFloor() {

    //console.log(chunksToCheck.length)

    let chunksToCheck = [];

    for (let x = -1; x <= 1; x += 2) {
      for (let z = -1; z <= 1; z += 2) {
        let exists = false;
        let check = this.gc(player.x + (halfWidth * x), player.z + (halfWidth * z));

        for (let i = 0; i < chunksToCheck.length; i++) {
          if (check[0] === chunksToCheck[i][0] && check[1] === chunksToCheck[i][1]) {
            exists = true;
          }
        }

        if (!exists) {
          chunksToCheck.push([check[0], check[1]]);
        }
      }
    }

    for (let x = -1; x <= 1; x += 2) {
      for (let z = -1; z <= 1; z += 2) {
        let exists = false;
        let check = this.gc(player.x + (halfWidth * x) + (player.xVel * deltaTime), player.z + (halfWidth * z) + (player.zVel * deltaTime));

        for (let i = 0; i < chunksToCheck.length; i++) {
          if (check[0] === chunksToCheck[i][0] && check[1] === chunksToCheck[i][1]) {
            exists = true;
          }
        }

        if (!exists) {
          chunksToCheck.push([check[0], check[1]]);
        }
      }
    }

    //console.log(chunksToCheck.length)

    for (let c = 0; c < chunksToCheck.length; c++) {
      if (this.chunk[chunksToCheck[c][0]]) {
        if (Array.isArray(this.chunk[chunksToCheck[c][0]][chunksToCheck[c][1]])) {
          let lngth = this.chunk[chunksToCheck[c][0]][chunksToCheck[c][1]].length;
          for (let b = 0; b < lngth; b++) {
            this.chunk[chunksToCheck[c][0]][chunksToCheck[c][1]][b].collideFloor();
          }
        }
      }
    }

  }

  // Generalize gc function to handle both (x, y, z) and single num
  gc(x, z) {
    x += 0.5;
    z += 0.5;
    if (arguments.length === 2) {
      return [Math.floor(x / this.chunkSize), Math.floor(z / this.chunkSize)];
    } else if (arguments.length === 1) {
      return Math.floor(x / this.chunkSize);
    }
  }

  doesChunkExist(x, z) {
    if (this.chunk[x]) {
      if (Array.isArray(this.chunk[x][z])) {
        return true;
      }
    }
    return false;
  }

  addBlock(x, y, z, tex) {
    let ch = this.gc(x, z);

    if (!this.chunk[ch[0]]) {
      this.chunk[ch[0]] = {};
    }
    if (!Array.isArray(this.chunk[ch[0]][ch[1]])) {
      this.chunk[ch[0]][ch[1]] = [];
    }
    if (!this.chunkModel[ch[0]]) {
      this.chunkModel[ch[0]] = {};
    }
    if (!this.chunkModel[ch[0]][ch[1]]) {
      this.chunkModel[ch[0]][ch[1]] = {};
    }
    this.chunk[ch[0]][ch[1]].push(new Block(x, y, z, tex));
  }

  addBlockNew(x, y, z, tex) {
    let ch = this.gc(x, z);

    if (!this.chunk[ch[0]]) {
      this.chunk[ch[0]] = {};
    }
    if (!Array.isArray(this.chunk[ch[0]][ch[1]])) {
      this.chunk[ch[0]][ch[1]] = [];
    }
    if (!this.chunkModel[ch[0]]) {
      this.chunkModel[ch[0]] = {};
    }
    if (!this.chunkModel[ch[0]][ch[1]]) {
      this.chunkModel[ch[0]][ch[1]] = {};
    }

    if(!this.checkForBlock(this.chunk[ch[0]][ch[1]], x, y, z)){
      this.chunk[ch[0]][ch[1]].push(new Block(x, y, z, tex));
    }
  }

  removeBlock(x, y, z) {
    let ch = this.gc(x, z);

    if (this.chunk[ch[0]]) {
      if (Array.isArray(this.chunk[ch[0]][ch[1]])) {
        let temp = this.chunk[ch[0]][ch[1]].length;
        for (let b = temp - 1; b >= 0; b--) {
          if (this.chunk[ch[0]][ch[1]][b].x === x && this.chunk[ch[0]][ch[1]][b].y === y && this.chunk[ch[0]][ch[1]][b].z === z) {
            this.chunk[ch[0]][ch[1]].splice(b, 1);
          }
        }
        this.compileChunk(ch[0], ch[1]);
      }
    }
  }

  unloadAll() {
    for (let x in this.chunk) {
      for (let z in this.chunk[x]) {
        scene.remove(this.chunkModel[x][z].model);
        this.chunkModel[x][z].model.material.dispose();
        this.chunkModel[x][z].model.geometry.dispose();
      }
    }
  }

  unloadChunk(x, z) {
    scene.remove(this.chunkModel[x][z].model);
    this.chunkModel[x][z].rendered = false;
  }

  loadChunk(x, z) {
    if (!this.chunkModel[x][z].rendered) {
      scene.add(this.chunkModel[x][z].model);
      this.chunkModel[x][z].rendered = true;
    }
  }

  addBlockRaw(x, y, z, tex) {
    let ch = this.gc(x, z);
    this.chunk[ch[0]][ch[1]].push(new Block(x, y, z, tex));
  }

  generateNearby() {

    let ch = this.gc(player.x, player.z);

    for (let x = -this.renderDistance; x <= this.renderDistance; x++) {
      for (let z = -this.renderDistance; z <= this.renderDistance; z++) {
        if (x === 0 && z === 0) {
          this.generate(ch[0] + x, ch[1] + z);
        } else {
          this.update.push([ch[0] + x, ch[1] + z]);
        }
      }
    }

  }

  checkForBlock(chunk, x, y, z) {
    let numBlocks = chunk.length;
    for (let i = 0; i < numBlocks; i++) {
      if (chunk[i].x === x && chunk[i].y === y && chunk[i].z === z) {
        return true;
      }
    }
    return false;
  }

  compile() {
    for (let x in this.chunk) {
      for (let z in this.chunk[x]) {

        if (this.chunkModel[x][z].model === undefined) {

        } else {
          scene.remove(this.chunkModel[x][z].model);
          this.chunkModel[x][z].model.geometry.dispose();
          this.chunkModel[x][z].model.material.dispose();
        }

        let vertices = [];
        let indices = [];
        let UVs = [];

        let totalIndices = 0;

        let chunk = this.chunk[x][z];

        let lngth = this.chunk[x][z].length;

        for (let b = 0; b < lngth; b++) {
          let block = chunk[b];

          // Back (z-)
          if (!this.checkForBlock(chunk, block.x, block.y, block.z - 1)) {
            vertices.push(block.x - 0.5, block.y - 0.5, block.z - 0.5);
            vertices.push(block.x - 0.5, block.y + 0.5, block.z - 0.5);
            vertices.push(block.x + 0.5, block.y + 0.5, block.z - 0.5);
            vertices.push(block.x + 0.5, block.y - 0.5, block.z - 0.5);
            UVs.push(block.lx, block.ly);
            UVs.push(block.lx, block.hy);
            UVs.push(block.hx, block.hy);
            UVs.push(block.hx, block.ly);
            indices.push(0 + totalIndices, 1 + totalIndices, 2 + totalIndices, 0 + totalIndices, 2 + totalIndices, 3 + totalIndices);
            totalIndices += 4;
          }


          // Front (z+)
          if (!this.checkForBlock(chunk, block.x, block.y, block.z + 1)) {
            vertices.push(block.x - 0.5, block.y - 0.5, block.z + 0.5);
            vertices.push(block.x - 0.5, block.y + 0.5, block.z + 0.5);
            vertices.push(block.x + 0.5, block.y + 0.5, block.z + 0.5);
            vertices.push(block.x + 0.5, block.y - 0.5, block.z + 0.5);
            UVs.push(block.lx, block.ly);
            UVs.push(block.lx, block.hy);
            UVs.push(block.hx, block.hy);
            UVs.push(block.hx, block.ly);
            indices.push(0 + totalIndices, 2 + totalIndices, 1 + totalIndices, 0 + totalIndices, 3 + totalIndices, 2 + totalIndices);
            totalIndices += 4;
          }

          // Left (x-)
          if (!this.checkForBlock(chunk, block.x - 1, block.y, block.z)) {
            vertices.push(block.x - 0.5, block.y + 0.5, block.z - 0.5);
            vertices.push(block.x - 0.5, block.y + 0.5, block.z + 0.5);
            vertices.push(block.x - 0.5, block.y - 0.5, block.z + 0.5);
            vertices.push(block.x - 0.5, block.y - 0.5, block.z - 0.5);
            UVs.push(block.hx, block.hy);
            UVs.push(block.lx, block.hy);
            UVs.push(block.lx, block.ly);
            UVs.push(block.hx, block.ly);
            indices.push(2 + totalIndices, 0 + totalIndices, 3 + totalIndices, 2 + totalIndices, 1 + totalIndices, 0 + totalIndices);
            totalIndices += 4;
          }

          // Right (x+)
          if (!this.checkForBlock(chunk, block.x + 1, block.y, block.z)) {
            vertices.push(block.x + 0.5, block.y + 0.5, block.z + 0.5);
            vertices.push(block.x + 0.5, block.y + 0.5, block.z - 0.5);
            vertices.push(block.x + 0.5, block.y - 0.5, block.z - 0.5);
            vertices.push(block.x + 0.5, block.y - 0.5, block.z + 0.5);
            UVs.push(block.hx, block.hy);
            UVs.push(block.lx, block.hy);
            UVs.push(block.lx, block.ly);
            UVs.push(block.hx, block.ly);
            indices.push(0 + totalIndices, 2 + totalIndices, 1 + totalIndices, 0 + totalIndices, 3 + totalIndices, 2 + totalIndices);
            totalIndices += 4;
          }

          // Bottom (y-)
          if (!this.checkForBlock(chunk, block.x, block.y - 1, block.z)) {
            vertices.push(block.x - 0.5, block.y - 0.5, block.z - 0.5);
            vertices.push(block.x - 0.5, block.y - 0.5, block.z + 0.5);
            vertices.push(block.x + 0.5, block.y - 0.5, block.z + 0.5);
            vertices.push(block.x + 0.5, block.y - 0.5, block.z - 0.5);
            UVs.push(block.lx, block.ly);
            UVs.push(block.lx, block.hy);
            UVs.push(block.hx, block.hy);
            UVs.push(block.hx, block.ly);
            indices.push(0 + totalIndices, 3 + totalIndices, 2 + totalIndices, 0 + totalIndices, 2 + totalIndices, 1 + totalIndices);
            totalIndices += 4;
          }

          // Top (y+)
          if (!this.checkForBlock(chunk, block.x, block.y + 1, block.z)) {
            vertices.push(block.x - 0.5, block.y + 0.5, block.z + 0.5);
            vertices.push(block.x - 0.5, block.y + 0.5, block.z - 0.5);
            vertices.push(block.x + 0.5, block.y + 0.5, block.z - 0.5);
            vertices.push(block.x + 0.5, block.y + 0.5, block.z + 0.5);
            UVs.push(block.lx, block.hy);
            UVs.push(block.lx, block.ly);
            UVs.push(block.hx, block.ly);
            UVs.push(block.hx, block.hy);
            indices.push(1 + totalIndices, 3 + totalIndices, 2 + totalIndices, 1 + totalIndices, 0 + totalIndices, 3 + totalIndices);
            totalIndices += 4;
          }
        }

        let vertices2 = new Float32Array(vertices);
        let indices2 = new Uint16Array(indices);
        let UVs2 = new Float32Array(UVs);

        let geometry = new THREE.BufferGeometry();

        geometry.setAttribute('position', new THREE.BufferAttribute(vertices2, 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(UVs2, 2));
        geometry.setIndex(new THREE.BufferAttribute(indices2, 1));

        geometry.computeVertexNormals();

        let material = new THREE.MeshStandardMaterial({ map: blockTex, side: THREE.FrontSide });
        this.chunkModel[x][z].model = new THREE.Mesh(geometry, material);

        scene.add(this.chunkModel[x][z].model);
        this.chunkModel[x][z].rendered = true;
      }
    }
  }

  compileChunk(x, z) {

    if (this.chunkModel[x][z].model === undefined) {

    } else {
      scene.remove(this.chunkModel[x][z].model);
      this.chunkModel[x][z].model.geometry.dispose();
      this.chunkModel[x][z].model.material.dispose();
    }
    let vertices = [];
    let indices = [];
    let UVs = [];

    let totalIndices = 0;

    let chunk = this.chunk[x][z];

    let lngth = this.chunk[x][z].length

    for (let b = 0; b < lngth; b++) {
      let block = chunk[b];

      // Back (z-)
      if (!this.checkForBlock(chunk, block.x, block.y, block.z - 1)) {
        vertices.push(block.x - 0.5, block.y - 0.5, block.z - 0.5);
        vertices.push(block.x - 0.5, block.y + 0.5, block.z - 0.5);
        vertices.push(block.x + 0.5, block.y + 0.5, block.z - 0.5);
        vertices.push(block.x + 0.5, block.y - 0.5, block.z - 0.5);
        UVs.push(block.lx, block.ly);
        UVs.push(block.lx, block.hy);
        UVs.push(block.hx, block.hy);
        UVs.push(block.hx, block.ly);
        indices.push(0 + totalIndices, 1 + totalIndices, 2 + totalIndices, 0 + totalIndices, 2 + totalIndices, 3 + totalIndices);
        totalIndices += 4;
      }


      // Front (z+)
      if (!this.checkForBlock(chunk, block.x, block.y, block.z + 1)) {
        vertices.push(block.x - 0.5, block.y - 0.5, block.z + 0.5);
        vertices.push(block.x - 0.5, block.y + 0.5, block.z + 0.5);
        vertices.push(block.x + 0.5, block.y + 0.5, block.z + 0.5);
        vertices.push(block.x + 0.5, block.y - 0.5, block.z + 0.5);
        UVs.push(block.lx, block.ly);
        UVs.push(block.lx, block.hy);
        UVs.push(block.hx, block.hy);
        UVs.push(block.hx, block.ly);
        indices.push(0 + totalIndices, 2 + totalIndices, 1 + totalIndices, 0 + totalIndices, 3 + totalIndices, 2 + totalIndices);
        totalIndices += 4;
      }

      // Left (x-)
      if (!this.checkForBlock(chunk, block.x - 1, block.y, block.z)) {
        vertices.push(block.x - 0.5, block.y + 0.5, block.z - 0.5);
        vertices.push(block.x - 0.5, block.y + 0.5, block.z + 0.5);
        vertices.push(block.x - 0.5, block.y - 0.5, block.z + 0.5);
        vertices.push(block.x - 0.5, block.y - 0.5, block.z - 0.5);
        UVs.push(block.hx, block.hy);
        UVs.push(block.lx, block.hy);
        UVs.push(block.lx, block.ly);
        UVs.push(block.hx, block.ly);
        indices.push(2 + totalIndices, 0 + totalIndices, 3 + totalIndices, 2 + totalIndices, 1 + totalIndices, 0 + totalIndices);
        totalIndices += 4;
      }

      // Right (x+)
      if (!this.checkForBlock(chunk, block.x + 1, block.y, block.z)) {
        vertices.push(block.x + 0.5, block.y + 0.5, block.z + 0.5);
        vertices.push(block.x + 0.5, block.y + 0.5, block.z - 0.5);
        vertices.push(block.x + 0.5, block.y - 0.5, block.z - 0.5);
        vertices.push(block.x + 0.5, block.y - 0.5, block.z + 0.5);
        UVs.push(block.hx, block.hy);
        UVs.push(block.lx, block.hy);
        UVs.push(block.lx, block.ly);
        UVs.push(block.hx, block.ly);
        indices.push(0 + totalIndices, 2 + totalIndices, 1 + totalIndices, 0 + totalIndices, 3 + totalIndices, 2 + totalIndices);
        totalIndices += 4;
      }

      // Bottom (y-)
      if (!this.checkForBlock(chunk, block.x, block.y - 1, block.z)) {
        vertices.push(block.x - 0.5, block.y - 0.5, block.z - 0.5);
        vertices.push(block.x - 0.5, block.y - 0.5, block.z + 0.5);
        vertices.push(block.x + 0.5, block.y - 0.5, block.z + 0.5);
        vertices.push(block.x + 0.5, block.y - 0.5, block.z - 0.5);
        UVs.push(block.lx, block.ly);
        UVs.push(block.lx, block.hy);
        UVs.push(block.hx, block.hy);
        UVs.push(block.hx, block.ly);
        indices.push(0 + totalIndices, 3 + totalIndices, 2 + totalIndices, 0 + totalIndices, 2 + totalIndices, 1 + totalIndices);
        totalIndices += 4;
      }

      // Top (y+)
      if (!this.checkForBlock(chunk, block.x, block.y + 1, block.z)) {
        vertices.push(block.x - 0.5, block.y + 0.5, block.z + 0.5);
        vertices.push(block.x - 0.5, block.y + 0.5, block.z - 0.5);
        vertices.push(block.x + 0.5, block.y + 0.5, block.z - 0.5);
        vertices.push(block.x + 0.5, block.y + 0.5, block.z + 0.5);
        UVs.push(block.lx, block.hy);
        UVs.push(block.lx, block.ly);
        UVs.push(block.hx, block.ly);
        UVs.push(block.hx, block.hy);
        indices.push(1 + totalIndices, 3 + totalIndices, 2 + totalIndices, 1 + totalIndices, 0 + totalIndices, 3 + totalIndices);
        totalIndices += 4;
      }
    }

    let vertices2 = new Float32Array(vertices);
    let indices2 = new Uint16Array(indices);
    let UVs2 = new Float32Array(UVs);

    let geometry = new THREE.BufferGeometry();

    geometry.setAttribute('position', new THREE.BufferAttribute(vertices2, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(UVs2, 2));
    geometry.setIndex(new THREE.BufferAttribute(indices2, 1));

    geometry.computeVertexNormals();

    let material = new THREE.MeshStandardMaterial({ map: blockTex, side: THREE.FrontSide });
    this.chunkModel[x][z].model = new THREE.Mesh(geometry, material);

    scene.add(this.chunkModel[x][z].model);
    this.chunkModel[x][z].rendered = true;
  }

  processChunk(data) {

    if (!this.chunk[data.x]) {
      this.chunk[data.x] = {};
    }
    if (!Array.isArray(this.chunk[data.x][data.z])) {
      this.chunk[data.x][data.z] = [];
    }
    if (!this.chunkModel[data.x]) {
      this.chunkModel[data.x] = {};
    }
    if (!this.chunkModel[data.x][data.z]) {
      this.chunkModel[data.x][data.z] = {};
    }

    let lngth = data.blocks.length;
    for (let b = 0; b < lngth; b++) {
      this.chunk[data.x][data.z].push(new Block(data.blocks[b].x, data.blocks[b].y, data.blocks[b].z, data.blocks[b].type));
    }

    let geometry = new THREE.BufferGeometry();

    geometry.setAttribute('position', new THREE.BufferAttribute(data.vertices, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(data.UVs, 2));
    geometry.setIndex(new THREE.BufferAttribute(data.indices, 1));

    geometry.computeVertexNormals();

    let material = new THREE.MeshStandardMaterial({ map: blockTex, side: THREE.FrontSide });
    this.chunkModel[data.x][data.z].model = new THREE.Mesh(geometry, material);

    scene.add(this.chunkModel[data.x][data.z].model);

  }
}