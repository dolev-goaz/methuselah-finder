import { Chromosome } from "@/genetic/chromosome";
import { ChromosomeResult } from "@/genetic/generation";
import { Simulation } from "./simulation";

export type WorkerInput = {
   type: 'start',
   innerData: Chromosome[],
};
export type WorkerOutputObject = {
    result: ChromosomeResult[];
}

export type WorkerOutput = {
    [TKey in keyof WorkerOutputObject]: {
        type: TKey;
        innerData: WorkerOutputObject[TKey]
    }
}[keyof WorkerOutputObject];

function runChromosome(chromosome: Chromosome) {
    const simulation = new Simulation(chromosome);
    simulation.runSimulation();
    return [simulation.chromosome, simulation.calculateFitness()] as [Chromosome, number];

}

onmessage = (event: MessageEvent<WorkerInput>) => {
    if (event.data.type === 'start') {
        const chromosomeData = event.data.innerData.map(runChromosome);
        myPostMessage('result', chromosomeData);
    }
}

function myPostMessage<TKey extends keyof WorkerOutputObject>(type: TKey, data: WorkerOutputObject[TKey]) {
    postMessage({
        type,
        innerData: data,
    });
}