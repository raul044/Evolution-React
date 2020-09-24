/* Raul Moldovan
   Genetic algorithm applied on th evolution of strings towards a target

   Insbired by 
   Daniel Shiffman's:
   https://natureofcode.com/book/chapter-9-the-evolution-of-code/
   https://github.com/nature-of-code/noc-examples-p5.js/tree/master/chp09_ga/NOC_9_01_GA_Shakespeare
*/
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function newChar() {
    let c = Math.floor(getRandomArbitrary(64, 122));
    if (c === 64) 
        c = 32;
    return String.fromCharCode(c);
}
  
class DNA {
    constructor(length) {
        this.genes = [];
        this.fitness = 0;
        for (let i = 0; i < length; i++) {
            this.genes[i] = newChar();
        }
    }

    getPhrase() {
        return this.genes.join("");
    }

    calcFitness(seq) {
        let fit = 0;
        for (let i = 0; i < this.genes.length; i++) {
            if (this.genes[i] === seq.charAt(i)) {
                fit++;
            }
        }
        this.fitness = fit / seq.length;
    }

    crossover(partner) {
        let child = new DNA(this.genes.length);
        let mid = Math.floor(getRandomArbitrary(0, this.genes.length));

        for (let i = 0; i < this.genes.length; i++) {
            if (i > mid) 
                child.genes[i] = this.genes[i];
            else 
                child.genes[i] = partner.genes[i];
        }
        return child;
    }

    mutate(mutationRate) {
        for (let i = 0; i < this.genes.length; i++) {
            if (getRandomArbitrary(0, 1) < mutationRate) {
                this.genes[i] = newChar();
            }
        }
    }
}

class Population {
    constructor(str, mut, pop) {
      this.generations = 0;
      this.finished = false;
      this.target = str;
      this.mutationRate = mut;
      this.perfectScore = 1;
      this.best = "";
  
      this.population = [];
      for (let i = 0; i < pop; i++) {
        this.population[i] = new DNA(this.target.length);
      }
      this.matingPool = [];
      this.calcFitness();
    }

    calcFitness() {
      for (let i = 0; i < this.population.length; i++) {
        this.population[i].calcFitness(this.target);
      }
    }
  
    naturalSelection() {
      this.matingPool = [];
      let maxFitness = 0;
      for (let i = 0; i < this.population.length; i++) {
        if (this.population[i].fitness > maxFitness) {
          maxFitness = this.population[i].fitness;
        }
      }

      for (let i = 0; i < this.population.length; i++) {
        let fitness = this.population[i].fitness / maxFitness;
        let n = Math.floor(fitness * 100);
        for (let j = 0; j < n; j++) {
          this.matingPool.push(this.population[i]);
        }
      }
    }

    generate() {
      for (let i = 0; i < this.population.length; i++) {
        let a = Math.floor(getRandomArbitrary(0, this.matingPool.length));
        let b = Math.floor(getRandomArbitrary(0, this.matingPool.length));
        let partnerA = this.matingPool[a];
        let partnerB = this.matingPool[b];
        let child = partnerA.crossover(partnerB);
        child.mutate(this.mutationRate);
        this.population[i] = child;
      }
      this.generations++;
    }
  
    getBest() {
      return this.best;
    }
  
    evaluate() {
      let bestFitness = 0.0;
      let idx = 0;
      for (let i = 0; i < this.population.length; i++) {
        if (this.population[i].fitness > bestFitness) {
          idx = i;
          bestFitness = this.population[i].fitness;
        }
      }
  
      this.best = this.population[idx].getPhrase();
      if (bestFitness === this.perfectScore) {
        this.finished = true;
      }
    }
  
    isFinished() {
      return this.finished;
    }
  
    getGenerations() {
      return this.generations;
    }
  
    getAverageFitness() {
      let total = 0;
      for (let i = 0; i < this.population.length; i++) {
        total += this.population[i].fitness;
      }
      return total / (this.population.length);
    }
  
    allPhrases() {
        return this.population.map(dna => dna.getPhrase());
    }
}

class StringPanel extends React.Component {
    render() {
        let rows = [];
        for (let i = 0; i < 49; i++) {
            rows.push(<li> {this.props.phrases[i]} </li>)
        }
        return (
            <ul id="list"> {rows} </ul>
        );
    }
}

