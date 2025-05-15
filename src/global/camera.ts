import { PerspectiveCamera } from "three";

export const canvasWidth = window.innerWidth;
export const canvasHeight = window.innerHeight;

const aspectRatio = canvasWidth / canvasHeight;
const fov = 60;
const near = 0.5;
const far = 10000.0;

export const camera = new PerspectiveCamera(fov, aspectRatio, near, far);

camera.position.set(20, 5, 15);
