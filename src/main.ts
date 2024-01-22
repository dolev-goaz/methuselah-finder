import { Simulation } from "./simulation/simulation";
import config from "./config.json";
import { setupControls } from "./controls";
import { SimulationMap } from "./simulation/simulationMap";
import { WorkerOutput } from "./simulation/worker";

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

async function runSimulation() {

  simulationWorker.postMessage("start");
  simulationWorker.onmessage = async ({ data }: MessageEvent<WorkerOutput>) => {

    if (data.type == 'progress') {
      console.log(`Generation: ${data.innerData.generation}, Max Fitness: ${data.innerData.maxFitness}`);
      return;
    }
    // data.type = result
    const chromosome = data.innerData;

    simulationWithVisuals = new Simulation(config.CellsInRow, config.CellsInColumn, chromosome);

    simulationMap.draw(simulationWithVisuals);
    await sleep(msPerStep);
    while (!simulationWithVisuals.isStabilized()) {
      if (simulationWithVisuals.step == config.SimulationMaxSteps) alert("timed out!")
      step();
      await sleep(msPerStep);
    }
  }
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