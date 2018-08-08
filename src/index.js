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
      allAccounts: [],
      userAccount: null,
      XuserAccount: null,
      OuserAccount: null,
      web3: web3
    };

    //TUTO
    // Binding
    this.SendWinner = this.SendWinner.bind(this);
    this.BetOn = this.BetOn.bind(this);
    this.BuyIn = this.BuyIn.bind(this);

  }

  //TUTO
  componentDidMount(){

    // Get accounts
    console.log("Getting user accounts")
    web3.eth.getAccounts((error, accounts) => {
      // Update state with the result.
      this.setState({allAccounts: accounts})
      this.setState({userAccount: accounts[0] })
      console.log("user account is: "+ this.state.userAccount)
      this.setState({XuserAccount: accounts[0] })
      console.log("X user account is: "+ this.state.XuserAccount)
      this.setState({OuserAccount: accounts[1] })
      console.log("O user account is: "+ this.state.OuserAccount)
    })
    .then(()=>{
      // Getting X user balance
      web3.eth.getBalance(this.state.XuserAccount)
      .then((result)=>{
        console.log("X user balance is: " + result)
      })
    })

    // Get contract
    var contractAddress = "0x3c9036fc5f3cbb75ceefee5a888fcf1a3d1f842e";
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
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [],
        "name": "BuyIn",
        "outputs": [],
        "payable": true,
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
    console.log("Winner is: " + _winner + ", SENDING WINNER")
    //Update new Winner
    if(_winner === 'X') {
      this.state.contract.methods.SetWinner(_winner).send({from: this.state.XuserAccount})
      this.state.contract.methods.BettingResult().send({from: this.state.XuserAccount})
    }
    else{
      this.state.contract.methods.SetWinner(_winner).send({from: this.state.OuserAccount})
      this.state.contract.methods.BettingResult().send({from: this.state.OuserAccount})
    }
  }

  //TUTO
  BetOn(){
    let bet = this.state.web3.utils.toWei('3', 'ether');
    this.state.contract.methods.BetOn("X").send({from: this.state.userAccount, value: bet});
  }

  BuyIn(){
    let bet = this.state.web3.utils.toWei('3', 'ether');
    this.state.contract.methods.BuyIn().send({from: this.state.XuserAccount, value: bet});
    this.state.contract.methods.BuyIn().send({from: this.state.OuserAccount, value: bet});
  }

  handleXAddressChange = (event) =>{
      this.setState({XuserAccount: event.target.value});
  }

  handleOAddressChange = (event) =>{
    this.setState({OuserAccount: event.target.value});
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
    
    let optionItems = this.state.allAccounts.map((account) =>
    <option key={account}>{account}</option>
    );

    let selectedXaddress = this.state.XuserAccount;
    let selectedOaddress = this.state.OuserAccount;

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
          <div>
            {"X: "}
            <select id="XaddressSelect" value={selectedXaddress} onChange={this.handleXAddressChange} >
              {optionItems}
            </select>
          </div>
          <div>
            {"0: "}
            <select id="OaddressSelect" value={selectedOaddress} onChange={this.handleOAddressChange}>
              {optionItems}
            </select>
          </div>
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
