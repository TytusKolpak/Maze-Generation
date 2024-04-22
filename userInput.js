import app, { drawMaze, cellGrid, cellsText } from "./app.js";
import { Assets, Sprite } from "./node_modules/pixi.js/dist/pixi.min.mjs";

console.log("X");
// Listen for changes to the input field
const gridSizeInput = document.getElementById("gridSizeInput");
gridSizeInput.addEventListener("input", (event) => {
  resetStage();
});

const addCellNumbers = document.getElementById("addCellNumbers");
addCellNumbers.addEventListener("click", () => {
  cellsText.forEach((text) => {
    app.stage.addChild(text);
  });
});

const removeCellNumbers = document.getElementById("removeCellNumbers");
removeCellNumbers.addEventListener("click", () => {
  cellsText.forEach((text) => {
    app.stage.removeChild(text);
  });
});

// Initialize global movement parameters (We will only control acceleration now to mimic real life (but not force to make it too complicated))
var bunny,
  accelerationX = 0, // Acceleration rate in x axis (horizontal)
  accelerationY = 0, // Acceleration rate in y axis (vertical)
  moveSpeedX = 0,
  moveSpeedY = 0,
  maxSpeedX = 5,
  maxSpeedY = 5,
  minSpeedAbs = 0.1,
  force = 0.4,
  frictionCoefficient = 0.01;

// Listen for addBunny button click
const addBunnyButton = document.getElementById("addBunnyButton");
var tickerHandler;
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
  const cellWidth = (window.innerHeight - 5) / cellGrid.length;
  const cellHeight = (window.innerHeight - 5) / cellGrid.length;
  bunny.x = cellWidth / 2;
  bunny.y = cellHeight / 2;

  app.stage.addChild(bunny);
  console.log("Added bunny to the stage");

  const walls = generateCollisionWalls(cellWidth, cellHeight);

  tickerHandler = (delta) => {
    // Change of speed according to standard speed formula: Velocity = Acceleration * Time (1m/s = 1[m/s2] * 1s)
    moveSpeedX += accelerationX * delta.deltaTime;
    moveSpeedY += accelerationY * delta.deltaTime;

    // Limit moveSpeed
    moveSpeedX = Math.min(maxSpeedX, moveSpeedX); // for going down
    moveSpeedX = Math.max(-maxSpeedX, moveSpeedX); // for going up
    moveSpeedY = Math.min(maxSpeedY, moveSpeedY);
    moveSpeedY = Math.max(-maxSpeedY, moveSpeedY);

    // Slow down the bunny gradually as if there was friction if there is no acceleration (otherwise the bunny wouldn't start)
    if (accelerationX === 0) {
      if (moveSpeedX > minSpeedAbs) {
        moveSpeedX -= frictionCoefficient * delta.deltaTime;
      } else if (moveSpeedX < -minSpeedAbs) {
        moveSpeedX += frictionCoefficient * delta.deltaTime;
      } else {
        moveSpeedX = 0;
      }
    }
    if (accelerationY === 0) {
      if (moveSpeedY > minSpeedAbs) {
        moveSpeedY -= frictionCoefficient * delta.deltaTime;
      } else if (moveSpeedY < -minSpeedAbs) {
        moveSpeedY += frictionCoefficient * delta.deltaTime;
      } else {
        moveSpeedY = 0;
      }
    }

    // Detect collision with the cell walls
    detectCollision(walls);

    // Change of position according to standard shift formula: Shift = Velocity * Time (1m = 1m/s * 1s)
    bunny.x += moveSpeedX * delta.deltaTime;
    bunny.y += moveSpeedY * delta.deltaTime;
  };

  app.ticker.add(tickerHandler);
});

