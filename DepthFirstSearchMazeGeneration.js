// Function to generate a maze-like grid of numbers
function generateMazeGrid(rows, cols) {
  // Initialize grid
  let grid = [];
  for (let i = 0; i < rows; i++) {
    grid.push([]);
    for (let j = 0; j < cols; j++) {
      grid[i].push(-1); // Initialize with placeholder value
    }
  }

  // DFS algorithm to generate maze pattern
  let num = 0;
  let stack = [{ row: 0, col: 0 }];
  while (stack.length > 0 && num < rows * cols) {
    let current = stack.pop();
    let row = current.row;
    let col = current.col;

    if (grid[row][col] === -1) {
      grid[row][col] = num++;
      let neighbors = getNeighbors(row, col, rows, cols);
      neighbors = neighbors.filter(
        (neighbor) => grid[neighbor.row][neighbor.col] === -1
      );
      neighbors.sort((a, b) => {
        let distanceA =
          Math.abs(a.row - ((num / cols) | 0)) + Math.abs(a.col - (num % cols));
        let distanceB =
          Math.abs(b.row - ((num / cols) | 0)) + Math.abs(b.col - (num % cols));
        return distanceA - distanceB || Math.random() - 0.5; // Randomize order if distances are equal
      });
      for (let neighbor of neighbors) {
        stack.push(neighbor);
      }
    }
  }

  return grid;
}

// Function to get neighboring cells
function getNeighbors(row, col, rows, cols) {
  let neighbors = [];
  if (row > 0) neighbors.push({ row: row - 1, col });
  if (row < rows - 1) neighbors.push({ row: row + 1, col });
  if (col > 0) neighbors.push({ row, col: col - 1 });
  if (col < cols - 1) neighbors.push({ row, col: col + 1 });
  return neighbors;
}

// Output the maze grid
function printGrid(grid) {
  grid.forEach((row) => console.log(row.join("\t")));
}
