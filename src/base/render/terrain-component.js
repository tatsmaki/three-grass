import * as shaders from "../../game/render/shaders.js";

import { Mesh, PlaneGeometry, Vector4 } from "three";

export const TERRAIN_HEIGHT = 0;
export const TERRAIN_OFFSET = 0;
export const TERRAIN_DIMS = 2000;

export const createTerrain = () => {
  const geometry = new PlaneGeometry(TERRAIN_DIMS, TERRAIN_DIMS, 256, 256);

  geometry.rotateX(-Math.PI / 2);

  const terrainMaterial = new shaders.GamePBRMaterial("TERRAIN", {});

  terrainMaterial.setVec4(
    "heightParams",
    new Vector4(TERRAIN_DIMS, TERRAIN_DIMS, TERRAIN_HEIGHT, TERRAIN_OFFSET)
  );

  const mesh = new Mesh(geometry, terrainMaterial);
  mesh.position.set(0, 0, 0);

  return mesh;
};
