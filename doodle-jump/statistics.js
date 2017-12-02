
showStats = function () {
    var iterations = [];
    for (var i = 0; i <= GA.iteration; i += BATCH_SIZE) {
        iterations.push(i);
    }

    var trace1 = {
      x: iterations,
      y: GA.batchGameScores,
      type: 'scatter',
      name: 'Average game score'
    };
    var trace2 = {
      x: iterations, 
      y: GA.batchPlayerScores, 
      type: 'scatter',
      name: 'Average score top player'
    };
    var data = [trace1, trace2];
    Plotly.newPlot('statsCanvas', data);
}
