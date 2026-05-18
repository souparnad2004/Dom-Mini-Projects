import { useState } from "react";

const emptyBoard = Array(9).fill(null);

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function App() {
  const [board, setBoard] = useState(emptyBoard);
  const [turn, setTurn] = useState("X");
  const [clickable, setClickable] = useState(false);
  const [scores, setScores] = useState({
    X: 0,
    O: 0,
    Draw: 0,
  });
  const [winline, setWinline] = useState([]);
  const [statusText, setStatusText] = useState(`Player ${turn}'s turn`);

  const boxClickHandler = (index) => {
    if (board[index] || clickable) return;

    const newBoard = [...board];
    newBoard[index] = turn;

    setBoard(newBoard);

    const win = winner(newBoard);

    if(win) return;

    const isDraw = draw(newBoard);
    if(isDraw) return;

    const nextTurn = turn === "X" ? "O" : "X";
    setTurn(nextTurn);
    setStatusText(`Player ${nextTurn}'s turn`);
  };

  const reset = () => {
    setBoard(emptyBoard);
    setClickable(false);
    setWinline([]);
    setScores({
    X: 0,
    O: 0,
    Draw: 0,
  })
    setTurn("X");
    setStatusText(`Player X's turn`);
  };

  const newRound = () => {
    setBoard(emptyBoard);
    setClickable(false);
    setWinline([]);
  };

  const winner = (currentBoard) => {
    for (let i = 0; i < winningLines.length; i++) {
      const [a, b, c] = winningLines[i];

      if (
        currentBoard[a] &&
        currentBoard[a] === currentBoard[b] &&
        currentBoard[b] === currentBoard[c]
      ) {
        setScores((prev) => ({
          ...prev,
          [currentBoard[a]]: prev[currentBoard[a]] + 1,
        }));

        setStatusText(`${currentBoard[a]} wins`);
        setClickable(true);
        setWinline([a, b, c]);

        return true;
      }
    }

    return false;
  };

  const draw = (currentBoard) => {
    if (currentBoard.includes(null)) return false;
    if (clickable) return false;

    setScores((prev) => ({
      ...prev,
      Draw: prev.Draw + 1,
    }));

    setStatusText("Draw");
    setClickable(true);
    return true;
  };

  return (
    <main className="min-h-screen bg-[#15161d] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <section className="grid w-full gap-8 rounded-4xl border border-white/10 bg-[#20212b]/90 p-5 shadow-2xl shadow-black/30 backdrop-blur sm:p-8 lg:grid-cols-[0.9fr_1.1fr]">
          {/* LEFT PANEL */}
          <div className="flex flex-col justify-between gap-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
                Tic Tac Toe
              </p>
              <h1 className="mt-4 text-4xl font-black leading-tight text-white sm:text-5xl">
                Your next move decides the board.
              </h1>
              <p className="mt-4 max-w-md text-base leading-7 text-slate-300">
                A cleaner, brighter classic for quick rounds between X and O.
              </p>
            </div>

            {/* SCORES */}
            <h2 className="text-center text-2xl font-bold">Score Board</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                ["X", scores.X, "text-cyan-200"],
                ["Draw", scores.Draw, "text-slate-200"],
                ["O", scores.O, "text-rose-200"],
              ].map(([label, value, color]) => (
                <div
                  className="rounded-2xl border border-white/10 bg-white/6 p-4 text-center"
                  key={label}
                >
                  <p className={`text-2xl font-black ${color}`}>{value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="rounded-3xl border border-white/10 bg-[#161720] p-4 shadow-xl shadow-black/25 sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Status</p>
                <p className="text-2xl font-black text-white">{statusText}</p>
              </div>

              <div className="flex gap-2">
                <button
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-slate-200"
                  type="button"
                  onClick={newRound}
                >
                  New round
                </button>
                <button
                  className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950"
                  type="button"
                  onClick={reset}
                >
                  Reset
                </button>
              </div>
            </div>

            {/* BOARD */}
            <div className="grid aspect-square grid-cols-3 gap-3">
              {board.map((cell, index) => (
                <button
                  key={index}
                  disabled={clickable}
                  type="button"
                  className={`flex aspect-square items-center justify-center rounded-2xl border text-5xl font-black shadow-lg transition sm:text-6xl border-white/10 text-white shadow-black/20 ${
                    winline?.includes(index)
                      ? "bg-emerald-400"
                      : "bg-white/[0.07]"
                  }`}
                  onClick={() => boxClickHandler(index)}
                >
                  {cell}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
