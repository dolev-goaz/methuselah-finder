import { Cell, GenerationData, createCell } from "./cell";

type Statistic = {
    set: number[];
    mean: number;
    stdDeviation: number;
}
export type Statistics = Record<string, Statistic>;

export class Simulation {
    cellNeighbors: Map<Cell, Cell[]>; // this is by reference so its fine

    cells: Cell[];
    gridWidth: number;
    gridHeight: number;

    generation: number;

    statistics: Statistics;

    constructor(width: number, height: number, livingCells: Array<[number, number]>) {
        this.generation = 0;

        this.gridWidth = width;
        this.gridHeight = height;
        this.cells = [];
        this.initializeCells(livingCells);

        this.cellNeighbors = new Map();
        this.cells.forEach((cell) => {
            this.cellNeighbors.set(cell, this.getNeighbors(cell));
        });

        this.statistics = this.initializeStatistics();
        this.calculateStatistics();
    }

    private initializeCells(livingCells: Array<[number, number]>) {
        this.cells.length = 0;
        for (let yIndex = 0; yIndex < this.gridWidth; ++yIndex) {
            for (let xIndex = 0; xIndex < this.gridHeight; ++xIndex) {
                this.cells.push(createCell(xIndex, yIndex, false));
            }
        }

        livingCells.forEach(([x, y]) => {
            this.cells[y * this.gridWidth + x].currentGeneration.alive = true;
        });
    }

    calcNextGen() {
        this.cells.forEach(this.calculateCellNextGen.bind(this));
    }
    moveNextGen() {
        this.cells.forEach(this.moveCellNextGen.bind(this));

        ++this.generation;
        this.calculateStatistics();
    }

    private initializeStatistics() {
        return {}
    }

    private calculateStatistics() {

        const statisticsContainer = document.querySelector<HTMLDivElement>('#statistics-container')!;
        statisticsContainer.hidden = false;
        const statisticsData = statisticsContainer.querySelector<HTMLParagraphElement>('p#statistics')!;
        statisticsData.innerText = `Statistics Placeholder`;
    }

    private moveCellNextGen(cell: Cell) {
        cell.currentGeneration = cell.nextGeneration as GenerationData;
        cell.nextGeneration = {};
    }

    private calculateCellNextGen(cell: Cell) {
        const neighbors = this.cellNeighbors.get(cell);
        if (!neighbors) throw new Error("Invalid cell");

        cell.nextGeneration.alive = cell.currentGeneration.alive; // initialization

        const livingNeighborsCount = neighbors.filter((neighbor) => neighbor.currentGeneration.alive).length;

        if (!cell.currentGeneration.alive) {
            // dead cells turn alive if there are 3 neighbors
            cell.nextGeneration.alive = (livingNeighborsCount == 3);
            return;
        }

        // living cells die if there are too many or too few neighbors
        cell.nextGeneration.alive = (livingNeighborsCount > 1 && livingNeighborsCount < 4)
    }

    /**
     * Finds all the neighbors of the given cell.
     */
    private getNeighbors(cell: Cell) {
        const directions: Array<[number, number]> = [
            [0, 1],
            [0, -1],
            [1, 0],
            [1, 1],
            [1, -1],
            [-1, 0],
            [-1, 1],
            [-1, -1]
        ];
        return directions
            .map((direction) => this.getNeighbor(cell, direction))
            .filter(Boolean) as Cell[];
    }

    /**
     * Gets a of a cell neighbor in the given direction vector.
     */
    private getNeighbor(cell: Cell, [dx, dy]: [number, number]) {
        const xIndex = (cell.indexX + dx);
        if (xIndex < 0 || xIndex >= this.gridWidth) return undefined;
        const yIndex = (cell.indexY + dy);
        if (yIndex < 0 || yIndex >= this.gridHeight) return undefined;

        return this.cells[yIndex * this.gridWidth + xIndex];
    }
}