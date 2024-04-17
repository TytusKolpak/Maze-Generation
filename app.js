import {
  Application,
  Graphics,
} from "./node_modules/pixi.js/dist/pixi.min.mjs";

var app;
(async () => {
  // Create a new application
  app = new Application();

  // Initialize the application
  await app.init({ resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  fillScreenWithRectangles();
})();

function fillScreenWithRectangles() {
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      const xPosition = (window.innerWidth / 10) * i;
      const yPosition = (window.innerHeight / 10) * j;
      addRectangle(xPosition, yPosition);
    }
  }
}

function getRandomColor() {
  // Generate random values for red, green, and blue channels
  const r = Math.floor(Math.random() * 256); // Random value between 0 and 255
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  // Convert the values to hexadecimal and concatenate them
  const color = `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

  return color;
}

function addRectangle(xPosition, yPosition) {
  // Create a Graphics object
  const graphics = new Graphics();
  const fillColor = getRandomColor();
  const width = 200,
    height = 100;

  graphics
    .beginFill(fillColor)
    .drawRect(xPosition, yPosition, width, height)
    .endFill();

  // Add the Graphics object to the stage
  app.stage.addChild(graphics);
}
