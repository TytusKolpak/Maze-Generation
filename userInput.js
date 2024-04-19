import drawMaze from "./app.js";

// Listen for changes to the input field
const gridSizeInput = document.getElementById("gridSizeInput");
gridSizeInput.addEventListener("input", (event) => {
  const newSize = parseInt(event.target.value);
  if (!isNaN(newSize) && newSize >= 3 && newSize <= 20) {
    drawMaze(newSize);
  }
});
