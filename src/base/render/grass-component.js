import * as shaders from "../../shaders.js";
import { GRASS_PATCH_SIZE, createGrassGeo } from "./grass_geo.js";
import {
  Box3,
  FrontSide,
  Frustum,
  Group,
  Matrix4,
  Mesh,
  Vector2,
  Vector3,
  Vector4,
} from "three";
import {
  TERRAIN_DIMS,
  TERRAIN_HEIGHT,
  TERRAIN_OFFSET,
} from "./terrain-component.js";

const M_TMP = new Matrix4();
const AABB_TMP = new Box3();

const GRASS_SEGMENTS_LOW = 1;
const GRASS_SEGMENTS_HIGH = 6;
const GRASS_VERTICES_LOW = (GRASS_SEGMENTS_LOW + 1) * 2;
const GRASS_VERTICES_HIGH = (GRASS_SEGMENTS_HIGH + 1) * 2;
const GRASS_LOD_DIST = 15;
// const GRASS_MAX_DIST = 100;
const GRASS_MAX_DIST = 50;

const GRASS_WIDTH = 0.1;
const GRASS_HEIGHT = 1.5;

const group = new Group();

const data = {
  grassMaterialLow: new shaders.GameMaterial("GRASS"),
  grassMaterialHigh: new shaders.GameMaterial("GRASS"),
  geometryLow: createGrassGeo(GRASS_SEGMENTS_LOW),
  geometryHigh: createGrassGeo(GRASS_SEGMENTS_HIGH),
  meshesLow: [],
  meshesHigh: [],
  totalTime: 0,
};

data.grassMaterialLow.side = FrontSide;
data.grassMaterialHigh.side = FrontSide;

export const createGrass = () => {
  data.grassMaterialLow.setVec2(
    "grassSize",
    new Vector2(GRASS_WIDTH, GRASS_HEIGHT)
  );
  data.grassMaterialLow.setVec4(
    "grassParams",
    new Vector4(
      GRASS_SEGMENTS_LOW,
      GRASS_VERTICES_LOW,
      TERRAIN_HEIGHT,
      TERRAIN_OFFSET
    )
  );
  data.grassMaterialLow.setVec4(
    "grassDraw",
    new Vector4(GRASS_LOD_DIST, GRASS_MAX_DIST, 0, 0)
  );
  // data.grassMaterialLow.setTexture("heightmap", params.heightmap);
  data.grassMaterialLow.setVec4(
    "heightParams",
    new Vector4(TERRAIN_DIMS, 0, 0, 0)
  );
  data.grassMaterialLow.setVec3("grassLODColour", new Vector3(0, 0, 1));
  data.grassMaterialLow.alphaTest = 0.5;

  data.grassMaterialHigh.setVec2(
    "grassSize",
    new Vector2(GRASS_WIDTH, GRASS_HEIGHT)
  );
  data.grassMaterialHigh.setVec4(
    "grassParams",
    new Vector4(
      GRASS_SEGMENTS_HIGH,
      GRASS_VERTICES_HIGH,
      TERRAIN_HEIGHT,
      TERRAIN_OFFSET
    )
  );
  data.grassMaterialHigh.setVec4(
    "grassDraw",
    new Vector4(GRASS_LOD_DIST, GRASS_MAX_DIST, 0, 0)
  );
  // data.grassMaterialHigh.setTexture("heightmap", params.heightmap);
  data.grassMaterialHigh.setVec4(
    "heightParams",
    new Vector4(TERRAIN_DIMS, 0, 0, 0)
  );
  data.grassMaterialHigh.setVec3("grassLODColour", new Vector3(1, 0, 0));
  data.grassMaterialHigh.alphaTest = 0.5;

  return group;
};

const createMesh = (distToCell) => {
  const meshes = distToCell > GRASS_LOD_DIST ? data.meshesLow : data.meshesHigh;

  if (meshes.length > 1000) {
    console.log("crap");
    return null;
  }

  const geo =
    distToCell > GRASS_LOD_DIST ? data.geometryLow : data.geometryHigh;
  const mat =
    distToCell > GRASS_LOD_DIST
      ? data.grassMaterialLow
      : data.grassMaterialHigh;

  const m = new Mesh(geo, mat);
  m.position.set(0, 0, 0);
  m.receiveShadow = true;
  m.castShadow = false;
  m.visible = false;

  meshes.push(m);
  group.add(m);
  return m;
};

export const renderGrass = (camera, time) => {
  data.grassMaterialLow.setFloat("time", time);
  data.grassMaterialHigh.setFloat("time", time);

  const frustum = new Frustum().setFromProjectionMatrix(
    M_TMP.copy(camera.projectionMatrix).multiply(camera.matrixWorldInverse)
  );

  const meshesLow = [...data.meshesLow];
  const meshesHigh = [...data.meshesHigh];

  const baseCellPos = camera.position.clone();
  baseCellPos.divideScalar(GRASS_PATCH_SIZE);
  baseCellPos.floor();
  baseCellPos.multiplyScalar(GRASS_PATCH_SIZE);

  // This is dumb and slow
  for (let c of group.children) {
    c.visible = false;
  }

  const cameraPosXZ = new Vector3(camera.position.x, 0, camera.position.z);

  // data.grassMaterialHigh.setVec3("playerPos", playerPos);
  data.grassMaterialHigh.setMatrix("viewMatrixInverse", camera.matrixWorld);
  data.grassMaterialLow.setMatrix("viewMatrixInverse", camera.matrixWorld);

  for (let x = -16; x < 16; x++) {
    for (let z = -16; z < 16; z++) {
      // Current cell
      const currentCell = new Vector3(
        baseCellPos.x + x * GRASS_PATCH_SIZE,
        0,
        baseCellPos.z + z * GRASS_PATCH_SIZE
      );
      // currentCell.y = terrain.GetHeight(currentCell.x, currentCell.z);
      currentCell.y = 0;

      AABB_TMP.setFromCenterAndSize(
        currentCell,
        new Vector3(GRASS_PATCH_SIZE, 1000, GRASS_PATCH_SIZE)
      );
      const distToCell = AABB_TMP.distanceToPoint(cameraPosXZ);

      if (distToCell > GRASS_MAX_DIST) {
        continue;
      }

      if (!frustum.intersectsBox(AABB_TMP)) {
        continue;
      }

      if (distToCell > GRASS_LOD_DIST) {
        const m =
          meshesLow.length > 0 ? meshesLow.pop() : createMesh(distToCell);
        m.position.copy(currentCell);
        m.position.y = 0;
        m.visible = true;
      } else {
        const m =
          meshesHigh.length > 0 ? meshesHigh.pop() : createMesh(distToCell);
        m.position.copy(currentCell);
        m.position.y = 0;
        m.visible = true;
      }
    }
  }
};
