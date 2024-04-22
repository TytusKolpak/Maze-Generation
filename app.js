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

  const mazeSize = 2;
  drawMaze(mazeSize); // Example usage
})();

export function drawMaze(mazeSize) {
  // Clear previous grid
  app.stage.removeChildren();

  // Messed something with colum / row ordering in loops so it works with NxN grid only
  const columns = mazeSize;
  const rows = mazeSize;

  // Create a maze using Depth First Search algorithm
  const mazeGrid = generateMazeGrid(rows, columns);
  console.log(mazeGrid);

  // Use its values to create a 2D array of cells
  cellGrid = generateCellGrid(mazeGrid);

  // Display it on screen using numbered rectangles
  drawGrid(cellGrid);
}

function generateCellGrid(mazeGrid) {
  // Initialize a 2D array to store the cell objects
  let grid = [];
  //column
  for (let i = 0; i < mazeGrid.length; i++) {
    let gridRow = [];
    //row
    for (let j = 0; j < mazeGrid[0].length; j++) {
      var useUpperWall = true;
      var useRightWall = true;
      var useBottomWall = true;
      var useLeftWall = true;

      // Check already-existing mazeGrid if a neighbor cell exists (it doesn't at the border)
      // and has a value within 1 of the current cell's value
      if (j - 1 >= 0 && Math.abs(mazeGrid[i][j] - mazeGrid[i][j - 1]) === 1) {
        useUpperWall = false;
      }
      if (i - 1 >= 0 && Math.abs(mazeGrid[i][j] - mazeGrid[i - 1][j]) === 1) {
        useLeftWall = false;
      }
      if (i + 1 < mazeGrid[0].length && Math.abs(mazeGrid[i][j] - mazeGrid[i + 1][j]) === 1) {
        useRightWall = false;
      }
      if (j + 1 < mazeGrid.length && Math.abs(mazeGrid[i][j] - mazeGrid[i][j + 1]) === 1) {
        useBottomWall = false;
      }

      // Create a cell object
      let gridCell = {
        upperWall: useUpperWall,
        rightWall: useRightWall,
        bottomWall: useBottomWall,
        leftWall: useLeftWall,
        row: i,
        col: j,
        value: mazeGrid[i][j],
      };
      gridRow.push(gridCell);
    }
    grid.push(gridRow);
  }

  // Apply backtracking errors
  const finishedGrid = removeClosedBranchWalls(grid, mazeGrid);

  return finishedGrid;
}

export var cellsText = [];
function drawGrid(grid) {
  const cellSize = (window.innerHeight - 5) / grid.length;
  const wallSize = 2; // Also works as offset
  const graphics = new Graphics();

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      // Draw cell walls
      if (grid[i][j].upperWall) {
        graphics.moveTo(i * cellSize + wallSize, j * cellSize + wallSize); // Starting point of the line
        graphics.lineTo((i + 1) * cellSize + wallSize, j * cellSize + wallSize); // Ending point of the line
      }
      if (grid[i][j].rightWall) {
        graphics.moveTo((i + 1) * cellSize + wallSize, j * cellSize + wallSize);
        graphics.lineTo((i + 1) * cellSize + wallSize, (j + 1) * cellSize + wallSize);
      }
      if (grid[i][j].bottomWall) {
        graphics.moveTo(i * cellSize + wallSize, (j + 1) * cellSize + wallSize);
        graphics.lineTo((i + 1) * cellSize + wallSize, (j + 1) * cellSize + wallSize);
      }
      if (grid[i][j].leftWall) {
        graphics.moveTo(i * cellSize + wallSize, j * cellSize + wallSize);
        graphics.lineTo(i * cellSize + wallSize, (j + 1) * cellSize + wallSize);
      }
      graphics.stroke({ width: wallSize, color: 0xffffff });

      // Draw numbers
      const text = new Text({
        style: { fontFamily: "Arial", fontSize: 20, fill: 0xffffff, align: "center" },
        text: grid[i][j].value.toString(),
        x: i * cellSize + wallSize + 2, //Shift them a little to the right so that line and number don't overlap
        y: j * cellSize + wallSize,
      });
      cellsText.push(text);
    }
  }
  app.stage.addChild(graphics);
}

