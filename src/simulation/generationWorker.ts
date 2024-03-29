import config from "@/config.json";
import { Chromosome } from "@/genetic/chromosome";
import { createGeneration, crossoverGeneration, runGeneration } from "@/genetic/generation";

type WorkerInput = 'start';
export type WorkerOutputObject = {
    result: Chromosome;
    progress: {
        generation: number;
        maxFitness: number;
        chromosome: Chromosome;
    }
}

export type WorkerOutput = {
    [TKey in keyof WorkerOutputObject]: {
        type: TKey;
        innerData: WorkerOutputObject[TKey]
    }
}[keyof WorkerOutputObject];

async function runGeneticAlgorithm() {
    let generation = await createGeneration();
    for (let genIndex = 0; genIndex < config.GenerationCount; ++genIndex) {
        const simulations = await runGeneration(generation);
        const max = Math.max(...simulations.map((simulation) => simulation[1]));
        const best = simulations.find((simulation) => simulation[1] == max)!;
        myPostMessage('progress', {
            generation: genIndex + 1,
            chromosome: best[0],
            maxFitness: best[1],
        });
        generation = await crossoverGeneration(simulations);
    }

    const lastGeneration = await runGeneration(generation);

    const bestSimulation = lastGeneration
        .reduce(
            (best, current) => best[1] > current[1]
                ? best : current
        );
    return bestSimulation[0];
}

onmessage = async (event: MessageEvent<WorkerInput>) => {
    if (event.data === 'start') {
        const bestChromosome = await runGeneticAlgorithm();
        myPostMessage('result', bestChromosome);
    }
}

function myPostMessage<TKey extends keyof WorkerOutputObject>(type: TKey, data: WorkerOutputObject[TKey]) {
    postMessage({
        type,
        innerData: data,
    });
}