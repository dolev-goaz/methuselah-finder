import { Simulation } from "./simulation/simulation";
import config from "./config.json";
import { setupControls } from "./controls";
import { writeSpreadSheet } from "./spreadsheet";
import { SimulationMap } from "./simulation/simulationMap";

const { simulation, map, drawSimulation } = createSimulation();

function step() {
  simulation.calcNextGen();
  simulation.moveNextGen();

  drawSimulation();
  const currentPosition = simulation.positions.at(-1)!;
  const existingPositionIndex = simulation.positions.indexOf(currentPosition);
  if (existingPositionIndex != -1 && existingPositionIndex != simulation.positions.length - 1) {
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
    config.InitialCells[0] as Array<[number, number]>
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