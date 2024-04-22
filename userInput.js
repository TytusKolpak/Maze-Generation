import app, { drawMaze, richGrid, cellsText, wallSize } from "./app.js";
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
  maxSpeedX = 10,
  maxSpeedY = 10,
  minSpeedAbs = 0.1,
  force = 0.4,
  frictionCoefficient = 0.04;

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

    // Change of position according to standard shift formula: Shift = Velocity * Time (1m = 1m/s * 1s)
    bunny.x += moveSpeedX * delta.deltaTime;
    bunny.y += moveSpeedY * delta.deltaTime;
  };

  app.ticker.add(tickerHandler);
});

function generateCollisionWalls(cellWidth, cellHeight) {
  const walls = [];

  // It happens to be so that we only need top and right walls + 1 big left and 1 big bottom wall to fill whole maze, any more would be duplicates
  // TODO Implement and check the hypothesis
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

function detectCollision(walls) {
  // TODO review and add detection of impaling too
  // FIXME Collision can occur in bunny's middle point currently not at its edges
  const bunnyLeftSide = bunny.x - bunny.width / 2;
  const bunnyRightSide = bunny.x + bunny.width / 2;
  const bunnyTopSide = bunny.y - bunny.height / 2;
  const bunnyBottomSide = bunny.y + bunny.height / 2;

  const buffer = 5; // Add a small buffer to the collision detection (it increases bunny size artificially)

  walls.forEach((wall) => {
    if (wall.isVertical) {
      // Collision can occur from left or right (large area)
      if (bunny.y >= wall.y && bunny.y <= wall.y + wall.length) {
        // Bunny overlaps the wall (collision occurs)
        if (bunnyLeftSide - buffer <= wall.x && bunnyRightSide + buffer >= wall.x) {
          // Bounce the bunny in the other direction immediately
          moveSpeedX = -moveSpeedX;
        }
      }
      // Collision can occur from up or down (very small area)
      // if (bunny.x >= wall.x && bunny.x <= wall.x + wallSize) {
      //   // Bunny overlaps the wall (collision occurs)
      //   if (bunnyLeftSide - buffer <= wall.x && bunnyRightSide + buffer >= wall.x) {
      //     // Bounce the bunny in the other direction immediately
      //     moveSpeedX = -moveSpeedX;
      //   }
      // }
    } else {
      // Wall is horizontal
      // Collision can occur from up or down (large area)
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
