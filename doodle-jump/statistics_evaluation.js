var scores = Array();
var average_scores = Array();
var deviations = Array();
var times_called = 0;

initStats = function () {
  for (var i = 0; i < NUMBER_OF_RUNS; i++) {
    scores.push(Array());
    scores[i].push(0);
  }
}

showStats = function () {
  //just add the scores
  scores[EXECUTED_RUN_NUMBER].push(GAS.batchGameScores[GAS.batchGameScores.length - 1]);
}

showAllStats = function () {
  console.log('drawing curve');
  console.log(scores);
  var iterations = [];
  for (var i = 0; i <= NUMBER_OF_GENERATIONS; i += BATCH_SIZE) {
      iterations.push(i);
  }
  for (var i=0; i<scores[0].length; i++) {
    var average = 0;
    for (var j=0; j<NUMBER_OF_RUNS; j++) {
      average += scores[j][i];
    }
    average = average / NUMBER_OF_RUNS;
    average_scores.push(average);
    var deviation = 0;
    for (var j = 0; j < NUMBER_OF_RUNS; j += 1) {
      deviation += (scores[j][i] - average) * (scores[j][i] - average);
    }
    deviation = Math.sqrt(deviation / (NUMBER_OF_RUNS - 1));
    deviations.push(deviation);
  }
  var gameScore = {
    x: iterations,
    y: average_scores,
    type: 'scatter',
    name: 'Average game score'
  };
  var playerScore = {
    x: iterations, 
    y: deviations, 
    type: 'scatter',
    name: 'Standard deviation'
  };
  var data = [playerScore, gameScore];
  var layout = {xaxis: {
    title: 'Generations',
    titlefont: {
      family: 'Courier New, monospace',
      size: 18,
      color: '#7f7f7f'
    }
  },
  yaxis: {
    title: 'Score',
    titlefont: {
      family: 'Courier New, monospace',
      size: 18,
      color: '#7f7f7f'
    },
    range: [0, 550]
  },
  showlegend: false};
  Plotly.newPlot('statsCanvas', data, layout);
}