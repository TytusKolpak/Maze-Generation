import { Application, Graphics, Text } from "./node_modules/pixi.js/dist/pixi.min.mjs";

var app;
(async () => {
  // Create a new application
  app = new Application();

  // Initialize the application
  await app.init({ resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.view);

  const columns = 10;
  const rows = 10;

  // Create a maze using Depth First Search algorithm
  const mazeGrid = generateMazeGrid(rows, columns);

  // Use its values to create a 2D array of cells
  const cellGrid = generateCellGrid(mazeGrid);

  // Display it on screen using numbered rectangles
  drawGrid(cellGrid);
})();

function generateCellGrid(mazeGrid) {
  // Initialize a 2D array to store the cell objects
  let grid = [];
  for (let i = 0; i < mazeGrid.length; i++) {
    let gridRow = [];
    for (let j = 0; j < mazeGrid[0].length; j++) {
      let gridCell = {
        row: i,
        col: j,
        value: mazeGrid[i][j],
      };
      gridRow.push(gridCell);
    }
    grid.push(gridRow);
  }
  return grid;
}

function drawGrid(grid) {
  const cellSize = Math.floor(window.innerHeight / grid.length);
  const borderSize = 1; // Also works as offset
  const graphics = new Graphics();
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      // Draw rectangles
      graphics.rect(i * cellSize + borderSize, j * cellSize + borderSize, cellSize, cellSize);
      graphics.stroke({ width: borderSize, color: 0xffffff });

      // Draw numbers
      const text = new Text({
        style: { fontFamily: "Arial", fontSize: 24, fill: 0xffffff, align: "center" },
        text: grid[i][j].value.toString(),
        x: i * cellSize + borderSize,
        y: j * cellSize + borderSize,
      });
      app.stage.addChild(text);
    }
  }
  app.stage.addChild(graphics);
}