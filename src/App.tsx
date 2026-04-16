import { useState } from 'react';
import { BookOpen, Code2, PlayCircle, GraduationCap, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ACOSimulator from './components/ACOSimulator';
import TheorySection from './components/TheorySection';
import PythonCode from './components/PythonCode';
import { cn } from './lib/utils';

type Tab = 'simulation' | 'theory' | 'code';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('simulation');

  const tabs = [
    { id: 'simulation', label: 'Interactive Simulation', icon: PlayCircle },
    { id: 'theory', label: 'Theoretical Foundation', icon: BookOpen },
    { id: 'code', label: 'Python Implementation', icon: Code2 },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Soft Computing Techniques</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Ant Colony Optimization Project</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>

        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Nav */}
        <div className="md:hidden flex overflow-x-auto gap-2 pb-4 mb-4 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all shrink-0",
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'simulation' && (
              <section className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">TSP Solver Simulator</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Observe how artificial ants find the shortest path through a set of cities.</p>
                  </div>
                </div>
                <ACOSimulator />
              </section>
            )}

            {activeTab === 'theory' && (
              <section className="max-w-4xl mx-auto">
                <TheorySection />
              </section>
            )}

            {activeTab === 'code' && (
              <section className="max-w-5xl mx-auto space-y-6">
                <PythonCode />
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; 2026 Soft Computing Techniques. Developed for educational purposes.
          </p>
          <div className="mt-4 flex justify-center gap-6 text-xs font-medium text-slate-400 uppercase tracking-widest">
            <span>Ant Colony Optimization</span>
            <span>Genetic Algorithms</span>
            <span>Fuzzy Logic</span>
            <span>Neural Networks</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
