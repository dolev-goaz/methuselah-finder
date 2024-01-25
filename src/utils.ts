export function splitBatches<T extends any>(src: T[], batchCount: number): Array<T[]> {
    const batchSize = Math.ceil(src.length / batchCount);
    const batches: Array<T[]> = [];
    for (let i = 0; i < batchCount; ++i) {
        const start = i * batchSize;
        const end = start + batchSize;
        batches.push(src.slice(start, end));
    }

    return batches;
}

export async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}