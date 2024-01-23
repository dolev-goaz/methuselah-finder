import config from "@/config.json"

export type Chromosome = bigint;

export const chromosomeSize = config.InitialChromosome.MaxWidth * config.InitialChromosome.MaxHeight;

const xLimits = [
    Math.floor((config.CellsInRow - config.InitialChromosome.MaxWidth) / 2),
    Math.floor((config.CellsInRow + config.InitialChromosome.MaxWidth) / 2),
];
const yLimits = [
    Math.floor((config.CellsInColumn - config.InitialChromosome.MaxHeight) / 2),
    Math.floor((config.CellsInColumn + config.InitialChromosome.MaxHeight) / 2),
];

export async function generateChromosome() {
    let chromosome = BigInt(0);

    await Promise.all(
        Array.from({ length: chromosomeSize })
            .map(async (_, index) => {
                if (Math.random() < config.InitialChromosome.CellLivingChance) {
                    chromosome |= (1n << BigInt(index));
                }
            })
    );

    return chromosome;
}

export function isInitialCellAlive(chromosome: Chromosome, positionX: number, positionY: number) {
    if (positionX < xLimits[0] || positionX >= xLimits[1] || positionY < yLimits[0] || positionY >= yLimits[1]) {
        return false;
    }
    positionX -= xLimits[0];
    positionY -= yLimits[0];
    const index = BigInt(positionY * config.InitialChromosome.MaxWidth + positionX);
    return Boolean(chromosome & (1n << index));
}

export function howManyLivingCells(chromosome: Chromosome) {
    let sum = 0;
    for (let i = 0n; i < chromosomeSize; i++) {
        const isAlive = Boolean(chromosome & (1n  << i));
        sum += Number(isAlive);
    }
    return sum;
}