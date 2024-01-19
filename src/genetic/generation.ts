import { Simulation } from "@/simulation/simulation";
import { generateChromosomeAsync } from "./chromosome";
import config from "@/config.json";

export async function createGeneration() {
    const chromosomes = await Promise.all(Array.from({ length: 50 }).map(generateChromosomeAsync));
    const simulations = chromosomes.map((chromosome) => new Simulation(
        config.CellsInRow,
        config.CellsInColumn,
        chromosome
    ));
    return simulations;
}

export async function runGeneration(generation: Simulation[]) {
    await Promise.all(generation.map(async (simulation) => simulation.runSimulation()));
}