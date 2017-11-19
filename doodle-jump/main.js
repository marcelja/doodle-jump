// RequestAnimFrame: a browser API for getting smooth animations
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
  function(callback) {
    window.setTimeout(callback, 1000 / 60);
  };
})();

var width = 422,
  height = 552;

//Base object
function Base(game) {
  this.height = 5;
  this.width = width;

  //Sprite clipping
  this.cx = 0;
  this.cy = 614;
  this.cwidth = 100;
  this.cheight = 5;

  this.moved = 0;

  this.x = 0;
  this.y = height - this.height;
  this.last_y = this.y;

  this.draw = function() {
    try {
      game.ctx.drawImage(game.image, this.cx, this.cy, this.cwidth, this.cheight, this.x, this.y, this.width, this.height);
    } catch (e) {}
  };
};

//Player object
function Player(game) {
  this.vy = 11;
  this.vx = 0;

  this.isMovingLeft = false;
  this.isMovingRight = false;
  this.isDead = false;

  this.width = 55;
  this.height = 40;

  //Sprite clipping
  this.cx = 0;
  this.cy = 0;
  this.cwidth = 110;
  this.cheight = 80;

  this.dir = "left";

  this.x = width / 2 - this.width / 2;
  this.last_y = height;
  this.y = height;

  //Function to draw it
  this.draw = function() {

    try {
      if (this.dir == "right") this.cy = 121;
      else if (this.dir == "left") this.cy = 201;
      else if (this.dir == "right_land") this.cy = 289;
      else if (this.dir == "left_land") this.cy = 371;

      game.ctx.drawImage(game.image, this.cx, this.cy, this.cwidth, this.cheight, this.x, this.y, this.width, this.height);
    } catch (e) {console.log(e);}
  };

  this.jump = function() {
    this.vy = -8;
  };

  this.jumpHigh = function() {
    this.vy = -16;
  };

};

//Platform class

function Platform(game) {
  this.width = 70;
  this.height = 17;

  this.x = game.rng.uniform() * (width - this.width);
  this.y = game.position;

  game.position += (height / game.platformCount);

  this.flag = 0;
  this.state = 0;

  //Sprite clipping
  this.cx = 0;
  this.cy = 0;
  this.cwidth = 105;
  this.cheight = 31;

  //Function to draw it
  this.draw = function() {
    try {

      if (this.type == 1) this.cy = 0;
      else if (this.type == 2) this.cy = 61;
      else if (this.type == 3 && this.flag === 0) this.cy = 31;
      else if (this.type == 3 && this.flag == 1) this.cy = 1000;
      else if (this.type == 4 && this.state === 0) this.cy = 90;
      else if (this.type == 4 && this.state == 1) this.cy = 1000;

      game.ctx.drawImage(game.image, this.cx, this.cy, this.cwidth, this.cheight, this.x, this.y, this.width, this.height);
    } catch (e) {}
  };

  //Platform types
  //1: Normal
  //2: Moving
  //3: Breakable (Go through)
  //4: Vanishable 
  //Setting the probability of which type of platforms should be shown at what score
  /*
  if (score >= 5000) this.types = [2, 3, 3, 3, 4, 4, 4, 4];
  else if (score >= 2000 && score < 5000) this.types = [2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4];
  else if (score >= 1000 && score < 2000) this.types = [2, 2, 2, 3, 3, 3, 3, 3];
  else if (score >= 500 && score < 1000) this.types = [1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3];
  else if (score >= 100 && score < 500) this.types = [1, 1, 1, 1, 2, 2];
  else this.types = [1];
  */
  this.types = [1];
  this.type = this.types[Math.floor(Math.random() * this.types.length)];

  //We can't have two consecutive breakable platforms otherwise it will be impossible to reach another platform sometimes!
  if (this.type == 3 && broken < 1) {
    broken++;
  } else if (this.type == 3 && broken >= 1) {
    this.type = 1;
    broken = 0;
  }

  this.moved = 0;
  this.vx = 1;
}

//Broken platform object
function Platform_broken_substitute(game) {
  this.height = 30;
  this.width = 70;

  this.x = 0;
  this.y = 0;

  //Sprite clipping
  this.cx = 0;
  this.cy = 554;
  this.cwidth = 105;
  this.cheight = 60;

  this.appearance = false;

  this.draw = function() {
    try {
      if (this.appearance === true) game.ctx.drawImage(game.image, this.cx, this.cy, this.cwidth, this.cheight, this.x, this.y, this.width, this.height);
      else return;
    } catch (e) {}
  };
};

