
showStats = function () {
    var iterations = [];
    for (var i = 0; i <= GA.iteration; i += BATCH_SIZE) {
        iterations.push(i);
    }

    var gameScore = {
      x: iterations,
      y: GA.batchGameScores,
      type: 'scatter',
      name: 'Average game score'
    };
    var playerScore = {
      x: iterations, 
      y: GA.batchPlayerScores, 
      type: 'scatter',
      name: 'Average score top player'
    };
    var data = [playerScore, gameScore];
    Plotly.newPlot('statsCanvas', data);
}
