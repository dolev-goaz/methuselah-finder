import config from "@/config.json";
import { Chromosome } from "@/genetic/chromosome";
import { createGeneration, crossoverGeneration, runGeneration } from "@/genetic/generation";

type WorkerInput = 'start';
type _workerOutput = {
    result: Chromosome;
    progress: {
        generation: number;
        maxFitness: number;
    }
}

export type WorkerOutput = {
    [TKey in keyof _workerOutput]: {
        type: TKey;
        innerData: _workerOutput[TKey]
    }
}[keyof _workerOutput];

async function runGeneticAlgorithm() {
    let generation = await createGeneration();
    for (let genIndex = 0; genIndex < config.GenerationCount - 1; ++genIndex) {
        const simulations = await runGeneration(generation);
        const max = Math.max(...simulations.map((simulation) => simulation[1]));
        myPostMessage('progress', { generation: genIndex, maxFitness: max });
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

function myPostMessage<TKey extends keyof _workerOutput>(type: TKey, data: _workerOutput[TKey]) {
    postMessage({
        type,
        innerData: data,
    });
}