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
  const chromosomes = await createGeneration();
  const simulations = await runGeneration(chromosomes);
  const bestSimulation = simulations
    .reduce(
      (best, current) => best[1] > current[1]
        ? best : current
    );

  simulationWithVisuals = new Simulation(config.CellsInRow, config.CellsInColumn, bestSimulation[0]);
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