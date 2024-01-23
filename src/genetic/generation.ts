import { Simulation } from "@/simulation/simulation";
import { Chromosome, generateChromosome } from "./chromosome";
import config from "@/config.json";

type ChromosomeResult = [Chromosome, number];
const chromosomeSize = config.InitialChromosome.MaxWidth * config.InitialChromosome.MaxHeight;

export async function createGeneration() {
    return Promise.all(Array.from({ length: config.PopulationSize }).map(generateChromosome));
}

export async function runGeneration(chromosomes: Chromosome[]): Promise<ChromosomeResult[]> {
    const simulations = chromosomes.map(async (chromosome) => {
        const simulation = new Simulation(chromosome);
        simulation.runSimulation();

        return [simulation.chromosome, simulation.calculateFitness()] as [Chromosome, number];
    });
    return Promise.all(simulations);
}

export async function crossoverGeneration(generation: ChromosomeResult[]) {
    const minFitness = Math.min(...generation.map(([_, fitness]) => fitness));
    const fitnessAddition = minFitness > 0 ? 0 : Math.abs(minFitness) + 1;
    const totalFitness =
        generation.reduce((sum, current) => sum + current[1], 0)
        + fitnessAddition * generation.length;

    let sum = 0;
    // running probability
    const probabilityLimits = generation
        .map((chromosomeResult) => {
            const probability = (chromosomeResult[1] + fitnessAddition) / totalFitness;
            sum += probability;
            return [sum, chromosomeResult[0]] as [number, Chromosome];
        });

    const crossoverChildrenCount = config.PopulationSize - config.BestPromotionCount - config.NewVariancePopulationCount;

    const children = await Promise.all(
        Array.from({ length: crossoverChildrenCount })
            .map(() => {
                const parents = selectParents(probabilityLimits);
                const child = crossover(parents);
                return tryMutate(child);
            })
    );

    const bestChromosome = generation.reduce((bestRes, currentRes) => bestRes[1] > currentRes[1] ? bestRes : currentRes);
    const bestCopies = Array.from({length: config.BestPromotionCount}).map(() => bestChromosome[0]);

    const varianceChildren = await Promise.all(
        Array.from({ length: config.NewVariancePopulationCount })
            .map(generateChromosome)
    );


    return [
        ...bestCopies,
        ...varianceChildren,
        ...children
    ];
}

function tryMutate(chromosome: Chromosome) {
    if (Math.random() >= config.MutationChance) return chromosome;
    const mutationPosition = BigInt(Math.floor(Math.random() * chromosomeSize));
    chromosome ^= (1n << mutationPosition);
    return chromosome;
}

function crossover(parents: Chromosome[]) {
    const chunkSize = BigInt(chromosomeSize / parents.length);
    let mask = (1n << chunkSize) - 1n;
    let out = BigInt(0);
    parents.forEach((parent) => {
        out <<= chunkSize;
        out |= (parent & mask);

        mask <<= chunkSize;
    })
    return out;
}

function selectParents(probabilities: Array<[number, Chromosome]>, count: number = 2) {
    // assumes probabilities are sorted, uses roulette selection
    const out: Chromosome[] = [];
    for (let parentIndex = 0; parentIndex < count; ++parentIndex) {
        const rand = Math.random();

        for (let i = 0; i < probabilities.length - 1; ++i) {
            const probability = probabilities[i][0];
            const nextProbability = probabilities[i + 1][0];

            if ((probability < rand && nextProbability > rand) || (probability > rand && i == 0)) {
                out.push(probabilities[i][1])
                break;
            }
        }
    }

    return out;
}