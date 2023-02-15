class Car {
    // Car setup
    #alive;
    #startPos;
    #immortal;
    #respawn;
    // Display settings
    #showFeelers;
    #showDriftTracks;
    // Car positioning
    #xPos;
    #yPos;
    #direction;
    // Dimensions of car
    #width;
    #height;
    // Car movement
    #vel;
    #friction;
    #driftFactor;
    // Car Trackers
    #surroundings;
    #currentCheckpoint;
    #lapsDone;
    //Drift Tracks
    #driftTracksX;
    #driftTracksY;

    constructor(startPosX, startPosY) {
        // Car setup
        this.#alive = true;
        this.#startPos = new Point(startPosX, startPosY);
        this.#immortal = true;
        this.#respawn = true;
        // Display settings
        this.#showFeelers = false;
        this.#showDriftTracks = false;
        // Car positioning
        this.#xPos = startPosX;
        this.#yPos = startPosY;
        this.#direction = 0; // Direction car facing in degrees. 0 degrees is north and increases clockwise
        // Dimensions of car
        this.#width = 15;
        this.#height = 30;
        // Car movement variables
        this.#vel = [0, 0]; // Current velocity (x, y) direction
        this.#friction = 1.09; // 1 friction is no friction. More friction means faster deceleration
        this.#driftFactor = 0.97; // How much drift from a scale from 0 to 1 where 0 is no drift and 1 is full drift (breaks otherwise)
        // Trackers
        this.#surroundings = [new Point(0, 0), new Point(0, 0), new Point(0, 0), new Point(0, 0), new Point(0, 0), new Point(0, 0), new Point(0, 0), new Point(0, 0), new Point(0, 0), new Point(0, 0)];
        this.#currentCheckpoint = 0;
        this.#lapsDone = 0;
        // Drift Tracks
        this.#driftTracksX = [[], [], [], []];
        this.#driftTracksY = [[], [], [], []];
    }

    load(saveCode) {
        let json = JSON.parse(saveCode);
        this.#startPos = new Point(json.startPosX, json.startPosY);
        this.reset();
    }

    // HANDLES EVERYTHING LOOPED AND NEEDS TO BE CONSTANTLY UPDATED
    update(ctx, track) {
        this.#getSurroundings(track);
        this.drive();
        this.#checkNextCheckpoint(track);
        this.#checkNextLap(track);
        this.displayCar(ctx);
        if (!this.#immortal && this.isAlive()) {
            this.#checkCarCrashed(track);
        }
        if (!this.isAlive() && this.#respawn) {
            this.reset();
            this.revive();
        }
    }
    
//================================================================================================================================
    // Car Display
    displayCar(ctx) {
        /* Rotation by t degrees around origin
            x' = xcos(t) - ysin(t)
            y' = xsin(t) + ycos(t)

            Convert degrees to radians
            x degrees = x * pi / 180 radians
        */
        const rad = this.#getRad();

        if (this.#alive) {
            ctx.fillStyle = 'black';
        } else {
            ctx.fillStyle = 'red';
        }

        //Draws outer rectangle
        ctx.beginPath();
        ctx.moveTo((this.#width / 2 * Math.cos(rad) - this.#height / 2 * Math.sin(rad)) + this.#xPos, (this.#width / 2 * Math.sin(rad) + this.#height / 2 * Math.cos(rad)) + this.#yPos);
        ctx.lineTo((this.#width / 2 * Math.cos(rad) + this.#height / 2 * Math.sin(rad)) + this.#xPos, (this.#width / 2 * Math.sin(rad) - this.#height / 2 * Math.cos(rad)) + this.#yPos);
        ctx.lineTo((-1 * this.#width / 2 * Math.cos(rad) + this.#height / 2 * Math.sin(rad)) + this.#xPos, (-1 * this.#width / 2 * Math.sin(rad) - this.#height / 2 * Math.cos(rad)) + this.#yPos);
        ctx.lineTo((-1 * this.#width / 2 * Math.cos(rad) - this.#height / 2 * Math.sin(rad)) + this.#xPos, (-1 * this.#width / 2 * Math.sin(rad) + this.#height / 2 * Math.cos(rad)) + this.#yPos);
        ctx.fill();
        
        //Draws inner rectangle
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo((2 / 3 * this.#width / 2 * Math.cos(rad) + 1 / 2 * this.#height / 2 * Math.sin(rad)) + this.#xPos, (2 / 3 * this.#width / 2 * Math.sin(rad) - 1 / 2 * this.#height / 2 * Math.cos(rad)) + this.#yPos);
        ctx.lineTo((-2 / 3 * this.#width / 2 * Math.cos(rad) + 1 / 2 * this.#height / 2 * Math.sin(rad)) + this.#xPos, (-2 / 3 * this.#width / 2 * Math.sin(rad) - 1 / 2 * this.#height / 2 * Math.cos(rad)) + this.#yPos);
        ctx.lineTo((-2 / 3 * this.#width / 2 * Math.cos(rad) + 1 / 6 * this.#height / 2 * Math.sin(rad)) + this.#xPos, (-2 / 3 * this.#width / 2 * Math.sin(rad) - 1 / 6 * this.#height / 2 * Math.cos(rad)) + this.#yPos);
        ctx.lineTo((2 / 3 * this.#width / 2 * Math.cos(rad) + 1 / 6 * this.#height / 2 * Math.sin(rad)) + this.#xPos, (2 / 3 * this.#width / 2 * Math.sin(rad) - 1 / 6 * this.#height / 2 * Math.cos(rad)) + this.#yPos);
        ctx.fill();

        //Draws headlights
        ctx.fillstyle = 'white';
        ctx.beginPath();
        //ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle)
        ctx.ellipse((2 / 3 * this.#width / 2 * Math.cos(rad) + 21 / 24 * this.#height / 2 * Math.sin(rad)) + this.#xPos, (2 / 3 * this.#width / 2 * Math.sin(rad) - 21 / 24 * this.#height / 2 * Math.cos(rad)) + this.#yPos, 
        1 / 6 * this.#width, 1 / 24 * this.#height, rad, 0, 2 * Math.PI);
        ctx.ellipse((-2 / 3 * this.#width / 2 * Math.cos(rad) + 21 / 24 * this.#height / 2 * Math.sin(rad)) + this.#xPos, (-2 / 3 * this.#width / 2 * Math.sin(rad) - 21 / 24 * this.#height / 2 * Math.cos(rad)) + this.#yPos, 
        1 / 6 * this.#width, 1 / 24 * this.#height, rad, 0, 2 * Math.PI);
        ctx.fill();

        if (this.#showFeelers) {
            this.#drawFeelers(ctx);
        }

        if (this.#showDriftTracks) {
            this.#drawDriftTracks(ctx);
        }
        
    }

    #drawFeelers(ctx) {
        const rad = this.#getRad();
        let front = new Point((0 * this.#width / 2 * Math.cos(rad) + this.#height / 2 * Math.sin(rad)) + this.#xPos, (0 * this.#width / 2 * Math.sin(rad) - this.#height / 2 * Math.cos(rad)) + this.#yPos); //Is top middle of car
        let back =  new Point((0 * this.#width / 2 * Math.cos(rad) - this.#height / 2 * Math.sin(rad)) + this.#xPos, (0 * this.#width / 2 * Math.sin(rad) + this.#height / 2 * Math.cos(rad)) + this.#yPos); //Is bottom middle of car
        
        ctx.beginPath();
        ctx.strokeStyle = 'yellow';
        ctx.stroke();
        ctx.closePath();
        for (let i = 0; i < this.#surroundings.length; i++) { // NEEDS TO HANDLES NULL VALUES, cant just default to 0,0
            // 0-3 and 7-9 uses front, 4-6 uses back
            // Draws the line to the dot
            ctx.beginPath();
            if ((0 <= i && i <= 3) || (7 <= i && i <= 9)) {
                ctx.moveTo(front.x, front.y);
            } else {
                ctx.moveTo(back.x, back.y);
            }
            ctx.lineTo(this.#surroundings[i].x, this.#surroundings[i].y);
            ctx.stroke();
            ctx.closePath();

            // Draws the dot on the track
            ctx.beginPath();
            ctx.fillStyle = "Blue";
            ctx.arc(this.#surroundings[i].x, this.#surroundings[i].y, 4, 0, Math.PI * 2); 
            ctx.fill();
            ctx.closePath();
        }
    }

    #drawDriftTracks(ctx) {

    }

//================================================================================================================================
    // Car Status
    reset() {
        // Reset car position
        this.#xPos = this.#startPos.x;
        this.#yPos = this.#startPos.y;
        this.#direction = 0;

        this.#vel = [0, 0];

        // Reset drift tracks
        this.#driftTracksX = [[], [], [], []];
        this.#driftTracksY = [[], [], [], []];
    }

    revive() {
        this.#alive = true;
    }
//================================================================================================================================
    // Car Movement
    drive() {
        this.#calcVel();
        this.#xPos += this.#vel[0];
        this.#yPos -= this.#vel[1];
    }

    turn(deg) {
        this.#direction += Math.log(this.#getTotalVel() + 1) / 3 * deg + deg / 3;
    }

    accelerate(boost) {
        const rad = this.#getRad();
        this.#vel[0] += boost * Math.sin(rad);
        this.#vel[1] += boost * Math.cos(rad);
    }

    #calcVel() { // not sure if i need this function. It's here in case need more calcs in future
        this.#applyFriction();
        this.#applyDrift();
        
    }

    #applyFriction() {
        this.#vel[0] /= this.#friction;
        this.#vel[1] /= this.#friction;
    }

    #applyDrift() {
        const velDir = this.#getVelDir();
        const rad = this.#getRad();
        const directionDiff = velDir - rad;
        this.#driftFactor * directionDiff + rad;
        const totalVel = this.#getTotalVel();
        this.#vel[0] = (this.#vel[0] * this.#driftFactor) + (Math.sin(rad) * totalVel * (1 - this.#driftFactor));

        this.#vel[1] = (this.#vel[1] * this.#driftFactor) + (Math.cos(rad) * totalVel * (1 - this.#driftFactor));
        
    }

    // Returns the true direction of velocity in radians
    #getVelDir() {
        return Math.atan(this.#vel[1] / this.#vel[0]);
    }

//================================================================================================================================
    // Drift Tracks
    setDriftTracks() {

    }
//================================================================================================================================
    // Collision
    // Gets the closest point on the track to the car in 10 directions
    #getSurroundings(track) { // Can be optimized by making the feeler lines adaptive and not just staic 500 length
        //labeled 0-9 starting from top of car moving right
        //feeler lines are length 500 atm
        const rad = this.#getRad();
        let front = new Point((0 * this.#width / 2 * Math.cos(rad) + this.#height / 2 * Math.sin(rad)) + this.#xPos, (0 * this.#width / 2 * Math.sin(rad) - this.#height / 2 * Math.cos(rad)) + this.#yPos); //Is top middle of car
        let back =  new Point((0 * this.#width / 2 * Math.cos(rad) - this.#height / 2 * Math.sin(rad)) + this.#xPos, (0 * this.#width / 2 * Math.sin(rad) + this.#height / 2 * Math.cos(rad)) + this.#yPos); //Is bottom middle of car
        
        let q1 = new Point(front.x + 500 * Math.cos(-1.5708 + rad), front.y + 500 * Math.sin(-1.5708 + rad))
        this.#surroundings[0] = this.#calcSurroundIntersect(front, q1, track);

        q1 = new Point(front.x + 500 * Math.cos(-1.0472 + rad), front.y + 500 * Math.sin(-1.0472 + rad));
        this.#surroundings[1] = this.#calcSurroundIntersect(front, q1, track);

        q1 = new Point(front.x + 500 * Math.cos(-0.5236 + rad), front.y + 500 * Math.sin(-0.5236 + rad));
        this.#surroundings[2] = this.#calcSurroundIntersect(front, q1, track);

        q1 = new Point(front.x + 500 * Math.cos(rad), front.y + 500 * Math.sin(rad));
        this.#surroundings[3] = this.#calcSurroundIntersect(front, q1, track);

        q1 = new Point(back.x + 500 * Math.cos(0.7854 + rad), back.y + 500 * Math.sin(0.7854 + rad));
        this.#surroundings[4] = this.#calcSurroundIntersect(back, q1, track);

        q1 = new Point(back.x + 500 * Math.cos(1.5708 + rad), back.y + 500 * Math.sin(1.5708 + rad))
        this.#surroundings[5] = this.#calcSurroundIntersect(back, q1, track);

        q1 = new Point(back.x + 500 * Math.cos(2.3562 + rad), back.y + 500 * Math.sin(2.3562 + rad));
        this.#surroundings[6] = this.#calcSurroundIntersect(back, q1, track);

        q1 = new Point(front.x + 500 * Math.cos(3.1415 + rad), front.y + 500 * Math.sin(3.1415 + rad));
        this.#surroundings[7] = this.#calcSurroundIntersect(front, q1, track);

        q1 = new Point(front.x + 500 * Math.cos(3.6652 + rad), front.y + 500 * Math.sin(3.6652 + rad));
        this.#surroundings[8] = this.#calcSurroundIntersect(front, q1, track);

        q1 = new Point(front.x + 500 * Math.cos(4.1888 + rad), front.y + 500 * Math.sin(4.1888 + rad));
        this.#surroundings[9] = this.#calcSurroundIntersect(front, q1, track);
    }


    // Checks if car has crashed into the track
    #checkCarCrashed(track) {
        const rad = this.#getRad();
        let xVals = track.getXVals();
        let yVals = track.getYVals();
        let q2;
        for (let i = 0; i < xVals.length; i++) {
            for (let j = 0; j < xVals[i].length - 1; j++) {
                let p2 = new Point(xVals[i][j], yVals[i][j])
                q2 = new Point(xVals[i][j + 1], yVals[i][j + 1]);

                /*let q2;
                if (j < track.xVals[i].length - 1) {
                    q2 = new Point(track.xVals[i][j + 1], track.yVals[i][j + 1]);
                } else {
                    q2 = new Point(track.xVals[i][0], track.yVals[i][0])
                }*/
                
                if (doIntersect(new Point((this.#width / 2 * Math.cos(rad) - this.#height / 2 * Math.sin(rad)) + this.#xPos, (this.#width / 2 * Math.sin(rad) + this.#height / 2 * Math.cos(rad)) + this.#yPos), 
                new Point((this.#width / 2 * Math.cos(rad) + this.#height / 2 * Math.sin(rad)) + this.#xPos, (this.#width / 2 * Math.sin(rad) - this.#height / 2 * Math.cos(rad)) + this.#yPos), p2, q2) || 
                
                doIntersect(new Point((this.#width / 2 * Math.cos(rad) + this.#height / 2 * Math.sin(rad)) + this.#xPos, (this.#width / 2 * Math.sin(rad) - this.#height / 2 * Math.cos(rad)) + this.#yPos), 
                new Point((-1 * this.#width / 2 * Math.cos(rad) + this.#height / 2 * Math.sin(rad)) + this.#xPos, (-1 * this.#width / 2 * Math.sin(rad) - this.#height / 2 * Math.cos(rad)) + this.#yPos), p2, q2) || 

                doIntersect(new Point((-1 * this.#width / 2 * Math.cos(rad) + this.#height / 2 * Math.sin(rad)) + this.#xPos, (-1 * this.#width / 2 * Math.sin(rad) - this.#height / 2 * Math.cos(rad)) + this.#yPos), 
                new Point((-1 * this.#width / 2 * Math.cos(rad) - this.#height / 2 * Math.sin(rad)) + this.#xPos, (-1 * this.#width / 2 * Math.sin(rad) + this.#height / 2 * Math.cos(rad)) + this.#yPos), p2, q2) || 

                doIntersect(new Point((-1 * this.#width / 2 * Math.cos(rad) - this.#height / 2 * Math.sin(rad)) + this.#xPos, (-1 * this.#width / 2 * Math.sin(rad) + this.#height / 2 * Math.cos(rad)) + this.#yPos), 
                new Point((this.#width / 2 * Math.cos(rad) - this.#height / 2 * Math.sin(rad)) + this.#xPos, (this.#width / 2 * Math.sin(rad) + this.#height / 2 * Math.cos(rad)) + this.#yPos), p2, q2)) {

                    this.#alive = false;
                    return;
                }
            }
        }
    }

    // Checks if car is touching next checkpoint
    #checkNextCheckpoint(track) {
        const rad = this.#getRad();
        let checkpoints = track.getCheckpoints();
        // Only checks for collision on the next checkpoint in order for processing optimization
        if (this.#currentCheckpoint < checkpoints.length / 2) {
            if (doIntersect(new Point((this.#width / 2 * Math.cos(rad) - this.#height / 2 * Math.sin(rad)) + this.#xPos, (this.#width / 2 * Math.sin(rad) + this.#height / 2 * Math.cos(rad)) + this.#yPos), 
            new Point((this.#width / 2 * Math.cos(rad) + this.#height / 2 * Math.sin(rad)) + this.#xPos, (this.#width / 2 * Math.sin(rad) - this.#height / 2 * Math.cos(rad)) + this.#yPos), checkpoints[2 * this.#currentCheckpoint], checkpoints[2 * this.#currentCheckpoint + 1]) || 
            
            doIntersect(new Point((this.#width / 2 * Math.cos(rad) + this.#height / 2 * Math.sin(rad)) + this.#xPos, (this.#width / 2 * Math.sin(rad) - this.#height / 2 * Math.cos(rad)) + this.#yPos), 
            new Point((-1 * this.#width / 2 * Math.cos(rad) + this.#height / 2 * Math.sin(rad)) + this.#xPos, (-1 * this.#width / 2 * Math.sin(rad) - this.#height / 2 * Math.cos(rad)) + this.#yPos), checkpoints[2 * this.#currentCheckpoint], checkpoints[2 * this.#currentCheckpoint + 1]) || 

            doIntersect(new Point((-1 * this.#width / 2 * Math.cos(rad) + this.#height / 2 * Math.sin(rad)) + this.#xPos, (-1 * this.#width / 2 * Math.sin(rad) - this.#height / 2 * Math.cos(rad)) + this.#yPos), 
            new Point((-1 * this.#width / 2 * Math.cos(rad) - this.#height / 2 * Math.sin(rad)) + this.#xPos, (-1 * this.#width / 2 * Math.sin(rad) + this.#height / 2 * Math.cos(rad)) + this.#yPos), checkpoints[2 * this.#currentCheckpoint], checkpoints[2 * this.#currentCheckpoint + 1]) || 

            doIntersect(new Point((-1 * this.#width / 2 * Math.cos(rad) - this.#height / 2 * Math.sin(rad)) + this.#xPos, (-1 * this.#width / 2 * Math.sin(rad) + this.#height / 2 * Math.cos(rad)) + this.#yPos), 
            new Point((this.#width / 2 * Math.cos(rad) - this.#height / 2 * Math.sin(rad)) + this.#xPos, (this.#width / 2 * Math.sin(rad) + this.#height / 2 * Math.cos(rad)) + this.#yPos), checkpoints[2 * this.#currentCheckpoint], checkpoints[2 * this.#currentCheckpoint + 1])) {
                this.#currentCheckpoint++;
            }
        }
    }

    // Checks if car is touching the start line
    #checkNextLap(track) {
        let checkpoints = track.getCheckpoints();
        if (this.#currentCheckpoint >= checkpoints.length / 2) {
            const rad = this.#getRad();
            let startLine = track.getStartLine();

            if (doIntersect(new Point((this.#width / 2 * Math.cos(rad) - this.#height / 2 * Math.sin(rad)) + this.#xPos, (this.#width / 2 * Math.sin(rad) + this.#height / 2 * Math.cos(rad)) + this.#yPos), 
            new Point((this.#width / 2 * Math.cos(rad) + this.#height / 2 * Math.sin(rad)) + this.#xPos, (this.#width / 2 * Math.sin(rad) - this.#height / 2 * Math.cos(rad)) + this.#yPos), startLine[0], startLine[1]) || 
            
            doIntersect(new Point((this.#width / 2 * Math.cos(rad) + this.#height / 2 * Math.sin(rad)) + this.#xPos, (this.#width / 2 * Math.sin(rad) - this.#height / 2 * Math.cos(rad)) + this.#yPos), 
            new Point((-1 * this.#width / 2 * Math.cos(rad) + this.#height / 2 * Math.sin(rad)) + this.#xPos, (-1 * this.#width / 2 * Math.sin(rad) - this.#height / 2 * Math.cos(rad)) + this.#yPos), startLine[0], startLine[1]) || 
    
            doIntersect(new Point((-1 * this.#width / 2 * Math.cos(rad) + this.#height / 2 * Math.sin(rad)) + this.#xPos, (-1 * this.#width / 2 * Math.sin(rad) - this.#height / 2 * Math.cos(rad)) + this.#yPos), 
            new Point((-1 * this.#width / 2 * Math.cos(rad) - this.#height / 2 * Math.sin(rad)) + this.#xPos, (-1 * this.#width / 2 * Math.sin(rad) + this.#height / 2 * Math.cos(rad)) + this.#yPos), startLine[0], startLine[1]) || 
    
            doIntersect(new Point((-1 * this.#width / 2 * Math.cos(rad) - this.#height / 2 * Math.sin(rad)) + this.#xPos, (-1 * this.#width / 2 * Math.sin(rad) + this.#height / 2 * Math.cos(rad)) + this.#yPos), 
            new Point((this.#width / 2 * Math.cos(rad) - this.#height / 2 * Math.sin(rad)) + this.#xPos, (this.#width / 2 * Math.sin(rad) + this.#height / 2 * Math.cos(rad)) + this.#yPos), startLine[0], startLine[1])) {
                this.#lapsDone++;
                this.#currentCheckpoint = 0;
            }
        }
    }

//================================================================================================================================
    // Getters
    isAlive() {
        return this.#alive;
    }

    getStartPos() {
        return this.#startPos;
    }

    #getRad() {
        return this.#direction * Math.PI / 180;
    }

    #getTotalVel() {
        return Math.sqrt(this.#vel[0]**2 + this.#vel[1]**2);

    }

    #getLapsFinished() {
        return this.#lapsDone;
    }

    #getCheckpointsPassed() {
        return this.#currentCheckpoint;
    }

//================================================================================================================================
    // Helper Methods
    // Helper function for getSurroundings
    #calcSurroundIntersect(p1, q1, track) {
        let intersections = [];
        let xVals = track.getXVals();
        let yVals = track.getYVals();
        for (let i = 0; i < xVals.length; i++) {
            for (let j = 0; j < xVals[i].length - 1; j++) {
                let p2 = new Point(xVals[i][j], yVals[i][j])
                let q2 = new Point(xVals[i][j + 1], yVals[i][j + 1]);
                if (doIntersect(p1, q1, p2, q2)) {
                    //should return location of intersection
                    intersections.push(lineLineIntersection(p1, q1, p2, q2));
                }
            }
        }
        if (intersections.length > 0) {
            let minIndex = 0;
            let minDistance = getDistance(new Point(this.#xPos, this.#yPos), intersections[0]);
            for (let i = 1; i < intersections.length; i++) {
                let currDistance = getDistance(new Point(this.#xPos, this.#yPos), intersections[i])
                if (currDistance < minDistance) {
                    minDistance = currDistance;
                    minIndex = i;
                }
            }
            return intersections[minIndex];
        }
        return q1;
    };

}