import { Color, DirectionalLight, SRGBColorSpace } from "three";

const LIGHT_INTENSITY = 0.7;
const LIGHT_COLOR = new Color().setRGB(0.52, 0.66, 0.99, SRGBColorSpace);

export const dirLight = new DirectionalLight(LIGHT_COLOR, LIGHT_INTENSITY);

dirLight.position.set(-20, 20, 20);
dirLight.target.position.set(0, 0, 0);
// VIDEO HACK
dirLight.castShadow = true;
dirLight.shadow.bias = -0.001;
dirLight.shadow.mapSize.width = 4096;
dirLight.shadow.mapSize.height = 4096;
dirLight.shadow.camera.near = 1.0;
dirLight.shadow.camera.far = 100.0;
dirLight.shadow.camera.left = 32;
dirLight.shadow.camera.right = -32;
dirLight.shadow.camera.top = 32;
dirLight.shadow.camera.bottom = -32;
