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

  this.spring = 0;

  this.getFrame = function() {
    return [this.appearance, this.cx, this.cy, this.cwidth, this.cheight, this.x, this.y, this.width, this.height];
  }

  //Function to draw it
  this.draw = function() {
    try {
      if (game.simulate_immediately) {
        return;
      }
      if (this.type == 1) this.cy = 0;
      else if (this.type == 2) this.cy = 61;
      else if (this.type == 3 && this.flag === 0) this.cy = 31;
      else if (this.type == 3 && this.flag == 1) this.cy = 1000;
      else if (this.type == 4 && this.state === 0) this.cy = 90;
      else if (this.type == 4 && this.state == 1) this.cy = 1000;

      // for (var i=0; i<game.inputPlatforms.length; i++) {
      //   if (game.platforms[game.inputPlatforms[i]].y == this.y) {
      //     this.cy = 61;
      //   }
      // }
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

  if (game.score >= 10000) this.types = [2, 2, 2, 4, 3];
  else if (game.score >= 5000 && game.score < 10000) this.types = [1, 2, 3, 4, 4];
  else if (game.score >= 2000 && game.score < 5000) this.types = [1, 1, 1, 2, 2, 3, 4, 4, 4, 4];
  else if (game.score >= 1000 && game.score < 2000) this.types = [1, 1, 1, 1, 3, 4, 4, 4];
  else if (game.score >= 500 && game.score < 1000) this.types = [1, 1, 1, 4];
  else if (game.score >= 100 && game.score < 500) this.types = [1, 1, 1, 1, 4];
  else this.types = [1];
  this.type = this.types[Math.floor(game.rng.random() * this.types.length)];

  //We can't have two consecutive breakable platforms otherwise it will be impossible to reach another platform sometimes!
  if (this.type == 3 && game.broken < 1) {
    game.broken++;
  } else if (this.type == 3 && game.broken >= 1) {
    this.type = 1;
    game.broken = 0;
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
  this.spring = 0;

  this.getFrame = function() {
    return [this.appearance, this.cx, this.cy, this.cwidth, this.cheight, this.x, this.y, this.width, this.height];
  }

  this.draw = function() {
    try {
      if (this.appearance === true && !game.simulate_immediately) game.ctx.drawImage(game.image, this.cx, this.cy, this.cwidth, this.cheight, this.x, this.y, this.width, this.height);
      else return;
    } catch (e) {}
  };
};

// Calculations
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
    if (!this.simulate_immediately) {
      p.draw();
    }
    
  });

  if (subs.appearance === true) {
    if (!this.simulate_immediately) {
      subs.draw();
    }
    subs.y += 8;
  }

  if (subs.y > height) subs.appearance = false;
}