class SettingPanel extends React.Component {
    /* Allows settings to the parameters:
            target string
            total population
            mutation rate*/
    constructor(props) {
        super(props);
        this.handleTargetChange = this.handleTargetChange.bind(this);
        this.handlePopulationChange = this.handlePopulationChange.bind(this);
        this.handleMutationChange = this.handleMutationChange.bind(this);
        
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleTargetChange(e) {
        this.props.onTargetChange(e.target.value);
    }

    handlePopulationChange(e) {
        this.props.onPopulationChange(e.target.value);
    }

    handleMutationChange(e) {
        this.props.onMutationChange(e.target.value);
    }

    handleSubmit(e) {
        e.preventDefault();
        this.props.onSubmit();
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <h2> Settings: </h2>
                <div>
                    <label>
                    Target string:
                    <input type="text" value={this.props.targetString} onChange={this.handleTargetChange} />
                </label>
                </div>
                <div>
                    <label>
                    Total population:
                    <input type="number" value={this.props.totalPop} onChange={this.handlePopulationChange} />
                </label>
                </div>
                <div>
                    <label>
                        Mutation rate (%):
                        <input type="number" value={this.props.mutationRate} onChange={this.handleMutationChange} />
                    </label>
                </div>
                <input type="submit" value="Submit" />
            </form>
        );
    }
}

class StatPanel extends React.Component {
    /* Shows the stats on
            best match
            number of generations
            average firness*/
    render() {
        return (
            <div>
                <h2> Best match: {this.props.bestMatch} </h2>
                <h2> Number of generations: {this.props.numberGen} </h2>
                <h2> Average fitness: {this.props.averageFitness.toPrecision(2)} </h2>
            </div>
        );
    }
}

class Evolution extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            targetString: 'Random sequence to evolve towards',
            totalPop: 500,
            mutationRate: 1,
            population: new Population('Random sequence to evolve towards', 0.01, 500)
        };
        this.handleTargetChange = this.handleTargetChange.bind(this);
        this.handlePopulationChange = this.handlePopulationChange.bind(this);
        this.handleMutationChange = this.handleMutationChange.bind(this);
        
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    
    handleTargetChange(targetString) {
        this.setState({
          targetString: targetString
        });
    }

    handlePopulationChange(totalPop) {
        this.setState({
          totalPop: totalPop
        });
    }

    handleMutationChange(mutationRate) {
        this.setState({
          mutationRate: mutationRate
        });
    }

    handleSubmit() {
        this.setState((state) => ({
           population: new Population(state.targetString, state.mutationRate/100, state.totalPop)
        }), this.update());
    }

    update = () => {
        // Create the new population, pass it in the state
        if (this.state.population.isFinished())
            return;

        let newPop = this.state.population;
        newPop.naturalSelection();
        newPop.generate();
        newPop.calcFitness();
        newPop.evaluate();

        this.setState({
            population: newPop
        });

        if (!this.state.population.isFinished())    
            window.requestAnimationFrame(this.update);
    };

    render() {
        return (
            <div>
                <div id="col-1">
                    <h1 id="hdr"> GENETIC EVOLUTION </h1>
                    <div id="comp-1"> <StatPanel 
                        bestMatch={this.state.population.getBest()}
                        numberGen={this.state.population.getGenerations()}
                        averageFitness={this.state.population.getAverageFitness()}
                    /> </div>
                    <div id="comp-2"> <SettingPanel 
                        targetString={this.state.targetString}
                        totalPop={this.state.totalPop}
                        mutationRate={this.state.mutationRate}
                        onTargetChange={this.handleTargetChange}
                        onPopulationChange={this.handlePopulationChange}
                        onMutationChange={this.handleMutationChange}
                        onSubmit={this.handleSubmit}
                    /> </div>
                </div>
                <div id="col-2">
                    <h2 id="hdr2"> Population sample: </h2>
                    <StringPanel phrases={this.state.population.allPhrases()} />
                </div>
            </div>
        );
    }
}

ReactDOM.render(
    <Evolution />,
    document.getElementById('root')
  );