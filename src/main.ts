import { Simulation } from "./simulation/simulation";
import config from "./config.json";
import { setupControls } from "./controls";
import { SimulationMap } from "./simulation/simulationMap";
import type { WorkerOutput, WorkerOutputObject } from "./simulation/worker";
import { Chromosome } from "./genetic/chromosome";

const simulationWorker = new Worker(new URL('./simulation/worker.ts', import.meta.url), {
  type: 'module'
})

let msPerStep = 0;
setupControls({
  step: step,
  onChangeSize: updateMapSize,
  onChangeSpeed: (ms) => msPerStep = ms,
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
      handleResult(data.innerData);
      break;
    }
    default: {
      alert("Unhandled message type");
      throw Error("Unhandled message type");
    }

  }
}

async function handleResult(chromosome: Chromosome) {
  document.querySelector<HTMLDivElement>("#simulation-container")!.hidden = false;
  document.querySelector<HTMLDivElement>("#simulation-progress")!.hidden = true;
  simulationWithVisuals = new Simulation(config.CellsInRow, config.CellsInColumn, chromosome);

  simulationMap.draw(simulationWithVisuals);
  await sleep(msPerStep);
  while (!simulationWithVisuals.isStabilized()) {
    if (simulationWithVisuals.step == config.SimulationMaxSteps) alert("timed out!")
    step();
    await sleep(msPerStep);
  }
}

function handleProgress(progress: WorkerOutputObject['progress']) {
  document.querySelector("#simulation-progress #current-generation")!
    .innerHTML = progress.generation.toString();

  document.querySelector("#simulation-progress #max-fitness")!
    .innerHTML = progress.maxFitness.toFixed(3);
}


function runSimulation() {
  document.querySelector<HTMLDivElement>("#simulation-progress")!.hidden = false;
  document.querySelector<HTMLSpanElement>("#simulation-progress #total-generations")!
    .innerHTML = config.GenerationCount.toString();

  simulationWorker.postMessage("start");
}

function step() {
  simulationWithVisuals.moveNextGen();
  simulationMap.draw(simulationWithVisuals);
}
function updateMapSize(cellSize: number) {
  simulationMap.setCellSizeMultiplier(cellSize);
  simulationMap.draw(simulationWithVisuals);
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}