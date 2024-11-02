let player;
let playerSpeedVariable = 0.5;
let frameCount = 0;
let bullets = [];
let largeAsteroids = [];
let medAsteroids = [];
let smallAsteroids = [];
let difficulty = 20;
let asteroids = [];
let asteroidCount = 0;
let score = 0;
let start = true;
let playing = false;
let hit = false;
let gameOn = true;
let doAsteroids = true;
let doPlayer = true;
let livesAdded = 1;
let powersAdded = 1;
let lives = 3;
let listOfNukes = [];
let listOfExplosions = [];
let pewSound;
let powers = [];

//PRELOAD
function preload() {
    //soundFormats('mp3', 'wav');
    font = loadFont('./Slim-Thirteen-Pixel-Fonts.ttf');
    largeAsteroidSheet = loadImage("./Large-Rocks.png");
    medAsteroidSheet = loadImage("./Medium-Rocks.png");
    smallAsteroidSheet = loadImage("./Small-Rocks.png");
    explosionFrames= loadImage("./explosionGif.gif");
    explosionSound = document.getElementById('Explosion');
    pewSound = document.getElementById('Pew');
    explosionSound = document.getElementById('Explosion');
    pewSound = document.getElementById('Pew');
    tripleShotIcon = loadImage("./Triple Shot.png");
    shieldIcon = loadImage("./Shield.png");
    nukeIcon = loadImage("./Radioactive.png");
    autoIcon = loadImage('./Auto.png');

  }
//SETUP
function setup(){
    //angleMode(DEGREES)
    imageMode(CENTER);
    createCanvas(windowWidth-20, windowHeight-20);
    //INIT PLAYER
    player = {
        x: width / 2,
        y: height / 2,
        xv: 0,
        yv: 0,
        tx1: -20,
        ty1: 25,
        tx2: 20,
        ty2: 25,
        tx3: 0,
        ty3: -25,
        rotation: 0,
        on: true,
        power: []
    }
    //IMAGES
    for(let i = 0; i < 8; i++){
        largeAsteroids.push(largeAsteroidSheet.get(i*1000, 0, 1000, 1000));
        medAsteroids.push(medAsteroidSheet.get(i*500, 0, 500, 500));
        smallAsteroids.push(smallAsteroidSheet.get(i*250, 0, 250, 250));
    }
    
}

