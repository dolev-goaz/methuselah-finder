import { Simulation } from "./simulation/simulation";
import config from "./config.json";
import { setupControls } from "./controls";
import { SimulationMap } from "./simulation/simulationMap";
import { generateChromosome } from "./genetic/chromosome";

const chromosome = await generateChromosome();
const { simulation, map, drawSimulation } = createSimulation(chromosome);


let msPerStep = 0;
async function runSimulation() {
  await sleep(500);
  while (!simulation.isStabilized()) {
    if (simulation.generation == config.SimulationMaxSteps) alert("time out!")
    step();
    await sleep(msPerStep);
  }
}
runSimulation();

function step() {
  simulation.moveNextGen();
  drawSimulation();
}
function updateMapSize(cellSize: number) {
  map.setCellSizeMultiplier(cellSize);
  drawSimulation();
}
setupControls({
  step: step,
  onChangeSize: updateMapSize,
  onChangeSpeed: (ms) => msPerStep = ms,
});

function createSimulation(chromosome: bigint) {
  const simulation = new Simulation(
    config.CellsInRow,
    config.CellsInColumn,
    chromosome
  );
  const map = new SimulationMap();

  const draw = () => {
    map.draw(simulation);
  }
  draw();
  return {
    simulation,
    map,
    drawSimulation: draw
  }
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}