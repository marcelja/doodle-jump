function startOneGame(ctx, sb, sp, ip, ga, playerIndex, gameIndex, fast) {
  var gameObj = new Game(ctx, sb, sp, ip, ga, playerIndex, gameIndex);
  gameObj.init();
  allGames.push(gameObj);
}

Game.prototype.platformParams = function(inputPlatformIndex) {
  var platform = this.inputPlatforms[inputPlatformIndex];
  var params = [this.player.vy, this.player.vx];

  var player_mid_x = this.player.x + (this.player.width / 2);
  var platform_mid_x = platform.x + (platform.width / 2);

  // relative x distance
  params[2] = player_mid_x - platform_mid_x;

  if (Math.abs(player_mid_x - platform_mid_x) > (width + this.player.width) / 2) {
    if (player_mid_x - platform_mid_x < 0) {
      params[2] = width + this.player.width + player_mid_x - platform_mid_x;
    } else {
      params[2] = - width - this.player.width + player_mid_x - platform_mid_x;
    }
  }
  // relative y distance
  params[3] = this.player.y - platform.y;
  // breakable
  params[4] = (platform.type == 3) ? 0 : 1;
  // moving direction
  params[5] = (platform.type == 2) ? platform.vx : 0;
  // spring
  params[6] = platform.spring;
  params[7] = inputPlatformIndex + 1;

  return params;
}

Game.prototype.updateInputParams = function() {
  // var numberPlatformParams = 6;
  var numberInputPlatforms = 3;
  this.input_params = [];
  
  // keep updating input params after using spring
  if (this.player.vy < -8) this.calculateInputParams();

  for (var i = 0; i < numberInputPlatforms; i++) {
    this.input_params.push(this.platformParams(i));
  }
}

Game.prototype.calculateInputParams = function() {
  var platform_helper = [];
  for (var i = 0; i < this.platforms.length; i++) {
    if (this.platforms[i].state == 0 && this.platforms[i].flag == 0) {
      platform_helper.push(this.platforms[i]);
    }
  }

  platform_helper.sort(function(platformA, platformB) {
    return platformB.y - platformA.y;
  });

  for (var i = 0; i < platform_helper.length; i++) {
    if (platform_helper[i].y < this.player.y) {
      // TODO for loop
      this.inputPlatforms[0] = platform_helper[i];
      this.inputPlatforms[1] = platform_helper[i+1];
      this.inputPlatforms[2] = platform_helper[i+2];
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