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
    map.draw(simulation.cells, simulation.generation);
  }
  draw();
  return {
    simulation,
    map,
    drawSimulation: draw
  }
}