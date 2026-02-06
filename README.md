# methuselah-finder

A genetic algorithm used to find 'nice' methuselah patterns in the game of life- with long lifespans and sizes before stabilizing.

## Overview

Methuselahs are small patterns in Conway's Game of Life that take a long time to stabilize.

This project implements a genetic algorithm to discover new methuselah patterns by evolving a population of candidate patterns over multiple generations.

## Features

- Genetic algorithm to evolve patterns
- Fitness evaluation based on lifespan and size
- Configurable parameters for population size, mutation rate, and generations
- Visualization of discovered methuselah patterns

## Requirements

- Node.js
- npm

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dolev-goaz/methuselah-finder.git
    cd methuselah-finder
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

To run the genetic algorithm, use the following command:

```bash
npm run dev
```

You can also build the project and run the distributed version:

```bash
npm run build
cd dist
npx live-server
```

## Configuration
You can configure the genetic algorithm parameters in the `src/config.json` file:

```json
{
  "GridSize": {
    "Min": 500,
    "Max": 1000,
    "StepSize": 100,
    "Initial": 700
  },
  "CellsInRow": 50,
  "CellsInColumn": 50,

  "SimulationMaxSteps": 500,
  "PopulationSize": 30,
  "GenerationCount": 200,
  "MutationChance": 0.6,

  "BestPromotionCount": 1,
  "NewVariancePopulationCount": 5,

  "InitialChromosome": {
    "CellLivingChance": 0.2,
    "MaxWidth": 5,
    "MaxHeight": 5
  },
  "InitialStepsPerSecond": 20,

  "ParallelWorkerCount": 15
}
```

## Examples

### Evolutionary Algorithm

https://github.com/user-attachments/assets/668f458a-fe38-48e0-94be-74b42e1ae2e5

### Simulation

https://github.com/user-attachments/assets/67c978d0-bd40-47b3-b745-9be812f6cd13

