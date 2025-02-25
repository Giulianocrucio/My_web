const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
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

    // Calculate and draw the linear regression line
    if (points.length >= 2) {
    const regression = linearRegression(points);
    drawRegressionLine(regression);
    }
}

// Function to calculate linear regression
function linearRegression(points) {
    const n = points.length;
    const xSum = points.reduce((sum, point) => sum + point.x, 0);
    const ySum = points.reduce((sum, point) => sum + point.y, 0);
    const xySum = points.reduce((sum, point) => sum + point.x * point.y, 0);
    const xSquaredSum = points.reduce((sum, point) => sum + point.x * point.x, 0);

    const slope = (n * xySum - xSum * ySum) / (n * xSquaredSum - xSum * xSum);
    const intercept = (ySum - slope * xSum) / n;

    return { slope, intercept };
}

// Function to draw the regression line
function drawRegressionLine(regression) {
    const { slope, intercept } = regression;

    // Calculate start and end points for the line
    const x1 = 0;
    const y1 = slope * x1 + intercept;
    const x2 = canvas.width;
    const y2 = slope * x2 + intercept;

    // Draw the line
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
}