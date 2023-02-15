let track;
let car;
let startPos;
// Starts the animation cycle
function init() {
    track = new Track();
    track.load(defaultTrackCode);
    car = new Car(0, 0);
    car.load(defaultTrackCode);
    startPos = car.getStartPos();

    // Starts the animation cycle
    window.requestAnimationFrame(draw);
}

init();

function draw() {
    //Sets up canvas: creates it, clears it, then makes the origin the center point for easier math. Y increases downwards, x increases rightwards
    const canvas = document.getElementById('drawingArea');
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#C1C0BD";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    canvasHeight = canvas.height;
    canvasWidth = canvas.width;

    track.displayTrack(ctx); // might be able to get away with doing this one time at start for efficiency

    // Update the car
    if (rightPressed) {
        car.turn(5);
    } else if (leftPressed) {
        car.turn(-5);
    }
    if (upPressed) {
        car.accelerate(1);
    }
    if (downPressed) {
        car.accelerate(-1);
    }
    car.update(ctx, track);

    // Updates and refreshes the canvas
    ctx.restore();
    window.requestAnimationFrame(draw);
}