function drawLife(lifeNumber) {
    //LIVES
    let rightVal = lifeNumber*60;
    fill('white')
    triangle(50 + rightVal, height - 50, 100 + rightVal, height - 50, 75 + rightVal, height - 100);
    fill('black');
    triangle(50 + rightVal, height - 40, 100 + rightVal, height - 40, 75 + rightVal, height - 90);
    fill('white');
    triangle(50 + rightVal, height - 50, 100 + rightVal, height - 50, 75 + rightVal, height - 70);
    fill('black');
    triangle(45 + rightVal, height - 40, 105 + rightVal, height - 40, 75 + rightVal, height - 63);
    }
    
    function draw(){
        frameCount++;
        let degree = player.rotation * (Math.PI / 180);
    background('black');
    
    //START SCREEN 
    if(!playing && start){
        textFont(font);
        textSize(100);
        fill('white');
        text('ASTEROIDS', width/2 - 275, height/2 - 50);
        textSize(30);
        text('By Cade McNelly', width/2 -105, height/2);
        text('Press SPACE to start', width/2 -125, height/2 + 100);
        if(keyIsDown(32)){
            playing = true;
            start = false;
        }
    }
    //NUKE
    if(listOfNukes.length > 0){
        for(let n = 0; n < listOfNukes.length; n++){
            fill('yellow');
            circle(listOfNukes[n][0], listOfNukes[n][1], listOfNukes[n][2]);
            fill('black');
            circle(listOfNukes[n][0], listOfNukes[n][1], listOfNukes[n][2]-20);
            fill('white');
            listOfNukes[n][2] += 150;
            if(listOfNukes[n][2] >= width*2){
                listOfNukes.splice(0, 1);
            }
        }
    
    }
    //MOVE ASTEROIDS
    moveAsteroids();
    movePowers();
    if(score > 5000){
        difficulty = 40;
    }

    //PLAYING
    if(playing){
        if(mouseIsPressed && player.power.includes(3)){
            createBullet();
        }
        moveBullet();
        loadScore();
        if(doPlayer){
            if(!hit){
                findMovement(degree);
            }
            shield();
            movePlayer();
            updatePlayer(degree);
            
        }
        for(let i = 0; i<lives; i++){
            drawLife(i);
        }
        if(score > 10000 * livesAdded){
            lives++;
            livesAdded++;
        }
    }

    //BULLET-ASTEROID COLLISION
    for(let i=0; i < bullets.length; i++){
        if(checkCollisions(bullets[i])){
            explosion(bullets[i]);
        }
    }

    //ADD ASTEROIDS
    let rand = Math.floor(Math.random() * 25);
    if(rand == 1 && asteroidCount < difficulty){
        addAsteroid();
    };

    rand = Math.floor(Math.random() * 500);
    if(rand == 1){
        if(powers.length < 3){
           addPower(); 
        } 
    }

    //GAME OVER SCREEN
    if(!gameOn){
        textFont(font);
        textSize(100);
        fill('white');
        text('GAME OVER', width/2 - 275, height/2 - 50);
        textSize(30);
        text(`Your score is ${score}!`, width/2 -125, height/2);
        text('Press SPACE to restart', width/2 -125, height/2 + 40);
        if(keyIsDown(32)){
            lives = 3;
            score = 0;
            bullets = [];
            asteroids = [];
            powers = [];
            player.x = width /2;
            player.y = height / 2;
            player.rotation = 0;
            doPlayer = true;
            hit = false;
            playing = true;
            doAsteroids = true;
            asteroidCount = 0;
            livesAdded = 1;
            gameOn = true;
        }
    }

    //EXPLOSION ANIMATION
    if(listOfExplosions.length > 0) {
        for(let i = 0; i < listOfExplosions.length; i++){
            image(explosionFrames, listOfExplosions[i][0], listOfExplosions[i][1], 50, 50);
        }

    }
    //console.log(player.rotation);
}

//UPDATE PLAYER
function updatePlayer(degree) { 
    strokeWeight(0);
    fill('white');
    push();
    translate(player.x, player.y);
    rotate(degree);
    triangle(
        player.tx1,
        player.ty1,
        player.tx2,
        player.ty2,
        player.tx3,
        player.ty3
    );
    fill('black');
    triangle(
        player.tx1 + 4,
        player.ty1 + 1,
        player.tx2 - 4,
        player.ty2 + 1,
        player.tx3,
        player.ty3 + 10
    );
    fill('white');
    triangle(
        player.tx1,
        player.ty1 + 1,
        player.tx2,
        player.ty2 + 1,
        player.tx3,
        player.ty3 + 35
    );
    fill('black');
    triangle(
        player.tx1,
        player.ty1 + 6,
        player.tx2,
        player.ty2 + 6,
        player.tx3,
        player.ty3 + 40
    );
    fill('white');
    pop();
}
    
function findMovement(degree) {
    //PLAYER MOVEMENT
    //W
    if((keyIsDown(87) || keyIsDown(38) || keyIsDown(32)) && player.yv > playerSpeedVariable*-20){
        if(player.rotation < 90 || player.rotation > 270){
            player.yv -= playerSpeedVariable * (Math.cos(degree));
        } else {
            player.yv += playerSpeedVariable * -(Math.cos(degree));
        };
        if(player.rotation > 360 || player.rotation < 180) {
            player.xv += playerSpeedVariable * (Math.sin(degree));
        } else {
            player.xv -= playerSpeedVariable * -(Math.sin(degree));
        };
    };
    //S
    if((keyIsDown(83) || keyIsDown(40)) && player.yv < playerSpeedVariable*10){
        if(player.rotation < 90 || player.rotation > 270){
            player.yv +=playerSpeedVariable * (Math.cos(degree));
        } else {
            player.yv -=playerSpeedVariable * -(Math.cos(degree));
        };
        if(player.rotation > 360 || player.rotation < 180) {
            player.xv -= playerSpeedVariable * (Math.sin(degree));
        } else {
            player.xv += playerSpeedVariable * -(Math.sin(degree));
        };
    };
    //A
    if(keyIsDown(65) || keyIsDown(37)){
        if(player.rotation == 0){
            player.rotation = 360;
        };
        player.rotation -= 5;
    };
    //D
    if(keyIsDown(68) || keyIsDown(39)){
        if(player.rotation == 360){
            player.rotation = 0;
        };
        player.rotation += 5;
    };
}

