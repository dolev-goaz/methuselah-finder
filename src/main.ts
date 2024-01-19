import { Simulation } from "./simulation/simulation";
import config from "./config.json";
import { setupControls } from "./controls";
import { SimulationMap } from "./simulation/simulationMap";
import { createGeneration, runGeneration } from "./genetic/generation";

let msPerStep = 0;
setupControls({
  step: step,
  onChangeSize: updateMapSize,
  onChangeSpeed: (ms) => msPerStep = ms,
});


let simulationWithVisuals: Simulation;
const simulationMap = new SimulationMap();

async function runSimulation() {
  const generation = await createGeneration();
  await runGeneration(generation);
  const bestSimulation = generation
    .reduce(
      (best, current) => best.calculateFitness({ withLimit: true }) > current.calculateFitness({ withLimit: true })
        ? best : current
    );

  simulationWithVisuals = new Simulation(config.CellsInRow, config.CellsInColumn, bestSimulation.chromosome);
  while (!simulationWithVisuals.isStabilized()) {
    if (simulationWithVisuals.generation == config.SimulationMaxSteps) alert("timed out!")
    step();
    await sleep(msPerStep);
  }

}
runSimulation();

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