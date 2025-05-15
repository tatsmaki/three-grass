import { RenderPass, ShaderPass, FXAAShader } from "../base/three-defs.js";
import gammaVert from "../shaders/gamma.vert?raw";
import gammaFrag from "../shaders/gamma.frag?raw";
import {
  ClampToEdgeWrapping,
  Color,
  DepthStencilFormat,
  DepthTexture,
  DirectionalLight,
  FogExp2,
  HalfFloatType,
  LinearFilter,
  LinearSRGBColorSpace,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  UnsignedInt248Type,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import { camera, canvasHeight, canvasWidth } from "./camera.js";
import { scene } from "./scene.js";

const GammaCorrectionShader2 = {
  name: "GammaCorrectionShader2",
  uniforms: {
    tDiffuse: { value: null },
    exposure: { value: 1.0 },
  },
  vertexShader: gammaVert,
  fragmentShader: gammaFrag,
};

export const renderer = new WebGLRenderer({
  canvas: document.getElementById("canvas"),
  antialias: true,
  powerPreference: "high-performance",
});

renderer.setSize(canvasWidth, canvasHeight);
renderer.outputColorSpace = LinearSRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;

const bufferParams = {
  type: HalfFloatType,
  magFilter: LinearFilter,
  minFilter: LinearFilter,
  wrapS: ClampToEdgeWrapping,
  wrapT: ClampToEdgeWrapping,
  generateMipmaps: false,
};
let readBuffer = new WebGLRenderTarget(canvasWidth, canvasHeight, bufferParams);
readBuffer.stencilBuffer = false;
readBuffer.depthTexture = new DepthTexture();
readBuffer.depthTexture.format = DepthStencilFormat;
readBuffer.depthTexture.type = UnsignedInt248Type;

let writeBuffer = new WebGLRenderTarget(
  canvasWidth,
  canvasHeight,
  bufferParams
);
writeBuffer.stencilBuffer = false;
writeBuffer.depthTexture = new DepthTexture();
writeBuffer.depthTexture.format = DepthStencilFormat;
writeBuffer.depthTexture.type = UnsignedInt248Type;

const opaquePass = new RenderPass(scene, camera);
const fxaaPass = new ShaderPass(FXAAShader);
const gammaPass = new ShaderPass(GammaCorrectionShader2);

const swapBuffers = () => {
  const tmp = writeBuffer;
  writeBuffer = readBuffer;
  readBuffer = tmp;
};

export const render = (timeElapsedS) => {
  renderer.autoClear = true;
  renderer.autoClearColor = true;
  renderer.autoClearDepth = true;
  renderer.autoClearStencil = true;
  renderer.setRenderTarget(writeBuffer);
  renderer.clear();
  renderer.setRenderTarget(readBuffer);
  renderer.clear();
  renderer.setRenderTarget(null);
  opaquePass.renderToScreen = false;
  opaquePass.render(renderer, null, writeBuffer, timeElapsedS, false);
  writeBuffer.ACTIVE_HAS_OPAQUE = true;
  readBuffer.ACTIVE_HAS_OPAQUE = false;
  swapBuffers();

  renderer.autoClear = false;
  renderer.autoClearColor = false;
  renderer.autoClearDepth = false;
  renderer.autoClearStencil = false;

  gammaPass.clear = false;
  gammaPass.renderToScreen = true;
  gammaPass.render(renderer, null, readBuffer, timeElapsedS, false);
};

export const onWindowResize = () => {
  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;
  const aspectRatio = canvasWidth / canvasHeight;

  camera.aspect = aspectRatio;
  camera.updateProjectionMatrix();

  renderer.setSize(canvasWidth, canvasHeight);

  writeBuffer.setSize(canvasWidth, canvasHeight);
  readBuffer.setSize(canvasWidth, canvasHeight);

  fxaaPass.material.uniforms["resolution"].value.x = 1 / canvasWidth;
  fxaaPass.material.uniforms["resolution"].value.y = 1 / canvasHeight;
};
