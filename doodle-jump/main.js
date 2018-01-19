// RequestAnimFrame: a browser API for getting smooth animations
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
  function(callback) {
    window.setTimeout(callback, 1000 / 60);
  };
})();

var width = 422;
var height = 552;
var allGames = [];

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
                   gameIndex,
                   false);
    }
  }
}

function updateStats () {
  document.getElementById("generation").innerHTML = "Generation: " + GA.iteration;
  document.getElementById("best_generation").innerHTML = "The best unit was born in population " + GA.best_population;
  document.getElementById("best_score").innerHTML = "Best score: " + GA.best_score.toFixed(2);
  document.getElementById("best_fitness").innerHTML = "Best fitness: " + GA.best_fitness.toFixed(2);
  // Population is already sorted. Hence we can use first element in population
  document.getElementById("best_score_gen").innerHTML += "  " + GA.Population[0].score.toFixed(2);
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

function replay(gameIndex) {
  allGames[gameIndex].startReplay();
}

function main() {
  var game = document.getElementById('game');
  var html = "";
  for (var playerIndex = 0; playerIndex < NUMBER_OF_PLAYERS; playerIndex++) {
    html += `<div class="wrapper" style="margin-bottom:30px">
              <div style="margin-left:20px" >Network: ${playerIndex}</div>`;
    for (var gameIndex = 0; gameIndex < PARALLEL_GAMES; gameIndex++) {
        html += `<div class="wrapper" id="game" style="padding-left:20px">
                  <canvas id="canvas_${playerIndex}${gameIndex}" style="margin-bottom:10px;margin-right:20px;margin-top:15px;border:1px solid #d3d3d3;"></canvas>
                  <div id="scoreBoard_${playerIndex}${gameIndex}" style="margin:20px;">
                    <p>Score: </p><p id="score_${playerIndex}${gameIndex}">0</p>
                    <button id="replay_${playerIndex*PARALLEL_GAMES+gameIndex}" onclick="replay(${playerIndex*PARALLEL_GAMES+gameIndex})" style="visibility:hidden">Replay</button>
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
                   <p id="best_score_gen">Best score per generation (avg over game):</p>`;
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
