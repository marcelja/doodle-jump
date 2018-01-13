var average_scores = Array();
var deviations = Array();
var times_called = 0;
showStats = function () {
  times_called += 1;
  if (times_called < NUMBER_OF_RUNS) {
    return;
  }
  times_called = 0;
  console.log('drawing curve');
    var iterations = [];
    for (var i = 0; i <= GA[0].iteration; i += BATCH_SIZE) {
        iterations.push(i);
    }
    var average = 0;
    for (var i = 0; i < NUMBER_OF_RUNS; i += 1) {
      average += GA[i].batchGameScores[GA[i].batchGameScores.length - 1];
    }
    console.log(NUMBER_OF_RUNS);
    average = average / NUMBER_OF_RUNS;
    average_scores.push(average);
    console.log(average);
    var deviation = 0;
    for (var i = 0; i < NUMBER_OF_RUNS; i += 1) {
      deviation += (GA[i].batchGameScores[GA[i].batchGameScores.length - 1] - average) * (GA[i].batchGameScores[GA[i].batchGameScores.length - 1] - average);
    }
    deviation = Math.sqrt(deviation / (NUMBER_OF_RUNS - 1));
    deviations.push(deviation);
    console.log(deviation);
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
    Plotly.newPlot('statsCanvas', data);
}