//MOVE PLAYER
function movePlayer(){

    //MOVE
    if(player.y > height -25 || player.y < 25){
        if(player.yv < 0){
            player.yv -= 1;
        } else if(player.yv > 0){
            player.yv += 1;
        };
        player.yv *= -1;
    };
    if(player.x > width -25 || player.x < 25){
        if(player.xv < 0){
            player.xv -= 1;
        } else if(player.xv > 0){
            player.xv += 1;
        };
        player.xv *= -1;
    };
    player.x += player.xv;
    player.y += player.yv;

    //BOUNCE
    if(!keyIsDown() && (player.yv != 0 || player.xv != 0)){
        if(player.yv > 0){
            player.yv -= 0.25;
        } else if(player.yv < 0){
            player.yv += 0.25;
        };
        if(player.xv > 0){
            player.xv -= 0.25;
        } else if(player.xv < 0){
            player.xv += 0.25;
        };
    };

    //PLAYER_ASTEROID COLLISIONS
    if(checkCollisions(player) && !hit){
        if(!powers.includes(checkCollisions(player))){
            if(lives == 0){
                die();
            } else {
                loseLife();
            }
        } else {
            getPower(checkCollisions(player), player);
        }
        
    }
}

//CREATE BULLET
function mousePressed() {
    createBullet();
}

function createBullet(){
    if(playing && doAsteroids){

        //CREATE BULLET
        let bullet = {
            x: player.x,
            y: player.y,
            size: 5,
            rotation: player.rotation,
            xv: 20*(Math.cos((player.rotation - 90)*(Math.PI / 180))),
            yv: 20*(Math.sin((player.rotation - 90)*(Math.PI / 180))),
            on: true,
            color: 'white'
        } 
        if(player.power.includes(2)){
            let bullet2 = {
                x: player.x,
                y: player.y,
                size: 5,
                rotation: player.rotation - 30,
                xv: 20*(Math.cos((player.rotation - 120)*(Math.PI / 180))),
                yv: 20*(Math.sin((player.rotation - 120)*(Math.PI / 180))),
                on: true,
                color: 'red'
            } 
            bullets.push(bullet2);
            let bullet3 = {
                x: player.x,
                y: player.y,
                size: 5,
                rotation: player.rotation + 30,
                xv: 20*(Math.cos((player.rotation - 60)*(Math.PI / 180))),
                yv: 20*(Math.sin((player.rotation - 60)*(Math.PI / 180))),
                on: true,
                color: 'red'
            } 
            bullets.push(bullet3);
        }
        //PEW SOUND
        pewSound.pause();
        pewSound.currentTime = 0;
        pewSound.play();
        bullets.push(bullet);
    };
};
//MOVE BULLET
function moveBullet(){
    for(let i=0; i < bullets.length; i++){
        fill(bullets[i].color);
        rect(bullets[i].x, bullets[i].y, bullets[i].size, bullets[i].size);
        bullets[i].x += bullets[i].xv;
        bullets[i].y += bullets[i].yv;
        if(checkCollisions(bullets[i])){
            //console.log('hit');
            //explosion(bullets[i]);
            //bullets[i].explosionArr = explosion(bullets[i]);
            explosion(bullets[i], i);
            //splitAsteroid(checkCollisions(bullets[i]), bullets[i]);
            //if(bullets[i].explosionArr){
            //    doExplosion(bullets[i].explosionArr);
            //}
            //bullets.splice(i, 1);
        } else if(bullets[i].x > width || bullets[i].x < 0 || bullets[i].y > height || bullets[i].y < 0){
            bullets.splice(i, 1);
        }
    }
}

