const cellBorderThickness = 1;

type DrawData = {
    drawX: number;
    drawY: number;
    drawSize: number;
};

export type StepData = {
    alive: boolean;
}

export type Cell = {
    indexX: number;
    indexY: number;

    currentStepData: StepData;

    nextStepData: Partial<StepData>;

}

export function createCell(
    indexX: number,
    indexY: number,
    alive: boolean,
): Cell {
    return {
        indexX: indexX,
        indexY: indexY,
        currentStepData: {
            alive: alive
        },
        nextStepData: {}
    }
}

export function drawCell(ctx: CanvasRenderingContext2D, cell: Cell, cellSize: number) {
    const drawData: DrawData = {
        drawX: cellSize * cell.indexX,
        drawY: cellSize * cell.indexY,
        drawSize: cellSize
    };

    ctx.fillStyle = cell.currentStepData.alive ? 'orange' : 'white';
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