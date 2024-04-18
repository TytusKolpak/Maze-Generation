import {
  Application,
  Graphics,
} from "./node_modules/pixi.js/dist/pixi.min.mjs";

var app;
(async () => {
  // Create a new application
  app = new Application();

  // Initialize the application
  await app.init({ resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  fillScreenWithRectangles();
})();

function fillScreenWithRectangles() {
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      const xPosition = (window.innerWidth / 10) * i;
      const yPosition = (window.innerHeight / 10) * j;
      const color = getColorBySpectrum((j * 10 + i) / 100);
      addRectangle(xPosition, yPosition, color);
    }
  }
}

function addRectangle(xPosition, yPosition, color) {
  // Create a Graphics object
  const graphics = new Graphics();
  const fillColor = color;
  const width = 200,
    height = 100;

  graphics
    .beginFill(fillColor)
    .drawRect(xPosition, yPosition, width, height)
    .endFill();

  // Add the Graphics object to the stage
  app.stage.addChild(graphics);
}

function getColorBySpectrum(position) {
  // Calculate hue value based on position (0 to 1)
  const hue = (1 - position) * 120; // Green at 100% (0 hue) to Red at 0% (120 hue)

  // Convert HSL to RGB
  const rgbColor = hslToRgb(hue / 360, 1, 0.5); // Saturation and Lightness set to 1 and 0.5 respectively

  // Convert RGB to hexadecimal
  const hexColor = rgbToHex(rgbColor[0], rgbColor[1], rgbColor[2]);

  return hexColor;
}

function hslToRgb(h, s, l) {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
