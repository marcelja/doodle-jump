/***********************************************************************************
/* Genetic Algorithm implementation
/***********************************************************************************/

BATCH_SIZE = 10;
MAX_TOP_UNITS = 5;
MIN_TOP_UNITS = 3;
MAX_MUTATION_RATE = 0.24;
MIN_MUTATION_RATE = 0.18;

var GeneticAlgorithm = function(max_units, parallel_games, top_units){
	this.max_units = max_units; // max number of units in population
    this.parallel_games = parallel_games; // number of games the played at the same time
	this.top_units = top_units; // number of top units (winners) used for evolving population
	
	if (this.max_units < this.top_units) this.top_units = this.max_units;
	
	this.Population = []; // array of all units in current population
    this.scoreGames = 0;
    this.scorePlayers = 0;
    this.scoresPerGeneration = {};
    this.fitnessPerGeneration = {};
    this.batchGameScores = [0];
    this.batchPlayerScores = [0];
    this.lastBestFitness = 0;
    this.lastFitnessOfMaxTop = 0;

}

GeneticAlgorithm.prototype = {
    // resets genetic algorithm parameters
    reset : function(){
        this.iteration = 1; // current iteration number (it is equal to the current population number)
        this.mutateRate = 1; // initial mutation rate

        this.best_population = 0; // the population number of the best unit
        this.best_fitness = 0;  // the fitness of the best unit
        this.best_score = 0;    // the score of the best unit ever
        this.alive = 0;
        this.fitnessPerGeneration = {};
        this.scoresPerGeneration = {};
        this.scoreGames = 0;
        this.scorePlayers = 0;
        this.batchGameScores = [0];
        this.batchPlayerScores = [0];
	    this.lastBestFitness = 0;
	    this.lastFitnessOfMaxTop = 0;
	},
	
	// creates a new population
	createPopulation : function(){
		// clear any existing population
		this.Population.splice(0, this.Population.length);
		
		for (var i=0; i<this.max_units; i++){
			// create a new unit by generating a random Synaptic neural network
			// with 12 neurons in the input layer, 20 neurons in the hidden layer and 3 neuron in the output layer
			var newUnit = new synaptic.Architect.Perceptron(14, 20, 3);
			
			// set additional parameters for the new unit
			newUnit.index = i;
			newUnit.fitness = 0;
			newUnit.score = 0;
			newUnit.isWinner = false;
			
			// add the new unit to the population 
			this.Population.push(newUnit);
		}
		this.alive = this.max_units * this.parallel_games;
	},

	// creates a new population
	createPopulationFromJson : function(givenJsons){
		// clear any existing population
		this.Population.splice(0, this.Population.length);
		
		for (var i=0; i<this.max_units; i++){
			// create a new unit from json
			var newUnit = synaptic.Network.fromJSON(givenJsons[i]); 
			
			// set additional parameters for the new unit
			newUnit.index = i;
			newUnit.fitness = 0;
			newUnit.score = 0;
			newUnit.isWinner = false;
			
			// add the new unit to the population 
			this.Population.push(newUnit);
		}
		this.alive = this.max_units * this.parallel_games;
	},
	
	// activates the neural network of an unit from the population 
	// to calculate an output action according to the inputs
	activateBrain : function(game){
		// create an array of all inputs
		var inputs = game.input_params;
		
		// calculate outputs by activating synaptic neural network of this bird
		var outputs = this.Population[game.playerIndex].activate(inputs);
			
		// perform flap if output is greater than 0.5
		if (outputs[0] > outputs[1] && outputs[0] > outputs[2]) game.goLeft();
		if (outputs[1] >= outputs[0] && outputs[1] > outputs[2]) game.goRight();
		if (outputs[2] >= outputs[0] && outputs[2] >= outputs[1]) game.stopMoving();
	},

	gameDied : function(game){
		this.alive--;
		if (this.alive == 0) {
            this.averageScores()
            this.calculateStatsPerBatch();
            this.evolvePopulation();
			this.iteration++;
            this.alive = this.max_units * this.parallel_games;
            this.fitnessPerGeneration = {};
            this.scoresPerGeneration = {};
            restartAllGames();
		}
	},

    averageScores: function() {
        var bestScoreHelper = [];
        var bestFitnessHelper = [];
        // for (var i = this.Population.length - 1; i >= 0; i--) {
        for (var i = 0; i < this.Population.length; i++) {
            this.Population[i].score = this.scoresPerGeneration[i].reduce(function (init, b) { return init + b}, 0) / this.parallel_games;
            this.Population[i].fitness = this.fitnessPerGeneration[i].reduce(function (init, b) { return init + b}, 0) / this.parallel_games;
            bestScoreHelper.push(Math.max.apply(null, this.scoresPerGeneration[i]));
            bestFitnessHelper.push(Math.max.apply(null, this.fitnessPerGeneration[i]));
        }

        var bestScore = Math.max.apply(null, bestScoreHelper);
        var bestFitness = Math.max.apply(null, bestFitnessHelper);

        // if the top winner has the best fitness in the history, store its achievement!
        if (bestFitness > this.best_fitness){
            this.best_population = this.iteration;
            this.best_fitness = bestFitness;
            this.best_score = bestScore;
        }

    },

    calculateStatsPerBatch : function() {
        if (this.iteration % BATCH_SIZE == 0) {
            this.scorePlayers += Math.max.apply(null, this.Population.map(function(o){return o.score;}));
            this.scoreGames += this.Population.reduce(function (init, b) { return init + b.score}, 0);
            this.batchGameScores.push(this.scoreGames / (BATCH_SIZE * this.Population.length));
            this.batchPlayerScores.push(this.scorePlayers / BATCH_SIZE);
            showStats();
            this.scoreGames = 0;
            this.scorePlayers = 0;
        } else {
            this.scorePlayers += Math.max.apply(null, this.Population.map(function(o){return o.score;}));
            this.scoreGames += this.Population.reduce(function (init, b) { return init + b.score}, 0);
        }
    },
 
	calculateFitness : function(game) {
		// good players can get more than 0.4 score per loop, up to 0.48
        var fitness = Math.max(0, 0.8 * game.score * game.score - 0.2 * 0.1 * game.loops);
        if (this.fitnessPerGeneration[game.playerIndex]) {
            this.fitnessPerGeneration[game.playerIndex].push(fitness)
            this.scoresPerGeneration[game.playerIndex].push(game.score)
        } else {
            this.fitnessPerGeneration[game.playerIndex] = [fitness];
            this.scoresPerGeneration[game.playerIndex] = [game.score];
        }
	},

	// evolves the population by performing selection, crossover and mutations on the units
	evolvePopulation : function(){
		// select the top units of the current population to get an array of winners
		// (they will be copied to the next population)
		
		sortedPopulation = this.Population.sort(
			function(unitA, unitB){
				return unitB.fitness - unitA.fitness;
			}
		);
		
		var current_best_fitness = sortedPopulation[0].fitness;
		var current_average_fitness = this.Population.reduce(function (init, b) { return init + b.fitness}, 0) / this.max_units;

		// Magic goes here

		// console.log("Fitness old: " + this.lastBestFitness + ", now: " +  current_best_fitness);

        var Winners = this.selection(sortedPopulation);

		if (this.mutateRate == 1 && Winners[0].fitness < 0){ 
			// If the best unit from the initial population has a negative fitness 
			// then it means there is no any bird which reached the first barrier!
			// Playing as the God, we can destroy this bad population and try with another one.
			this.createPopulation();
			console.log('created new pop')
		} else {
			var mutatation_rate = this.lastBestFitness / (current_best_fitness + this.lastBestFitness);
			mutatation_rate = Math.min(1, mutatation_rate);
			mutatation_rate = mutatation_rate * (MAX_MUTATION_RATE - MIN_MUTATION_RATE) + MIN_MUTATION_RATE;
			//console.log("Mutation rate: " + mutatation_rate);
			this.lastBestFitness = current_best_fitness;
			this.last_average_fitness = current_average_fitness;
			this.mutateRate = mutatation_rate; // else set the mutatation rate to the real value
		}
		// fill the rest of the next population with new units using crossover and mutation
		for (var i=this.top_units; i<this.max_units; i++){
			var parentA, parentB, offspring;
			//this.Population[i].reset();
			var cutPoint = this.random(0, 32);
			if (i == this.top_units){
				// offspring is made by a crossover of two best winners
				
				parentA = Winners[0].toJSON();
				parentB = Winners[1].toJSON();
				offspring = this.crossOver(parentA, parentB);
				
				//console.log(this.Population[i]);
				this.copyNetwork(Winners[0], i);
				this.crossOverSave(this.Population[i], Winners[0], Winners[1], cutPoint);
				//console.log(string1);
				//console.log(this.Population[i]);
				/*
				var json1 = Winners[0].toJSON();
				var json2 = this.Population[i].toJSON();
				console.log(json1);
				console.log(Winners[1].toJSON());
				console.log(json2);
				debugger;
				*/

			} else if (i < this.max_units-2){
				// offspring is made by a crossover of two random winners
				
				parentA = this.getRandomUnit(Winners).toJSON();
				parentB = this.getRandomUnit(Winners).toJSON();
				offspring = this.crossOver(parentA, parentB);
				
				this.copyNetwork(this.getRandomUnit(Winners), i);
				this.crossOverSave(this.Population[i], this.getRandomUnit(Winners), this.getRandomUnit(Winners), cutPoint);
				
			} else {
				// offspring is a random winner
				offspring = this.getRandomUnit(Winners).toJSON();
				var randomWinner = this.getRandomUnit(Winners);
				this.copyNetwork(randomWinner, i);
				//randomWinner.reset();
				this.crossOverSave(this.Population[i], randomWinner, randomWinner, cutPoint);
				this.Population[i].optimize();
				
				
			}

			// mutate the offspring
			offspring = this.mutationOld(offspring);
			this.mutation(this.Population[i]);
			
			// create a new unit using the neural network from the offspring
			var newUnit = synaptic.Network.fromJSON(offspring);
			newUnit.index = this.Population[i].index;

			this.Population[i].fitness = 0;
			this.Population[i].score = 0;
			this.Population[i].isWinner = false;
			this.Population[i].optimize();
			
			// update population by changing the old unit with the new one
			
			//this.Population[i].clear();
			//delete this.Population[i];
			this.Population[i] = newUnit;
			
		}
		//console.log(this.Population[this.top_units].layers.input.list[0].getBias())
		//console.log(this.Population[this.top_units].layers.input.list[0].connections.projected)

		
		// sort the units of the new population	in ascending order by their index
		//this.Population.sort(function(unitA, unitB){
		//});
	},

	// selects the best units from the current population
	selection : function(sortedPopulation){
		// sort the units of the current population	in descending order by their fitness

		this.top_units = 0;

		for (var i = 0; i <= MAX_TOP_UNITS - 1; i++) {
			if (sortedPopulation[i].fitness > this.lastFitnessOfMaxTop) {
				this.top_units++;
			} else {
				break;
			}
		}


		this.top_units = Math.max(MIN_TOP_UNITS, this.top_units);

		this.lastFitnessOfMaxTop = sortedPopulation[MAX_TOP_UNITS - 1].fitness;

		//console.log(this.top_units);

		
		// mark the top units as the winners!
		for (var i=0; i<this.top_units; i++) sortedPopulation.isWinner = true;
		
		// return an array of the top units from the current population
		return sortedPopulation.slice(0, this.top_units);
	},
	
	// performs a single point crossover between two parents
	crossOver : function(parentA, parentB) {
		// get a cross over cutting point
		var cutPoint = this.random(0, parentA.neurons.length-1);
		
		// swap 'bias' information between both parents:
		// 1. left side to the crossover point is copied from one parent
		// 2. right side after the crossover point is copied from the second parent
		for (var i = cutPoint; i < parentA.neurons.length; i++){
			var biasFromParentA = parentA.neurons[i]['bias'];
			parentA.neurons[i]['bias'] = parentB.neurons[i]['bias'];
			parentB.neurons[i]['bias'] = biasFromParentA;
		}

		return this.random(0, 1) == 1 ? parentA : parentB;
	},

	copyNetwork : function(original, i) {
		//json = original.toJSON();
		//this.Population[i] = synaptic.Network.fromJSON(json);
	},

	crossOverSave : function(child, parentA, parentB, cutPoint) {
		

		//var cutPoint = this.random(0, parentA.neurons().length-1);
		//console.log(cutPoint);
		var leftParent = null;
		var rightParent = null;
		if (this.random(0,1) == 1) {
			leftParent = parentA;
			rightParent = parentB;
		} else {
			leftParent = parentB;
			rightParent = parentA;
		}
		// swap 'bias' information between both parents:
		// 1. left side to the crossover point is copied from one parent
		// 2. right side after the crossover point is copied from the second parent
		child_neurons = child.neurons();
		lPneurons = leftParent.neurons();
		rPneurons = rightParent.neurons();
		for (var i = 0; i < cutPoint; i++) {
			child_neurons[i].neuron.bias = lPneurons[i].neuron.bias;
		}
		for (var i = cutPoint; i < child_neurons.length; i++){
			child_neurons[i].neuron.bias = rPneurons[i].neuron.bias;
		}
		//copy all weight from one parent
		
		var wParent = null;
		if (this.random(0,1) == 1) {
			wParent = parentA;
		} else {
			wParent = parentB;
		}

		var child_connections = child.connections();
		var parent_connections = wParent.connections();
	    for (var i = 0; i < child_connections.length; i++) {
	    	child_connections[i].weight = parent_connections[i].weight;
	    }
	    child.optimize();
	},

	mutationOld : function (offspring){
		// mutate some 'bias' information of the offspring neurons
		for (var i = 0; i < offspring.neurons.length; i++){
			offspring.neurons[i]['bias'] = this.mutate(offspring.neurons[i]['bias']);
		}
		
		// mutate some 'weights' information of the offspring connections
		for (var i = 0; i < offspring.connections.length; i++){
			offspring.connections[i]['weight'] = this.mutate(offspring.connections[i]['weight']);
		}
		
		return offspring;
	},
	
	// performs random mutations on the offspring
	mutation : function (offspring){
		// mutate some 'bias' information of the offspring neurons
		ofneu = offspring.neurons();
		for (var i = 0; i < ofneu.length; i++){
			ofneu[i].neuron.bias = this.mutate(ofneu[i].neuron.bias);
		}
		
		// mutate some 'weights' information of the offspring connections

		for (var i = 0; i < ofneu.length; i++) {
	      for (var j in ofneu[i].neuron.connections.projected) {
	      	ofneu[i].neuron.connections.projected[j].weight = this.mutate(ofneu[i].neuron.connections.projected[j].weight);
	      }
	      
	    }
		
		return offspring;
	},
	
	// mutates a gene
	mutate : function (gene){
		if (Math.random() < 1) {//this.mutateRate
			var mutateFactor = 1 + ((Math.random() - 0.5) * 3 + (Math.random() - 0.5));
			gene *= mutateFactor;
		}
		
		return gene;
	},
	
	random : function(min, max){
		return Math.floor(Math.random()*(max-min+1) + min);
	},
	
	getRandomUnit : function(array){
		return array[this.random(0, array.length-1)];
	},
	
	normalize : function(value, max){
		// clamp the value between its min/max limits
		if (value < -max) value = -max;
		else if (value > max) value = max;
		
		// normalize the clamped value
		return (value/max);
	}
}