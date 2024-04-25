import { Application, Graphics, Text } from "./node_modules/pixi.js/dist/pixi.min.mjs";

var app;
(async () => {
  // Create a new application
  app = new Application();

  // Initialize the application
  await app.init({
    // background: "#1099bb",
    resizeTo: window,
  });

  // Append the application canvas to the document body
  document.body.appendChild(app.view);

  const mazeSize = 5;
  drawMaze(mazeSize); // Example usage
})();

export function drawMaze(mazeSize) {
  // Clear previous grid
  app.stage.removeChildren();

  // Messed something with colum / row ordering in loops so it works with NxN grid only
  const gridWidth = mazeSize;
  const gridHeight = mazeSize;

  // Create a maze using Depth First Search algorithm
  richGrid = generateMazeGrid(gridWidth, gridHeight);

  // Display it on screen using numbered rectangles
  drawGrid(richGrid);
}

function drawGrid(grid) {
  // console.log(grid);
  const gridHeight = grid.length;
  const gridWidth = grid[0].length;
  const cellSize = (window.innerHeight - 5) / grid.length;
  const graphics = new Graphics();

  cellsText = [];

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      // It happens to be so that we only need top and right walls + 1 big left and 1 big bottom wall to fill whole maze, any more would be duplicates
      // Draw cell walls
      if (grid[y][x].topWall) {
        graphics.moveTo(x * cellSize + wallSize, y * cellSize + wallSize); // Starting point of the line
        graphics.lineTo((x + 1) * cellSize + wallSize, y * cellSize + wallSize); // Ending point of the line
      }
      if (grid[y][x].rightWall) {
        graphics.moveTo((x + 1) * cellSize + wallSize, y * cellSize + wallSize);
        graphics.lineTo((x + 1) * cellSize + wallSize, (y + 1) * cellSize + wallSize);
      }
      graphics.stroke({ width: wallSize, color: 0xffffff });

      // Draw numbers
      if (gridHeight < 20) {
        const text = new Text({
          style: { fontFamily: "Arial", fontSize: 20, fill: 0xffffff, align: "center" },
          text: grid[y][x].value.toString(),
          x: x * cellSize + wallSize + 2, //Shift them a little to the right so that line and number don't overlap
          y: y * cellSize + wallSize,
        });
        cellsText.push(text);
      }
    }
  }

  // Additionally we draw one big left wall and one big right wall
  graphics.moveTo(wallSize, wallSize);
  graphics.lineTo(wallSize, gridHeight * cellSize + wallSize);
  graphics.lineTo(gridWidth * cellSize + wallSize, gridHeight * cellSize + wallSize);
  graphics.stroke({ width: wallSize, color: 0xffffff });

  app.stage.addChild(graphics);
  if (gridHeight < 20) {
    cellsText.forEach((text) => {
      app.stage.addChild(text);
    });
  }
}

export const wallSize = 2; // Also works as offset
export var cellsText = [];
export var richGrid;
export default app;
