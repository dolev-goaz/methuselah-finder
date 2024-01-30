import { Simulation } from "./simulation/simulation";
import config from "./config.json";
import { setupControls } from "./controls";
import { SimulationMap } from "./simulation/simulationMap";
import type { WorkerOutput, WorkerOutputObject } from "./simulation/generationWorker";
import { Chromosome } from "./genetic/chromosome";
import { sleep } from "./utils";

import SimulationWorker from './simulation/generationWorker?worker';
import { writeSpreadSheet } from "./spreadsheet";
const simulationWorker = new SimulationWorker();

let msPerStep = 0;
setupControls({
  step: step,
  onChangeSize: updateMapSize,
  onChangeSpeed: (ms) => msPerStep = ms,
  onCalculate: runGeneticAlgorithm,
  onRun: runSimulation,
  spreadSheetExport: () => writeSpreadSheet(fitnessHistory)
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

const fitnessHistory: Array<WorkerOutputObject['progress']> = [];

function handleProgress(progress: WorkerOutputObject['progress']) {
  const fitnessRounded = parseFloat(progress.maxFitness.toFixed(3));
  if (fitnessHistory.findIndex((item) => item.maxFitness == fitnessRounded) == -1) {
    fitnessHistory.push({ chromosome: progress.chromosome, generation: progress.generation, maxFitness: fitnessRounded });
    const fitnesses = fitnessHistory.map((fitnessItem) => fitnessItem.maxFitness)
    const str = JSON.stringify(fitnesses, null, '\t');
    document.querySelector("#simulation-progress #fitness-history")!
      .innerHTML = str + ` (${fitnessHistory.length} total)`;
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