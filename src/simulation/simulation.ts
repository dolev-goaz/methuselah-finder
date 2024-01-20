import { Chromosome, isInitialCellAlive } from "@/genetic/chromosome";
import { Cell, StepData, createCell } from "./cell";
import config from "@/config.json";

export type Statistics = Record<string, string | number>;

type Edges = Partial<Record<'top' | 'left' | 'bottom' | 'right', Cell>>;
type Size = { Width: number; Height: number; }

export class Simulation {

    chromosome: Chromosome;

    cellNeighbors: Map<Cell, Cell[]> = new Map();

    cells: Cell[];
    gridWidth: number;
    gridHeight: number;

    step: number;

    statistics: Statistics;
    states: Chromosome[] = [];

    edges: Edges;
    initialSize: Size;

    constructor(width: number, height: number, chromosome: Chromosome) {
        this.chromosome = chromosome;
        this.step = 0;
        this.edges = {};

        this.gridWidth = width;
        this.gridHeight = height;
        this.cells = [];
        this.initializeCells(chromosome);
        const currentState = this.calculateState();
        this.states.push(currentState);
        this.initialSize = this.calculateSize();

        this.cellNeighbors = new Map();
        this.cells.forEach((cell) => {
            this.cellNeighbors.set(cell, this.getNeighbors(cell));
        });

        this.statistics = {};
        this.calculateStatistics();
    }

    runSimulation() {
        for (let i = 0; !this.isStabilized() && i < config.SimulationMaxSteps; ++i) {
            this.moveNextGen();
        }
    }

    calculateFitness() {
        const currentSize = this.calculateSize();
        const addedWidth = currentSize.Width - this.initialSize.Width;
        const addedHeight = currentSize.Height - this.initialSize.Height;

        const livingCells = this.cells.filter((cell) => cell.currentStepData.alive).length;
        return addedWidth + addedHeight + livingCells + this.step;
    }

    moveNextGen() {
        this.edges = {};

        this.cells.forEach(this.calculateCellNextGen.bind(this));
        this.cells.forEach((cell) => {
            this.moveCellNextGen(cell);
            this.updatePatternEdges(cell);
        });
        this.step += 1;

        const currentState = this.calculateState();
        this.states.push(currentState);
        this.calculateStatistics();
    }

    isStabilized() {
        const lastStateIndex = this.states.length - 1;
        const currentState = this.states[lastStateIndex];
        const firstDuplicateStateIndex = this.states.indexOf(currentState);
        // if it exists and the first state isnt the current state
        return (firstDuplicateStateIndex != -1 && firstDuplicateStateIndex != lastStateIndex);
    }

    private initializeCells(chromosome: Chromosome) {
        this.cells.length = 0;
        for (let yIndex = 0; yIndex < this.gridHeight; ++yIndex) {
            for (let xIndex = 0; xIndex < this.gridWidth; ++xIndex) {
                const newCell = createCell(xIndex, yIndex, isInitialCellAlive(chromosome, xIndex, yIndex));
                this.cells.push(newCell);
                this.updatePatternEdges(newCell)
            }
        }
    }

    private updatePatternEdges(cell: Cell) {
        if (!cell.currentStepData.alive) return;
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

    private calculateState() {
        const bitRepresentation = this.cells.map((cell) => cell.currentStepData.alive ? '1' : '0').join("");
        return BigInt(`0b${bitRepresentation}`);
    }

    private calculateStatistics() {
        this.statistics.Fitness = this.calculateFitness();
        this.statistics["Initial Width"] = this.initialSize.Width;
        this.statistics["Initial Height"] = this.initialSize.Height;
        Object.assign(this.statistics, this.calculateSize());
    }

    private calculateSize() {
        const size: Size = {
            Width: 0,
            Height: 0
        };
        if (this.states[this.states.length - 1] === 0n) {
            // no cells are alive (all bits are turned off)
            return size;
        }
        size.Width = this.edges.right!.indexX - this.edges.left!.indexX + 1;
        size.Height = this.edges.bottom!.indexY - this.edges.top!.indexY + 1;
        return size;
    }

    private moveCellNextGen(cell: Cell) {
        cell.currentStepData = cell.nextStepData as StepData;
        cell.nextStepData = {};
    }

    private calculateCellNextGen(cell: Cell) {
        const neighbors = this.cellNeighbors.get(cell);
        if (!neighbors) throw new Error("Invalid cell");

        cell.nextStepData.alive = cell.currentStepData.alive; // initialization

        const livingNeighborsCount = neighbors.filter((neighbor) => neighbor.currentStepData.alive).length;

        if (!cell.currentStepData.alive) {
            // dead cells turn alive if there are 3 neighbors
            cell.nextStepData.alive = (livingNeighborsCount == 3);
            return;
        }

        // living cells die if there are too many or too few neighbors
        cell.nextStepData.alive = (livingNeighborsCount > 1 && livingNeighborsCount < 4)
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