//Handles draw track button
let dtoutput = document.getElementById('drawTrackValue');
dtoutput.innerHTML = "off";
function changeDrawTrackState() {
    if (track.isDrawingTrack) {
        track.isDrawingTrack = false;
        dtoutput.innerHTML = "off";
    } else {
        track.isDrawingTrack = true;
        dtoutput.innerHTML = "on";
    }
}

//Handles clear track button
function clearTrack() {
    track.clear();
}

//Handles save track button
function saveTrack() {
    track.save();
}

//Handles setting the car's starting position
function setCarPos() {
    car.died();
    settingCarPos = true;
}

//Handles load track button
function loadTrack() {
    track.load(prompt("Enter your save code here"), car);
}

//Handles undo last drawn track button
function undoTrack() {
    track.undoLastStroke();
}

//Handles creation of start line
function createStartLine() {
    track.isMakingStartLine = 1;
    track.createStartLine();
}

//Handles the create checkpoint button
let ccOutput = document.getElementById("createCheckpointValue");
ccOutput.innerHTML = "Create Checkpoints";
function createCheckpoint() {
    if (!track.isDrawingCheckpoints) {
        track.isDrawingCheckpoints = true;
        track.isMakingCheckpoint = 1;
        ccOutput.innerHTML = "Finish Creating Checkpoints";
        track.createCheckpoints();
    } else {
        track.isDrawingCheckpoints = false;
        ccOutput.innerHTML = "Create Checkpoints";
    }

}

//Handles the undo checkpoint button
function undoCheckpoint() {
    track.undoCheckpoint();
}

//Handles the show/hide checkpoints button
let ccvoutput = document.getElementById("changeCheckpointVisibilityValue")
ccvoutput.innerHTML = "Hide Checkpoints";
function changeCheckpointVisibility() {
    if (track.showCheckpoints) {
        track.showCheckpoints = false;
        ccvoutput.innerHTML = "Show Checkpoints";
    } else {
        track.showCheckpoints = true;
        ccvoutput.innerHTML = "Hide Checkpoints";
    }
}