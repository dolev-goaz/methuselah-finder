import config from "@/config.json"
import { Cell } from "@/simulation/cell";

export type Chromosome = bigint;

const chromosomeSize = config.CellsInRow * config.CellsInColumn
const chromosomeMask = generateChromosomeCenterMask();
// debug- see chromosome mask
const maskStr =
    chromosomeMask.toString(2)
        .padStart(chromosomeSize, '0')
        .match(new RegExp(`.{${config.CellsInRow}}`, 'g'))!;
console.log("CHROMOSOME MASK-\n" + maskStr.join('\n'));

function generateChromosomeCenterMask() {
    let rowMask = BigInt(0);

    const [rowPadding, colPadding] = [
        (config.CellsInRow - config.InitialChromosome.MaxWidth) / 2,
        (config.CellsInColumn - config.InitialChromosome.MaxHeight) / 2
    ].map(Math.floor);

    for (let _ = 0; _ < config.InitialChromosome.MaxWidth; ++_) {
        rowMask <<= 1n;
        rowMask |= 1n;
    }

    rowMask <<= BigInt(rowPadding);

    let chromosomeMask = BigInt(0);

    for (let _ = 0; _ < config.InitialChromosome.MaxHeight; ++_) {
        chromosomeMask <<= BigInt(config.CellsInRow);
        chromosomeMask |= rowMask;
    }

    chromosomeMask <<= BigInt(config.CellsInRow * colPadding);
    return chromosomeMask
}

export async function generateChromosomeAsync() {
    let chromosome = BigInt(0);
    const chromosomeSize = config.CellsInColumn * config.CellsInRow;

    await Promise.all(
        Array.from({ length: chromosomeSize })
            .map(async (_, index) => {
                if (Math.random() < config.InitialChromosome.CellLivingChance) {
                    chromosome |= (1n << BigInt(index));
                }
            })
    );

    chromosome &= chromosomeMask;

    return chromosome;
}

export function isCellAlive(chromosome: Chromosome, positionX: number, positionY: number) {
    const index = BigInt(positionY * config.CellsInRow + positionX);

    return Boolean(chromosome & (1n << index));
}

export function cellsToChromosome(cells: Cell[]) {
    const bitRepresentation = cells.map((cell) => cell.currentStepData.alive ? '1' : '0').join("");
    return BigInt(`0b${bitRepresentation}`);
}