function generateCollisionWalls(cellWidth, cellHeight) {
  const walls = [];

  // Function to check if a wall with the same position and dimensions already exists in the array
  function isDuplicateWall(wall) {
    return walls.some(
      (existingWall) =>
        existingWall.x === wall.x &&
        existingWall.y === wall.y &&
        existingWall.isVertical === wall.isVertical &&
        existingWall.length === wall.length
    );
  }

  // Iterate over each cell in the maze array
  // !important rowIndex and colIndex are backwards temporarily because of a mistake earlier
  cellGrid.forEach((row, colIndex) => {
    row.forEach((cell, rowIndex) => {
      // Calculate the position of the current cell
      const x = colIndex * cellWidth;
      const y = rowIndex * cellHeight;
      const upperWallExists = cell.upperWall;
      const bottomWallExists = cell.bottomWall;
      const leftWallExists = cell.leftWall;
      const rightWallExists = cell.rightWall;

      // console.log({ rowIndex, colIndex, x, y, upperWallExists, bottomWallExists, leftWallExists, rightWallExists });
      // Create wall objects based on the cell's properties
      // Upper wall
      if (cell.upperWall && !isDuplicateWall({ x: x, y: y, isVertical: false, length: cellWidth })) {
        walls.push({
          x: x,
          y: y,
          isVertical: false,
          length: cellWidth,
        });
      }
      // Bottom wall
      if (cell.bottomWall && !isDuplicateWall({ x: x, y: y + cellHeight, isVertical: false, length: cellWidth })) {
        walls.push({
          x: x,
          y: y + cellHeight,
          isVertical: false,
          length: cellWidth,
        });
      }
      // Left wall
      if (cell.leftWall && !isDuplicateWall({ x: x, y: y, isVertical: true, length: cellHeight })) {
        walls.push({
          x: x,
          y: y,
          isVertical: true,
          length: cellHeight,
        });
      }
      // Right wall
      if (cell.rightWall && !isDuplicateWall({ x: x + cellWidth, y: y, isVertical: true, length: cellHeight })) {
        walls.push({
          x: x + cellWidth,
          y: y,
          isVertical: true,
          length: cellHeight,
        });
      }
    });
  });
  console.log(walls);

  return walls;
}

function detectCollision(walls) {
  const bunnyLeftSide = bunny.x - bunny.width / 2;
  const bunnyRightSide = bunny.x + bunny.width / 2;
  const bunnyTopSide = bunny.y - bunny.height / 2;
  const bunnyBottomSide = bunny.y + bunny.height / 2;

  const buffer = 5; // Add a small buffer to the collision detection

  walls.forEach((wall) => {
    if (wall.isVertical) {
      // Collision can occur
      if (bunny.y >= wall.y && bunny.y <= wall.y + wall.length) {
        // Bunny overlaps the wall (collision occurs)
        if (bunnyLeftSide - buffer <= wall.x && bunnyRightSide + buffer >= wall.x) {
          // Bounce the bunny in the other direction immediately
          moveSpeedX = -moveSpeedX;
        }
      }
    } else {
      // Wall is horizontal
      // Collision can occur
      if (bunny.x >= wall.x && bunny.x <= wall.x + wall.length) {
        // Bunny overlaps the wall (collision occurs)
        if (bunnyTopSide - buffer <= wall.y && bunnyBottomSide + buffer >= wall.y) {
          // Bounce the bunny in the other direction immediately
          moveSpeedY = -moveSpeedY;
        }
      }
    }
  });
}
// Listen for arrow keys to control the bunny's movement
document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowUp":
      accelerationY = -force;
      break;
    case "ArrowDown":
      accelerationY = force;
      break;
    case "ArrowLeft":
      accelerationX = -force;
      break;
    case "ArrowRight":
      accelerationX = force;
      break;
    case " ": // space bar
      resetBunnyMovementParameters();
      break;
    case "r":
      resetStage();
      break;
    case "b":
      console.log("b for add Bunny");
      addBunnyButton.click();
      break;
  }
});

function resetStage() {
  console.log("r for reset");

  app.ticker.remove(tickerHandler);
  app.stage.removeChildren();
  resetBunnyMovementParameters();
  addBunnyButton.disabled = false;
  const newSize = parseInt(gridSizeInput.value);
  if (newSize) {
    if (newSize >= 2 && newSize <= 50) {
      drawMaze(newSize);
    }
  } else {
    drawMaze(10);
  }
}

function resetBunnyMovementParameters() {
  accelerationX = 0;
  accelerationY = 0;
  moveSpeedX = 0;
  moveSpeedY = 0;
}

// Listen for keyup events to stop the bunny's movement
document.addEventListener("keyup", (event) => {
  if (bunny) {
    switch (event.key) {
      case "ArrowUp":
      case "ArrowDown":
        accelerationY = 0;
        break;
      case "ArrowLeft":
      case "ArrowRight":
        accelerationX = 0;
        break;
    }
  }
});
