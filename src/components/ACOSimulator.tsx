import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Settings2, Plus, Minus, Info } from 'lucide-react';
import { cn } from '../lib/utils';

interface City {
  id: number;
  x: number;
  y: number;
}

interface Ant {
  currentCity: number;
  visited: Set<number>;
  path: number[];
  totalDistance: number;
  finished: boolean;
}

interface ACOConfig {
  alpha: number; // Pheromone importance
  beta: number;  // Distance importance
  evaporation: number; // Rho
  antCount: number;
  cityCount: number;
  q: number; // Pheromone constant
  maxIterations: number;
  patience: number;
}

const DEFAULT_CONFIG: ACOConfig = {
  alpha: 1,
  beta: 2,
  evaporation: 0.1,
  antCount: 20,
  cityCount: 15,
  q: 100,
  maxIterations: 200,
  patience: 50,
};

export default function ACOSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [config, setConfig] = useState<ACOConfig>(DEFAULT_CONFIG);
  const [isRunning, setIsRunning] = useState(false);
  const [iteration, setIteration] = useState(0);
  const [bestDistance, setBestDistance] = useState<number | null>(null);
  const [bestPath, setBestPath] = useState<number[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [pheromones, setPheromones] = useState<number[][]>([]);
  const [ants, setAnts] = useState<Ant[]>([]);
  const [noImprovementCount, setNoImprovementCount] = useState(0);
  const [stopReason, setStopReason] = useState<'max_iterations' | 'convergence' | null>(null);

  // Initialize cities and pheromones
  const init = useCallback(() => {
    const newCities: City[] = [];
    const width = canvasRef.current?.width || 800;
    const height = canvasRef.current?.height || 500;
    const padding = 50;

    for (let i = 0; i < config.cityCount; i++) {
      newCities.push({
        id: i,
        x: padding + Math.random() * (width - 2 * padding),
        y: padding + Math.random() * (height - 2 * padding),
      });
    }

    const initialPheromone = 1 / config.cityCount;
    const newPheromones = Array(config.cityCount).fill(0).map(() =>
      Array(config.cityCount).fill(initialPheromone)
    );

    setCities(newCities);
    setPheromones(newPheromones);
    setIteration(0);
    setBestDistance(null);
    setBestPath([]);
    setNoImprovementCount(0);
    setStopReason(null);
    resetAnts(newCities);
  }, [config.cityCount]);

  const resetAnts = (currentCities: City[]) => {
    const newAnts: Ant[] = Array(config.antCount).fill(0).map(() => {
      const startCity = Math.floor(Math.random() * currentCities.length);
      return {
        currentCity: startCity,
        visited: new Set([startCity]),
        path: [startCity],
        totalDistance: 0,
        finished: false,
      };
    });
    setAnts(newAnts);
  };

  useEffect(() => {
    init();
  }, [init]);

  const getDistance = (c1: City, c2: City) => {
    return Math.sqrt(Math.pow(c1.x - c2.x, 2) + Math.pow(c1.y - c2.y, 2));
  };

  const pickNextCity = (ant: Ant, currentPheromones: number[][], currentCities: City[]) => {
    const current = ant.currentCity;
    const probabilities: { city: number; prob: number }[] = [];
    let totalWeight = 0;

    for (let i = 0; i < currentCities.length; i++) {
      if (!ant.visited.has(i)) {
        const dist = getDistance(currentCities[current], currentCities[i]);
        const pheromone = currentPheromones[current][i];
        const weight = Math.pow(pheromone, config.alpha) * Math.pow(1 / dist, config.beta);
        probabilities.push({ city: i, prob: weight });
        totalWeight += weight;
      }
    }

    if (totalWeight === 0) return -1;

    let random = Math.random() * totalWeight;
    for (const p of probabilities) {
      random -= p.prob;
      if (random <= 0) return p.city;
    }
    return probabilities[probabilities.length - 1].city;
  };

  const step = useCallback(() => {
    if (!isRunning) return;

    let allFinished = true;
    const nextAnts = ants.map(ant => {
      if (ant.finished) return ant;

      const nextCity = pickNextCity(ant, pheromones, cities);

      if (nextCity === -1) {
        // Return to start
        const startCity = ant.path[0];
        const dist = getDistance(cities[ant.currentCity], cities[startCity]);
        return {
          ...ant,
          path: [...ant.path, startCity],
          totalDistance: ant.totalDistance + dist,
          finished: true,
        };
      }

      allFinished = false;
      const dist = getDistance(cities[ant.currentCity], cities[nextCity]);
      const newVisited = new Set(ant.visited);
      newVisited.add(nextCity);

      return {
        ...ant,
        currentCity: nextCity,
        visited: newVisited,
        path: [...ant.path, nextCity],
        totalDistance: ant.totalDistance + dist,
      };
    });

    if (allFinished) {
      // Check stopping conditions
      if (iteration >= config.maxIterations) {
        setIsRunning(false);
        setStopReason('max_iterations');
        return;
      }

      // Update Pheromones
      const nextPheromones = pheromones.map(row => row.map(val => val * (1 - config.evaporation)));

      let currentBestDist = bestDistance;
      let currentBestPath = bestPath;
      let improved = false;

      nextAnts.forEach(ant => {
        if (currentBestDist === null || ant.totalDistance < currentBestDist) {
          currentBestDist = ant.totalDistance;
          currentBestPath = ant.path;
          improved = true;
        }

        // Deposit pheromone
        for (let i = 0; i < ant.path.length - 1; i++) {
          const from = ant.path[i];
          const to = ant.path[i + 1];
          const deposit = config.q / ant.totalDistance;
          nextPheromones[from][to] += deposit;
          nextPheromones[to][from] += deposit;
        }
      });

      if (improved) {
        setNoImprovementCount(0);
      } else {
        const nextNoImprovement = noImprovementCount + 1;
        setNoImprovementCount(nextNoImprovement);
        if (nextNoImprovement >= config.patience) {
          setIsRunning(false);
          setStopReason('convergence');
          return;
        }
      }

      setPheromones(nextPheromones);
      setBestDistance(currentBestDist);
      setBestPath(currentBestPath);
      setIteration(prev => prev + 1);
      resetAnts(cities);
    } else {
      setAnts(nextAnts);
    }
  }, [isRunning, ants, pheromones, cities, config, bestDistance, bestPath, iteration, noImprovementCount]);

  // Animation Loop
  useEffect(() => {
    if (!isRunning) return;
    const timer = setTimeout(step, 50);
    return () => clearTimeout(timer);
  }, [isRunning, step]);

  // Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Pheromones
    let maxPheromone = 0.01;
    for (let i = 0; i < cities.length; i++) {
      for (let j = i + 1; j < cities.length; j++) {
        if (pheromones[i][j] > maxPheromone) maxPheromone = pheromones[i][j];
      }
    }

    for (let i = 0; i < cities.length; i++) {
      for (let j = i + 1; j < cities.length; j++) {
        const strength = pheromones[i][j];
        if (strength > 0.01) {
          const normalized = strength / maxPheromone;
          ctx.lineWidth = 0.5 + normalized * 4;
          ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 + normalized * 0.7})`;
          ctx.beginPath();
          ctx.moveTo(cities[i].x, cities[i].y);
          ctx.lineTo(cities[j].x, cities[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw Best Path
    if (bestPath.length > 0) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cities[bestPath[0]].x, cities[bestPath[0]].y);
      for (let i = 1; i < bestPath.length; i++) {
        ctx.lineTo(cities[bestPath[i]].x, cities[bestPath[i]].y);
      }
      ctx.stroke();
    }

    // Draw Cities
    cities.forEach(city => {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(city.x, city.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw Ants
    ants.forEach(ant => {
      if (!ant.finished) {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(cities[ant.currentCity].x, cities[ant.currentCity].y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }, [cities, pheromones, bestPath, ants]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 bg-slate-50 dark:bg-slate-950 min-h-[600px]">
      {/* Simulation Area */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className="w-full h-auto cursor-crosshair"
          />

          {/* Overlay Info */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <div className="bg-slate-900/80 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-medium border border-slate-700">
              Iteration: {iteration} / {config.maxIterations}
            </div>
            <div className="bg-slate-900/80 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-medium border border-slate-700">
              Best Distance: {bestDistance ? bestDistance.toFixed(2) : 'N/A'}
            </div>
            {noImprovementCount > 0 && isRunning && (
              <div className="bg-amber-900/80 backdrop-blur-md text-white px-4 py-2 rounded-lg text-xs font-medium border border-amber-700">
                Patience: {noImprovementCount} / {config.patience}
              </div>
            )}
          </div>

          {stopReason && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 text-center max-w-sm">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4">
                  <Info size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Simulation Halted</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                  {stopReason === 'max_iterations'
                    ? `Reached maximum iterations limit (${config.maxIterations}).`
                    : `Converged: No improvement for ${config.patience} consecutive iterations.`}
                </p>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl mb-6 text-left border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Final Distance</span>
                    <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">{bestDistance?.toFixed(2)}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Best Path</span>
                    <p className="text-[10px] font-mono text-slate-600 dark:text-slate-300 break-all leading-tight">
                      {bestPath.join(' → ')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={init}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-colors"
                >
                  Restart Simulation
                </button>
              </div>
            </div>
          )}

          {!isRunning && iteration === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 backdrop-blur-[1px]">
              <button
                onClick={() => setIsRunning(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 font-bold transition-all transform hover:scale-105 active:scale-95"
              >
                <Play size={24} fill="currentColor" />
                Start Simulation
              </button>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors",
              isRunning ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            {isRunning ? <><Pause size={18} fill="currentColor" /> Pause</> : <><Play size={18} fill="currentColor" /> Resume</>}
          </button>

          <button
            onClick={init}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <RotateCcw size={18} /> Reset
          </button>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2" />

          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 opacity-50" />
              Pheromone Trail
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              Best Path
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              Active Ants
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Controls */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-slate-100">
            <Settings2 size={20} />
            <h3 className="font-bold">Parameters</h3>
          </div>

          <div className="space-y-6">
            {/* Alpha */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="text-slate-600 dark:text-slate-400 font-medium">Alpha (α)</label>
                <span className="text-blue-600 font-bold">{config.alpha}</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={config.alpha}
                onChange={(e) => setConfig({ ...config, alpha: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[10px] text-slate-400">Pheromone importance</p>
            </div>

            {/* Beta */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="text-slate-600 dark:text-slate-400 font-medium">Beta (β)</label>
                <span className="text-blue-600 font-bold">{config.beta}</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={config.beta}
                onChange={(e) => setConfig({ ...config, beta: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[10px] text-slate-400">Heuristic (distance) importance</p>
            </div>

            {/* Evaporation */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="text-slate-600 dark:text-slate-400 font-medium">Evaporation (ρ)</label>
                <span className="text-blue-600 font-bold">{config.evaporation}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={config.evaporation}
                onChange={(e) => setConfig({ ...config, evaporation: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[10px] text-slate-400">Pheromone decay rate</p>
            </div>

            {/* Ant Count */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="text-slate-600 dark:text-slate-400 font-medium">Ant Count</label>
                <span className="text-blue-600 font-bold">{config.antCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfig(c => ({ ...c, antCount: Math.max(1, c.antCount - 5) }))}
                  className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <Minus size={14} />
                </button>
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden">
                  <div className="h-full bg-blue-600" style={{ width: `${(config.antCount / 100) * 100}%` }} />
                </div>
                <button
                  onClick={() => setConfig(c => ({ ...c, antCount: Math.min(100, c.antCount + 5) }))}
                  className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* City Count */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="text-slate-600 dark:text-slate-400 font-medium">City Count</label>
                <span className="text-blue-600 font-bold">{config.cityCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfig(c => ({ ...c, cityCount: Math.max(5, c.cityCount - 5) }))}
                  className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <Minus size={14} />
                </button>
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden">
                  <div className="h-full bg-blue-600" style={{ width: `${(config.cityCount / 50) * 100}%` }} />
                </div>
                <button
                  onClick={() => setConfig(c => ({ ...c, cityCount: Math.min(50, c.cityCount + 5) }))}
                  className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-800 my-4" />

            {/* Max Iterations */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="text-slate-600 dark:text-slate-400 font-medium">Max Iterations</label>
                <span className="text-blue-600 font-bold">{config.maxIterations}</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="50"
                value={config.maxIterations}
                onChange={(e) => setConfig({ ...config, maxIterations: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Patience */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="text-slate-600 dark:text-slate-400 font-medium">Patience</label>
                <span className="text-blue-600 font-bold">{config.patience}</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                step="10"
                value={config.patience}
                onChange={(e) => setConfig({ ...config, patience: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[10px] text-slate-400">Stop after N iterations with no improvement</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
          <div className="flex gap-3">
            <Info className="text-blue-600 shrink-0" size={20} />
            <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
              <strong>Tip:</strong> High <strong>Beta</strong> values make ants more greedy (preferring short distances), while high <strong>Alpha</strong> values make them follow the crowd (preferring strong pheromones).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
