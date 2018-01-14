// RequestAnimFrame: a browser API for getting smooth animations
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
  function(callback) {
    window.setTimeout(callback, 1000 / 60);
  };
})();

var width = 422,
  height = 552;


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

function startOneGame(ctx, sb, sp, ip, ga, playerIndex, gameIndex) {
  var gameObj = new Game(ctx, sb, sp, ip, ga, playerIndex, gameIndex);
  gameObj.init();
}

function startAllGames() {
  SEEDS = Array.apply(null, Array(PARALLEL_GAMES)).map(function(){return Math.random()})
  RNGSEED = Math.random();
  for (var playerIndex = 0; playerIndex < NUMBER_OF_PLAYERS; playerIndex++) {
    for (var gameIndex = 0; gameIndex < PARALLEL_GAMES; gameIndex++) {
      var canvas = document.getElementById(`canvas_${playerIndex}${gameIndex}`),
      ctx = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = height;
      startOneGame(ctx,
                   `scoreBoard_${playerIndex}${gameIndex}`,
                   `score_${playerIndex}${gameIndex}`,
                   `input_params${playerIndex}${gameIndex}`,
                   GA,
                   playerIndex,
                   gameIndex);
    }
  }
}

function restartAllGames() {
  if (document.getElementById("wait").checked) {
    setTimeout(restartAllGames, 1000);
  } else {
    updateStats();
    startAllGames();
  }
}

function updateStats () {
  document.getElementById("generation").innerHTML = "Generation: " + GA.iteration;
  document.getElementById("best_generation").innerHTML = "The best unit was born in population " + GA.best_population;
  document.getElementById("best_score").innerHTML = "Best score: " + GA.best_score.toFixed(2);
  document.getElementById("best_fitness").innerHTML = "Best fitness: " + GA.best_fitness.toFixed(2);
  // Population is already sorted. Hence we can use first element in population
  document.getElementById("best_score_gen").innerHTML += " " + GA.Population[0].score;
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

function main() {
  var game = document.getElementById('game');
  var html = "";
  for (var playerIndex = 0; playerIndex < NUMBER_OF_PLAYERS; playerIndex++) {
    html += `<div class="container">`;
    for (var gameIndex = 0; gameIndex < PARALLEL_GAMES; gameIndex++) {
        html += `<div class="wrapper">
                  <canvas id="canvas_${playerIndex}${gameIndex}" style="margin-bottom:10px;margin-left:10px;border:1px solid #d3d3d3;"></canvas>
                  <div id="scoreBoard_${playerIndex}${gameIndex}">
                    <p>Score: </p><p id="score_${playerIndex}${gameIndex}">0</p>
                    <p>Input parameters: </p><p id="input_params${playerIndex}${gameIndex}"></p>
                  </div>
                </div>`
    }
    html += `</div>`;
  }
  game.innerHTML = html;

  var stats = document.getElementById('stats');
  var statsHtml = `<p id="generation">Generation: 1</p>
                   <p id="best_generation">The best unit was born in generation 1</p>
                   <p id="best_score">Best score:</p>
                   <p id="best_fitness">Best fitness:</p>
                   <p id="best_score_gen">Best score per generation:</p>`;
  stats.innerHTML = statsHtml;
}

slider = document.getElementById('speedUp');

slider.oninput = function() {
    SPEED_UP_FACTOR = Math.pow(2, document.getElementById('speedUp').value);
    document.getElementById('speedUpValue').innerHTML = SPEED_UP_FACTOR;
}

var NUMBER_OF_PLAYERS = 16;
var TOP_UNIT_NUMBER = 4;
var SPEED_UP_FACTOR = 1;
var PARALLEL_GAMES = 3;

document.getElementById('speedUpValue').innerHTML = SPEED_UP_FACTOR;

main();


var SEEDS = Array.apply(null, Array(PARALLEL_GAMES)).map(function(){return Math.random()})
var RNGSEED = Math.random();
var GA = new GeneticAlgorithm(NUMBER_OF_PLAYERS, PARALLEL_GAMES, TOP_UNIT_NUMBER);
GA.reset();
GA.createPopulation();
showStats();
