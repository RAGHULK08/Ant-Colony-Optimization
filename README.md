# Ant Colony Optimization (ACO) Simulator 🐜

**Ant Colony Optimization (ACO)** is a probabilistic algorithm inspired by the foraging behavior of real ants. To find optimal paths through graphs, artificial ants navigate a problem space and deposit virtual **pheromones** on successful routes. Over time, the strongest pheromone trails guide the entire swarm to the most efficient solutions.

This project is an interactive web-based simulator built to demonstrate how the ACO algorithm works in real-time, accompanied by theoretical explanations and code references.

## 🌟 Features

* **Interactive Simulator:** Visualize how ants traverse a graph, lay pheromones, and eventually converge on the shortest path.
* **Theory Section:** Understand the mathematical models and biological inspiration behind the algorithm.
* **Python Reference:** View the equivalent Python code for implementing the ACO algorithm.

## 🛠️ Tech Stack

* **Frontend Framework:** React 
* **Build Tool:** Vite
* **Language:** TypeScript
* **Styling/UI:** CSS / Utility classes (via `lib/utils.ts`)

## 📂 Project Structure

```text
ant-colony-optimization/
├── src/
│   ├── components/
│   │   ├── ACOSimulator.tsx    # The core interactive simulation component
│   │   ├── PythonCode.tsx      # Displays the Python implementation reference
│   │   └── TheorySection.tsx   # Contains the theoretical background of ACO
│   ├── lib/
│   │   └── utils.ts            # Utility functions 
│   ├── App.tsx                 # Main application layout
│   ├── main.tsx                # Application entry point
│   └── index.css               # Global styles
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

🚀 Getting Started
To run this project locally on your machine, follow these steps:

Prerequisites
Make sure you have Node.js installed on your computer.

Installation
Clone the repository (if you have uploaded it to GitHub):

Bash
git clone [https://github.com/your-username/ant-colony-optimization.git](https://github.com/your-username/ant-colony-optimization.git)
cd ant-colony-optimization
Install the dependencies:

Bash
npm install
Start the development server:

Bash
npm run dev
View the app: Open your browser and navigate to http://localhost:5173 (or the port specified in your terminal).

🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

📝 License
This project is open-source and available under the MIT License.


**Tips for finalizing your README:**
* If you decide to add a license, remember to create a `LICENSE` file and change the `[MIT License](LICENSE)` link if necessary.
* Replace `your-username` in the `git clone` link with your actual GitHub username once you've published the repository.