//CREATE ASTEROID
function initAsteroid(tier = Math.floor(Math.random()* 3) + 1){
    asteroidCount++;
    let asteroid = {
        x: 0,
        y: 0,
        xv: Math.floor(Math.random()* 14) - 7,
        yv: Math.floor(Math.random()* 14) - 7,
        size: 120,
        imgSize: 200,
        tier: tier,
        img: largeAsteroids[Math.floor(Math.random()*7)],
        pts: 50,
        rotationv: Math.floor(Math.random() * 7),
        rotation: 0,
        on: true
    }
    if(asteroid.tier == 1){
        asteroid.imgSize = 50;
        asteroid.size = 30;
        asteroid.pts = 200;
        asteroid.img = smallAsteroids[Math.floor(Math.random()*7)];
    } else if(asteroid.tier == 2){
        asteroid.imgSize = 100;
        asteroid.size = 50;
        asteroid.pts = 100;
        asteroid.img = medAsteroids[Math.floor(Math.random()*7)];
    }else{
        asteroid.img = largeAsteroids[Math.floor(Math.random()*7)];
    }
    return asteroid;
}

//ADD ASTEROID
function addAsteroid() {
    let asteroid = initAsteroid();
    let asteroidHorizontal = Math.floor(Math.random() * width);
    let asteroidVertical = Math.floor(Math.random() * 2) + 1;
    if(asteroidVertical == 1) {
        asteroid.x = asteroidHorizontal;
        asteroid.y = -500;
        if(Math.floor(Math.random()*2) == 1){
            asteroid.xv *= -1;
        }
    } else if(asteroidVertical == 2) {
        asteroid.y = Math.floor(Math.random() * height);
        let side = Math.floor(Math.random() * 2);
        if(side == 1){
            asteroid.x = -500;
        } else {
            asteroid.x = width + 500;
            asteroid.xv *= -1;
        }
        if(Math.floor(Math.random()*2) == 1){
            asteroid.yv *= -1;
        }
    } else if(asteroidVertical ==3 ) {
        asteroid.x = asteroidHorizontal;
        asteroid.y = height + 500;
        if(Math.floor(Math.random()*2) == 1){
            asteroid.yv *= -1;
        }
    }
   // console.log(asteroidHorizontal + ', ' + asteroidVertical);

    asteroids.push(asteroid);

    //console.log(asteroid);

}

//MOVE ASTEROIDS
function moveAsteroids() {
    for(let i=0; i < asteroids.length; i++){
        fill('white');
        if(doAsteroids){
            if(asteroids[i].x > width + 1000 || asteroids[i].x < -1000){
                asteroids[i].xv *= -1;
            }
            if(asteroids[i].y > height + 1000 || asteroids[i].y < -1000){
                asteroids[i].yv *= -1;
            }
            asteroids[i].x += asteroids[i].xv;
            asteroids[i].y += asteroids[i].yv;

            asteroids[i].rotation += asteroids[i].rotationv;

        }
        angleMode(DEGREES);
        push();
        translate(asteroids[i].x, asteroids[i].y);
        rotate(asteroids[i].rotation);
        image(asteroids[i].img, 0, 0, asteroids[i].imgSize, asteroids[i].imgSize);
        pop();
        angleMode(RADIANS);
        
        //console.log(asteroids[i])
        //rect(asteroids[i].x, asteroids[i].y, asteroids[i].size, asteroids[i].size);

    }

    
}


