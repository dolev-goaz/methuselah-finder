import { Simulation } from "./simulation/simulation";
import config from "./config.json";
import { setupControls } from "./controls";
import { writeSpreadSheet } from "./spreadsheet";
import { SimulationMap } from "./simulation/simulationMap";

const { simulation, map, drawSimulation } = createSimulation();


let msPerStep = 0;

async function runSimulation() {
  await sleep(500);
  while (!simulation.isStabilized() && simulation.generation < config.SimulationMaxSteps) {
    step();
    await sleep(msPerStep);
  }
}
runSimulation();

function step() {
  simulation.moveNextGen();
  drawSimulation();
}
function exportSimulationData() {
  writeSpreadSheet(simulation.statistics, 'export_simulation');
}
function updateMapSize(cellSize: number) {
  map.setCellSizeMultiplier(cellSize);
  drawSimulation();
}
setupControls({
  spreadSheetExport: exportSimulationData,
  step: step,
  onChangeSize: updateMapSize,
  onChangeSpeed: (ms) => msPerStep = ms,
});

function createSimulation() {
  const simulation = new Simulation(
    config.CellsInRow,
    config.CellsInColumn,
    config.TestChromosomes[0] as Array<[number, number]>
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