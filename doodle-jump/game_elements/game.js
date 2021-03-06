function Game(ctx, scoreBoard, score_p, input_params_p, genetic_algorithm, playerIndex, gameIndex, simulate_immediately) {
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
  this.replay = 0;
  this.lastFrames = [];
  this.simulate_immediately = simulate_immediately;

  this.ctx = ctx;
  this.scoreBoard = scoreBoard;
  this.score_p = score_p;
  this.input_params_p = input_params_p;
  this.GA = genetic_algorithm;
  this.playerIndex = playerIndex;
  this.gameIndex = gameIndex;
  this.base = new Base(this);
  this.player = new Player(this);
  this.rng = new RNG(SEEDS[gameIndex]);
  for (var i = 0; i < this.platformCount; i++) {
    this.platforms.push(new Platform(this));
  }
  this.platform_broken_substitute = new Platform_broken_substitute(this);
  this.Spring = new Spring(this);
  this.died_message_sent = false;
  this.input_params = [];
  this.inputPlatforms = [];

  this.iterationsSinceLastScoreIncrease = 0;
  this.diedByStayingOnPlatform = 0;
  this.diedByHittingWall = 0;
  this.xDifferenceToTargetPlatform = 0;
  this.loops = 0;
}

Game.prototype.init = function() {
  //Variables for the game
  this.dir = "left";
  this.calculateInputParams();
  this.firstRun = false;
  if (!this.simulate_immediately) {
    document.getElementById(`replay_${this.playerIndex*PARALLEL_GAMES+this.gameIndex}`).style.visibility = 'hidden';
  }
  
  this.animloop();

  this.hideMenu();

  this.showScore();
}

//Function for clearing canvas in each consecutive frame
Game.prototype.paintCanvas = function() {
  if (!this.simulate_immediately) {
    this.ctx.clearRect(0, 0, width, height);
  }
}

//Function to update everything
Game.prototype.update = function() {
  this.loops = this.loops + 1;
  this.paintCanvas();
  this.platformCalc();

  this.updateInputParams();
  this.GA.activateBrain(this);
  this.base.last_y = this.base.y;
  this.player.last_y = this.player.y;

  this.springCalc();

  this.playerCalc();
  if (!this.simulate_immediately) {
    this.player.draw();

    this.base.draw();
  }

  this.saveFrame();
  this.updateScore();
  this.iterationsSinceLastScoreIncrease++;
  if (this.iterationsSinceLastScoreIncrease == 200) {
    //this equals about 6 jumps without gaining permanent height
    this.diedByStayingOnPlatform = 1;
    this.gameOver();
  }
}

Game.prototype.saveFrame = function() {
  if (this.lastFrames.length == 200) {
    this.lastFrames.shift();
  }
  var elements = []
  for (var i = 0; i < this.platforms.length; i++) {
    elements.push(this.platforms[i].getFrame());
  }
  elements.push(this.player.getFrame());
  this.lastFrames.push(elements);
}


Game.prototype.startReplay = function() {
  this.replay = 1;
  this.animloop();
}

Game.prototype.updateReplay = function() {
  if (this.replay == this.lastFrames.length) {
    this.replay = 0;
  } else {
    this.paintCanvas();
    for (var i = 0; i < this.lastFrames[this.replay].length; i++) {    
      this.ctx.drawImage(this.image, this.lastFrames[this.replay][i][1], this.lastFrames[this.replay][i][2], this.lastFrames[this.replay][i][3], this.lastFrames[this.replay][i][4], this.lastFrames[this.replay][i][5], this.lastFrames[this.replay][i][6], this.lastFrames[this.replay][i][7], this.lastFrames[this.replay][i][8]);
    }
    this.replay += 1;
  }
}

Game.prototype.animloop = function() {
  if (!this.simulate_immediately && this.replay > 0) {
    this.updateReplay();
    this.requestAnimId = requestAnimFrame(this.animloop.bind(this));
  }

  if (!this.died_message_sent) {
    for (var i = 0; i < SPEED_UP_FACTOR; i++) {
      if (!this.died_message_sent) {
        this.update();
      }
    }
    if (this.simulate_immediately) {
      while(!this.died_message_sent) {
        this.update();
      }
    } else {
      this.requestAnimId = requestAnimFrame(this.animloop.bind(this));
    }
  }
};

Game.prototype.reset = function() {
  this.showScore();
  this.player.isDead = false;

  this.flag = 0;
  this.position = 0;
  this.score = 0;

  this.base = new Base(this);
  this.player = new Player(this);
  this.Spring = new Spring(this);
  this.platform_broken_substitute = new Platform_broken_substitute(this);

  this.platforms = [];
  for (var i = 0; i < this.platformCount; i++) {
    this.platforms.push(new Platform(this));
  }
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
        self.calculateInputParams();
        p.state = 1;
      } else if (p.flag == 1) {
        return;
      } else {
        self.player.jump();
        self.calculateInputParams();
      }
    }
  });

  //assume that we want to land on input platform 0
  if (this.inputPlatforms[0].y == this.player.y) {
    this.xDifferenceToTargetPlatform = Math.abs(this.player.x - this.inputPlatforms[0].x);
  }

  //Springs
  var s = this.Spring;
  if (this.player.vy > 0 && (s.state === 0) && (this.player.x + 15 < s.x + s.width) && (this.player.x + this.player.width - 15 > s.x) && (this.player.y + this.player.height > s.y) && (this.player.y + this.player.height < s.y + s.height)) {
    //disabled for now
    s.state = 1;
    self.player.jumpHigh();
  }

}

Game.prototype.updateScore = function() {
  var scoreText = document.getElementById(this.score_p);
  scoreText.innerHTML = this.score;
}

Game.prototype.gameOver = function() {
  if (!this.simulate_immediately) {
    document.getElementById(`replay_${this.playerIndex*PARALLEL_GAMES+this.gameIndex}`).style.visibility = 'visible';
  }
  
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
    //window.cancelAnimationFrame(this.requestAnimId);
    this.died_message_sent = true;
    this.GA.gameDied(this);
  }

}

//Hides the menu
Game.prototype.hideMenu = function() {
  var menu = document.getElementById("mainMenu");
  menu.style.zIndex = -1;
}
