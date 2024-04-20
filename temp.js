// Listen for addBunny button click
var bunny, moveSpeed, acceleration, maxSpeed, directionVertical, directionHorizontal, keyPressedDuration;
const addBunnyButton = document.getElementById("addBunnyButton");
addBunnyButton.addEventListener("click", async () => {
  // Load the bunny texture
  const texture = await Assets.load("https://pixijs.com/assets/bunny.png");

  // Create a bunny Sprite
  bunny = new Sprite(texture);

  // Center the sprite's anchor point
  bunny.anchor.set(0.5);

  // Initialize movement parameters
  moveSpeed = 0;
  acceleration = 0.1; // Acceleration rate
  maxSpeed = 5; // Maximum speed
  directionVertical = 0;
  directionHorizontal = 0;
  keyPressedDuration = 0;

  // Listen for animate update
  app.ticker.add((delta) => {
    // Accelerate or decelerate based on the duration the key was pressed
    moveSpeed += acceleration * directionVertical;
    moveSpeed = Math.min(maxSpeed, Math.max(0, moveSpeed));

    // Move the bunny
    bunny.y += moveSpeed * directionVertical * delta;
    bunny.x += moveSpeed * directionHorizontal * delta;

    // Reverse the directionVertical when the bunny reaches the top or bottom of the screen
    if (bunny.y - bunny.height / 2 <= 0 || bunny.y + bunny.height / 2 >= app.screen.height) {
      directionVertical *= -1;
    }
    if (bunny.x - bunny.width / 2 <= 0 || bunny.x + bunny.width / 2 >= app.screen.width) {
      directionHorizontal *= -1;
    }
  });

  // Move the sprite to the center of the screen
  bunny.x = app.screen.width / 2;
  bunny.y = app.screen.height / 2;

  // Add the bunny to the stage
  app.stage.addChild(bunny);
});