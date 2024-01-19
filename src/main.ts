import { Simulation } from "./simulation/simulation";
import config from "./config.json";
import { setupControls } from "./controls";
import { writeSpreadSheet } from "./spreadsheet";
import { SimulationMap } from "./simulation/simulationMap";

const { simulation, map, drawSimulation } = createSimulation();

function step() {
  simulation.moveNextGen();

  drawSimulation();

  const lastPositionIndex = simulation.positions.length - 1;
  const currentPosition = simulation.positions[lastPositionIndex];
  const existingPositionIndex = simulation.positions.indexOf(currentPosition);
  if (existingPositionIndex != -1 && existingPositionIndex != lastPositionIndex) {
    // if it exists and the first position isnt the current position
    console.log("loop found")
  }
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
  onChangeSize: updateMapSize
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