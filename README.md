# AI Playground: Perceptron & Maze Solver 🎓🤖

This interactive project combines two classic AI visualizations in a single F# + Fable application:


TRY-LIVE link - https://dmitriidrugov.github.io/AI-Playground/

## 🔵 Perceptron Mode

A visual tool for understanding how a simple neural unit (perceptron) learns to classify 2D points.

- Add red or blue points to the canvas
- Train the perceptron to adjust weights and bias
- See the live-updated decision boundary
- Background gradient shows classification confidence
- View real-time confusion matrix and learning logs

  ![{E1DCE26B-B0F6-4AF6-8A7E-8B011E40C39B}](https://github.com/user-attachments/assets/d9e39015-985b-4d9c-963c-0456de845359)


## 🧩 Maze Mode

An intelligent agent uses Breadth-First Search (BFS) to solve a procedurally generated maze.

- Each maze is unique and guaranteed to be solvable
- Start and goal are placed as far apart as possible
- Click **Train** to watch the agent animate through the path
- Click **Reset** to regenerate a new maze (only if the previous was solved)

![{0324AB30-F030-499F-9E1A-F58253CB9586}](https://github.com/user-attachments/assets/2bc3df54-129d-467b-b178-5c1b2532de02)


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
