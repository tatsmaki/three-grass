import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";

import { FXAAShader } from "three/addons/shaders/FXAAShader.js";

import { DataUtils } from "three";

export function Float32ToFloat16(data) {
  const data16 = new Uint16Array(data.length);
  for (let i = 0; i < data.length; i++) {
    data16[i] = DataUtils.toHalfFloat(data[i]);
  }
  return data16;
}

export { ShaderPass, RenderPass, FXAAShader };
