import grassVsh from "./shaders/grass.vert?raw";
import grassFsh from "./shaders/grass.frag?raw";
import terrainVsh from "./shaders/terrain.vert?raw";
import terrainFsh from "./shaders/terrain.frag?raw";
import skyVsh from "./shaders/sky.vert?raw";
import skyFsh from "./shaders/sky.frag?raw";
import common from "./shaders/common.glsl?raw";
import oklab from "./shaders/oklab.glsl?raw";
import noise from "./shaders/noise.glsl?raw";
import sky from "./shaders/sky.glsl?raw";
import {
  MeshPhongMaterial,
  MeshStandardMaterial,
  ShaderMaterial as ThreeShaderMaterial,
  Vector3,
} from "three";

const shaderCode = {};

const globalShadersCode = [common, oklab, noise, sky].join("\n");

const loadShader = (chunk) => {
  return globalShadersCode + "\n" + chunk;
};

shaderCode["GRASS"] = {
  vsh: loadShader(grassVsh),
  fsh: loadShader(grassFsh),
};

shaderCode["TERRAIN"] = {
  vsh: loadShader(terrainVsh),
  fsh: loadShader(terrainFsh),
};

shaderCode["SKY"] = {
  vsh: loadShader(skyVsh),
  fsh: loadShader(skyFsh),
};

export class ShaderMaterial extends ThreeShaderMaterial {
  constructor(shaderType, parameters) {
    parameters.vertexShader = shaderCode[shaderType].vsh;
    parameters.fragmentShader = shaderCode[shaderType].fsh;

    super(parameters);
  }
}

export class GamePBRMaterial extends MeshStandardMaterial {
  #uniforms_ = {};
  #shader_ = null;

  constructor(shaderType, parameters) {
    super(parameters);

    this.#shader_ = null;
    this.#uniforms_ = {};

    // ShaderManager.threejs.SetupMaterial(this);

    const previousCallback = this.onBeforeCompile;

    this.onBeforeCompile = (shader) => {
      shader.fragmentShader = shaderCode[shaderType].fsh;
      shader.vertexShader = shaderCode[shaderType].vsh;
      shader.uniforms.time = { value: 0.0 };
      shader.uniforms.playerPos = { value: new Vector3(0.0) };

      for (let k in this.#uniforms_) {
        shader.uniforms[k] = this.#uniforms_[k];
      }

      this.#shader_ = shader;

      previousCallback(shader);
    };

    this.customProgramCacheKey = () => {
      let uniformStr = "";
      for (let k in this.#uniforms_) {
        uniformStr += k + ":" + this.#uniforms_[k].value + ";";
      }
      return shaderType + uniformStr;
    };
  }

  setFloat(name, value) {
    this.#uniforms_[name] = { value: value };
    if (this.#shader_) {
      this.#shader_.uniforms[name] = this.#uniforms_[name];
    }
  }

  setVec2(name, value) {
    this.#uniforms_[name] = { value: value };
    if (this.#shader_) {
      this.#shader_.uniforms[name] = this.#uniforms_[name];
    }
  }

  setVec3(name, value) {
    this.#uniforms_[name] = { value: value };
    if (this.#shader_) {
      this.#shader_.uniforms[name] = this.#uniforms_[name];
    }
  }

  setVec4(name, value) {
    this.#uniforms_[name] = { value: value };
    if (this.#shader_) {
      this.#shader_.uniforms[name] = this.#uniforms_[name];
    }
  }

  setMatrix(name, value) {
    this.#uniforms_[name] = { value: value };
    if (this.#shader_) {
      this.#shader_.uniforms[name] = this.#uniforms_[name];
    }
  }

  setTexture(name, value) {
    this.#uniforms_[name] = { value: value };
    if (this.#shader_) {
      this.#shader_.uniforms[name] = this.#uniforms_[name];
    }
  }

  setTextureArray(name, value) {
    this.#uniforms_[name] = { value: value };
    if (this.#shader_) {
      this.#shader_.uniforms[name] = this.#uniforms_[name];
    }
  }
}

export class GameMaterial extends MeshPhongMaterial {
  #uniforms_ = {};
  #shader_ = null;

  constructor(shaderType, parameters) {
    super(parameters);

    this.#shader_ = null;
    this.#uniforms_ = {};

    // ShaderManager.threejs.SetupMaterial(this);

    const previousCallback = this.onBeforeCompile;

    this.onBeforeCompile = (shader) => {
      shader.fragmentShader = shaderCode[shaderType].fsh;
      shader.vertexShader = shaderCode[shaderType].vsh;
      shader.uniforms.time = { value: 0.0 };
      shader.uniforms.playerPos = { value: new Vector3(0.0) };

      for (let k in this.#uniforms_) {
        shader.uniforms[k] = this.#uniforms_[k];
      }

      this.#shader_ = shader;

      previousCallback(shader);
    };

    this.customProgramCacheKey = () => {
      let uniformStr = "";
      for (let k in this.#uniforms_) {
        uniformStr += k + ":" + this.#uniforms_[k].value + ";";
      }
      return shaderType + uniformStr;
    };
  }

  setFloat(name, value) {
    this.#uniforms_[name] = { value: value };
    if (this.#shader_) {
      this.#shader_.uniforms[name] = this.#uniforms_[name];
    }
  }

  setVec2(name, value) {
    this.#uniforms_[name] = { value: value };
    if (this.#shader_) {
      this.#shader_.uniforms[name] = this.#uniforms_[name];
    }
  }

  setVec3(name, value) {
    this.#uniforms_[name] = { value: value };
    if (this.#shader_) {
      this.#shader_.uniforms[name] = this.#uniforms_[name];
    }
  }

  setVec4(name, value) {
    this.#uniforms_[name] = { value: value };
    if (this.#shader_) {
      this.#shader_.uniforms[name] = this.#uniforms_[name];
    }
  }

  setMatrix(name, value) {
    this.#uniforms_[name] = { value: value };
    if (this.#shader_) {
      this.#shader_.uniforms[name] = this.#uniforms_[name];
    }
  }

  setTexture(name, value) {
    this.#uniforms_[name] = { value: value };
    if (this.#shader_) {
      this.#shader_.uniforms[name] = this.#uniforms_[name];
    }
  }

  setTextureArray(name, value) {
    this.#uniforms_[name] = { value: value };
    if (this.#shader_) {
      this.#shader_.uniforms[name] = this.#uniforms_[name];
    }
  }
}
