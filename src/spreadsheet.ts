import config from "@/config.json";
import * as ExcelJS from "exceljs";
import * as FileSaver from "file-saver";

import { type WorkerOutputObject } from "@/simulation/generationWorker";
import { chromosomeSize } from "./genetic/chromosome";

const headerInfo = {
    generation: {
        header: 'Generation',
        width: 13,
    },
    maxFitness: {
        header: 'Fitness',
        width: 11,
        style: { numFmt: '0.00' }
    },
    chromosome: {
        header: 'Chromosome',
        width: 13,
    },
    chromosomeStr: {
        header: 'Visualised (double click)',
        width: 40,
        
    }
} satisfies Record<keyof WorkerOutputObject['progress'] | 'chromosomeStr', Partial<ExcelJS.Column>>;
const headerKeys = Object.keys(headerInfo) as Array<keyof typeof headerInfo>;

export async function writeSpreadSheet(history: Array<WorkerOutputObject['progress']>, filename: string = 'export') {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("output");
    worksheet.columns = headerKeys.map((key) => ({
        key,
        ...headerInfo[key]
    }));
    history.forEach((row) => addProgressRow(worksheet, row));

    const buffer = await workbook.xlsx.writeBuffer();
    FileSaver.saveAs(new Blob([buffer]), `${filename}.xlsx`);

}

function addProgressRow(sheet: ExcelJS.Worksheet, row: WorkerOutputObject['progress']) {
    const newRow = Object.fromEntries(
        Object.entries(row).map(([key, value]) => [key, typeof value === 'bigint' ? value.toString() : value])
    ) as Record<typeof headerKeys[number], any>;

    newRow.chromosomeStr = row.chromosome
        .toString(2)
        .padStart(chromosomeSize, '0')
        .replace(/0/g, '□')
        .replace(/1/g, '■')
        .match(new RegExp(`.{${config.InitialChromosome.MaxWidth}}`, 'g'))!.join('\n');
    sheet.addRow(newRow);
}