//Spring Class
function spring(game) {
  this.x = 0;
  this.y = 0;

  this.width = 26;
  this.height = 30;

  //Sprite clipping
  this.cx = 0;
  this.cy = 0;
  this.cwidth = 45;
  this.cheight = 53;

  this.state = 0;

  this.draw = function() {
    try {
      if (this.state === 0) this.cy = 445;
      else if (this.state == 1) this.cy = 501;

      game.ctx.drawImage(game.image, this.cx, this.cy, this.cwidth, this.cheight, this.x, this.y, this.width, this.height);
    } catch (e) {}
  };
};

function Game(ctx, scoreBoard, score_p, input_params_p, genetic_algorithm, index) {
  this.platforms = [],
  this.image = document.getElementById("sprite"),
  this.player, this.platformCount = 10,
  this.position = 0,
  this.gravity = 0.2,
  this.animloop,
  this.flag = 0,
  this.broken = 0,
  this.dir, this.score = 0, this.firstRun = true;
  this.jumpCount = 0;

  this.ctx = ctx;
  this.scoreBoard = scoreBoard;
  this.score_p = score_p;
  this.input_params_p = input_params_p;
  this.GA = genetic_algorithm;
  this.index = index;
  this.base = new Base(this);
  this.player = new Player(this);
  this.rng = new RNG(RNGSEED);
  for (var i = 0; i < this.platformCount; i++) {
    this.platforms.push(new Platform(this));
  }
  this.platform_broken_substitute = new Platform_broken_substitute(this);
  this.Spring = new spring(this);
  this.died_message_sent = false;
  this.input_params = [];

  this.iterationsSinceLastScoreIncrease = 0;
}

Game.prototype.init = function() {
  //Variables for the game
  this.dir = "left";
  
  this.firstRun = false;

  this.animloop();

  this.hideMenu();
  this.showScore();
}

//Function for clearing canvas in each consecutive frame

Game.prototype.paintCanvas = function() {
  this.ctx.clearRect(0, 0, width, height);
}

//Player related calculations and functions

Game.prototype.playerCalc = function() {
  if (this.dir == "left") {
    this.player.dir = "left";
    if (this.player.vy < -7 && this.player.vy > -15) this.player.dir = "left_land";
  } else if (this.dir == "right") {
    this.player.dir = "right";
    if (this.player.vy < -7 && this.player.vy > -15) this.player.dir = "right_land";
  }

  //Adding keyboard controls
  /*
  var self = this;
  document.onkeydown = function(e) {
    var key = e.keyCode;
    
    if (key == 37) {
      self.goLeft();
    } else if (key == 39) {
      self.goRight();
    }
    
    if(key == 32) {
      if(self.firstRun === true) {
        self.init();
      } else {
        self.reset();
      }
    }
  };

  document.onkeyup = function(e) {
    var key = e.keyCode;
  
    if (key == 37) {
      self.stopMoving();
    } else if (key == 39) {
      self.stopMoving();
    }
  };
  */
  

  //Accelerations produces when the user hold the keys
  if (this.player.isMovingLeft === true) {
    this.player.x += this.player.vx;
    this.player.vx -= 0.15;
  } else {
    this.player.x += this.player.vx;
    if (this.player.vx < 0) this.player.vx += 0.1;
  }

  if (this.player.isMovingRight === true) {
    this.player.x += this.player.vx;
    this.player.vx += 0.15;
  } else {
    this.player.x += this.player.vx;
    if (this.player.vx > 0) this.player.vx -= 0.1;
  }

  // Speed limits!
  if(this.player.vx > 8)
    this.player.vx = 8;
  else if(this.player.vx < -8)
    this.player.vx = -8;

  //console.log(player.vx);
  
  //Jump the player when it hits the base
  if ((this.player.y + this.player.height) > this.base.y && this.base.y < height) this.player.jump();

  //Gameover if it hits the bottom 
  if (this.base.y > height && (this.player.y + this.player.height) > height && this.player.isDead != "lol") this.player.isDead = true;

  //Make the player move through walls
  if (this.player.x > width) this.player.x = 0 - this.player.width;
  else if (this.player.x < 0 - this.player.width) this.player.x = width;

  //Movement of player affected by gravity
  if (this.player.y >= (height / 2) - (this.player.height / 2)) {
    this.player.y += this.player.vy;
    this.player.vy += this.gravity;
  }

  //When the player reaches half height, move the platforms to create the illusion of scrolling and recreate the platforms that are out of viewport...
  else {
    var self = this;
    this.platforms.forEach(function(p, i) {

      if (self.player.vy < 0) {
        p.y -= self.player.vy;
      }

      if (p.y > height) {
        self.platforms[i] = new Platform(self);
        self.platforms[i].y = p.y - height;
      }

    });

    this.base.y -= this.player.vy;
    this.player.vy += this.gravity;

    if (this.player.vy >= 0) {
      this.player.y += this.player.vy;
      this.player.vy += this.gravity;
    } else {
      this.score++;
      this.iterationsSinceLastScoreIncrease = 0;
    }

    
  }

  //Make the player jump when it collides with platforms
  this.collides();

  if (this.player.isDead === true) this.gameOver();
}