//CHECK COLLISIONS
function checkCollisions(object) {
    if(object.on){
        for(let i = 0; i < asteroids.length; i++){
            let xDiff = object.x-asteroids[i].x;
            let yDiff = object.y-asteroids[i].y;
            let dist = Math.sqrt(xDiff*xDiff + yDiff*yDiff);
            if(player.power.includes(1) && object == player){
                dist -= 75;
            }
            
            if(dist <= asteroids[i].size){
                if(player.power.includes(1) && object == player){
                    score += asteroids[i].pts;
                    explosionSound.pause();
                    explosionSound.currentTime = 0;
                    explosionSound.play();
                    listOfExplosions.push([asteroids[i].x, asteroids[i].y]);
                    setTimeout(() => {
                        listOfExplosions.splice(0, 1);
                    }, 350);
                    asteroids.splice(asteroids.indexOf(asteroids[i]), 1);
                    asteroidCount--;
                    return false;
                }
                return asteroids[i];
            }
        }
        for(let i = 0; i < powers.length; i++){
            let xDiff = object.x-powers[i].x;
            let yDiff = object.y-powers[i].y;
            let dist = Math.sqrt(xDiff*xDiff + yDiff*yDiff);
            if(player.power.includes(1) && object == player){
                dist -= 75;
            }
            if(dist <= 75/2){
                return powers[i];
            }
        }
        return false;
    }
    
}
//SPLIT ASTEROIDS
function splitAsteroid(asteroidToSplit, bullet){
    
if(asteroidToSplit.tier != 1){
        let splitAsteroid1 = initAsteroid(asteroidToSplit.tier - 1);
        splitAsteroid1.x = asteroidToSplit.x;
        splitAsteroid1.y = asteroidToSplit.y;

        let splitAsteroid2 = initAsteroid(asteroidToSplit.tier - 1);
        splitAsteroid2.x = asteroidToSplit.x;
        splitAsteroid2.y = asteroidToSplit.y;

        asteroids.push(splitAsteroid1);
        asteroids.push(splitAsteroid2);
        if(bullet.xv < 0){
            splitAsteroid1.xv = -Math.abs(splitAsteroid1.xv);
            splitAsteroid2.xv = -Math.abs(splitAsteroid2.xv);
        } else {
            splitAsteroid1.xv = Math.abs(splitAsteroid1.xv);
            splitAsteroid2.xv = Math.abs(splitAsteroid2.xv);
        }
        if(bullet.yv < 0){
            splitAsteroid1.yv = -Math.abs(splitAsteroid1.yv);
            splitAsteroid2.yv = -Math.abs(splitAsteroid2.yv);
        } else {
            splitAsteroid1.yv = Math.abs(splitAsteroid1.yv);
            splitAsteroid2.yv = Math.abs(splitAsteroid2.yv);
        }
    }
    score += asteroidToSplit.pts;
    if(score > 10000 * livesAdded){
        lives++;
        livesAdded++;
    }
    asteroidCount--;
    asteroids.splice(asteroids.indexOf(asteroidToSplit), 1);

}

//LOAD SCORE
function loadScore(){
    fill('white');
    textFont(font);
    textSize(50)

    text(`Score: ${score}`, 20, 40);
}

//DEATH
function die() {
    hit = true;
    doAsteroids = false;
    player.xv = 0;
    player.yv = 0;
    for(let i = 0; i < 6; i++){
        setTimeout(() => {
            doPlayer = !doPlayer
        }, 500*i);
    }
    setTimeout(() => {
        asteroids = [];
        playing = false;
        doPlayer = false;
        gameOn = false;
    }, 4000)
}

//LOSE LIFE
function loseLife() {
    hit = true;
    doAsteroids = false;
    lives--;
    player.xv = 0;
    player.yv = 0;
    for(let i = 0; i < 6; i++){
        setTimeout(() => {
            doPlayer = !doPlayer;
        }, 500*i);
    }
    setTimeout(() => {
        doPlayer = false;
        explosion(player);
    }, 3500)
    setTimeout(() => {
        bullets = [];
        asteroids = [];
        powers = [];
        player.x = width /2;
        player.y = height / 2;
        player.rotation = 0;
        doPlayer = true;
        hit = false;
        playing = true;
        doAsteroids = true;
        asteroidCount = 0;
    }, 4100)
}

//EXPLOSIONS
function explosion(bullet, index = 0){
    explosionSound.pause();
    explosionSound.currentTime = 0;
    explosionSound.play();
    if(bullet != player){
        if(asteroids.includes(checkCollisions(bullets[index]))){
            splitAsteroid(checkCollisions(bullets[index]), bullets[index]);
        } else {
            getPower(checkCollisions(bullets[index]), bullets[index]);
        };
        listOfExplosions.push([bullet.x, bullet.y]);
        bullets.splice(index, 1);
        
    } else {
        listOfExplosions.push([player.x, player.y]);
    }
    setTimeout(() => {
        listOfExplosions.splice(0, 1);
    }, 350);

explosionSound.pause();
explosionSound.currentTime = 0;
explosionSound.play();

    
};

