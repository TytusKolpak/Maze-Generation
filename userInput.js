import app, { drawMaze, cellGrid } from "./app.js";
import { Assets, Sprite } from "./node_modules/pixi.js/dist/pixi.min.mjs";

// Listen for changes to the input field
const gridSizeInput = document.getElementById("gridSizeInput");
gridSizeInput.addEventListener("input", (event) => {
  const newSize = parseInt(event.target.value);
  if (!isNaN(newSize) && newSize >= 3 && newSize <= 20) {
    drawMaze(newSize);
  }
});
// Listen for addBunny button click
var bunny, moveSpeed, acceleration, maxSpeed, directionVertical, directionHorizontal, keyPressedDuration;
const addBunnyButton = document.getElementById("addBunnyButton");
addBunnyButton.addEventListener("click", async () => {
  // Disable the button to prevent multiple bunnies from being added
  addBunnyButton.disabled = true;
  // Load the bunny texture
  const texture = await Assets.load("bunny.png");

  // Create a bunny Sprite
  bunny = new Sprite(texture);

  // Center the sprite's anchor point
  bunny.anchor.set(0.5);

  // Move the sprite to the center of the first cell
  bunny.x = (window.innerHeight - 5) / cellGrid.length / 2;
  bunny.y = (window.innerHeight - 5) / cellGrid.length / 2;

  app.stage.addChild(bunny);
  console.log("Added bunny to the stage");

  // Initialize movement parameters
  moveSpeed = 0;
  acceleration = 0.1; // Acceleration rate
  maxSpeed = 5; // Maximum speed
  directionVertical = 0;
  directionHorizontal = 0;
  keyPressedDuration = 0;

  // Listen for animate update
  app.ticker.add((delta) => {
    // Accelerate or decelerate based on the duration the key was pressed

    // It needs to be separated somehow and refined cuz it funky rn
    moveSpeed += acceleration * Math.abs(directionVertical);
    moveSpeed += acceleration * Math.abs(directionHorizontal);

    bunny.y += moveSpeed * directionVertical * delta.deltaTime;
    bunny.x += moveSpeed * directionHorizontal * delta.deltaTime;

    // Reverse the directionVertical when the bunny reaches the top or bottom of the screen
    if (bunny.y - bunny.height / 2 <= 0 || bunny.y + bunny.height / 2 >= app.screen.height) {
      directionVertical *= -1;
    }
    if (bunny.x - bunny.width / 2 <= 0 || bunny.x + bunny.width / 2 >= app.screen.width) {
      directionHorizontal *= -1;
    }
  });
});

// Listen for arrow keys to control the bunny's movement
document.addEventListener("keydown", (event) => {
  if (bunny) {
    switch (event.key) {
      case "ArrowUp":
        directionVertical = -1;
        keyPressedDuration = 0; // Reset the duration
        break;
      case "ArrowDown":
        directionVertical = 1;
        keyPressedDuration = 0; // Reset the duration
        break;
      case "ArrowLeft":
        directionHorizontal = -1;
        keyPressedDuration = 0; // Reset the duration
        break;
      case "ArrowRight":
        directionHorizontal = 1;
        keyPressedDuration = 0; // Reset the duration
        break;
    }
  }
});

// Listen for keyup events to stop the bunny's movement
document.addEventListener("keyup", (event) => {
  if (bunny) {
    switch (event.key) {
      case "ArrowUp":
      case "ArrowDown":
        directionVertical = 0;
        moveSpeed = 0;
        break;
      case "ArrowLeft":
      case "ArrowRight":
        directionHorizontal = 0;
        moveSpeed = 0;
        break;
    }
  }
});
