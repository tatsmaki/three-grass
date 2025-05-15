import { FogExp2, Scene, SRGBColorSpace } from "three";
import { camera } from "./camera";

export const scene = new Scene();

scene.add(camera);
scene.fog = new FogExp2(0xdfe9f3, 0.0001);
scene.fog.color.setRGB(0.45, 0.8, 1.0, SRGBColorSpace);
