import { light } from "./base/render/hemi-light";
import { createGrass, renderGrass } from "./base/render/grass-component";
import { createTerrain } from "./base/render/terrain-component";
import { render, renderer } from "./base/threejs-component";
import { scene } from "./global/scene";
import { camera } from "./global/camera";
import { renderSky, sky } from "./objects/sky";

export const init = () => {
  scene.add(sky, light);

  camera.position.set(10, 1.95, 0);
  camera.lookAt(0, 4, 10);

  const terrain = createTerrain();
  const grass = createGrass();

  scene.add(terrain, grass);

  let prevTime = 0;

  renderer.setAnimationLoop((time) => {
    const dt = (time - prevTime) * 0.00025;
    prevTime = time;

    render(dt);

    renderGrass(camera, time * 0.00025);
    renderSky(dt);
  });
};