//Spring algorithms

Game.prototype.springCalc = function() {
  var s = this.Spring;
  var p = this.platforms[0];

  if (p.type == 1 || p.type == 2) {
    s.x = p.x + p.width / 2 - s.width / 2;
    s.y = p.y - p.height - 10;

    if (s.y > height / 1.1) s.state = 0;

    s.draw();
  } else {
    s.x = 0 - s.width;
    s.y = 0 - s.height;
  }
}

//Platform's horizontal movement (and falling) algo

Game.prototype.platformCalc = function() {
  var subs = this.platform_broken_substitute;

  this.platforms.forEach(function(p, i) {
    if (p.type == 2) {
      if (p.x < 0 || p.x + p.width > width) p.vx *= -1;

      p.x += p.vx;
    }

    if (p.flag == 1 && subs.appearance === false && this.jumpCount === 0) {
      subs.x = p.x;
      subs.y = p.y;
      subs.appearance = true;

      this.jumpCount++;
    }

    p.draw();
  });

  if (subs.appearance === true) {
    subs.draw();
    subs.y += 8;
  }

  if (subs.y > height) subs.appearance = false;
}

Game.prototype.collides = function() {
  //Platforms
  var self = this;
  this.platforms.forEach(function(p, i) {

    if (self.player.vy > 0 && p.state === 0 && (self.player.x + 15 < p.x + p.width) && (self.player.x + self.player.width - 15 > p.x) && (self.player.y + self.player.height > p.y) && (self.player.y + self.player.height < p.y + p.height)) {

      if (p.type == 3 && p.flag === 0) {
        p.flag = 1;
        self.jumpCount = 0;
        return;
      } else if (p.type == 4 && p.state === 0) {
        self.player.jump();
        p.state = 1;
      } else if (p.flag == 1) return;
      else {
        self.player.jump();
      }
    }
  });

  //Springs
  var s = this.Spring;
  if (this.player.vy > 0 && (s.state === 0) && (this.player.x + 15 < s.x + s.width) && (this.player.x + this.player.width - 15 > s.x) && (this.player.y + this.player.height > s.y) && (this.player.y + this.player.height < s.y + s.height)) {
    //disabled for now
    s.state = 1;
    //player.jumpHigh();
  }

}

Game.prototype.updateScore = function() {
  var scoreText = document.getElementById(this.score_p);
  scoreText.innerHTML = this.score;
}

Game.prototype.gameOver = function() {
  this.platforms.forEach(function(p, i) {
    p.y -= 12;
  });

  this.GA.calculateFitness(this);

  if(this.player.y > height/2 && this.flag === 0) {
    this.player.y -= 8;
    this.player.vy = 0;
  } 
  else if(this.player.y < height / 2) this.flag = 1;
  else if(this.player.y + this.player.height > height) {
    this.player.isDead = "lol";
  }
  
  if (!this.died_message_sent) {
    this.GA.gameDied(this);
    window.cancelAnimationFrame(this.requestAnimId);
    this.died_message_sent = true;
  }
}

Game.prototype.updateInputParams = function() {
  var inputParamsText =  document.getElementById(this.input_params_p);
  if (this.base.last_y < this.base.y) {
    this.input_params[0] = this.base.y - this.base.last_y;
  } else {
    this.input_params[0] = this.player.last_y - this.player.y;
  }
  for (var i = 0; i < 5; i++) {
    this.input_params[i*2 + 1] = Math.round(this.player.x - this.platforms[this.platforms.length-i-1].x);
    this.input_params[i*2 + 2] = Math.round(this.player.y - this.platforms[this.platforms.length-i-1].y);
  }
  inputParamsText.innerHTML = this.input_params;
}

