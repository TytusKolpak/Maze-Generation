import app, { drawMaze, richGrid, cellsText, wallSize } from "./app.js";
import { Assets, Sprite, Graphics } from "./node_modules/pixi.js/dist/pixi.min.mjs";

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
  gameOver = false,
  directionXChanged = false,
  directionYChanged = false;

const gridSizeInput = document.getElementById("gridSizeInput");
const addOrRemoveCellNumbersButton = document.getElementById("addOrRemoveCellNumbers");
const addBunnyButton = document.getElementById("addBunnyButton");
const addKnightButton = document.getElementById("addKnightButton");
const floodTheMazeButton = document.getElementById("floodTheMazeButton");

// Listen for changes to the input field
gridSizeInput.addEventListener("input", (event) => {
  resetStage();
});

addOrRemoveCellNumbersButton.addEventListener("click", () => {
  addOrRemoveCellNumbers();
});

addBunnyButton.addEventListener("click", async () => {
  // Disable the button to prevent multiple bunnies from being added
  addBunnyButton.disabled = true;
  // Load the bunny texture
  const texture = await Assets.load("images/bunny.png");

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

addKnightButton.addEventListener("click", () => {
  addKnight();
});

floodTheMazeButton.addEventListener("click", () => {
  floodTheMaze();
});

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
    case "k":
      addKnight();
      break;
    case "f":
      floodTheMaze();
      break;
    default:
      console.log("No key binding to this button:", event.key);
      break;
  }
});

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

async function addKnight() {
  const texture = await Assets.load("images/knight.png");
  const knight = new Sprite(texture);
  knight.anchor.set(0.5);

  const cellWidth = (window.innerHeight - 5) / richGrid.length;
  const cellHeight = (window.innerHeight - 5) / richGrid.length;

  // Resize the sprite
  knight.width = cellWidth * 0.8;
  knight.height = cellHeight * 0.8;

  // Move the sprite
  const cellX = Math.floor(Math.random() * richGrid.length);
  const cellY = Math.floor(Math.random() * richGrid.length);

  knight.x = (cellX + 0.5) * cellWidth;
  knight.y = (cellY + 0.5) * cellHeight;

  app.stage.addChild(knight);
  console.log("Added knight to the stage");
}

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

async function floodTheMaze() {
  console.log("Flooding the maze!");

  // Goal: Sort the cells by their order for later flooding (so we can iterate by their index without repeating to look for the next cell).
  // Sometimes there are branches in the array so there might be 2 (maybe more idk) elements with the same order field value
  // Step 1: Flatten the 2D array into a 1D array
  const richGrid1D = richGrid.flat();

  // Step 2: Sort the 1D array based on the order field
  const sortedRichGrid = richGrid1D.toSorted((a, b) => a.order - b.order);

  const waitTime = 10;
  const cellWidth = (window.innerHeight - 5) / richGrid.length;
  const cellHeight = (window.innerHeight - 5) / richGrid.length;

  // Draw rectangles in the order of the new array, wait "waitTime" milliseconds between each
  for (let i = 0; i < sortedRichGrid.length; i++) {
    const element = sortedRichGrid[i];

    // Calculate the fill color based on the position in the loop
    let fillColor;
    if (i === 0) {
      fillColor = 0x00ff00; // Green for the first cell
    } else if (i === sortedRichGrid.length - 1) {
      fillColor = 0xff0000; // Red for the last cell
    } else {
      fillColor = interpolateColor(i, sortedRichGrid.length);
    }

    // Draw rectangle
    const rectangle = new Graphics();
    rectangle.beginFill(fillColor);
    rectangle.drawRect(element.xCoordinate * cellWidth + wallSize, element.yCoordinate * cellHeight + wallSize, cellWidth, cellHeight);
    rectangle.endFill();
    rectangle.zIndex = -1; // Set the zIndex to place it below other elements
    app.stage.addChild(rectangle); // Add the rectangle to the stage

    // Wait a little before going to the next iteration of the loop
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  // Function to interpolate color based on position in the loop
  function interpolateColor(position, total) {
    const startColor = 0x074173; // Blue
    const endColor = 0xadd8e6; // Light blue
    // const startColor = 0xff0000; // Red
    // const endColor = 0x00ff00; // Green
    const ratio = position / total;
    const r = Math.round((1 - ratio) * (startColor >> 16) + ratio * (endColor >> 16));
    const g = Math.round((1 - ratio) * ((startColor >> 8) & 0xff) + ratio * ((endColor >> 8) & 0xff));
    const b = Math.round((1 - ratio) * (startColor & 0xff) + ratio * (endColor & 0xff));
    return (r << 16) + (g << 8) + b;
  }
}
