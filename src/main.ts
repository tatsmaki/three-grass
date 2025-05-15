import { init } from "./init";
import "./global.css";

const canvas = document.getElementById("canvas");

const controller = init(canvas);

controller.onWindowResize();

window.addEventListener("resize", () => {
  controller.onWindowResize();
});
