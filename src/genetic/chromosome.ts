import config from "@/config.json"
import { Cell } from "@/simulation/cell";

export type Chromosome = bigint;

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

    return chromosome;
}

export function isCellAlive(chromosome: Chromosome, positionX: number, positionY: number) {
    const index = BigInt(positionY * config.CellsInRow + positionX);

    return Boolean(chromosome & (1n << index));
}

export function cellsToChromosome(cells: Cell[]) {
    const bitRepresentation = cells.map((cell) => cell.currentGeneration.alive ? '1' : '0').join("");
    return BigInt(`0b${bitRepresentation}`);
}