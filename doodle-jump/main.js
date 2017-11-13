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

  this.x = Math.random() * (width - this.width);
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

function Game(ctx, scoreBoard, score_p, input_params_p) {
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
  this.base = new Base(this);
  this.player = new Player(this);
  for (var i = 0; i < this.platformCount; i++) {
    this.platforms.push(new Platform(this));
  }
  this.platform_broken_substitute = new Platform_broken_substitute(this);
  this.Spring = new spring(this);

  this.input_params = [[0,0], [0,0], [0,0]];
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
  var self = this;
  document.onkeydown = function(e) {
    var key = e.keyCode;
    
    if (key == 37) {
      self.dir = "left";
      self.player.isMovingLeft = true;
    } else if (key == 39) {
      self.dir = "right";
      self.player.isMovingRight = true;
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
      self.dir = "left";
      self.player.isMovingLeft = false;
    } else if (key == 39) {
      self.dir = "right";
      self.player.isMovingRight = false;
    }
  };
  

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
    }

    this.score++;
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

  if(this.player.y > height/2 && this.flag === 0) {
    this.player.y -= 8;
    this.player.vy = 0;
  } 
  else if(this.player.y < height / 2) this.flag = 1;
  else if(this.player.y + this.player.height > height) {
    this.player.isDead = "lol";
  }
}

Game.prototype.updateInputParams = function() {
  var inputParamsText =  document.getElementById(this.input_params_p);
  html = "[ <br>"
  for (var i = 1; i <= 3; i++) {
    this.input_params[i - 1][0] = Math.round(this.player.x - this.platforms[this.platforms.length-i].x);
    this.input_params[i - 1][1] = Math.round(this.player.y - this.platforms[this.platforms.length-i].y);
    html += "(" + this.input_params[i - 1][0] + "," + this.input_params[i - 1][1] + ") <br>"
  }
  html += "]"
  this.input_params[3] = this.player.last_y - this.player.y;
  html += "<br>Speed: " + this.input_params[3];
  inputParamsText.innerHTML = html;
}

//Function to update everything

Game.prototype.update = function() {
  this.paintCanvas();
  this.platformCalc();
 
  this.updateInputParams()
  this.player.last_y = this.player.y;

  this.springCalc();

  this.playerCalc();
  this.player.draw();

  this.base.draw();

  this.updateScore();
}

Game.prototype.animloop = function() {
  this.update();
  requestAnimFrame(this.animloop.bind(this));
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

Game.prototype.playerJump = function() {
  this.player.y += this.player.vy;
  this.player.vy += this.gravity;

  if (this.player.vy > 0 && 
    (this.player.x + 15 < 260) && 
    (this.player.x + this.player.width - 15 > 155) && 
    (this.player.y + this.player.height > 475) && 
    (this.player.y + this.player.height < 500))
    this.player.jump();

  if (this.dir == "left") {
    this.player.dir = "left";
    if (this.player.vy < -7 && this.player.vy > -15) this.player.dir = "left_land";
  } else if (this.dir == "right") {
    this.player.dir = "right";
    if (this.player.vy < -7 && this.player.vy > -15) this.player.dir = "right_land";
  }
  var self = this;
  //Adding keyboard controls
  document.onkeydown = function(e) {
    var key = e.keyCode;

    if (key == 37) {
      self.dir = "left";
      self.player.isMovingLeft = true;
    } else if (key == 39) {
      self.dir = "right";
      self.player.isMovingRight = true;
    }
  
    if(key == 32) {
      if(self.firstRun === true) {
        self.init();
        self.firstRun = false;
      }
      else 
        self.reset();
    }
  };

  document.onkeyup = function(e) {
    var key = e.keyCode;

    if (key == 37) {
      this.dir = "left";
      this.player.isMovingLeft = false;
    } else if (key == 39) {
      this.dir = "right";
      this.player.isMovingRight = false;
    }
  };

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

  //Jump the player when it hits the base
  if ((this.player.y + this.player.height) > this.base.y && this.base.y < height) this.player.jump();

  //Make the player move through walls
  if (this.player.x > width) this.player.x = 0 - this.player.width;
  else if (this.player.x < 0 - this.player.width) this.player.x = width;

  this.player.draw();
}

window.update = function(game) {
  game.ctx.clearRect(0, 0, width, height);
  game.playerJump();
}   


function startOneGame(ctx, sb, sp, ip) {
  var gameObj = new Game(ctx, sb, sp, ip);
  gameObj.init();
}

function startAllGames() {
  var canvas2 = document.getElementById('canvas_2'),
  ctx2 = canvas2.getContext('2d');
  canvas2.width = width;
  canvas2.height = height;
  startOneGame(ctx2, "scoreBoard_2", "score_2", "input_params2");

  var canvas = document.getElementById('canvas_1'),
  ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  startOneGame(ctx, "scoreBoard_1", "score_1", "input_params1");
}