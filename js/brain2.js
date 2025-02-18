const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const polynomialDegreeInput = document.getElementById('polynomialDegree');
const regularizationInput = document.getElementById('regularization');
const clearButton = document.getElementById('clearButton');

let currentColor = colorPicker.value;
let points = [];

// Set canvas size to full window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Update the current color when the color picker changes
colorPicker.addEventListener('input', (event) => {
  currentColor = event.target.value;
});

// Draw a point on the canvas when clicking
canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Add the point to the points array
  points.push({ x, y, color: currentColor });

  // Redraw everything
  redrawCanvas();
});

// Clear the canvas and reset points
clearButton.addEventListener('click', () => {
  points = [];
  redrawCanvas();
});

// Function to normalize x and y values
function normalizeX(x, xMin, xMax) {
  return (x - xMin) / (xMax - xMin) * 2 - 1;
}

function normalizeY(y, yMin, yMax) {
  return (y - yMin) / (yMax - yMin) * 2 - 1;
}

function denormalizeY(normalizedY, yMin, yMax) {
  return (normalizedY + 1) / 2 * (yMax - yMin) + yMin;
}

// Function to redraw the canvas
function redrawCanvas() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw all points
  points.forEach(point => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = point.color;
    ctx.fill();
    ctx.closePath();
  });

  // Fit and draw the polynomial regression curve
  if (points.length >= 2) {
    const degree = parseInt(polynomialDegreeInput.value);
    const regularization = parseFloat(regularizationInput.value);
    const coefficients = polynomialRegression(points, degree, regularization);
    drawPolynomialCurveFromCoefficients(coefficients, degree);
  }
}

function drawPolynomialCurveFromCoefficients(coefficients, degree) {
  // Set up drawing style
  ctx.beginPath();
  ctx.strokeStyle = 'blue'; // You can customize the color
  ctx.lineWidth = 2;

  // Evaluate the polynomial for each x-coordinate on the canvas
  for (let x = 0; x <= canvas.width; x++) {
    // Normalize x to a range (e.g., -10 to 10) for better visualization
    let normalizedX = (x / canvas.width) * 20 - 10;

    // Compute the y-value using the polynomial
    let y = evaluatePolynomial(normalizedX, coefficients);

    // Normalize y back to canvas coordinates
    // Canvas y=0 is at the top, so we invert the y-axis
    let canvasY = canvas.height - ((y + 10) / 20) * canvas.height;

    // Draw the curve
    if (x === 0) {
      ctx.moveTo(x, canvasY); // Move to the first point
    } else {
      ctx.lineTo(x, canvasY); // Draw a line to the next point
    }
  }

  // Stroke the curve
  ctx.stroke();
}

// Function to evaluate the polynomial at a given x
function evaluatePolynomial(x, coefficients) {
  let result = 0;
  for (let i = 0; i < coefficients.length; i++) {
    result += coefficients[i] * Math.pow(x, i);
  }
  return result;
}

function polynomialRegression(points, degree, hyperparameter, learningRate = 0.01, maxIterations = 10000) {
  if (points.length === 0 || degree < 0) {
    throw new Error("Invalid input: points array is empty or degree is negative.");
  }

  // Normalize x and y values
  const xMin = Math.min(...points.map(p => p.x));
  const xMax = Math.max(...points.map(p => p.x));
  const yMin = Math.min(...points.map(p => p.y));
  const yMax = Math.max(...points.map(p => p.y));

  // Initialize coefficients
  let coefficients = new Array(degree + 1).fill(0).map(() => (Math.random() - 0.5) * 0.2);
  // Gradient descent loop
  let prevLoss = Infinity;
  for (let iter = 0; iter < maxIterations; iter++) {
    let gradient = new Array(degree + 1).fill(0);

    // Compute gradient
    for (let i = 0; i < points.length; i++) {
      let x = normalizeX(points[i].x, xMin, xMax);
      let y = normalizeY(points[i].y, yMin, yMax);
      let predictedY = predict(x, coefficients);

      let xPowers = new Array(degree + 1).fill(0).map((_, j) => Math.pow(x, j));
      for (let j = 0; j <= degree; j++) {
        gradient[j] += 2 * (predictedY - y) * xPowers[j];
      }
    }

    // Add regularization term
    for (let j = 0; j <= degree; j++) {
      gradient[j] += 2 * hyperparameter * coefficients[j];
    }

    // Update coefficients
    for (let j = 0; j <= degree; j++) {
      coefficients[j] -= learningRate * gradient[j];
    }

    // Check for convergence
    let loss = computeLoss(points, coefficients, hyperparameter, xMin, xMax, yMin, yMax);
    console.log(`Iteration ${iter}: Loss = ${loss}, Coefficients = ${coefficients}`);
    if (Math.abs(prevLoss - loss) < 1e-6) {
      break;
    }
    prevLoss = loss;
  }

  return coefficients;
}

function predict(x, coefficients) {
  let y = 0;
  for (let j = 0; j < coefficients.length; j++) {
    y += coefficients[j] * Math.pow(x, j);
  }
  return y;
}

function computeLoss(points, coefficients, hyperparameter, xMin, xMax, yMin, yMax) {
  let loss = 0;
  for (let i = 0; i < points.length; i++) {
    let x = normalizeX(points[i].x, xMin, xMax);
    let y = normalizeY(points[i].y, yMin, yMax);
    let predictedY = predict(x, coefficients);
    loss += Math.pow(predictedY - y, 2);
  }
  loss += hyperparameter * coefficients.reduce((sum, coeff) => sum + Math.pow(coeff, 2), 0);
  return loss;
}