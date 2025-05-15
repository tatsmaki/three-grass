import { Color, HemisphereLight, SRGBColorSpace } from "three";

const HEMI_UP = new Color().setHex(0xa3c489, SRGBColorSpace);
const HEMI_DOWN = new Color().setHex(0xe5bcff, SRGBColorSpace);
const HEMI_INTENSITY = 0.25;

export const hemiLight = new HemisphereLight(
  HEMI_UP,
  HEMI_DOWN,
  HEMI_INTENSITY
);
