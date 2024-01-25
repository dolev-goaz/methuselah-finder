import { Simulation } from "./simulation/simulation";
import config from "./config.json";
import { setupControls } from "./controls";
import { SimulationMap } from "./simulation/simulationMap";
import type { WorkerOutput, WorkerOutputObject } from "./simulation/generationWorker";
import { Chromosome } from "./genetic/chromosome";
import { sleep } from "./utils";

import SimulationWorker from './simulation/generationWorker?worker';
const simulationWorker = new SimulationWorker();

let msPerStep = 0;
setupControls({
  step: step,
  onChangeSize: updateMapSize,
  onChangeSpeed: (ms) => msPerStep = ms,
  onCalculate: runGeneticAlgorithm,
  onRun: runSimulation,
});


let simulationWithVisuals: Simulation;
const simulationMap = new SimulationMap();

simulationWorker.onmessage = ({ data }: MessageEvent<WorkerOutput>) => {

  switch (data.type) {
    case 'progress': {
      handleProgress(data.innerData);
      break;
    }
    case 'result': {
      simulationWorker.terminate();
      handleResult(data.innerData);
      break;
    }
    default: {
      simulationWorker.terminate();
      alert("Unhandled message type");
      throw Error("Unhandled message type");
    }

  }
}

function handleResult(chromosome: Chromosome) {
  document.querySelector<HTMLDivElement>("#simulation-container")!.hidden = false;
  document.querySelector<HTMLDivElement>("#simulation-progress")!.hidden = true;
  document.querySelector<HTMLButtonElement>("#start-simulation")!.disabled = false;
  simulationWithVisuals = new Simulation(chromosome);
  simulationMap.draw(simulationWithVisuals);
}

async function runSimulation() {
  while (!simulationWithVisuals.isStabilized()) {
    if (simulationWithVisuals.step == config.SimulationMaxSteps) alert("timed out!")
    step();
    await sleep(msPerStep);
  }

}

const fitnessHistory: number[] = [];

function handleProgress(progress: WorkerOutputObject['progress']) {
  const fitnessRounded = parseFloat(progress.maxFitness.toFixed(3));
  if (fitnessHistory.indexOf(fitnessRounded) == -1) {
    fitnessHistory.push(fitnessRounded);
    document.querySelector("#simulation-progress #fitness-history")!
      .innerHTML = JSON.stringify(fitnessHistory, null, 2) +
      ` (${fitnessHistory.length} total)`;
  }


  document.querySelector("#simulation-progress #current-generation")!
    .innerHTML = progress.generation.toString();

  document.querySelector("#simulation-progress #current-fitness")!
    .innerHTML = fitnessRounded.toString();

}


function runGeneticAlgorithm() {
  document.querySelector<HTMLDivElement>("#simulation-progress")!.hidden = false;
  document.querySelector<HTMLSpanElement>("#simulation-progress #total-generations")!
    .innerHTML = config.GenerationCount.toString();

  simulationWorker.postMessage("start");
}

function step() {
  simulationWithVisuals.moveNextGen();
  simulationMap.draw(simulationWithVisuals);
}
function updateMapSize(gridSizeStep: number) {
  const gridSize = config.GridSize.Min + gridSizeStep * config.GridSize.StepSize
  simulationMap.setGridSize(gridSize);
  simulationMap.draw(simulationWithVisuals);
}