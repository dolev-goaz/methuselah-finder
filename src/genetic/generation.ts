import { Chromosome, chromosomeSize, generateChromosome } from "./chromosome";
import config from "@/config.json";
import { randomRange } from "@/mathUtil";
import ChromosomeWorker from "@/simulation/chromosomeWorker?worker";
import { WorkerOutput, type WorkerInput } from "@/simulation/chromosomeWorker";
import { splitBatches } from "@/utils";

export type ChromosomeResult = [Chromosome, number];
type NTuple<
    N extends number,
    Accumulator extends Chromosome[] = [],
> = Accumulator['length'] extends N
    ? Accumulator
    : NTuple<N, [...Accumulator, Chromosome]>;

export async function createGeneration() {
    const chromosomes = await Promise.all(
        Array.from({ length: config.PopulationSize })
            .map(generateChromosome)
    );

    return chromosomes.filter(Boolean); // non-zero chromosomes
}

export async function runGeneration(chromosomes: Chromosome[]): Promise<ChromosomeResult[]> {
    const batches = splitBatches(chromosomes, config.ParallelWorkerCount);
    const simulations = batches.map((batch, i) => {
        return new Promise<ChromosomeResult[]>((resolve) => {
            const worker = new ChromosomeWorker();
            worker.postMessage({
                type: 'start',
                innerData: batch
            } as WorkerInput);
            worker.onmessage = ({ data }: MessageEvent<WorkerOutput>) => {
                if (data.type == 'result') {
                    worker.terminate();
                    resolve(data.innerData);
                }
            };
        });

    });
    const result = await Promise.all(simulations);
    return result.flat();
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
                const parents = selectParents(probabilityLimits, 2);
                const child = crossover(parents);
                return tryMutate(child);
            })
    );

    const bestChromosome = generation.reduce((bestRes, currentRes) => bestRes[1] > currentRes[1] ? bestRes : currentRes);
    const bestCopies = Array.from({ length: config.BestPromotionCount }).map(() => bestChromosome[0]);

    const varianceChildren = await Promise.all(
        Array.from({ length: config.NewVariancePopulationCount })
            .map(generateChromosome)
    );


    return [
        ...bestCopies,
        ...varianceChildren,
        ...children
    ].filter(Boolean); // non-zero children
}

function tryMutate(chromosome: Chromosome) {
    if (Math.random() >= config.MutationChance) return chromosome;
    const mutationPosition = BigInt(Math.floor(Math.random() * chromosomeSize));
    chromosome ^= (1n << mutationPosition);
    return chromosome;
}

function crossover([parent1, parent2]: [Chromosome, Chromosome]) {
    const cutoff = BigInt(randomRange(1, chromosomeSize - 1));
    const mask = (1n << cutoff) - 1n;

    return parent1 | (parent2 & mask);
}

function selectParents<
    T extends number
>(probabilities: Array<[number, Chromosome]>, count: T): NTuple<T> {
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

    return out as NTuple<T>;
}