//Variables for fps
let times = [];
let fps = 60;

/*
To-do:

(done, kinda) doriftooooo
make drift physics better
    -maybe slower while drifting, more sliding

make car stop disappearing when alt tabbed
add a lap counter and track start pos
    -add to save code

compress save code with smth 

make scalable with larger screen
fix refresh rate scaling
track save files
changing car size changes stats

Car turning red flickers when doing so, fix that
add animations (boost, drift sparks/smoke, tire trails, etc)

Make a tutorial page

make an AI


*/



function Point(x, y) {
    this.x = x;
    this.y = y;
}

//These functions are for line segment intersection detection, also definitely not stolen code ofc not
function onSegment(p, q, r)
{
    if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
        q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y))
    return true;
    
    return false;
}
  
// To find orientation of ordered triplet (p, q, r).
// The function returns following values
// 0 --> p, q and r are collinear
// 1 --> Clockwise
// 2 --> Counterclockwise
function orientation(p, q, r)
{
  
    // See https://www.geeksforgeeks.org/orientation-3-ordered-points/
    // for details of below formula.
    let val = (q.y - p.y) * (r.x - q.x) -
            (q.x - p.x) * (r.y - q.y);
    
    if (val == 0) return 0; // collinear
    
    return (val > 0)? 1: 2; // clock or counterclock wise
}
  
// The main function that returns true if line segment 'p1q1'
// and 'p2q2' intersect.
function doIntersect(p1, q1, p2, q2)
{
  
    // Find the four orientations needed for general and
    // special cases
    let o1 = orientation(p1, q1, p2);
    let o2 = orientation(p1, q1, q2);
    let o3 = orientation(p2, q2, p1);
    let o4 = orientation(p2, q2, q1);
    
    // General case
    if (o1 != o2 && o3 != o4)
        return true;
    
    // Special Cases
    // p1, q1 and p2 are collinear and p2 lies on segment p1q1
    if (o1 == 0 && onSegment(p1, p2, q1)) return true;
    
    // p1, q1 and q2 are collinear and q2 lies on segment p1q1
    if (o2 == 0 && onSegment(p1, q2, q1)) return true;
    
    // p2, q2 and p1 are collinear and p1 lies on segment p2q2
    if (o3 == 0 && onSegment(p2, p1, q2)) return true;
    
    // p2, q2 and q1 are collinear and q1 lies on segment p2q2
    if (o4 == 0 && onSegment(p2, q1, q2)) return true;
    
    return false; // Doesn't fall in any of the above cases
}

//Some definitely not stolen code to calculate intersection of two line segments
function lineLineIntersection(A,B,C,D){
    // Line AB represented as a1x + b1y = c1
    let a1 = B.y - A.y;
    let b1 = A.x - B.x;
    let c1 = a1*(A.x) + b1*(A.y);
    
    // Line CD represented as a2x + b2y = c2
    let a2 = D.y - C.y;
    let b2 = C.x - D.x;
    let c2 = a2*(C.x)+ b2*(C.y);
    
    let determinant = a1*b2 - a2*b1;
    
    if (determinant == 0)
    {
        // The lines are parallel. This is simplified
        // by returning a pair of FLT_MAX
        return new Point(Number.MAX_VALUE, Number.MAX_VALUE);
    }
    else
    {
        console.log("returning: " + new Point((b2*c1 - b1*c2)/determinant, (a1*c2 - a2*c1)/determinant));
        return new Point((b2*c1 - b1*c2)/determinant, (a1*c2 - a2*c1)/determinant);
    }
}

//returns distance between two points
function getDistance(p1, p2) {
    return (Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2));
}

//Tracks mouse position
document.addEventListener("mousemove", getMouseCoords, false);
let mouseX, mouseY;
function getMouseCoords(e) {
    mouseX = e.pageX;
    mouseY = e.pageY;
}
//Handles keyboard inputs definitely not copy pasted from the internet ofc not wdym
let rightPressed, leftPressed, upPressed, downPressed;
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
function keyDownHandler(e) {
    if ("code" in e) {
        switch(e.code) {
            case "Unidentified":
                break;
            case "ArrowRight":
            case "Right": // IE <= 9 and FF <= 36
            case "KeyD":
                rightPressed = true;
                return;
            case "ArrowLeft":
            case "Left": // IE <= 9 and FF <= 36
            case "KeyA":
                leftPressed = true;
                return;
            case "ArrowUp":
            case "Up": // IE <= 9 and FF <= 36
            case "KeyW":
               upPressed = true;
               return;
            case "ArrowDown":
            case "Down": // IE <= 9 and FF <= 36
            case "KeyS":
               downPressed = true;
               return;
            default:
               return;
        }
    }
    if(e.keyCode == 39) {
        rightPressed = true;
    }
    else if(e.keyCode == 37) {
       leftPressed = true;
    }
    if(e.keyCode == 40) {
        downPressed = true;
    }
    else if(e.keyCode == 38) {
       upPressed = true;
    }
}

function keyUpHandler(e) {
    if ("code" in e) {
        switch(e.code) {
            case "Unidentified":
                break;
            case "ArrowRight":
            case "Right": // IE <= 9 and FF <= 36
            case "KeyD":
                rightPressed = false;
                return;
            case "ArrowLeft":
            case "Left": // IE <= 9 and FF <= 36
            case "KeyA":
                leftPressed = false;
                return;
            case "ArrowUp":
            case "Up": // IE <= 9 and FF <= 36
            case "KeyW":
                upPressed = false;
                return;
            case "ArrowDown":
            case "Down": // IE <= 9 and FF <= 36
            case "KeyS":
                downPressed = false;
                return;
            default:
                return;
        }
    }
    if(e.keyCode == 39) {
        rightPressed = false;
    }
    else if(e.keyCode == 37) {
        leftPressed = false;
    }
    if(e.keyCode == 40) {
        downPressed = false;
    }
    else if(e.keyCode == 38) {
        upPressed = false;
    }
}

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
let settingCarPos = false;
function setCarPos() {
    car.died();
    settingCarPos = true;
}

//Handles load track button
function loadTrack() {
    track.load(prompt("Enter your save code here"));
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

let lapUpdater = document.getElementById("lapsTotal");
function updateLapCounter() {
    lapUpdater.innerHTML = totalLaps;
}







