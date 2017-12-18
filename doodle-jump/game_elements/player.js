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

  
  //Jump the player when it hits the base
  if ((this.player.y + this.player.height) > this.base.y && this.base.y < height) this.player.jump();

  //Gameover if it hits the bottom 
  if (this.base.y > height && (this.player.y + this.player.height) > height && this.player.isDead != "lol") {
    this.player.isDead = true;

  } 

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
