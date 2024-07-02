class Build {
  constructor() {
    this.size = 10;
    this.blocks = [];
    this.model = null;
    this.recompile = false;
  }

  collide() {

    let lngth = this.blocks.length;

    for (let b = 0; b < lngth; b++) {
      this.blocks[b].collide();
    }

  }

  collideFloor() {

    let lngth = this.blocks.length;

    for (let b = 0; b < lngth; b++) {
      this.blocks[b].collideFloor();
    }

  }

  addBlock(x, y, z, tex) {
    this.blocks.push(new Block(x, y, z, tex));
    this.recompile = true;
  }

  removeBlock(x, y, z) {
    let temp = this.blocks.length;
    for (let b = temp - 1; b >= 0; b--) {
      if (this.blocks[b].x === x && this.blocks[b].y === y && this.blocks[b].z === z) {
        this.blocks.splice(b, 1);
      }
    }
    this.recompile = true;
  }

  checkForBlock(x, y, z) {
    let numBlocks = this.blocks.length;
    for (let i = 0; i < numBlocks; i++) {
      if (this.blocks[i].x === x && this.blocks[i].y === y && this.blocks[i].z === z) {
        return true;
      }
    }
    return false;
  }

  compile() {

    if (this.model != undefined) {
      scene.remove(this.model);
      this.model.geometry.dispose();
      this.model.material.dispose();
    }

    let vertices = [];
    let indices = [];
    let UVs = [];

    let totalIndices = 0;

    let lngth = this.blocks.length;

    for (let b = 0; b < lngth; b++) {
      let block = this.blocks[b];

      // Back (z-)
      if (!this.checkForBlock(block.x, block.y, block.z - 1)) {
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
      if (!this.checkForBlock(block.x, block.y, block.z + 1)) {
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
      if (!this.checkForBlock(block.x - 1, block.y, block.z)) {
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
      if (!this.checkForBlock(block.x + 1, block.y, block.z)) {
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
      if (!this.checkForBlock(block.x, block.y - 1, block.z)) {
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
      if (!this.checkForBlock(block.x, block.y + 1, block.z)) {
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
    this.model = new THREE.Mesh(geometry, material);

    scene.add(this.model);
  }
}