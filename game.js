// Original game from:
// http://www.lostdecadegames.com/how-to-make-a-simple-html5-canvas-game/
// Slight modifications by Gregorio Robles <grex@gsyc.urjc.es>
// to meet the criteria of a canvas class for DAT @ Univ. Rey Juan Carlos

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background.png";

// Monster image
var monsterReady = false
var monsterImage = new Image();
monsterImage.onload = function(){
	monsterReady = true;
};
monsterImage.src = "images/monster.png";

// Rock image
var rockReady = false
var rockImage = new Image();
rockImage.onload = function(){
	rockReady = true;
};
rockImage.src = "images/stone.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "images/hero.png";

// princess image
var princessReady = false;
var princessImage = new Image();
princessImage.onload = function () {
	princessReady = true;
};
princessImage.src = "images/princess.png";

// Game objects
var hero = {
	speed: 256 // movement in pixels per second
};
var princess = {};
var princessesCaught = 0;
var monster = [];
var monsterKill = 0;
var monsterSpeed = 100;
var rock = [];
var level = 1;
var indexLevel = 1;

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

var checkNearnessLimits = function (people) {
	if(people.x <= 0 +16){
		people.x += 10;
	}else if(people.x >= canvas.width - 50){
		people.x -= 10;
	}else if(people.y <= 0 + 16){
		people.y += 10;
	}else if(people.y >= canvas.height - 50){
		people.y -= 10;
	};
};

var checkNearnessCharacters = function (c1,c2){
	if(
		c1.x <= (c2.x + 16)
		&& c2.x <= (c1.x + 16)
		&& c1.y <= (c2.y + 16)
		&& c2.y <= (c1.y + 32)
	){
		return true;
	}
	return false;
};

var getMonster = function(){
	var m = {};
	m.x = 32 + (Math.random() * (canvas.width - 64));
	m.y = 32 + (Math.random() * (canvas.height - 64));
	if(checkNearnessCharacters(hero,m)){
		m.x += 32;
		m.y += 32;
	}else if(checkNearnessCharacters(m,princess)){
		m.x += 32;
		m.y += 32;
	};
	checkNearnessLimits(m);
	return m;
};

var getRock = function(){
	var r = {};
	r.x = 32 + (Math.random() * (canvas.width - 64));
	r.y = 32 + (Math.random() * (canvas.height - 64));
	if(checkNearnessCharacters(hero,r)){
		r.x += 32;
		r.y += 32;
	}else if(checkNearnessCharacters(r,princess)){
		r.x += 32;
		r.y += 32;
	};
	checkNearnessLimits(r);
	return r;
};

var getState = function(){
	var estado = localStorage.getItem("prinCau");
	console.log(estado);
	if(estado === null){
		estado = 0;
	};
	return estado;
};

var getLevel = function(){
	if(princessesCaught === 0 || getState() === 0){
		princessesCaught = getState();
		monster = [];
		rock = []
		indexLevel = Math.floor(princessesCaught/2);
		level = Math.floor(princessesCaught/2);
		monsterSpeed = 100 + Math.floor(princessesCaught/2)*25;
	};
	if(princessesCaught >= (2*indexLevel)){
		localStorage.setItem("prinCau",princessesCaught);
		indexLevel++;
		level++;
		monsterSpeed += 25;
	};
};

// Reset the game when the player catches a princess
var reset = function () {
	getLevel();
	hero.x = canvas.width / 2;
	hero.y = canvas.height / 2;

	// Throw the princess somewhere on the screen randomly
	princess.x = 32 + (Math.random() * (canvas.width - 64));
	princess.y = 32 + (Math.random() * (canvas.height - 64));
	if(checkNearnessCharacters(hero,princess)){
		princess.x += 32;
		princess.y += 32;
	}
	checkNearnessLimits(princess);

	for(var i=0; i < level*2; i++){
		monster[i] = getMonster();
		rock[i] = getRock();
	}
};

var expon = function(a,b){
	var res = a;
	for(var i =0; i < b; i++){
		res = res * a;
	}
	return res;
};

var removePrincCau = function(){
	localStorage.removeItem("prinCau");
};

// Update game objects
var update = function (modifier) {

	if(princessesCaught === 0){
		princessesCaught = getState();
		if(princessesCaught != 0){
			reset();
		};
	};

	if (38 in keysDown) { // Player holding up
		hero.y -= hero.speed * modifier;
		for(var i=0; i < monster.length; i++){
			monster[i].y += monsterSpeed * modifier * expon((-1),i);
			checkNearnessLimits(monster[i]);
		};
	};
	if (40 in keysDown) { // Player holding down
		hero.y += hero.speed * modifier;
		for(var i=0; i < monster.length; i++){
			monster[i].y -= monsterSpeed * modifier * expon((-1),i);
			checkNearnessLimits(monster[i]);
		};
	};
	if (37 in keysDown) { // Player holding left
		hero.x -= hero.speed * modifier;
		for(var i=0; i < monster.length; i++){
			monster[i].x += monsterSpeed * modifier * expon((-1),i);
			checkNearnessLimits(monster[i]);
		};
	};
	if (39 in keysDown) { // Player holding right
		hero.x += hero.speed * modifier;
		for(var i=0; i < monster.length; i++){
			monster[i].x -= monsterSpeed * modifier * expon((-1),i);
			checkNearnessLimits(monster[i]);
		};
	};
	if(32 in keysDown){
		removePrincCau();
		reset();
	};

	// Are they touching princess?
	if (checkNearnessCharacters(hero,princess)){
		++princessesCaught;
		reset();
	};

	// Are they touching monster?
	for(var i=0; i < monster.length; i++){
		if(checkNearnessCharacters(hero,monster[i])){
			++monsterKill;
			reset();
		};
	};

	// Are they touching rock?
	for(var i=0; i < rock.length; i++){
		if(checkNearnessCharacters(hero,rock[i])){
			hero.x -= 16;
			hero.y -= 16;
		};
	};

	// Are they touching limits?
	checkNearnessLimits(hero);
};

// Draw everything
var render = function (){
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}

	if (heroReady) {
		ctx.drawImage(heroImage, hero.x, hero.y);
	}

	if (princessReady) {
		ctx.drawImage(princessImage, princess.x, princess.y);
	}

	if(monsterReady){
		for(var i=0; i < rock.length; i++){
			ctx.drawImage(monsterImage, monster[i].x, monster[i].y);
		};
	}

	if(rockReady){
		for(var i=0; i < rock.length; i++){
			ctx.drawImage(rockImage, rock[i].x, rock[i].y);
		};
	}

	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	//ctx.fillText("Princesses caught: " + princessesCaught, 32, 32);
	//ctx.fillText("Hero's deaths: " + monsterKill,64,64);
	
	var caught = document.getElementById("caught");
	caught.innerHTML = "Princesses caught: " + princessesCaught;
	var deaths = document.getElementById("deaths");
	deaths.innerHTML = "Hero's deaths: " + monsterKill;
};

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

	then = now;
};

// Let's play this game!
reset();
var then = Date.now();
//The setInterval() method will wait a specified number of milliseconds, and then execute a specified function, and it will continue to execute the function, once at every given time-interval.
//Syntax: setInterval("javascript function",milliseconds);
setInterval(main, 1); // Execute as fast as possible
