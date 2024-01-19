import { Simulation } from "@/simulation/simulation";
import { Chromosome, generateChromosomeAsync } from "./chromosome";
import config from "@/config.json";

type ChromosomeResult = [Chromosome, number];

export async function createGeneration() {
    return Promise.all(Array.from({ length: 50 }).map(generateChromosomeAsync));
}

export async function runGeneration(chromosomes: Chromosome[]): Promise<ChromosomeResult[]> {
    const simulations = chromosomes.map(async (chromosome) => {
        const simulation = new Simulation(
            config.CellsInRow,
            config.CellsInColumn,
            chromosome
        );
        simulation.runSimulation();

        return [simulation.chromosome, simulation.calculateFitness({ withLimit: true })] as [Chromosome, number];
    });
    return Promise.all(simulations);
}

export async function crossoverGeneration(generation: ChromosomeResult[]) {
    const totalFitness = generation
        .reduce((sum, current) => sum + current[1], 0);

    let sum = 0;
    // running probability
    const probabilityLimits = generation.map((chromosomeResult) => {
        const probability = chromosomeResult[1] / totalFitness;
        sum += probability;
        return [sum, chromosomeResult[0]] as [number, Chromosome];
    });

    const newGeneration: Chromosome[] = [];

    for (let i = 0; i < config.GenerationSize; ++i) {
        const parents = selectParents(probabilityLimits);
        newGeneration.push(crossover(parents));
    }

    return newGeneration;
}

function crossover(parents: Chromosome[]) {
    return parents[0]
}

function selectParents(probabilities: Array<[number, Chromosome]>, count: number = 2) {
    // assumes probabilities are sorted, uses roulette selection
    const out: Chromosome[] = [];
    for (let _ = 0; _ < count; ++_) {
        const rand = Math.random();

        for (let i = 0; i < probabilities.length; ++i) {
            const probability = probabilities[i][0];

            if (rand > probability) {
                out.push(probabilities[i - 1][1])
                break;
            }
        }
    }

    return out;
}