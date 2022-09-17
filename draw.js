//Starts the animation cycle
function init() {
    let car = new Car(100, 100);
    let track = new Track();
    track.load(defaultTrackCode);
    let canvasHeight, canvasWidth;
    let totalLaps = 0;
    window.requestAnimationFrame(draw);
}

init();

function draw(now) {
    //Sets up canvas: creates it, clears it, then makes the origin the center point for easier math
    const canvas = document.getElementById('drawingArea');
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#C1C0BD";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    canvasHeight = canvas.height;
    canvasWidth = canvas.width;

    //Calculates FPS
    times.unshift(now);
    if (times.length > 10) {
        var t0 = times.pop();
        fps = Math.floor(1000 * 10 / (now - t0));
        document.getElementById('fps').innerHTML = fps;
    }

    //Operates the track
    track.createTrack(ctx);
    track.drawTrack(ctx);
    track.carCrashed(ctx);
    track.drawStartLine(ctx);
    track.drawCheckpoints(ctx);
    track.hittingStartLine();
    if (track.checkpoints.length > 1) {
        track.hittingCheckpoint();
    }

    //Operates the car
    if (!settingCarPos) {
        car.calcVel();
        car.drawDriftTracks(ctx);
        if (rightPressed) {
            car.turn(6);
        } else if (leftPressed) {
            car.turn(-6);
        }
        if (upPressed) {
            car.boostVel(10);
        }
        if (downPressed) {
            car.boostVel(-10);
        }
        //car.wrap(canvas);
        car.getSurroundings(ctx);
    } else {
        car.setStartPos();
    }
    car.show(ctx); //Drawing car last ensures it's on top of everything else drawn

    //Updates and refreshes canvas
    updateLapCounter();
    ctx.restore();
    window.requestAnimationFrame(draw);
}