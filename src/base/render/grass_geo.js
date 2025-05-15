import {
  DataUtils,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Sphere,
  Uint8BufferAttribute,
  Vector3,
} from "three";
import * as math from "../math.js";

export const NUM_GRASS = 32 * 32 * 3;
export const GRASS_PATCH_SIZE = 5 * 2;

class InstancedFloat16BufferAttribute extends InstancedBufferAttribute {
  constructor(array, itemSize, normalized, meshPerAttribute = 1) {
    super(new Uint16Array(array), itemSize, normalized, meshPerAttribute);

    this.isFloat16BufferAttribute = true;
  }
}

export const createGrassGeo = (segments) => {
  math.set_seed(0);

  const VERTICES = (segments + 1) * 2;

  const indices = [];

  for (let i = 0; i < segments; ++i) {
    const vi = i * 2;
    indices[i * 12 + 0] = vi + 0;
    indices[i * 12 + 1] = vi + 1;
    indices[i * 12 + 2] = vi + 2;

    indices[i * 12 + 3] = vi + 2;
    indices[i * 12 + 4] = vi + 1;
    indices[i * 12 + 5] = vi + 3;

    const fi = VERTICES + vi;
    indices[i * 12 + 6] = fi + 2;
    indices[i * 12 + 7] = fi + 1;
    indices[i * 12 + 8] = fi + 0;

    indices[i * 12 + 9] = fi + 3;
    indices[i * 12 + 10] = fi + 1;
    indices[i * 12 + 11] = fi + 2;
  }

  const offsets = [];

  for (let i = 0; i < NUM_GRASS; ++i) {
    offsets.push(
      math.rand_range(-GRASS_PATCH_SIZE * 0.5, GRASS_PATCH_SIZE * 0.5)
    );
    offsets.push(
      math.rand_range(-GRASS_PATCH_SIZE * 0.5, GRASS_PATCH_SIZE * 0.5)
    );
    offsets.push(0);
  }

  const offsetsData = offsets.map(DataUtils.toHalfFloat);

  const vertID = new Uint8Array(VERTICES * 2);
  for (let i = 0; i < VERTICES * 2; ++i) {
    vertID[i] = i;
  }

  const geo = new InstancedBufferGeometry();
  geo.instanceCount = NUM_GRASS;
  geo.setAttribute("vertIndex", new Uint8BufferAttribute(vertID, 1));
  geo.setAttribute(
    "position",
    new InstancedFloat16BufferAttribute(offsetsData, 3)
  );
  geo.setIndex(indices);
  geo.boundingSphere = new Sphere(
    new Vector3(0, 0, 0),
    1 + GRASS_PATCH_SIZE * 2
  );

  return geo;
};
