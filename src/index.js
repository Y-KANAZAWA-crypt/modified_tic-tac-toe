import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

const SIZE_OF_COLUMN = 3;
const SIZE_OF_ROW = 3;
const Turn = { X: "X", O: "O" };

function Square(props) {
  return (
    <button
      className={
        "square" +
        (props.value === Turn.X ? " X" : " O") +
        (props.isHighlight ? " highlight" : "") +
        " blink"
      }
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  handleClick(i) {
    const squares = this.state.squares.slice();
    if (calculateWinner(squares).player || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? Turn.X : Turn.O;
    this.setState({
      squares: squares,
      xIsNext: !this.state.xIsNext
    });
  }

  renderSquare(i, isHighlight) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        key={i}
        isHighlight={isHighlight}
      />
    );
  }

  // ゲーム盤の描画
  // 2重ループの使用
  render() {
    const rows = [];

    for (let row = 0; row < SIZE_OF_ROW; row++) {
      const squares = [];
      let isHighlight = null;

      for (let col = 0; col < SIZE_OF_COLUMN; col++) {
        isHighlight = this.props.causeOfWin.includes(
          row * SIZE_OF_COLUMN + col
        );
        squares[col] = this.renderSquare(
          row * SIZE_OF_COLUMN + col,
          isHighlight
        );
      }
      rows.push(
        <div className="board-row" key={row}>
          {squares}
        </div>
      );
    }
    return <div>{rows}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          // squares: Array(9).fill(null)
          squares: Array(SIZE_OF_COLUMN * SIZE_OF_ROW).fill(null),
          // 座標
          point: {
            col: null,
            row: null
          }
        }
      ],
      stepNumber: 0,
      xIsNext: true // 初期手番 X
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const winner = calculateWinner(squares);

    if (winner.player || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? Turn.X : Turn.O;
    this.setState({
      history: history.concat([
        {
          squares: squares,
          point: {
            col: i % SIZE_OF_COLUMN,
            row: Math.trunc(i / SIZE_OF_ROW)
          }
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext // 手番の入れ替え
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move
        ? "Go to move #" +
          move +
          " (" +
          step.point.col +
          ", " +
          step.point.row +
          ")"
        : "Go to game start";
      return (
        <li key={move}>
          <button
            onClick={() => this.jumpTo(move)}
            className={move === this.state.stepNumber ? "text-bold_900" : ""}
          >
            {desc}
          </button>
        </li>
      );
    });

    let status;
    if (winner.player) {
      status = "Winner; " + winner.player;
    } else if (!current.squares.includes(null)) {
      status = "Draw";
    } else {
      status = "Next player: " + (this.state.xIsNext ? Turn.X : Turn.O);
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={i => this.handleClick(i)}
            causeOfWin={winner.causeOfWin}
          />
        </div>
        <div className="game-info">
          <div className={status === "Draw" ? "text-blink" : ""}>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  const winner = {
    player: null,
    causeOfWin: [null]
  };

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      winner.player = squares[a];
      winner.causeOfWin = lines[i];
      return winner;
    }
  }
  return winner;
}