function removeClosedBranchWalls(grid, mazeGrid) {
  // Check for backtracked paths
  // If there is a cell whose only neighbor with value different by 1 has value Smaller by 1 it means we are in a deadEnd
  // and we need to backtrack. Find which cells are like this
  //column
  for (let i = 0; i < mazeGrid.length; i++) {
    //row
    for (let j = 0; j < mazeGrid[0].length; j++) {
      // Check if currently checked cell has no neighbors whose values is larger than it by 1
      var cellIsDeadEnd = true;
      if (j - 1 >= 0 && mazeGrid[i][j - 1] - mazeGrid[i][j] === 1) {
        cellIsDeadEnd = false;
      } else if (i - 1 >= 0 && mazeGrid[i - 1][j] - mazeGrid[i][j] === 1) {
        cellIsDeadEnd = false;
      } else if (i + 1 < mazeGrid[0].length && mazeGrid[i + 1][j] - mazeGrid[i][j] === 1) {
        cellIsDeadEnd = false;
      } else if (j + 1 < mazeGrid.length && mazeGrid[i][j + 1] - mazeGrid[i][j] === 1) {
        cellIsDeadEnd = false;
      }

      if (cellIsDeadEnd) {
        // First we need to store deadEnd cells value
        let deadEndCellValue = mazeGrid[i][j];

        // Then go back through the neighbors with values decreasing by 1 until we find a neighbor
        // whose value is 1 larger than the deadEndCellsValue and then remove according wall of the found cell as a branch
        var branchingCellFound = false;
        var iterator = 1;
        var x = i;
        var y = j;
        let checkedCellRow, checkedCellCol;

        while (!branchingCellFound) {
          var checkedCellValue = deadEndCellValue - iterator;
          if (checkedCellValue === 0) {
            // We've reached the start of the maze, no need to continue
            break;
          }
          // Find index of the next cell to check in mazeGrid, it's enough to only check current cells neighbors
          // (Meaning: Where is the previous cell?)
          if (y - 1 >= 0 && mazeGrid[x][y - 1] === checkedCellValue) {
            checkedCellCol = x;
            checkedCellRow = y - 1;
            //console.log("Looked for cell", checkedCellValue, "and found at", x, y - 1);
          } else if (x - 1 >= 0 && mazeGrid[x - 1][y] === checkedCellValue) {
            checkedCellCol = x - 1;
            checkedCellRow = y;
            //console.log("Looked for cell", checkedCellValue, "and found at", x - 1, y);
          } else if (x + 1 < mazeGrid[0].length && mazeGrid[x + 1][y] === checkedCellValue) {
            checkedCellCol = x + 1;
            checkedCellRow = y;
            //console.log("Looked for cell", checkedCellValue, "and found at", x + 1, y);
          } else if (y + 1 < mazeGrid.length && mazeGrid[x][y + 1] === checkedCellValue) {
            checkedCellCol = x;
            checkedCellRow = y + 1;
            //console.log("Looked for cell", checkedCellValue, "and found at", x, y + 1);
          } else {
            //console.log("Checked cell", checkedCellValue, " not found");
          }

          // Now we have indexes of the previous cell

          // If the checked cell has a neighbor whose value is larger by 1 than deadEndCellValue then that means we found the branch point
          branchingCellFound = true; // This will end the loop if it won't be overwritten in else statement
          if (checkedCellRow - 1 >= 0 && mazeGrid[checkedCellCol][checkedCellRow - 1] === deadEndCellValue + 1) {
            grid[checkedCellCol][checkedCellRow].upperWall = false; // remove according wall in this cell
            grid[checkedCellCol][checkedCellRow - 1].bottomWall = false; // and opposite wall in the next one (left in 7 and right in 6 )
          } else if (checkedCellRow + 1 < mazeGrid.length && mazeGrid[checkedCellCol][checkedCellRow + 1] === deadEndCellValue + 1) {
            grid[checkedCellCol][checkedCellRow].bottomWall = false;
            grid[checkedCellCol][checkedCellRow + 1].upperWall = false;
          } else if (checkedCellCol - 1 >= 0 && mazeGrid[checkedCellCol - 1][checkedCellRow] === deadEndCellValue + 1) {
            grid[checkedCellCol][checkedCellRow].leftWall = false;
            grid[checkedCellCol - 1][checkedCellRow].rightWall = false;
          } else if (checkedCellCol + 1 < mazeGrid[0].length && mazeGrid[checkedCellCol + 1][checkedCellRow] === deadEndCellValue + 1) {
            grid[checkedCellCol][checkedCellRow].rightWall = false;
            grid[checkedCellCol + 1][checkedCellRow].leftWall = false;
          } else {
            branchingCellFound = false;
          }

          x = checkedCellCol;
          y = checkedCellRow;

          iterator++;
          if (iterator > 100000) {
            console.error("Something went wrong. There has been 100000 iterations of backtrack path opening. Infinite loop stopped");
            break;
          }
        }
      }
    }
  }
  return grid;
}

export default app;
export var cellGrid;
