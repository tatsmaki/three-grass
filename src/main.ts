import { init } from "./init";
import "./global.css";
import { onWindowResize } from "./base/threejs-component";

init();

onWindowResize();

window.addEventListener("resize", () => {
  onWindowResize();
});
