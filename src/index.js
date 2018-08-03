import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// TUTO
import Web3 from 'web3';
//var web3 = new Web3(Web3.givenProvider || "http://localhost:8545"); //To use at deployement: Metamask and Ropsten
var web3 = new Web3("http://localhost:8545"); //To during dev.: use with Ganache

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
      //TUTO
      contract: null,
      userAccount: null,
      web3: web3
    };

    //TUTO
    // Binding
    this.SendWinner = this.SendWinner.bind(this);
    this.BetOn = this.BetOn.bind(this);

  }

  //TUTO
  componentDidMount(){

    // Get accounts
    console.log("Getting user account")
    web3.eth.getAccounts((error, accounts) => {
      // Update state with the result.
      this.setState({userAccount: accounts[0] })
      console.log("user account is: "+ this.state.userAccount)
    })
    .then(()=>{
      // Getting user balance
      web3.eth.getBalance(this.state.userAccount)
      .then((result)=>{
        console.log("user balance is: " +result)
      })
    })

    // Get contract
    var contractAddress = "0xc6f05f5418a3e0fec2e63509c208b608f032b6a4";
    var contractABI = [
      {
        "constant": false,
        "inputs": [
          {
            "name": "_betWinner",
            "type": "string"
          }
        ],
        "name": "BetOn",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [],
        "name": "BettingResult",
        "outputs": [],
        "payable": false,
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_newWinner",
            "type": "string"
          }
        ],
        "name": "SetWinner",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "constructor"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "GetBet",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "GetWinner",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      }
    ]


    this.setState({
      contract: new this.state.web3.eth.Contract(contractABI, contractAddress)
    })
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

  //TUTO
  SendWinner(_winner){
    console.log("SENDING WINNER")
    //Update new Winner
    this.state.contract.methods.SetWinner(_winner).send({from: this.state.userAccount})
    this.state.contract.methods.BettingResult().send({from: this.state.userAccount})

  }

  //TUTO
  BetOn(){
    let bet = this.state.web3.utils.toWei('3', 'ether');
    this.state.contract.methods.BetOn("X").send({from: this.state.userAccount, value: bet})
  }

  BuyIn(){
    let bet = this.state.web3.utils.toWei('3', 'ether');
    this.state.contract.methods.BuyIn().send({from: this.state.userAccount, value: bet})
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
      //TUTO
      this.SendWinner(winner)
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div>
          <button onClick={this.BuyIn}>Buy in (3ETH)</button>
        </div>
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
