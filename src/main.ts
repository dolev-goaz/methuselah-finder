import { Simulation } from "./simulation/simulation";
import config from "./config.json";
import { setupControls } from "./controls";
import { SimulationMap } from "./simulation/simulationMap";
import { createGeneration, crossoverGeneration, runGeneration } from "./genetic/generation";

let msPerStep = 0;
setupControls({
  step: step,
  onChangeSize: updateMapSize,
  onChangeSpeed: (ms) => msPerStep = ms,
});


let simulationWithVisuals: Simulation;
const simulationMap = new SimulationMap();

async function runSimulation() {
  let generation = await createGeneration();
  for (let genIndex = 0; genIndex < config.GenerationCount - 1; ++genIndex) {
    const simulations = await runGeneration(generation);
    const max = Math.max(...simulations.map((simulation) => simulation[1]));
    console.log("Generation: " + genIndex, "Max fitness: " + max)
    generation = await crossoverGeneration(simulations);
  }

  const lastGeneration = await runGeneration(generation);
  
  const bestSimulation = lastGeneration
    .reduce(
      (best, current) => best[1] > current[1]
        ? best : current
    );

  simulationWithVisuals = new Simulation(config.CellsInRow, config.CellsInColumn, bestSimulation[0]);

  simulationMap.draw(simulationWithVisuals);
  await sleep(msPerStep);
  while (!simulationWithVisuals.isStabilized()) {
    if (simulationWithVisuals.step == config.SimulationMaxSteps) alert("timed out!")
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