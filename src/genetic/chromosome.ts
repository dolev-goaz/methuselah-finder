import config from "@/config.json"
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
export function generateChromosome() {
    let chromosome = BigInt(0);
    const chromosomeSize = config.CellsInColumn * config.CellsInRow;

    Array.from({ length: chromosomeSize })
        .forEach((_, index) => {
            if (Math.random() < config.InitialChromosome.CellLivingChance) {
                chromosome |= (1n << BigInt(index));
            }
        });

    return chromosome;
}