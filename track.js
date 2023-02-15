class Track {
    // Track Colors
    #trackColor;
    #startLineColor;
    #checkpointColor;

    // Track Data
    #xVals; // Stores the x values of each track point
    #yVals; // Stores the y values of each track point
    #startLine; // Starting line of the track. Is a line based on 2 points [(x1,y1), (x2,y2)]
    #checkpoints; // Stores the checkpoints of the track as an array of track markers (points) in form (i, i+1)

    // Flags
    #showCheckpoints = true;


    constructor() {
        this.#trackColor = "#000000";
        this.#startLineColor = "#1ED32C";
        this.#checkpointColor = "#FFFFFF";

        this.#xVals = []; // Stores the x values of each track point
        this.#yVals = []; // Stores the y values of each track point
        this.#startLine = [new Point(0, 0), new Point(0, 0)]; // Starting line of the track. Is a line based on 2 points [(x1,y1), (x2,y2)]
        this.#checkpoints = []; // Stores the checkpoints of the track as an array of track markers (points) in form (i, i+1)
    
        this.#showCheckpoints = true;
    }

    load(saveCode) {
        //gotta make more robust in case something is missing from save file
        this.clear();
        const json = JSON.parse(saveCode);
        this.#xVals = json.xVals;
        this.#yVals = json.yVals;

        if (json.startLine !== null && json.startLine !== undefined) {
            this.#startLine = [new Point(json.startLine[0], json.startLine[1]), new Point(json.startLine[2], json.startLine[3])];
        } else {
            this.#startLine = [new Point(0, 0), new Point(0, 0)];
        }

        for (let i = 0; i < json.checkpoints.length; i += 2) {
            this.#checkpoints.push(new Point(json.checkpoints[i], json.checkpoints[i + 1]));
        }        
        console.log("Save loaded");
    }

    save() {

    }
    
    // Handles everything about drawing the track
    displayTrack(ctx) {
        ctx.strokeStyle = this.#trackColor;
        for (let i = 0; i < this.#xVals.length; i++) {
            ctx.beginPath();
            ctx.moveTo(this.#xVals[i][0], this.#yVals[i][0]);
            for (let j = 0; j < this.#xVals[i].length; j++) {
                ctx.lineTo(this.#xVals[i][j], this.#yVals[i][j]);
            }
            //ctx.closePath();
            ctx.stroke();
        }
        
        this.#displayStartingLine(ctx);
        if (this.#showCheckpoints) {
            this.#displayCheckpoints(ctx);
        }
    }
    
    // Draws the starting line of the track
    #displayStartingLine(ctx) {
        ctx.strokeStyle = this.#startLineColor;
        ctx.beginPath();
        ctx.moveTo(this.#startLine[0].x, this.#startLine[0].y); // 1st point
        ctx.lineTo(this.#startLine[1].x, this.#startLine[1].y); // 2nd point
        ctx.stroke();
    }

    // Draws the checkpoints of the track
    #displayCheckpoints(ctx) {
        for (let i = 0; i < this.#checkpoints.length; i += 2) {
            ctx.beginPath();
            ctx.strokeStyle = this.#checkpointColor;
            ctx.moveTo(this.#checkpoints[i].x, this.#checkpoints[i].y);
            ctx.lineTo(this.#checkpoints[i + 1].x, this.#checkpoints[i + 1].y);
            ctx.stroke();
        }
    }

    clear() {
        this.#xVals.length = 0;
        this.#yVals.length = 0;
        this.#checkpoints.length = 0;
        this.#startLine = [new Point(0, 0), new Point(0, 0)];
    }

    // todo, will make distance b/w points consistent for better performance
    smooth() {

    }

    getXVals() {
        return this.#xVals;
    }
    
    getYVals() {
        return this.#yVals;
    }
    
    getCheckpoints() {
        return this.#checkpoints;
    }

    getStartLine() {
        return this.#startLine;
    }
}