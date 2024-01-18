import { Cell, drawCell } from "./cell";
import config from "../config.json";

export class SimulationMap {

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    private cellSizeMultiplier: number;
    private generationHeader: HTMLElement;

    constructor() {
        this.cellSizeMultiplier = config.CellSize.Initial;
        const htmlElements = this.initializeMapHTML();
        if (!htmlElements) {
            alert("Error");
            throw new Error("Error");
        }
        this.canvas = htmlElements.canvas;
        this.generationHeader = htmlElements.generationHeader;

        const ctx = this.canvas.getContext("2d");
        if (!ctx) throw new Error("An error has occured. please refresh");
        this.ctx = ctx;
    }

    setCellSizeMultiplier(multiplier: number) {
        this.cellSizeMultiplier = multiplier;

        this.canvas.width = this.cellSize * config.CellsInColumn;
        this.canvas.height = this.cellSize * config.CellsInRow;
    }

    private drawCell(cell: Cell) {
        drawCell(this.ctx, cell, this.cellSize);
    }

    get cellSize() {
        return this.cellSizeMultiplier * config.CellSize.Multiplier;
    }

    draw(cells: Cell[], generation: number = 0) {
        this.clear();
        cells.forEach(this.drawCell.bind(this));
        this.generationHeader.innerText = `Generation ${generation}`;
    }

    clear() {
        this.ctx.fillStyle = 'lightgray';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private initializeMapHTML() {
        const canvasParent = document.querySelector<HTMLDivElement>("#simulation-map")
        if (!canvasParent) return;
        const canvas = canvasParent.querySelector<HTMLCanvasElement>("canvas");
        if (!canvas) return;
        canvas.width = this.cellSize * config.CellsInColumn;
        canvas.height = this.cellSize * config.CellsInRow;

        const generationHeader = document.querySelector<HTMLElement>("header#generation-header")!;


        return {
            canvas,
            generationHeader
        };
    }
}