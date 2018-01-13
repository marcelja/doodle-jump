// RequestAnimFrame: a browser API for getting smooth animations
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
  function(callback) {
    window.setTimeout(callback, 1000 / 60);
  };
})();

var width = 422,
  height = 552;

var allGames = [];

function startAllGames() {
  RNGSEED = Math.random();
  for (var i = 0; i < NUMBER_OF_GAMES; i++) {
    var canvas = document.getElementById(`canvas_${i}`),
    ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    startOneGame(ctx, `scoreBoard_${i}`, `score_${i}`, `input_params${i}`, GA, i, false);
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

function restartAllGames() {
  if (document.getElementById("wait").checked) {
    setTimeout(restartAllGames, 1000);
  } else {
    updateStats();
    allGames = [];
    startAllGames();
  }
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

var NUMBER_OF_GAMES = 16;
var TOP_UNIT_NUMBER = 4;
var SPEED_UP_FACTOR = 1;

document.getElementById('speedUpValue').innerHTML = SPEED_UP_FACTOR;

main();

var RNGSEED = Math.random();
var GA = new GeneticAlgorithm(NUMBER_OF_GAMES,TOP_UNIT_NUMBER);
GA.reset();
GA.createPopulation();
showStats();
