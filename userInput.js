import app, { drawMaze, richGrid, cellsText, wallSize } from "./app.js";
import { Assets, Sprite } from "./node_modules/pixi.js/dist/pixi.min.mjs";

// Initialize global movement parameters
var numbersDisplayed = true,
  tickerHandler,
  bunny,
  accelerationX = 0, // Acceleration rate in x axis (horizontal)
  accelerationY = 0, // Acceleration rate in y axis (vertical)
  moveSpeedX = 0,
  moveSpeedY = 0,
  maxSpeedX = 8,
  maxSpeedY = 8,
  minSpeedAbs = 0.1,
  force = 0.2,
  frictionCoefficient = 0.04,
  gameOver = false;

// Listen for changes to the input field
const gridSizeInput = document.getElementById("gridSizeInput");
gridSizeInput.addEventListener("input", (event) => {
  resetStage();
});

const addOrRemoveCellNumbersButton = document.getElementById("addOrRemoveCellNumbers");
addOrRemoveCellNumbersButton.addEventListener("click", () => {
  addOrRemoveCellNumbers();
});

function addOrRemoveCellNumbers() {
  if (numbersDisplayed) {
    console.log("n for remove Numbers");
    cellsText.forEach((text) => {
      app.stage.removeChild(text);
    });
    numbersDisplayed = false;
  } else {
    console.log("n for add Numbers");
    cellsText.forEach((text) => {
      app.stage.addChild(text);
    });
    numbersDisplayed = true;
  }
}

// Listen for addBunny button click
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
  const cellWidth = (window.innerHeight - 5) / richGrid.length;
  const cellHeight = (window.innerHeight - 5) / richGrid.length;
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
    if (!gameOver) {
      if (bunny.x > cellWidth * (richGrid[0].length - 1) && bunny.y > cellHeight * (richGrid.length - 1)) {
        gameOverFun();
      }
    }
    // Change of position according to standard shift formula: Shift = Velocity * Time (1m = 1m/s * 1s)
    bunny.x += moveSpeedX * delta.deltaTime;
    bunny.y += moveSpeedY * delta.deltaTime;
  };

  app.ticker.add(tickerHandler);
});

function gameOverFun() {
  gameOver = true;
  // Create a div element for the win message
  var winMessage = document.createElement("div");
  winMessage.id = "gameOver";
  winMessage.textContent = "You Win!";

  // Append the message element to the body
  document.body.appendChild(winMessage);
}

function generateCollisionWalls(cellWidth, cellHeight) {
  const walls = [];

  // It happens to be so that we only need top and right walls + 1 big left and 1 big bottom wall to fill whole maze, any more would be duplicates
  richGrid.forEach((row) => {
    row.forEach((cell) => {
      if (cell.topWall) {
        walls.push({
          x: cell.xCoordinate * cellWidth + wallSize,
          y: cell.yCoordinate * cellHeight + wallSize,
          isVertical: false,
          length: cellWidth,
        });
      }
      if (cell.rightWall) {
        walls.push({
          x: (cell.xCoordinate + 1) * cellWidth + wallSize,
          y: cell.yCoordinate * cellHeight + wallSize,
          isVertical: true,
          length: cellHeight,
        });
      }
    });
  });

  // Big left wall
  walls.push({
    x: wallSize,
    y: wallSize,
    isVertical: true,
    length: cellHeight * richGrid.length,
  });

  // Big bottom wall
  walls.push({
    x: wallSize,
    y: cellHeight * richGrid.length + wallSize,
    isVertical: false,
    length: cellWidth * richGrid[0].length,
  });

  return walls;
}

let directionXChanged = false;
let directionYChanged = false;
function detectCollision(walls) {
  // TODO Is there a way to not bounce vertically at the outside corners and not to be impaled

  const buffer = 5; // Add a small buffer to the collision detection (it increases bunny size artificially)
  const bunnyLeftSide = bunny.x - bunny.width / 2 - buffer;
  const bunnyRightSide = bunny.x + bunny.width / 2 + buffer;
  const bunnyTopSide = bunny.y - bunny.height / 2 - buffer;
  const bunnyBottomSide = bunny.y + bunny.height / 2 + buffer;

  // 2*buffer so that it will not bounce vertically from outside walls
  for (let i = 0; i < walls.length; i++) {
    const wall = walls[i];
    if (wall.isVertical) {
      if (bunnyBottomSide - 2 * buffer >= wall.y && bunnyTopSide + 2 * buffer <= wall.y + wall.length) {
        if (bunnyRightSide >= wall.x && bunnyLeftSide <= wall.x) {
          if (!directionXChanged) {
            moveSpeedX = -moveSpeedX;
            directionXChanged = true;
            console.log("directionXChanged");
          } else {
            directionXChanged = false;
          }
        }
      }
    } else {
      // Wall is horizontal
      if (bunnyRightSide - 2 * buffer >= wall.x && bunnyLeftSide + 2 * buffer <= wall.x + wall.length) {
        if (bunnyBottomSide >= wall.y && bunnyTopSide <= wall.y) {
          if (!directionYChanged) {
            moveSpeedY = -moveSpeedY;
            directionYChanged = true;
            console.log("directionYChanged");
          } else {
            directionYChanged = false;
          }
        }
      }
    }
  }
}

function resetStage() {
  console.log("r for reset");
  app.ticker.remove(tickerHandler);
  app.stage.removeChildren();
  if (document.getElementById("gameOver")) {
    document.getElementById("gameOver").remove();
  }
  resetBunnyMovementParameters();
  addBunnyButton.disabled = false;
  gameOver = false;
  const newSize = parseInt(gridSizeInput.value);
  if (newSize) {
    if (newSize >= 2 && newSize <= 50) {
      drawMaze(newSize);
    }
  } else {
    drawMaze(5);
  }
}

function resetBunnyMovementParameters() {
  accelerationX = 0;
  accelerationY = 0;
  moveSpeedX = 0;
  moveSpeedY = 0;
}

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
    case "n":
      addOrRemoveCellNumbers();
      break;
    default:
      console.log("No key binding to this button:", event.key);
      break;
  }
});

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
