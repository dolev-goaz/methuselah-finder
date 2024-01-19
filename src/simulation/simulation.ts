import { Cell, GenerationData, createCell } from "./cell";

export type Statistics = Record<string, string | number>;

type Edges = Partial<Record<'top' | 'left' | 'bottom' | 'right', Cell>>;

export class Simulation {
    cellNeighbors: Map<Cell, Cell[]>; // this is by reference so its fine

    cells: Cell[];
    gridWidth: number;
    gridHeight: number;

    generation: number;

    statistics: Statistics;
    positions: bigint[];

    edges: Edges;

    constructor(width: number, height: number, livingCells: Array<[number, number]>) {
        this.generation = 0;
        this.edges = {};

        this.gridWidth = width;
        this.gridHeight = height;
        this.cells = [];
        this.initializeCells(livingCells);
        this.positions = [];

        this.cellNeighbors = new Map();
        this.cells.forEach((cell) => {
            this.cellNeighbors.set(cell, this.getNeighbors(cell));
        });

        this.statistics = {};
        const currentPosition = this.calculatePosition();
        this.positions.push(currentPosition);
        this.calculateStatistics();
    }

    private initializeCells(livingCells: Array<[number, number]>) {
        this.cells.length = 0;
        for (let yIndex = 0; yIndex < this.gridWidth; ++yIndex) {
            for (let xIndex = 0; xIndex < this.gridHeight; ++xIndex) {
                this.cells.push(createCell(xIndex, yIndex, false));
            }
        }

        const center = [Math.floor(this.gridWidth / 2), Math.floor(this.gridHeight / 2)] as const;

        livingCells.forEach(([x, y]) => {
            const absX = center[0] + x;
            const absY = center[1] + y;
            const cell = this.cells[absY * this.gridWidth + absX];
            cell.currentGeneration.alive = true;
            this.updatePatternEdges(cell)
        });
    }

    moveNextGen() {
        this.edges = {};

        this.cells.forEach(this.calculateCellNextGen.bind(this));
        this.cells.forEach((cell) => {
            this.moveCellNextGen(cell);
            this.updatePatternEdges(cell);
        });
        this.generation += 1;

        const currentPosition = this.calculatePosition();
        this.positions.push(currentPosition);
        this.calculateStatistics();
    }

    private updatePatternEdges(cell: Cell) {
        if (!cell.currentGeneration.alive) return;
        if (!this.edges.top || (cell.indexY < this.edges.top.indexY)) {
            this.edges.top = cell;
        }
        if (!this.edges.bottom || (cell.indexY > this.edges.bottom.indexY)) {
            this.edges.bottom = cell;
        }
        if (!this.edges.left || (cell.indexX < this.edges.left.indexX)) {
            this.edges.left = cell;
        }
        if (!this.edges.right || (cell.indexX > this.edges.right.indexX)) {
            this.edges.right = cell;
        }
    }

    private calculatePosition() {
        const bitRepresentation = this.cells.map((cell) => cell.currentGeneration.alive ? '1' : '0').join("");
        return BigInt(`0b${bitRepresentation}`);
    }

    private calculateStatistics() {
        if (!Object.values(this.edges).every((element) => element)) {
            // no cells are alive- could also check if current position is 0
            return;
        }
        this.statistics.Width = this.edges.right!.indexX - this.edges.left!.indexX + 1;
        this.statistics.Height = this.edges.bottom!.indexY - this.edges.top!.indexY + 1;
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