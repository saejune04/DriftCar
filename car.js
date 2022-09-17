function Car(x, y) {
    this.startPos = new Point(100, 100);
    this.alive = true;
    this.x = x;
    this.y = y;
    this.dir = 0;
    this.width = 15;
    this.height = 30;
    this.vel = [0, 0];
    this.totalVel = 0;
    this.friction = 1.07;
    this.driftFactor = 20;
    this.driftTracksX = [[], [], [], []];
    this.driftTracksY = [[], [], [], []];
    let rad = this.dir * Math.PI / 180;

    //AI stuff here
    //this.brain = new NeuralNetwork(10, 16, 4);
    this.score = 0;
    this.fitness = 0;



    //Draws the car
    this.show = function(ctx) {
        /* Rotation by t degrees around origin
        x' = xcos(t) - ysin(t)
        y' = xsin(t) + ycos(t)

        Convert degrees to radians
        x degrees = x * pi / 180 radians
        */
            
        //Draws outer rectangle
        if (this.alive) {
            ctx.fillStyle = 'black';
        } else {
            ctx.fillStyle = 'red';
            if (!settingCarPos) {
                this.died();
            }
        }
        ctx.beginPath();
        ctx.moveTo((this.width / 2 * Math.cos(rad) - this.height / 2 * Math.sin(rad)) + this.x, (this.width / 2 * Math.sin(rad) + this.height / 2 * Math.cos(rad)) + this.y);
        ctx.lineTo((this.width / 2 * Math.cos(rad) + this.height / 2 * Math.sin(rad)) + this.x, (this.width / 2 * Math.sin(rad) - this.height / 2 * Math.cos(rad)) + this.y);
        ctx.lineTo((-1 * this.width / 2 * Math.cos(rad) + this.height / 2 * Math.sin(rad)) + this.x, (-1 * this.width / 2 * Math.sin(rad) - this.height / 2 * Math.cos(rad)) + this.y);
        ctx.lineTo((-1 * this.width / 2 * Math.cos(rad) - this.height / 2 * Math.sin(rad)) + this.x, (-1 * this.width / 2 * Math.sin(rad) + this.height / 2 * Math.cos(rad)) + this.y);
        ctx.fill();
        
        //Draws inner rectangle
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo((2 / 3 * this.width / 2 * Math.cos(rad) + 1 / 2 * this.height / 2 * Math.sin(rad)) + this.x, (2 / 3 * this.width / 2 * Math.sin(rad) - 1 / 2 * this.height / 2 * Math.cos(rad)) + this.y);
        ctx.lineTo((-2 / 3 * this.width / 2 * Math.cos(rad) + 1 / 2 * this.height / 2 * Math.sin(rad)) + this.x, (-2 / 3 * this.width / 2 * Math.sin(rad) - 1 / 2 * this.height / 2 * Math.cos(rad)) + this.y);
        ctx.lineTo((-2 / 3 * this.width / 2 * Math.cos(rad) + 1 / 6 * this.height / 2 * Math.sin(rad)) + this.x, (-2 / 3 * this.width / 2 * Math.sin(rad) - 1 / 6 * this.height / 2 * Math.cos(rad)) + this.y);
        ctx.lineTo((2 / 3 * this.width / 2 * Math.cos(rad) + 1 / 6 * this.height / 2 * Math.sin(rad)) + this.x, (2 / 3 * this.width / 2 * Math.sin(rad) - 1 / 6 * this.height / 2 * Math.cos(rad)) + this.y);
        ctx.fill();

        //Draws headlights
        ctx.fillstyle = 'white';
        ctx.beginPath();
        //ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle)
        ctx.ellipse((2 / 3 * this.width / 2 * Math.cos(rad) + 21 / 24 * this.height / 2 * Math.sin(rad)) + this.x, (2 / 3 * this.width / 2 * Math.sin(rad) - 21 / 24 * this.height / 2 * Math.cos(rad)) + this.y, 
        1 / 6 * this.width, 1 / 24 * this.height, rad, 0, 2 * Math.PI);
        ctx.ellipse((-2 / 3 * this.width / 2 * Math.cos(rad) + 21 / 24 * this.height / 2 * Math.sin(rad)) + this.x, (-2 / 3 * this.width / 2 * Math.sin(rad) - 21 / 24 * this.height / 2 * Math.cos(rad)) + this.y, 
        1 / 6 * this.width, 1 / 24 * this.height, rad, 0, 2 * Math.PI);
        ctx.fill();
    };

    this.died = function() {
        this.x = this.startPos.x;
        this.y = this.startPos.y;
        this.driftTracksX = [[], [], [], []];
        this.driftTracksY = [[], [], [], []];
        this.dir = 0;
        rad = 0;
        this.vel = [0, 0];
        this.totalVel = 0;
        this.currCheckpoint = 0;
    };

    this.setStartPos = function() {
        this.x = mouseX - canvasWidth / 2;
        this.y = mouseY - canvasHeight / 2;
        window.onmousedown = () => {  
            if (mouseX > 0 && mouseX < canvasWidth && mouseY > 0 && mouseY < canvasHeight) {
                if (settingCarPos) {
                    this.startPos.x = mouseX - canvasWidth / 2;
                    this.startPos.y = mouseY - canvasHeight / 2;
                    settingCarPos = false;
                    this.died();
                }
            }
        }  
    };

    this.setDriftTracks = function() {
        this.driftTracksX[0].push((car.width / -2 * Math.cos(rad) - car.height / 4 * Math.sin(rad)) + car.x);
        this.driftTracksY[0].push((car.width / -2 * Math.sin(rad) + car.height / 4 * Math.cos(rad)) + car.y);

        this.driftTracksX[1].push((car.width / 2 * Math.cos(rad) - car.height / 4 * Math.sin(rad)) + car.x);
        this.driftTracksY[1].push((car.width / 2 * Math.sin(rad) + car.height / 4 * Math.cos(rad)) + car.y);

        this.driftTracksX[2].push((car.width / 2 * Math.cos(rad) - car.height / -4 * Math.sin(rad)) + car.x);
        this.driftTracksY[2].push((car.width / 2 * Math.sin(rad) + car.height / -4 * Math.cos(rad)) + car.y);

        this.driftTracksX[3].push((car.width / -2 * Math.cos(rad) - car.height / -4 * Math.sin(rad)) + car.x);
        this.driftTracksY[3].push((car.width / -2 * Math.sin(rad) + car.height / -4 * Math.cos(rad)) + car.y);

    };
    this.drawDriftTracks = function(ctx) {
        this.setDriftTracks();
        for (let i = 0; i < this.driftTracksX.length; i++) {
            ctx.strokeStyle = "#8F8E8B";
            ctx.beginPath();
            ctx.moveTo(this.driftTracksX[i][0], this.driftTracksY[i][0]);

            for (let j = 0; j < this.driftTracksX[i].length; j++) {
                ctx.lineTo(this.driftTracksX[i][j], this.driftTracksY[i][j]);
            }
            ctx.stroke();
        }
    };

    this.calcVel = function() {
        //Sets directional velocity
        this.vel[0] += (this.totalVel * Math.sin(rad)) / fps * 60;
        this.vel[1] += (this.totalVel * Math.cos(rad)) / fps * 60;
        
        //If velocity is negligible set it to 0
        if (Math.abs(this.vel[0]) < 0.01) {
            this.vel[0] = 0;
        }           
        if (Math.abs(this.vel[1]) < 0.01) {
            this.vel[1] = 0;
        }
        //console.log(this.getVel());
        //console.log(this.vel);
        
        //Decelerates
        if (this.friction !== 0) {
            this.vel[0] /= this.friction ** (60 / fps);
            this.vel[1] /= this.friction ** (60 / fps);
            this.totalVel /= this.friction ** (60 / fps);
        }
        
        this.drive();
    };

    //Handles acceleration
    this.boostVel = function(boost) {
        if (boost > 0) {
            if (this.getVel() < boost) {
                this.totalVel += 0.1 / fps * 60;
            }
        } else {
            if (this.getVel() > boost) {
                this.totalVel -= 0.05 / fps * 60;
            }
        }
    };
    //Physically moves the car
    this.drive = function() {
        this.x += this.vel[0] / fps * 60;
        this.y -= this.vel[1] / fps * 60;
    };

    //Gets the actual velocity of the car
    this.getVel = function() {
        return Math.sqrt(this.vel[0] * this.vel[0] + this.vel[1] * this.vel[1]);
    };

    this.getVelDir = function() {//gets the true direction of the velocity of the car, the variable this.dir is the orientation of the car
        return Math.atan(this.vel[1] / this.vel[0]);
    };

    //Turns the car
    this.turn = function(deg) {
        this.dir += (this.getVel() / 10) * deg / fps * 60;
        rad = this.dir * Math.PI / 180;
        //increases speed in direction of drift
        //this.vel[0] += this.totalVel * Math.cos(rad + (45 * deg > 0 ? 1: -1));
        //this.vel[1] += this.totalVel * Math.sin(rad + (45 * deg > 0 ? 1: -1));
        //console.log(this.totalVel);
    };

    //Wraps the car around the canvas
    this.wrap = function(canvas) {
        if (this.x <= -1 * canvas.width / 2) {
            this.x = canvas.width / 2;
        }
        if (this.x > canvas.width / 2) {
            this.x = -1 * canvas.width / 2;
        }
        if (this.y <= -1 * canvas.height / 2) {
            this.y = canvas.height / 2;
        }
        if (this.y > canvas.height / 2) {
            this.y = -1 * canvas.height / 2;
        }
    };
/*
                for (let j = 0; j < this.xVals[i].length - 1; j++) {
                    let p2 = new Point(this.xVals[i][j], this.yVals[i][j])
                    q2 = new Point(this.xVals[i][j + 1], this.yVals[i][j + 1]);
                    if (doIntersect(new Point((car.width / 2 * Math.cos(rad) - car.height / 2 * Math.sin(rad)) + car.x, (car.width / 2 * Math.sin(rad) + car.height / 2 * Math.cos(rad)) + car.y), 
                    new Point((car.width / 2 * Math.cos(rad) + car.height / 2 * Math.sin(rad)) + car.x, (car.width / 2 * Math.sin(rad) - car.height / 2 * Math.cos(rad)) + car.y), p2, q2) || 
                    
                    doIntersect(new Point((car.width / 2 * Math.cos(rad) + car.height / 2 * Math.sin(rad)) + car.x, (car.width / 2 * Math.sin(rad) - car.height / 2 * Math.cos(rad)) + car.y), 
                    new Point((-1 * car.width / 2 * Math.cos(rad) + car.height / 2 * Math.sin(rad)) + car.x, (-1 * car.width / 2 * Math.sin(rad) - car.height / 2 * Math.cos(rad)) + car.y), p2, q2) || 
    
                    doIntersect(new Point((-1 * car.width / 2 * Math.cos(rad) + car.height / 2 * Math.sin(rad)) + car.x, (-1 * car.width / 2 * Math.sin(rad) - car.height / 2 * Math.cos(rad)) + car.y), 
                    new Point((-1 * car.width / 2 * Math.cos(rad) - car.height / 2 * Math.sin(rad)) + car.x, (-1 * car.width / 2 * Math.sin(rad) + car.height / 2 * Math.cos(rad)) + car.y), p2, q2) || 
    
                    doIntersect(new Point((-1 * car.width / 2 * Math.cos(rad) - car.height / 2 * Math.sin(rad)) + car.x, (-1 * car.width / 2 * Math.sin(rad) + car.height / 2 * Math.cos(rad)) + car.y), 
                    new Point((car.width / 2 * Math.cos(rad) - car.height / 2 * Math.sin(rad)) + car.x, (car.width / 2 * Math.sin(rad) + car.height / 2 * Math.cos(rad)) + car.y), p2, q2)) {
                        car.alive = false;
                        //console.log("collided");
                        return;
                    }
                }
*/
    //will store all points from surrounding feelers thingies
    this.surroundings = [new Point(0, 0), new Point(0, 0), new Point(0, 0), new Point(0, 0), new Point(0, 0), new Point(0, 0), new Point(0, 0), new Point(0, 0), new Point(0, 0), new Point(0, 0)];
    this.getSurroundings = function(ctx) {
        //labeled 0-9 starting from top moving right
        //feeler lines are length 500

        ctx.beginPath();
        let p1 = new Point((0 * this.width / 2 * Math.cos(rad) + this.height / 2 * Math.sin(rad)) + this.x, (0 * this.width / 2 * Math.sin(rad) - this.height / 2 * Math.cos(rad)) + this.y); //Is top middle of car
        let q1 = new Point(p1.x + 500 * Math.cos(-1.5708 + car.getRad()), p1.y + 500 * Math.sin(-1.5708 + car.getRad()))
        this.surroundings[0] = this.calcSurroundIntersect(p1, q1);
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(q1.x, q1.y);

        q1 = new Point(p1.x + 500 * Math.cos(-1.0472 + car.getRad()), p1.y + 500 * Math.sin(-1.0472 + car.getRad()));
        this.surroundings[1] = this.calcSurroundIntersect(p1, q1);
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(q1.x, q1.y);

        q1 = new Point(p1.x + 500 * Math.cos(-0.5236 + car.getRad()), p1.y + 500 * Math.sin(-0.5236 + car.getRad()));
        this.surroundings[2] = this.calcSurroundIntersect(p1, q1);
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(q1.x, q1.y);

        q1 = new Point(p1.x + 500 * Math.cos(car.getRad()), p1.y + 500 * Math.sin(car.getRad()));
        this.surroundings[3] = this.calcSurroundIntersect(p1, q1);
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(q1.x, q1.y);

        p1 = new Point((0 * this.width / 2 * Math.cos(rad) - this.height / 2 * Math.sin(rad)) + this.x, (0 * this.width / 2 * Math.sin(rad) + this.height / 2 * Math.cos(rad)) + this.y); //Is bottom middle of car
        q1 = new Point(p1.x + 500 * Math.cos(0.7854 + car.getRad()), p1.y + 500 * Math.sin(0.7854 + car.getRad()));
        this.surroundings[4] = this.calcSurroundIntersect(p1, q1);
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(q1.x, q1.y);

        q1 = new Point(p1.x + 500 * Math.cos(1.5708 + car.getRad()), p1.y + 500 * Math.sin(1.5708 + car.getRad()))
        this.surroundings[5] = this.calcSurroundIntersect(p1, q1);
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(q1.x, q1.y);

        q1 = new Point(p1.x + 500 * Math.cos(2.3562 + car.getRad()), p1.y + 500 * Math.sin(2.3562 + car.getRad()));
        this.surroundings[6] = this.calcSurroundIntersect(p1, q1);
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(q1.x, q1.y);

        p1 = new Point((0 * this.width / 2 * Math.cos(rad) + this.height / 2 * Math.sin(rad)) + this.x, (0 * this.width / 2 * Math.sin(rad) - this.height / 2 * Math.cos(rad)) + this.y); //Is top middle of car
        q1 = new Point(p1.x + 500 * Math.cos(3.1415 + car.getRad()), p1.y + 500 * Math.sin(3.1415 + car.getRad()));
        this.surroundings[7] = this.calcSurroundIntersect(p1, q1);
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(q1.x, q1.y);

        q1 = new Point(p1.x + 500 * Math.cos(3.6652 + car.getRad()), p1.y + 500 * Math.sin(3.6652 + car.getRad()));
        this.surroundings[8] = this.calcSurroundIntersect(p1, q1);
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(q1.x, q1.y);

        q1 = new Point(p1.x + 500 * Math.cos(4.1888 + car.getRad()), p1.y + 500 * Math.sin(4.1888 + car.getRad()));
        this.surroundings[9] = this.calcSurroundIntersect(p1, q1);
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(q1.x, q1.y);
        ctx.stroke();
        ctx.closePath();

        //console.log(this.surroundings);
        for (let i = 0; i < this.surroundings.length; i++) { // NEEDS TO HANDLES NULL VALUES, cant just default to 0,0
            ctx.beginPath();

            ctx.fillStyle = "#000000";
            ctx.arc(this.surroundings[i].x, this.surroundings[i].y, 4, 0, Math.PI * 2); 
            ctx.fill();
            ctx.closePath();
        }
    };

    //helper function for getSurroundings
    this.calcSurroundIntersect = function(p1, q1) {
        let intersects = [];
        for (let i = 0; i < track.xVals.length; i++) {
            for (let j = 0; j < track.xVals[i].length - 1; j++) {
                let p2 = new Point(track.xVals[i][j], track.yVals[i][j])
                let q2 = new Point(track.xVals[i][j + 1], track.yVals[i][j + 1]);
                if (doIntersect(p1, q1, p2, q2)) {
                    //should return location of intersection
                    intersects.push(lineLineIntersection(p1, q1, p2, q2));
                }
            }
        }
        if (intersects.length > 0) {
            let minIndex = 0;
            let minDistance = getDistance(new Point(this.x, this.y), intersects[0]);
            for (let i = 1; i < intersects.length; i++) {
                let currDistance = getDistance(new Point(this.x, this.y), intersects[i])
                if (currDistance < minDistance) {
                    minDistance = currDistance;
                    minIndex = i;
                }
            }
            return intersects[minIndex];
        }
        return q1;
    };

    this.getRad = function() {
        return rad;
    };
}