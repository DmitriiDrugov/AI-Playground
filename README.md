# AI Playground: Perceptron & Maze Solver 🎓🤖

This interactive project combines two classic AI visualizations in a single F# + Fable application:

## 🔵 Perceptron Mode

A visual tool for understanding how a simple neural unit (perceptron) learns to classify 2D points.

- Add red or blue points to the canvas
- Train the perceptron to adjust weights and bias
- See the live-updated decision boundary
- Background gradient shows classification confidence
- View real-time confusion matrix and learning logs

## 🧩 Maze Mode

An intelligent agent uses Breadth-First Search (BFS) to solve a procedurally generated maze.

- Each maze is unique and guaranteed to be solvable
- Start and goal are placed as far apart as possible
- Click **Train** to watch the agent animate through the path
- Click **Reset** to regenerate a new maze (only if the previous was solved)

## 🚀 Tech Stack

- **F# + Fable** (transpiles to JS)
- **HTML Canvas** for rendering
- **Tailwind CSS** for styling
- No backend, fully frontend and interactive

## 📦 How to Run

```bash
git clone https://github.com/yourname/ai-playground-fsharp.git
cd ai-playground-fsharp
npm install
npm run dev
