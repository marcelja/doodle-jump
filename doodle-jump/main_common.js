function startOneGame(ctx, sb, sp, ip, ga, playerIndex, gameIndex, fast) {
  var gameObj = new Game(ctx, sb, sp, ip, ga, playerIndex, gameIndex);
  gameObj.init();
  allGames.push(gameObj);
}

Game.prototype.updateInputParams = function() {
  var inputParamsText =  document.getElementById(this.input_params_p);
  
  // keep updating input params after using spring
  if (this.player.vy < -8) this.calculateInputParams();

  this.input_params[0] = this.player.vy;
  this.input_params[1] = this.player.vx;

  var player_mid_x = this.player.x + (this.player.width / 2);

  for (var i = 0; i < this.inputPlatforms.length; i++) {
    var platform_mid_x = this.inputPlatforms[i].x + (this.inputPlatforms[i].width / 2);
    this.input_params[2+i*2] = player_mid_x - platform_mid_x;

    // remove if walls disabled
    if (Math.abs(player_mid_x - platform_mid_x) > (width + this.player.width) / 2) {
      if (player_mid_x - platform_mid_x < 0) {
        this.input_params[2+i*2] = width + this.player.width + player_mid_x - platform_mid_x;
      } else {
        this.input_params[2+i*2] = - width - this.player.width + player_mid_x - platform_mid_x;
      }
    }
    // end
    this.input_params[3+i*2] = this.player.y - this.inputPlatforms[i].y;
  }

  // inputParamsText.innerHTML = this.input_params;
}

Game.prototype.calculateInputParams = function() {
  var platform_helper = [];
  for (var i = 0; i < this.platforms.length; i++) {
    platform_helper.push(this.platforms[i]);
  }

  platform_helper.sort(function(platformA, platformB) {
    return platformB.y - platformA.y;
  });

  for (var i = 0; i < platform_helper.length; i++) {
    if (platform_helper[i].y < this.player.y) {
      this.inputPlatforms[0] = platform_helper[i];
      this.inputPlatforms[1] = platform_helper[i+1];
      // this.inputPlatforms[2] = platform_helper[i+2];
      break;
    }
  }
}


function stop() {
    if (SPEED_UP_FACTOR != 0) {
        old_speed = SPEED_UP_FACTOR;
        SPEED_UP_FACTOR = 0;
        stopButton = document.getElementById("stopButton");
        stopButton.text = "Start"
        stopButton.style.background = "url('http://i.imgur.com/2WEhF.png') 0 0 no-repeat";
    } else {
        stopButton = document.getElementById("stopButton");
        stopButton.text = "Stop"
        stopButton.style.background = "url('http://i.imgur.com/2WEhF.png') 0 -31px no-repeat";
        SPEED_UP_FACTOR = old_speed;
    }
}