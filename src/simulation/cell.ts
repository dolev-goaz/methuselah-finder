const cellBorderThickness = 1;

type DrawData = {
    drawX: number;
    drawY: number;
    drawSize: number;
};

export type GenerationData = {
    alive: boolean;
}

export type Cell = {
    indexX: number;
    indexY: number;

    currentGeneration: GenerationData;

    nextGeneration: Partial<GenerationData>;

}

export function createCell(
    indexX: number,
    indexY: number,
    alive: boolean,
): Cell {
    return {
        indexX: indexX,
        indexY: indexY,
        currentGeneration: {
            alive: alive
        },
        nextGeneration: {}
    }
}

export function drawCell(ctx: CanvasRenderingContext2D, cell: Cell, cellSize: number) {
    const drawData: DrawData = {
        drawX: cellSize * cell.indexX,
        drawY: cellSize * cell.indexY,
        drawSize: cellSize
    };

    ctx.fillStyle = cell.currentGeneration.alive ? 'orange' : 'white';
    ctx.fillRect(
        drawData.drawX + cellBorderThickness,
        drawData.drawY + cellBorderThickness,
        drawData.drawSize - 2 * cellBorderThickness,
        drawData.drawSize - 2 * cellBorderThickness
    );


    // debug
    // ctx.font = '7px serif';
    // ctx.strokeText(`(${cell.indexX}, ${cell.indexY})`, drawData.drawX + 2, drawData.drawY + 10);
}