//Function to update everything

Game.prototype.update = function() {
  this.paintCanvas();
  this.platformCalc();
 
  this.updateInputParams();
  this.GA.activateBrain(this);
  this.base.last_y = this.base.y;
  this.player.last_y = this.player.y;

  this.springCalc();

  this.playerCalc();
  this.player.draw();

  this.base.draw();

  this.updateScore();
  this.iterationsSinceLastScoreIncrease++;
  if (this.iterationsSinceLastScoreIncrease == 500) {
    //this equals about 6 jumps without gaining permanent height
    this.gameOver();
  }
}

Game.prototype.animloop = function() {
  if (!this.died_message_sent) {
    for (var i = 0; i < SPEED_UP_FACTOR; i++) {
      this.update();
    }
    this.requestAnimId = requestAnimFrame(this.animloop.bind(this));
  }
};

Game.prototype.reset = function() {
  this.hideGoMenu();
  this.showScore();
  this.player.isDead = false;
  
  this.flag = 0;
  this.position = 0;
  this.score = 0;

  this.base = new Base(this);
  this.player = new Player(this);
  this.Spring = new spring(this);
  this.platform_broken_substitute = new Platform_broken_substitute(this);

  this.platforms = [];
  for (var i = 0; i < this.platformCount; i++) {
    this.platforms.push(new Platform(this));
  }
}

//Hides the menu
Game.prototype.hideMenu = function() {
  var menu = document.getElementById("mainMenu");
  menu.style.zIndex = -1;
}

//Hides the game over menu
Game.prototype.hideGoMenu = function() {
  //var menu = document.getElementById("gameOverMenu");
  //menu.style.zIndex = -1;
  //menu.style.visibility = "hidden";
}

//Show ScoreBoard
Game.prototype.showScore = function() {
  var menu = document.getElementById(this.scoreBoard);
  menu.style.zIndex = 1;
}

Game.prototype.goLeft = function() {
  this.dir = "left";
  this.player.isMovingLeft = true;
}

Game.prototype.goRight = function() {
  this.dir = "right";
  this.player.isMovingRight = true;
}

Game.prototype.stopMoving = function() {
  this.player.isMovingLeft = false;
  this.player.isMovingRight = false;
}

window.update = function(game) {
  game.ctx.clearRect(0, 0, width, height);
  game.playerJump();
}   


function startOneGame(ctx, sb, sp, ip, ga, i) {
  var gameObj = new Game(ctx, sb, sp, ip, ga, i);
  gameObj.init();
}

function startAllGames() {
  RNGSEED = Math.random();
  GA.createPopulation();
  for (var i = 0; i < NUMBER_OF_GAMES; i++) {
    var canvas = document.getElementById(`canvas_${i}`),
    ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    startOneGame(ctx, `scoreBoard_${i}`, `score_${i}`, `input_params${i}`, GA, i);
  }
}

function restartAllGames() {
  updateStats()
  startAllGames();
}

function updateStats () {
  document.getElementById("generation").innerHTML = "Generation: " + GA.iteration;
  document.getElementById("best_generation").innerHTML = "The best unit was born in population " + GA.best_population;
  document.getElementById("best_fitness").innerHTML = "Best score: " + GA.best_score;
}

function main() {
  var game = document.getElementById('game');
  var html = "";
  for (var i = 0; i < NUMBER_OF_GAMES; i++) {
    html += `<div class="wrapper">
              <canvas id="canvas_${i}" style="margin-bottom:10px;margin-left:10px;border:1px solid #d3d3d3;"></canvas>
              <div id="scoreBoard_${i}">
                <p>Score: </p><p id="score_${i}">0</p>
                <p>Input parameters: </p><p id="input_params${i}"></p>
              </div>
            </div>`;
  }
  game.innerHTML = html;

  var stats = document.getElementById('stats');
  var statsHtml = `<p id="generation">Generation: 1</p>
                   <p id="best_generation">The best unit was born in generation 1</p>
                   <p id="best_fitness">Best fitness: 0</p>`;
  stats.innerHTML = statsHtml;
}

var NUMBER_OF_GAMES = 16;
var TOP_UNIT_NUMBER = 4;
var SPEED_UP_FACTOR = 3;
main();

var RNGSEED = Math.random();
var GA = new GeneticAlgorithm(NUMBER_OF_GAMES,TOP_UNIT_NUMBER);
GA.reset();
