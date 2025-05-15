import { hemiLight } from "./objects/hemi_light";
import { createGrass, renderGrass } from "./base/render/grass-component";
import { createTerrain } from "./base/render/terrain-component";
import { render, renderer } from "./global/renderer";
import { scene } from "./global/scene";
import { camera } from "./global/camera";
import { renderSky, sky } from "./objects/sky";

export const init = () => {
  const terrain = createTerrain();
  const grass = createGrass();

  scene.add(sky, hemiLight, terrain, grass);

  let prevTime = 0;

  renderer.setAnimationLoop((time) => {
    const dt = (time - prevTime) * 0.00025;
    prevTime = time;

    render(dt);

    renderGrass(camera, time * 0.00025);
    renderSky(dt);
  });
};
