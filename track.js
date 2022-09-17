function Track() {
    this.trackColor = "#000000";
    this.startLineColor = "#1ED32C";
    this.checkpointColor = "#FFFFFF";
    
    this.xVals = [];
    this.yVals = [];
    this.currentPathx = [];
    this.currentPathy = [];

    let drawDone = true;
    this.isDrawingTrack = false;
    this.mouseDown = false;
    this.isDrawingCheckpoints = false;
    /*
    0 -> not selecting
    1 -> selecting 1st point
    2 -> selecting 2nd point
    */
    this.isMakingStartLine = 0;
    this.isMakingCheckpoint = 0;

    this.currCheckpoint = 0;
    this.startLine = [new Point(0, 0), new Point(0, 0)];
    this.checkpoints = [];
    this.showCheckpoints = true;

    this.load = function(saveCode, car) {
        //gotta make more robust in case something is missing from save file
        //console.log("inputing code: " + saveCode);
        this.clear();
        let json = JSON.parse(saveCode);
        carStartPos.x = json.startPosX;
        carStartPos.y = json.startPosY;
        this.xVals = json.xVals;
        this.yVals = json.yVals;
        if (json.startLine !== null && json.startLine !== undefined) {
            this.startLine = [new Point(json.startLine[0], json.startLine[1]), new Point(json.startLine[2], json.startLine[3])];
        } else {
            this.startLine = [new Point(0, 0), new Point(0, 0)];
        }
        for (let i = 0; i < json.checkpoints.length; i += 2) {
            this.checkpoints.push(new Point(json.checkpoints[i], json.checkpoints[i + 1]));
        }        
        alert("Save loaded");
    };

    this.save = function() {
        /* Save file format
        JSON
        car start pos x
        car start pos y
        trackx vals
        tracky vals
        starting line 2 points
        array of the track markers
        */
       
        let buildjson = "{"
        let buildX = "[";
        let buildY = "[";
        let buildCheckpoints = "[";
        //adds start pos to save file
        buildjson += "\"startPosX\":" + carStartPos.x + ", ";
        buildjson += "\"startPosY\":" + carStartPos.y + ", ";

        //very hacky way of getting the 2d array in the JSON save file
        for (let i = 0; i < this.xVals.length; i++) {
            buildX += "[";
            buildY += "[";

            for (let j = 0; j < this.xVals[i].length; j++) {
                buildX += this.xVals[i][j] + ",";
                buildY += this.yVals[i][j] + ",";
            }
            if (this.xVals[i].length > 0) {
                buildX = buildX.slice(0, -1);
                buildY = buildY.slice(0, -1);
            }
            buildX += "],";
            buildY += "],";
        }
        buildX = buildX.slice(0, -1);
        buildY = buildY.slice(0, -1);

        buildX += "], ";
        buildY += "], ";

        buildjson += "\"xVals\":" + buildX;
        buildjson += "\"yVals\":" + buildY;

        //adds start line to save file
        buildjson += "\"startLine\":" + "[" + this.startLine[0].x + "," + this.startLine[0].y + ","  + this.startLine[1].x + "," + this.startLine[1].y + "],";
        
        //adds checkpoints to save file
        /*
        checkpoints are stored as an array with (x, y, x, y...)
        this is so the save file isnt littered with "new point"
        makes it harder to decode tho
        */
        for (let i = 0; i < this.checkpoints.length; i++) {
            buildCheckpoints += this.checkpoints[i].x + "," + this.checkpoints[i].y + ",";
        }
        if (buildCheckpoints.length > 1) {
            buildCheckpoints = buildCheckpoints.slice(0, -1);
        }
        buildCheckpoints += "]";
        buildjson += "\"checkpoints\":" + buildCheckpoints;

        buildjson += "}";

        navigator.clipboard.writeText(buildjson);
        alert("Copied save code to clipboard");
        //console.log(buildjson);
    };

    this.createStartLine = function() {
        /*
        if first one not created have a green dot follow mouse
        if click set that point as the first point of the start line
        after first one set draw a line from the first point to where the mouse is
        on click set the mouse pos as the second point of the start line
        */
        if (this.isMakingStartLine != 0) {
            dtoutput.innerHTML = "off";
            this.isDrawingTrack = false;
            drawDone = false;
            if (this.isMakingCheckpoint === 2) {
                this.checkpoints.pop();
            }
            this.isMakingCheckpoint = 0;
            this.isDrawingCheckpoints = false;
            ccOutput.innerHTML = "Create Checkpoints";

            window.onmousedown = () => {  
                this.mouseDown = true;  
                if (mouseX > 0 && mouseX < canvasWidth && mouseY > 0 && mouseY < canvasHeight) {
                    if (this.mouseDown && this.isMakingStartLine === 1) {
                        this.startLine[0] = new Point(mouseX - canvasWidth / 2, mouseY - canvasHeight / 2); //have to readjust the origin (mousex, mousey) origin is top left, normal is middle
                        this.mouseDown = false;
                        this.isMakingStartLine++;
                    }
                    if (this.mouseDown && this.isMakingStartLine === 2) {
                        this.startLine[1] = new Point(mouseX - canvasWidth / 2, mouseY - canvasHeight / 2);
                        this.mouseDown = false;
                        this.isMakingStartLine = 0;
                    }
                }
            }
            window.onmouseup = () => {  
                this.mouseDown = false; 
            }
        }  
    };

    this.drawStartLine = function(ctx) { 
        ctx.strokeStyle = this.startLineColor;
        if (this.isMakingStartLine === 1) {
            return;
        }
        if (this.isMakingStartLine === 2) {
            this.startLine[1] = new Point (mouseX - canvasWidth / 2, mouseY - canvasHeight / 2);
        }
        ctx.beginPath();
        ctx.moveTo(this.startLine[0].x, this.startLine[0].y);
        ctx.lineTo(this.startLine[1].x, this.startLine[1].y);
        ctx.stroke();
    };

    this.createCheckpoints = function() {
        //should be similar logic to drawing starting line but with more lines
        if (this.isMakingCheckpoint != 0) {
            dtoutput.innerHTML = "off";
            this.isDrawingTrack = false;
            drawDone = false;
            if (this.isMakingStartLine === 2) {
                this.startLine = [new Point(0, 0), new Point(0, 0)];
            }
            this.isMakingStartLine = 0;

            window.onmousedown = () => {  
                this.mouseDown = true;  
                if (mouseX > 0 && mouseX < canvasWidth && mouseY > 0 && mouseY < canvasHeight) {
                    if (this.mouseDown && this.isMakingCheckpoint === 1) {
                        this.checkpoints.push(new Point(mouseX - canvasWidth / 2, mouseY - canvasHeight / 2)); //have to readjust the origin (mousex, mousey) origin is top left, normal is middle
                        this.mouseDown = false;
                        this.isMakingCheckpoint++;
                    }
                    if (this.mouseDown && this.isMakingCheckpoint === 2) {
                        this.checkpoints.push(new Point(mouseX - canvasWidth / 2, mouseY - canvasHeight / 2));
                        this.mouseDown = false;
                        if (this.isDrawingCheckpoints) {
                            this.isMakingCheckpoint = 1;
                        } else {
                            this.isMakingCheckpoint = 0;
                        }
                    }
                }
            }
            window.onmouseup = () => {  
                this.mouseDown = false; 
                //console.log('mouse button up')  
            }
        }  
    };

    this.drawCheckpoints = function(ctx) {
        if (this.showCheckpoints) {
            //ctx.strokeStyle = this.checkpointColor;

            //Draws mouse tracking line
            if (this.isMakingCheckpoint === 2) {
                this.checkpoints.push(new Point (mouseX - canvasWidth / 2, mouseY - canvasHeight / 2));
            }
            //Draws all checkpoints
            for (let i = 0; i < this.checkpoints.length; i += 2) {
                ctx.beginPath();

                /*
                if (i < car.currCheckpoint * 2) {//Draws any checkpoint already reached as red, otherwise as the checkpoint color
                    ctx.strokeStyle = "#ff0000";
                } else {
                    ctx.strokeStyle = this.checkpointColor;
                }
                */
                ctx.strokeStyle = this.checkpointColor;

                ctx.moveTo(this.checkpoints[i].x, this.checkpoints[i].y);
                ctx.lineTo(this.checkpoints[i + 1].x, this.checkpoints[i + 1].y);
                ctx.stroke();

            }
            //deletes mouse tracking line temp
            if (this.isMakingCheckpoint === 2) {
                this.checkpoints.pop();
            }
        }
    };

    this.undoCheckpoint = function() {
        if (this.isMakingCheckpoint === 1) {
            this.checkpoints.length = Math.max(0, this.checkpoints.length - 2);
        } else if (this.isMakingCheckpoint === 2) {
            this.checkpoints.length = Math.max(0, this.checkpoints.length - 1);
            this.isMakingCheckpoint = 1;
        } else {
            this.checkpoints.length = Math.max(0, this.checkpoints.length - 2);
        }
    };

    this.createTrack = function(ctx) {
        if (this.isDrawingTrack) {
            if (this.isMakingStartLine === 2) {
                this.startLine = [new Point(0, 0), new Point(0, 0)];
            }
            this.isMakingStartLine = 0;
            if (this.isMakingCheckpoint === 2) {
                this.checkpoints.pop();
            }
            this.isMakingCheckpoint = 0;
            ccOutput.innerHTML = "Create Checkpoints";
            this.isDrawingCheckpoints = false;

            window.onmousedown = () => {  
                if (mouseX > 0 && mouseX < canvasWidth && mouseY > 0 && mouseY < canvasHeight) {
                    this.mouseDown = true;  
                }
            }  

            window.onmouseup = () => {  
                this.mouseDown = false; 
                //console.log('mouse button up')  
            }
            if (this.mouseDown) {
                drawDone = true;
                this.startPath(ctx);

            } else {
                if (drawDone) {
                    drawDone = false;
                    this.endPath();
                }
            }
        }
    };

    this.undoLastStroke = function() {
        this.xVals.pop(this.xVals.length);
        this.yVals.pop(this.yVals.length);
        this.currentPathx = [];
        this.currentPathy = [];
    }

    this.startPath = function(ctx) {
        let px = mouseX;
        let py = mouseY;
        //need to offset mouse pos cuz it starts top left rather than center
        if (px > 0 && px < canvasWidth && py > 0 && py < canvasHeight) {
            this.currentPathx.push(px - canvasWidth / 2);
            this.currentPathy.push(py - canvasHeight / 2);
            this.tempDraw(ctx, this.currentPathx, this.currentPathy);
        }
    };

    this.endPath = function() {
        this.xVals.push(this.currentPathx);
        this.yVals.push(this.currentPathy);
        this.currentPathx = [];
        this.currentPathy = [];
    };

    //Draws the current path while drawing a part of the track
    this.tempDraw = function(ctx, arrx, arry) {
        ctx.strokeStyle = this.trackColor;
        ctx.beginPath();
        ctx.moveTo(arrx[0], arry[0]);
        for (let i = 0; i < arrx.length - 1; i++) {
            ctx.lineTo(arrx[i + 1], arry[i + 1]);
        }
        //ctx.closePath(); //***************causes lines to be autofinished while drawing****************
        ctx.stroke();

    };

    this.drawTrack = function(ctx) {
        ctx.strokeStyle = this.trackColor;
        for (let i = 0; i < this.xVals.length; i++) {
            ctx.beginPath();
            ctx.moveTo(this.xVals[i][0], this.yVals[i][0]);
            for (let j = 0; j < this.xVals[i].length; j++) {
                ctx.lineTo(this.xVals[i][j], this.yVals[i][j]);
            }
            //ctx.closePath();
            ctx.stroke();
        }
    };

    this.clear = function() {
        this.xVals.length = 0;
        this.yVals.length = 0;
        this.currentPathx.length = 0;
        this.currentPathy.length = 0;
        this.checkpoints.length = 0;
        this.startLine = [new Point(0, 0), new Point(0, 0)];
    };

    //Makes the distance between points similar ig
    this.smooth = function() {
    };
}