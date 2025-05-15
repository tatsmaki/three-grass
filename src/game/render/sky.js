import { BackSide, Mesh, SphereGeometry } from "three";
import * as shaders from "./shaders.js";

const uniforms = {
  time: { value: 0.0 },
};

const skyGeo = new SphereGeometry(5000, 32, 15);
const skyMat = new shaders.ShaderMaterial("SKY", {
  uniforms: uniforms,
  side: BackSide,
});

export const sky = new Mesh(skyGeo, skyMat);
sky.castShadow = false;
sky.receiveShadow = false;

export const renderSky = (dt) => {
  sky.material.uniforms.time.value += dt;
};
