import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// **** 03.01 ****
import Web3 from 'web3';
var web3 = new Web3("http://localhost:7545");

function Square (props) {
  return (
    <button className='square' onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare (i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render () {
    return (
      <div>
        <div className='board-row'>
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className='board-row'>
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className='board-row'>
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
      // **** 03.01 ****
      // don't forget the "," at the end of the previous line
      web3: web3,
      // **** 03.02 ****
      XuserAccount: null,
      XuserBalance: 0,
      OuserAccount: null,
      OuserBalance: 0,
    };
  }

  // **** 03.02 ****
  componentDidMount(){
    // Get accounts
    console.log("Getting players accounts")
    web3.eth.getAccounts((error, accounts) => {
      this.setState({
        XuserAccount: accounts[0],
        OuserAccount: accounts[1] 
       })
    })
    .then(()=>{
      this.ShowBalances()
    })
  }

  // **** 03.02 ****
  // Show X and O balances
  ShowBalances(){
    // Getting X user balance
    web3.eth.getBalance(this.state.XuserAccount)
    .then((result)=>{
      this.setState({
        XuserBalance: result/1000000000000000000
      })
    })
    // Getting O user balance
    web3.eth.getBalance(this.state.OuserAccount)
    .then((result)=>{
      this.setState({
        OuserBalance: result/1000000000000000000
      })
    })
    // // **** 03.03 ****
    // // Show current bet
    // this.state.contract.methods.GetBet().call()
    // .then((result)=>{
    //   // 1 ETH = 1000000000000000000 WEI
    //   this.setState({currentBet: result/1000000000000000000});
    // })
  }


  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step){
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div>
        <div className="game">
        <div className="game-board">
          <Board
          squares={current.squares}
          onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
const lines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];
for (let i = 0; i < lines.length; i++) {
  const [a, b, c] = lines[i];
  if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
    return squares[a];
  }
}
return null;
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