function addPower() {
    //console.log('made');
    let power = {
        x: 100,
        y: 100,
        xv: 5,
        yv: 5,
        powerNum: Math.floor(Math.random()*4)

    }
    let powerHorizontal = Math.floor(Math.random() * width);
    let powerVertical = Math.floor(Math.random() * 2) + 1;
    if(powerVertical == 1) {
        power.x = powerHorizontal;
        power.y = -500;
        if(Math.floor(Math.random()*2) == 1){
            power.xv *= -1;
        }
    } else if(powerVertical == 2) {
        power.y = Math.floor(Math.random() * height);
        let side = Math.floor(Math.random() * 2);
        if(side == 1){
            power.x = -500;
        } else {
            power.x = width + 500;
            power.xv *= -1;
        }
        if(Math.floor(Math.random()*2) == 1){
            power.yv *= -1;
        }
    } else if(powerVertical ==3 ) {
        power.x = powerHorizontal;
        power.y = height + 500;
        if(Math.floor(Math.random()*2) == 1){
            power.yv *= -1;
        }
    }
   // console.log(powerHorizontal + ', ' + powerVertical);

    powers.push(power);
    
};

function movePowers() {
    for(let i =0; i < powers.length; i++){
        if(powers[i].x > width + 500 || powers[i].x < -500){
            powers[i].xv *= -1;
        }
        if(powers[i].y > height + 500 || powers[i].y < -500){
            powers[i].yv *= -1;
        }
        if(doAsteroids){
            powers[i].x += powers[i].xv;
            powers[i].y += powers[i].yv;
        } 
        if(powers[i].powerNum == 0){
            image(nukeIcon, powers[i].x, powers[i].y, 75, 75);
        }else if(powers[i].powerNum == 1){
            image(shieldIcon, powers[i].x, powers[i].y, 75, 75);
        }else if(powers[i].powerNum == 2){
            image(tripleShotIcon, powers[i].x, powers[i].y, 75, 75);
        } else {
            image(autoIcon, powers[i].x, powers[i].y, 75, 75);
        };
    }
};

function shield(){
    if(player.power.includes(1)){
        //console.log('shield');
        fill('blue');
        circle(player.x, player.y, 150);
        fill('black');
        circle(player.x, player.y, 130);
        fill('white');
    };
};

function nuke(power) {
    for(let i =0; i < asteroids.length; i++){
        //console.log(asteroids);  
        listOfNukes.push([power.x, power.y, 30]);
        listOfExplosions.push([asteroids[i].x, asteroids[i].y]);            
        score += asteroids[i].pts; 
        explosionSound.pause();
        explosionSound.currentTime = 0;
        explosionSound.play();
        setTimeout(() => { 
            listOfExplosions.splice(0, 1);
        }, 350);
    }  
    asteroidCount = 0;
    asteroids = [];
};

function getPower(power) {
    if(player.powerNum != 0){
        player.power.push(power.powerNum);
        if(power.powerNum != 3) {
            setTimeout(() => {
                player.power.splice(player.power.indexOf(power.powerNum), 1);
            }, 10000);
        } else {
            setTimeout(() => {
                player.power.splice(player.power.indexOf(power.powerNum), 1);
            }, 7000);
        }
         
    };
    if(power.powerNum == 0){
        nuke(power);
    }
    
    powers.splice(powers.indexOf(power), 1);
}

//function doExplosion(arr){
    //    let transparency = 100;
    //    while(transparency != 0){
        //        for(let i =0; i < arr.length; i++){
            //            arr[i].x += Math.cos(arr[i].speed)*(Math.PI / 180);
            //            arr[i].y += Math.sin(arr[i].speed)*(Math.PI / 180);
            //            fill()
            //            rect(arr[i].x, arr[i].y, 20, 20);
            //        }
//        transparency --;
//    }
//    
//}
