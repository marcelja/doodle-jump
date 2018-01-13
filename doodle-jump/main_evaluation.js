// RequestAnimFrame: a browser API for getting smooth animations
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
  function(callback) {
    window.setTimeout(callback, 1000 / 60);
  };
})();

var width = 422,
  height = 552;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startAllGames() {
	timeout = false;
	console.log('Generation ' + GA[0].iteration);
	if (GA[0].iteration-1%10 == 0) {
		//await sleep(20000);
	}
	if (GA[0].iteration == 200) {
		return;
	}
    for (var j = 0; j < NUMBER_OF_RUNS; j++) {
    	RNGSEED = Math.random();
    	for (var i = 0; i < NUMBER_OF_GAMES; i++) {
    	  var canvas = document.getElementById(`canvas_${j*NUMBER_OF_GAMES + i}`),
    	  ctx = canvas.getContext('2d');
    	  canvas.width = width;
    	  canvas.height = height;
    	  startOneGame(ctx, `scoreBoard_${j*NUMBER_OF_GAMES + i}`, `score_${j*NUMBER_OF_GAMES + i}`, `input_params${j*NUMBER_OF_GAMES + i}`, GA[j], i, true);
    	}
  
    }
  
}

var average_score = Array(NUMBER_OF_RUNS);

function updateStats () {
  document.getElementById("generation").innerHTML = "Generation: " + GA[0].iteration;
  document.getElementById("best_generation").innerHTML = "The best unit was born in population " + GA[0].best_population;
  document.getElementById("best_score").innerHTML = "Best score: " + GA[0].best_score.toFixed(2);
  document.getElementById("best_fitness").innerHTML = "Best fitness: " + GA[0].best_fitness.toFixed(2);
  // Population is already sorted. Hence we can use first element in population
  document.getElementById("best_score_gen").innerHTML += " " + GA[0].Population[0].score;
}

var runs_finished = 0;
function restartAllGames() {
	runs_finished += 1;
	if (runs_finished == NUMBER_OF_RUNS) {
		runs_finished = 0;
		updateStats();
		startAllGames();
	}
}

function main() {
  var game = document.getElementById('game');
  var html = "";
  for (var i = 0; i < NUMBER_OF_GAMES * NUMBER_OF_RUNS; i++) {
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




var filepathIncludingFileName = 'networks_test_networks.json';

// Function to download data to a file
function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}


function saveText(text, filename){
  download(text, filename, 'json');
}

function generateInitalPopulations(parallel_experiments_number, game_number) {
	var networks = new Array(parallel_experiments_number);
	for (var i = parallel_experiments_number - 1; i >= 0; i--) {
		networks[i] = new Array(game_number);
		for (var j = game_number - 1; j >= 0; j--) {
			var network = new synaptic.Architect.Perceptron(6, 20, 3);
			networks[i][j] = network.toJSON();
		}
	}
	saveText(JSON.stringify(networks), filepathIncludingFileName);
}


var NUMBER_OF_RUNS = 10;
var NUMBER_OF_GAMES = 16;
var TOP_UNIT_NUMBER = 4;
var SPEED_UP_FACTOR = 1;

//the created file needs to be edited manually by adding 
/*
initial_population = '(here goes what was in it before)'
function getInitialPopulation() {
	return JSON.parse(initial_population);
}
*/
//generateInitalPopulations(NUMBER_OF_RUNS, NUMBER_OF_GAMES);

document.getElementById('speedUpValue').innerHTML = SPEED_UP_FACTOR;

main();

var GA = new Array(NUMBER_OF_RUNS);
for (var i = 0; i < GA.length; i++) {
	GA[i] = new GeneticAlgorithm(NUMBER_OF_GAMES,TOP_UNIT_NUMBER);
	GA[i].reset();
	GA[i].createPopulationFromJson(getInitialPopulation()[i]);
	showStats();
}

