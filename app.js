import { Application, Graphics, Text } from "./node_modules/pixi.js/dist/pixi.min.mjs";

var app;
(async () => {
  // Create a new application
  app = new Application();

  // Initialize the application
  await app.init({ resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.view);

  // 1. Draw grid 10 x 10
  const columns = 10;
  const rows = 10;
  drawGrid(columns, rows);

  // 2. Generate maze path (2d array of numbers)
  const mazeGrid = generateMazeGrid(rows, columns);

  // 3. Add text to cells
  drawCellNumbers(mazeGrid);
})();

function drawGrid(columns, rows) {
  const cellSize = Math.floor(window.innerHeight / rows);
  const borderSize = 1; // Also works as offset
  const graphics = new Graphics();
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      graphics.rect(i * cellSize + borderSize, j * cellSize + borderSize, cellSize, cellSize);
      graphics.stroke({ width: borderSize, color: 0xffffff });
    }
  }
  app.stage.addChild(graphics);
}

function drawCellNumbers(grid) {
  const cellSize = Math.floor(window.innerHeight / grid.length);
  const borderSize = 1; // Also works as offset
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      const text = new Text({
        style: { fontFamily: "Arial", fontSize: 24, fill: 0xffffff, align: "center" },
        text: grid[i][j].toString(),
        x: i * cellSize + borderSize,
        y: j * cellSize + borderSize,
      });
      app.stage.addChild(text);
      
    }
  }
}
