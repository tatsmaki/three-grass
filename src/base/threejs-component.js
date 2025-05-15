import { RenderPass, ShaderPass, FXAAShader } from "./three-defs.js";

import * as entity from "./entity.js";
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

const LIGHT_INTENSITY = 0.7;
const LIGHT_COLOUR = new Color().setRGB(0.52, 0.66, 0.99, SRGBColorSpace);
// const LIGHT_FAR = 1000.0;

const GammaCorrectionShader2 = {
  name: "GammaCorrectionShader2",
  uniforms: {
    tDiffuse: { value: null },
    exposure: { value: 1.0 },
  },
  vertexShader: /* glsl */ `
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,
  fragmentShader: /* glsl */ `
		uniform sampler2D tDiffuse;
		varying vec2 vUv;

    #define saturate(a) clamp( a, 0.0, 1.0 )

    float inverseLerp(float minValue, float maxValue, float v) {
      return (v - minValue) / (maxValue - minValue);
    }
    
    float remap(float v, float inMin, float inMax, float outMin, float outMax) {
      float t = inverseLerp(inMin, inMax, v);
      return mix(outMin, outMax, t);
    }

		uniform float exposure;

		vec3 RRTAndODTFit( vec3 v ) {

			vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
			vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
			return a / b;

		}

		vec3 ACESFilmicToneMapping( vec3 color ) {

		// sRGB => XYZ => D65_2_D60 => AP1 => RRT_SAT
			const mat3 ACESInputMat = mat3(
				vec3( 0.59719, 0.07600, 0.02840 ), // transposed from source
				vec3( 0.35458, 0.90834, 0.13383 ),
				vec3( 0.04823, 0.01566, 0.83777 )
			);

		// ODT_SAT => XYZ => D60_2_D65 => sRGB
			const mat3 ACESOutputMat = mat3(
				vec3(  1.60475, -0.10208, -0.00327 ), // transposed from source
				vec3( -0.53108,  1.10813, -0.07276 ),
				vec3( -0.07367, -0.00605,  1.07602 )
			);

			color = ACESInputMat * color;

		// Apply RRT and ODT
			color = RRTAndODTFit( color );

			color = ACESOutputMat * color;

		// Clamp to [0, 1]
			return saturate( color );

		}

    vec3 vignette(vec2 uvs) {
      float v1 = smoothstep(0.5, 0.3, abs(uvs.x - 0.5));
      float v2 = smoothstep(0.5, 0.3, abs(uvs.y - 0.5));
      float v = v1 * v2;
      v = pow(v, 0.125);
      v = remap(v, 0.0, 1.0, 0.4, 1.0);
      return vec3(v);
    }

		void main() {
			vec4 tex = texture2D( tDiffuse, vUv );

      tex.rgb *= exposure / 0.6; // pre-exposed, outside of the tone mapping function
      tex.rgb = ACESFilmicToneMapping( tex.rgb );

      tex = LinearTosRGB(tex);
      tex.rgb *= vignette(vUv);

			gl_FragColor = tex;
		}`,
};

class FakeCSM {
  constructor() {
    this.lights = [
      {
        color: new Color(0xffffff),
        lightDirection: new Vector3(1, 0, 0),
      },
    ];
    this.lightDirection = new Vector3(1, 0, 0);
  }
  setupMaterial() {}
  updateFrustums() {}
  update() {}
}

export const threejs_component = (() => {
  class ThreeJSController extends entity.Component {
    static CLASS_NAME = "ThreeJSController";

    get NAME() {
      return ThreeJSController.CLASS_NAME;
    }

    #threejs_;
    #csm_;

    #ssaoPass_;
    #opaqueScene_;
    #opaquePass_;

    #opaqueCamera_;

    #fxaaPass_;
    #gammaPass_;

    #grassTimingAvg_;

    constructor(canvas) {
      super();

      this.canvas = canvas;
      this.#threejs_ = null;
      this.#ssaoPass_ = null;
      this.#opaqueScene_ = null;
      this.#opaquePass_ = null;
      this.#opaqueCamera_ = null;
      this.#fxaaPass_ = null;
      this.#gammaPass_ = null;
      this.#csm_ = null;
      this.grassTimingAvg_ = 0;
      this.timerQuery = null;
    }

    InitEntity() {
      // shaders.SetThreeJS(this);

      const canvasWidth = window.innerWidth;
      const canvasHeight = window.innerHeight;
      const aspectRatio = canvasWidth / canvasHeight;

      this.#threejs_ = new WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        powerPreference: "high-performance",
      });
      this.renderer = this.#threejs_;
      this.#threejs_.shadowMap.enabled = true;
      this.#threejs_.shadowMap.type = PCFSoftShadowMap;
      this.#threejs_.setSize(canvasWidth, canvasHeight);
      this.#threejs_.outputColorSpace = LinearSRGBColorSpace;

      const fov = 60;
      const near = 0.5;
      const far = 10000.0;
      this.#opaqueCamera_ = new PerspectiveCamera(fov, aspectRatio, near, far);
      this.#opaqueCamera_.position.set(20, 5, 15);

      this.#opaqueScene_ = new Scene();
      this.#opaqueScene_.add(this.#opaqueCamera_);
      this.scene = this.#opaqueScene_;

      this.#opaqueScene_.fog = new FogExp2(0xdfe9f3, 0.0001);
      this.#opaqueScene_.fog.color.setRGB(0.45, 0.8, 1.0, SRGBColorSpace);

      let light = new DirectionalLight(0xffffff, LIGHT_INTENSITY);
      light.position.set(-20, 20, 20);
      light.target.position.set(0, 0, 0);
      light.color.copy(LIGHT_COLOUR);

      this.#csm_ = new FakeCSM();

      // VIDEO HACK
      light.castShadow = true;
      light.shadow.bias = -0.001;
      light.shadow.mapSize.width = 4096;
      light.shadow.mapSize.height = 4096;
      light.shadow.camera.near = 1.0;
      light.shadow.camera.far = 100.0;
      light.shadow.camera.left = 32;
      light.shadow.camera.right = -32;
      light.shadow.camera.top = 32;
      light.shadow.camera.bottom = -32;
      this.#opaqueScene_.add(light);
      this.#opaqueScene_.add(light.target);

      const lightDir = light.position.clone();
      lightDir.normalize();
      lightDir.multiplyScalar(-1);

      for (let i = 0; i < this.#csm_.lights.length; i++) {
        this.#csm_.lights[i].color.copy(LIGHT_COLOUR);
      }

      this.#csm_.updateFrustums();

      this.sun_ = light;

      const bufferParams = {
        type: HalfFloatType,
        magFilter: LinearFilter,
        minFilter: LinearFilter,
        wrapS: ClampToEdgeWrapping,
        wrapT: ClampToEdgeWrapping,
        generateMipmaps: false,
      };
      this.readBuffer_ = new WebGLRenderTarget(
        canvasWidth,
        canvasHeight,
        bufferParams
      );
      this.readBuffer_.stencilBuffer = false;
      this.readBuffer_.depthTexture = new DepthTexture();
      this.readBuffer_.depthTexture.format = DepthStencilFormat;
      this.readBuffer_.depthTexture.type = UnsignedInt248Type;

      this.writeBuffer_ = new WebGLRenderTarget(
        canvasWidth,
        canvasHeight,
        bufferParams
      );
      this.writeBuffer_.stencilBuffer = false;
      this.writeBuffer_.depthTexture = new DepthTexture();
      this.writeBuffer_.depthTexture.format = DepthStencilFormat;
      this.writeBuffer_.depthTexture.type = UnsignedInt248Type;

      this.#opaquePass_ = new RenderPass(
        this.#opaqueScene_,
        this.#opaqueCamera_
      );

      this.#fxaaPass_ = new ShaderPass(FXAAShader);
      this.#gammaPass_ = new ShaderPass(GammaCorrectionShader2);

      this.onWindowResize();
    }

    get Scene() {
      return this.#opaqueScene_;
    }

    get Camera() {
      return this.#opaqueCamera_;
    }

    getMaxAnisotropy() {
      return this.#threejs_.capabilities.getMaxAnisotropy();
    }

    onWindowResize() {
      const canvasWidth = window.innerWidth;
      const canvasHeight = window.innerHeight;
      const aspectRatio = canvasWidth / canvasHeight;

      this.#opaqueCamera_.aspect = aspectRatio;
      this.#opaqueCamera_.updateProjectionMatrix();

      this.#threejs_.setSize(canvasWidth, canvasHeight);
      // this.composer_.setSize(canvasWidth, canvasHeight);

      this.writeBuffer_.setSize(canvasWidth, canvasHeight);
      this.readBuffer_.setSize(canvasWidth, canvasHeight);
      // this.csm_.updateFrustums();

      this.#fxaaPass_.material.uniforms["resolution"].value.x = 1 / canvasWidth;
      this.#fxaaPass_.material.uniforms["resolution"].value.y =
        1 / canvasHeight;

      this.#csm_.updateFrustums();
    }

    swapBuffers_() {
      const tmp = this.writeBuffer_;
      this.writeBuffer_ = this.readBuffer_;
      this.readBuffer_ = tmp;
    }

    SetupMaterial(material) {
      this.#csm_.setupMaterial(material);
    }

    AddSceneObject(obj) {
      this.#opaqueScene_.add(obj);
    }

    Render(timeElapsedS) {
      this.#threejs_.autoClear = true;
      this.#threejs_.autoClearColor = true;
      this.#threejs_.autoClearDepth = true;
      this.#threejs_.autoClearStencil = true;
      this.#threejs_.setRenderTarget(this.writeBuffer_);
      this.#threejs_.clear();
      this.#threejs_.setRenderTarget(this.readBuffer_);
      this.#threejs_.clear();
      this.#threejs_.setRenderTarget(null);
      this.#opaquePass_.renderToScreen = false;
      this.#opaquePass_.render(
        this.#threejs_,
        null,
        this.writeBuffer_,
        timeElapsedS,
        false
      );
      this.writeBuffer_.ACTIVE_HAS_OPAQUE = true;
      this.readBuffer_.ACTIVE_HAS_OPAQUE = false;
      this.swapBuffers_();

      this.#threejs_.autoClear = false;
      this.#threejs_.autoClearColor = false;
      this.#threejs_.autoClearDepth = false;
      this.#threejs_.autoClearStencil = false;

      this.#gammaPass_.clear = false;
      this.#gammaPass_.renderToScreen = true;
      this.#gammaPass_.render(
        this.#threejs_,
        null,
        this.readBuffer_,
        timeElapsedS,
        false
      );
    }

    Update() {
      this.#csm_.update();

      this.sun_.updateMatrixWorld();
      this.sun_.target.updateMatrixWorld();
    }
  }

  return {
    ThreeJSController: ThreeJSController,
  };
})();
