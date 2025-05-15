import { BackSide, Mesh, ShaderMaterial, SphereGeometry } from "three";
import { shaderCode } from "../shaders";

const uniforms = {
  time: { value: 0.0 },
};

const skyGeo = new SphereGeometry(5000, 32, 15);
const skyMat = new ShaderMaterial({
  uniforms,
  side: BackSide,
  vertexShader: shaderCode["SKY"].vsh,
  fragmentShader: shaderCode["SKY"].fsh,
});
export const sky = new Mesh(skyGeo, skyMat);

sky.castShadow = false;
sky.receiveShadow = false;

export const renderSky = (dt: number) => {
  sky.material.uniforms.time.value += dt;
};
