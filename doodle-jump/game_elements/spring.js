//Spring Class
function Spring(game) {
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
