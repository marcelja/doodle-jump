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
  
  this.input_params[0] = this.player.vy;
  this.input_params[1] = this.player.vx;

  for (var i = 0; i < this.inputPlatforms.length; i++) {
    this.input_params[2+i*2] = this.player.x - this.inputPlatforms[i].x + this.player.width / 2;
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
      // this.inputPlatforms[1] = platform_helper[i+1];
      // this.inputPlatforms[2] = platform_helper[i+2];
      break;
    }
  }
}



function startOneGame(ctx, sb, sp, ip, ga, i) {
  var gameObj = new Game(ctx, sb, sp, ip, ga, i);
  gameObj.init();
}

function startAllGames() {
  RNGSEED = Math.random();
  for (var i = 0; i < NUMBER_OF_GAMES; i++) {
    var canvas = document.getElementById(`canvas_${i}`),
    ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    startOneGame(ctx, `scoreBoard_${i}`, `score_${i}`, `input_params${i}`, GA, i);
  }
}

function restartAllGames() {
  updateStats();
  startAllGames();
}

function updateStats () {
  document.getElementById("generation").innerHTML = "Generation: " + GA.iteration;
  document.getElementById("best_generation").innerHTML = "The best unit was born in population " + GA.best_population;
  document.getElementById("best_score").innerHTML = "Best score: " + GA.best_score;
  document.getElementById("best_fitness").innerHTML = "Best fitness: " + GA.best_fitness;
  // Population is already sorted. Hence we can use first element in population
  document.getElementById("best_score_gen").innerHTML += " " + GA.Population[0].score;
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

var NUMBER_OF_GAMES = 10;
var TOP_UNIT_NUMBER = 4;
var SPEED_UP_FACTOR = 1;

document.getElementById('speedUpValue').innerHTML = SPEED_UP_FACTOR;

main();

var RNGSEED = Math.random();
var GA = new GeneticAlgorithm(NUMBER_OF_GAMES,TOP_UNIT_NUMBER);
GA.reset();
GA.createPopulation();
showStats();
