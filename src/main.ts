import { init } from "./init";
import "./global.css";
import { onWindowResize } from "./global/renderer";

init();

onWindowResize();

window.addEventListener("resize", () => {
  onWindowResize();
});
