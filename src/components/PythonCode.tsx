import { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-python';

const pythonCode = `
import numpy as np
import random

class AntColony:
    def __init__(self, distances, n_ants, n_best, n_iterations, decay, alpha=1, beta=1, early_stopping_patience=20, elitist_weight=2.0):
        """
        Args:
            distances (2D numpy.array): Square matrix of distances. 
                Diagonal is assumed to be np.inf.
            n_ants (int): Number of ants running per iteration
            n_best (int): Number of best ants who deposit pheromone
            n_iteration (int): Number of iterations
            decay (float): Rate it which pheromone decays. 
                The pheromone value is multiplied by decay, so 0.95 is decay.
            alpha (int or float): exponenet on pheromone, higher alpha gives pheromone more weight. Default=1
            beta (int or float): exponenet on distance, higher beta gives distance more weight. Default=1
            early_stopping_patience (int): Number of iterations to wait for improvement before halting.
            elitist_weight (float): Multiplier for pheromone on the best path found so far.
        """
        self.distances  = distances
        self.pheromone = np.ones(self.distances.shape) / len(distances)
        self.all_inds = range(len(distances))
        self.n_ants = n_ants
        self.n_best = n_best
        self.n_iterations = n_iterations
        self.decay = decay
        self.alpha = alpha
        self.beta = beta
        self.early_stopping_patience = early_stopping_patience
        self.elitist_weight = elitist_weight

    def run(self):
        shortest_path = None
        all_time_shortest_path = (None, np.inf)
        no_improvement_count = 0

        for i in range(self.n_iterations):
            # Pass the best path found so far to bias the ants' choices (Elitist Weight)
            all_paths = self.gen_all_paths(all_time_shortest_path[0])
            
            # Update pheromones based on iteration results
            self.spread_pheronome(all_paths, self.n_best, shortest_path=shortest_path)
            
            # Elitist Deposit: Reinforce the all-time best path even more
            if all_time_shortest_path[0] is not None:
                for move in all_time_shortest_path[0]:
                    self.pheromone[move] += (1.0 / all_time_shortest_path[1]) * self.elitist_weight

            shortest_path = min(all_paths, key=lambda x: x[1])

            if shortest_path[1] < all_time_shortest_path[1]:
                all_time_shortest_path = shortest_path
                no_improvement_count = 0
                print(f"Iteration {i}: New Best Distance = {all_time_shortest_path[1]:.2f}")
            else:
                no_improvement_count += 1

            if no_improvement_count >= self.early_stopping_patience:
                print(f"Convergence reached at iteration {i}. Halting.")
                break

            self.pheromone *= self.decay            
        
        print("\n" + "="*40)
        print("         SIMULATION COMPLETE")
        print("="*40)
        print(f" FINAL BEST DISTANCE: {all_time_shortest_path[1]:.4f}")
        print(f" FINAL BEST PATH:     {all_time_shortest_path[0]}")
        print("="*40)
        return all_time_shortest_path

    def spread_pheronome(self, all_paths, n_best, shortest_path):
        sorted_paths = sorted(all_paths, key=lambda x: x[1])
        for path, dist in sorted_paths[:n_best]:
            for move in path:
                self.pheromone[move] += 1.0 / self.distances[move]

    def gen_path_dist(self, path):
        total_dist = 0
        for ele in path:
            total_dist += self.distances[ele]
        return total_dist

    def gen_all_paths(self, best_path):
        all_paths = []
        for i in range(self.n_ants):
            path = self.gen_path(0, best_path)
            all_paths.append((path, self.gen_path_dist(path)))
        return all_paths

    def gen_path(self, start, best_path):
        path = []
        visited = set()
        visited.add(start)
        prev = start
        
        # Convert best path to a dictionary for O(1) lookup of edges
        best_edges = {u: v for u, v in best_path} if best_path else {}

        for i in range(len(self.distances) - 1):
            move = self.pick_move(self.pheromone[prev], self.distances[prev], visited, prev, best_edges)
            path.append((prev, move))
            prev = move
            visited.add(move)
        path.append((prev, start)) # back to start
        return path

    def pick_move(self, pheromone, dist, visited, prev_city, best_edges):
        pheromone = np.copy(pheromone)
        pheromone[list(visited)] = 0
        
        # Elitist Strategy: If an edge belongs to the best path, give it more weight
        if prev_city in best_edges:
            target = best_edges[prev_city]
            if target not in visited:
                pheromone[target] *= self.elitist_weight

        row = pheromone ** self.alpha * (( 1.0 / dist) ** self.beta)

        norm_row = row / row.sum()
        move = np.random.choice(self.all_inds, 1, p=norm_row)[0]
        return move

# Example usage:
# distances = np.array([[np.inf, 2, 2, 5, 7],
#                       [2, np.inf, 4, 8, 2],
#                       [2, 4, np.inf, 1, 3],
#                       [5, 8, 1, np.inf, 2],
#                       [7, 2, 3, 2, np.inf]])

# # Initialize and run
# ant_colony = AntColony(distances, n_ants=20, n_best=5, n_iterations=100, decay=0.95)
# best_path = ant_colony.run()
# # The run() method will print progress and final results automatically
`;

export default function PythonCode() {
  useEffect(() => {
    Prism.highlightAll();
  }, []);

  return (
    <div className="p-6 bg-slate-900 rounded-xl shadow-lg border border-slate-800 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          Python Implementation
        </h3>
        <span className="text-xs text-slate-400 font-mono">aco_tsp.py</span>
      </div>
      <pre className="rounded-lg overflow-auto max-h-[600px] text-sm scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
        <code className="language-python">{pythonCode}</code>
      </pre>
    </div>
  );
}
