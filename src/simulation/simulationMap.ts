import { Cell, drawCell } from "./cell";
import config from "../config.json";
import { Simulation, Statistics } from "./simulation";

export class SimulationMap {

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    private cellSizeMultiplier: number;
    private stepCountHeader: HTMLElement;

    constructor() {
        this.cellSizeMultiplier = config.CellSize.Initial;
        const htmlElements = this.initializeMapHTML();
        if (!htmlElements) {
            alert("Error");
            throw new Error("Error");
        }
        this.canvas = htmlElements.canvas;
        this.stepCountHeader = htmlElements.stepCountHeader;

        const ctx = this.canvas.getContext("2d");
        if (!ctx) throw new Error("An error has occured. please refresh");
        this.ctx = ctx;
    }

    setCellSizeMultiplier(multiplier: number) {
        this.cellSizeMultiplier = multiplier;

        this.canvas.width = this.cellSize * config.CellsInRow;
        this.canvas.height = this.cellSize * config.CellsInColumn;
    }

    private drawCell(cell: Cell) {
        drawCell(this.ctx, cell, this.cellSize);
    }

    get cellSize() {
        return this.cellSizeMultiplier * config.CellSize.Multiplier;
    }

    draw(simulation: Simulation) {
        this.clear();
        simulation.cells.forEach(this.drawCell.bind(this));
        this.stepCountHeader.innerText = `Step ${simulation.step}`;
        this.drawStatistics(simulation.statistics);
    }

    private drawStatistics(statistics: Statistics) {
        const text = Object.entries(statistics).map(([key, value]) => {
            const valueStr = typeof value === 'number'
            ? (Math.round(value * 100) / 100)
            : value.toString();
            return `${key}: ${valueStr}.`
        }).join('\n')
        const statisticsContainer = document.querySelector<HTMLDivElement>('#statistics-container')!;
        statisticsContainer.hidden = false;
        const statisticsData = statisticsContainer.querySelector<HTMLParagraphElement>('p#statistics')!;
        statisticsData.innerText = text ||`Empty Statistics`;
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
        canvas.width = this.cellSize * config.CellsInRow;
        canvas.height = this.cellSize * config.CellsInColumn;

        const stepCountHeader = document.querySelector<HTMLElement>("header#step-count-header")!;


        return {
            canvas,
            stepCountHeader
        };
    }
}