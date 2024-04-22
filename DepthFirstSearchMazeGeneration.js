// Few global variables for ease of use
let potentialBranchingCells = [];

// Function to generate a maze-like grid of numbers
function generateMazeGrid(gridWidth, gridHeight) {
  // Initialize grid and go through it as if it was a paragraph of text.
  // Meaning: go from right to left and go to new "line" once there are no more elements in current "line",
  // where "line" is a 1D array in 2D array.
  let richGrid = [];
  for (let y = 0; y < gridHeight; y++) {
    richGrid.push([]);
    for (let x = 0; x < gridWidth; x++) {
      // value=0 will later work as a sign that the cell can be visited (wasn't incorporated into the grid yet)
      richGrid[y].push({
        xCoordinate: x,
        yCoordinate: y,
        order: y * gridWidth + x + 1,
        value: 0,
        topWall: true,
        rightWall: true,
      });
    }
  }
  // Now the order of the cells look like this:
  // 1 2 3
  // 4 5 6

  // Define left upper corner as the start point and right bottom corner as the finish point
  let startXCoordinate = 0;
  let startYCoordinate = 0;

  // Set the first cell's value as 1
  let valueIterator = 1;
  let nextCell = { xCoordinate: 0, yCoordinate: 0 };
  const maxValueIterator = gridHeight * gridWidth;
  richGrid[startYCoordinate][startXCoordinate].value = valueIterator;

  let mazeComplete = false;

  while (!mazeComplete) {
    // Increase the iterator used to indicate which cell goes after the other in the maze
    valueIterator++;
    let currentX = nextCell.xCoordinate;
    let currentY = nextCell.yCoordinate;

    // Choose one of the valid neighboring cells as the destination
    nextCell = selectNextCellToVisit(richGrid, currentX, currentY, gridWidth, gridHeight);

    // Assign new value to it
    richGrid[nextCell.yCoordinate][nextCell.xCoordinate].value = valueIterator;

    // Simplify the array to have just the cell values in it
    const simpleGrid = richGrid.map((row) => row.map((cell) => cell.value));

    // Check if there are any unvisited cells
    const mazeHasUnvisitedCells = simpleGrid.flat().some((element) => element === 0);

    // If the maze has no unvisited cells or the iterator is too large (error catching) mark maze as completed
    if (!mazeHasUnvisitedCells || valueIterator > maxValueIterator) {
      mazeComplete = true;
    }
  }

  return richGrid;
}

// Function to return coordinates of the next cell to be visited (with validation)
function selectNextCellToVisit(richGrid, currentX, currentY, gridWidth, gridHeight) {
  let neighborCanBeVisited = [false, false, false, false];
  let nextCell = { xCoordinate: 0, yCoordinate: 0 };

  // top cell can be visited
  if (currentY - 1 >= 0 && richGrid[currentY - 1][currentX].value == 0) neighborCanBeVisited[0] = true;

  // right cell can be visited (right most cell has currentX=4 when gridWidth=5, right cell of the right most cell would have its xCoordinate=5)
  if (currentX + 1 <= gridWidth - 1 && richGrid[currentY][currentX + 1].value == 0) neighborCanBeVisited[1] = true;

  // bottom cell can be visited
  if (currentY + 1 <= gridHeight - 1 && richGrid[currentY + 1][currentX].value == 0) neighborCanBeVisited[2] = true;

  // left cell can be visited
  if (currentX - 1 >= 0 && richGrid[currentY][currentX - 1].value == 0) neighborCanBeVisited[3] = true;

  // Create an array with only these "directions" which can be visited
  // [false,true,true,false] -> turn false elements to -1 and turn true elements to values of their index -> [-1, 1, 2, -1]
  // [-1, 1, 2, -1] -> return these values which are not -1 -> [1, 2]
  const validDirections = neighborCanBeVisited.map((value, index) => (value ? index : -1)).filter((index) => index !== -1);

  // Mark currently regarded cell as a potential branching point (for later backtracking)
  // Sometimes this is not enough since the second path can be used up too
  if (validDirections.length >= 2) {
    const branchingCell = { xCoordinate: currentX, yCoordinate: currentY };
    potentialBranchingCells.push({ xCoordinate: currentX, yCoordinate: currentY });
  }

  // Select one of the valid directions at random
  const selectedDirection = validDirections[Math.floor(Math.random() * validDirections.length)];

  // !IMPORTANT It happens to be so that we only need top and right walls + 1 big left and 1 big bottom wall to fill whole maze,
  // any more would be duplicates and so we do not need to store or use them
  // Assign coordinates of the cell to visit next
  if (selectedDirection == 0) {
    // Next cell is above current cell
    nextCell = { xCoordinate: currentX, yCoordinate: currentY - 1 };
    richGrid[currentY][currentX].topWall = false;
  } else if (selectedDirection == 1) {
    // Next cell is to the right of current cell
    nextCell = { xCoordinate: currentX + 1, yCoordinate: currentY };
    richGrid[currentY][currentX].rightWall = false;
  } else if (selectedDirection == 2) {
    // Next cell is below current cell
    nextCell = { xCoordinate: currentX, yCoordinate: currentY + 1 };
    richGrid[nextCell.yCoordinate][nextCell.xCoordinate].topWall = false;
  } else if (selectedDirection == 3) {
    // Next cell is to the left of current cell
    nextCell = { xCoordinate: currentX - 1, yCoordinate: currentY };
    richGrid[nextCell.yCoordinate][nextCell.xCoordinate].rightWall = false;
  } else {
    // Some of the potential branching cells might be no longer valid so we need to search for the last one with some paths still open
    const branchingCell = potentialBranchingCells.pop();

    // Use last branching cell as a starting point to find new path
    currentX = branchingCell.xCoordinate;
    currentY = branchingCell.yCoordinate;

    // Here we need to backtrack to find a cell from which movement is possible (using self call)
    return selectNextCellToVisit(richGrid, currentX, currentY, gridWidth, gridHeight);
  }

  return nextCell;
}

function tempLogDirections(directions) {
  let message = "I can go: ";
  directions.forEach((direction) => {
    switch (direction) {
      case 0:
        message += "up ";
        break;
      case 1:
        message += "right ";
        break;
      case 2:
        message += "down ";
        break;
      case 3:
        message += "left ";
        break;
    }
  });
  console.log(message);
}

function tempLogSimplifiedGrid(simpleGrid) {
  simpleGrid.forEach((row) => {
    let cells = "";
    row.forEach((element) => {
      cells += element.toString().padEnd(3, " ");
    });
    console.log(cells);
  });
  console.log("---");
}

// const richMazeGrid = generateMazeGrid(5, 3);
// console.log(richMazeGrid);
// const simpleGrid = richMazeGrid.map((row) => row.map((cell) => cell.value));
// console.log(simpleGrid);
