import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const theoryContent = String.raw`
# Ant Colony Optimization (ACO)

Ant Colony Optimization is a probabilistic technique for solving computational problems which can be reduced to finding good paths through graphs.

## The Biological Inspiration
In the real world, ants initially wander randomly. Upon finding a food source, they return to their colony while laying down **pheromone trails**. If other ants find such a path, they are likely not to keep traveling at random, but instead to follow the trail, returning and reinforcing it if they eventually find food.

Over time, however, the pheromone trail starts to **evaporate**, thus reducing its attractive strength. The more time it takes for an ant to travel down the path and back again, the more time the pheromones have to evaporate. A short path, by comparison, gets marched over more frequently, and thus the pheromone density becomes higher on shorter paths than longer ones.

## The Mathematical Model
In ACO, we use two main parameters to guide the ants:

1.  **Pheromone ($\tau$):** Represents the "memory" of the colony. Higher pheromone levels indicate a better path found previously.
2.  **Heuristic Information ($\eta$):** Usually the inverse of the distance ($1/d$). This represents the "greedy" choice.

### Transition Probability
The probability $P_{ij}$ of an ant moving from city $i$ to city $j$ is:
$$P_{ij} = \frac{(\tau_{ij})^\alpha \cdot (\eta_{ij})^\beta}{\sum (\tau_{ik})^\alpha \cdot (\eta_{ik})^\beta}$$

-   **$\alpha$ (Alpha):** Controls the influence of pheromones.
-   **$\beta$ (Beta):** Controls the influence of distance (heuristic).

### Pheromone Update
After all ants complete a tour, pheromones are updated:
$$\tau_{ij} = (1 - \rho) \cdot \tau_{ij} + \sum \Delta \tau_{ij}^k$$
-   **$\rho$ (Rho):** Evaporation rate.
-   **$\Delta \tau_{ij}^k$:** Pheromone deposited by ant $k$ (usually $Q/L_k$, where $L_k$ is the tour length).
`;

export default function TheorySection() {
  return (
    <div className="prose prose-slate max-w-none dark:prose-invert p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{theoryContent}</ReactMarkdown>
    </div>
  );
}
