import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// TUTO
import Web3 from 'web3';
//var web3 = new Web3(Web3.givenProvider || "http://localhost:7545"); //To use at deployement: Metamask and Ropsten
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
      contractTransactionPending: false,
      //TUTO
      currentBet: 0,
      contract: null,
      allAccounts: [],
      XuserAccount: null,
      XuserBalance: 0,
      OuserAccount: null,
      OuserBalance: 0,
      web3: web3,
    };

    //TUTO
    // Binding
    this.BuyIn = this.BuyIn.bind(this);

  }

  //TUTO
  componentDidMount(){
    // Get accounts
    console.log("Getting players accounts")
    web3.eth.getAccounts((error, accounts) => {
      this.setState({
        allAccounts: accounts,
        XuserAccount: accounts[0],
        OuserAccount: accounts[1] 
       })
    })
    .then(()=>{
      this.ShowBalances()
    })

    // Get contract
    var contractAddress = "0xc6f05f5418a3e0fec2e63509c208b608f032b6a4";
    var contractABI = [
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
            "name": "_isX",
            "type": "bool"
          }
        ],
        "name": "ClaimBet",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_winnerAddress",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "_loserAddress",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "_gameIndex",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "_betAmount",
            "type": "uint256"
          }
        ],
        "name": "WinnerIs",
        "type": "event"
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
    // Show current bet
    this.state.contract.methods.GetBet().call()
    .then((result)=>{
      // 1 ETH = 1000000000000000000 WEI
      this.setState({currentBet: result/1000000000000000000});
    })
}

  //TUTO
  SendWinner(_winner, _contractTransactionPending){
    console.log("Inside SendWinner()!")
    console.log("Winner is: " + _winner + ", SENDING WINNER")
      if(_winner === 'X') {
        this.state.contract.methods.ClaimBet(true).send({from: this.state.XuserAccount, gasLimit: "300000"})
        .then(()=>{
          this.ShowBalances()
        })
      }
      else{
        this.state.contract.methods.ClaimBet(false).send({from: this.state.OuserAccount, gasLimit: "300000"})
        .then(()=>{
          this.ShowBalances()
        })
      }   
  }
    //Update new Winner


  BuyIn(){
    let bet = this.state.web3.utils.toWei('3', 'ether');
    //IMPORTANT: You need to specify a gas limit otherwise ganache tops it at 90000 gas by default.
    //When saving the address of the players, BuyIn() uses more then 100K of gaz.
    this.state.contract.methods.BuyIn().send({from: this.state.XuserAccount, value: bet, gasLimit: "300000"});
    this.state.contract.methods.BuyIn().send({from: this.state.OuserAccount, value: bet, gasLimit: "300000"})
    .then(()=>{
      //Show users balances
      this.ShowBalances();
    })
  }

  handleXAddressChange = (event) =>{
    this.setState({XuserAccount: event.target.value}, () => {
      this.ShowBalances();
  });
  }

  handleOAddressChange = (event) =>{
    this.setState({OuserAccount: event.target.value}, () => {
    this.ShowBalances();
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
    // Workaround to prevent loop with SendWinner: && this.state.currentBet !== 0
    if (winner && this.state.currentBet !== 0) {
      //TUTO
      status = 'Winner: ' + winner;
      this.SendWinner(winner);
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }
    
    let optionItems = this.state.allAccounts.map((account) =>
    <option key={account}>{account}</option>
    );

    let selectedXaddress = this.state.XuserAccount;
    let selectedOaddress = this.state.OuserAccount;

    return (
      <div>
        <div>
          <div>
            Player X address:
            <select id="XaddressSelect" value={selectedXaddress || ''} onChange={this.handleXAddressChange} disabled={this.state.currentBet !== 0}>
              {optionItems}
            </select>
            <br/>
            {"Player X balance: " + this.state.XuserBalance + " ETH"}
            <br/>
            Player O address:
            <select id="OaddressSelect" value={selectedOaddress || ''} onChange={this.handleOAddressChange} disabled={this.state.currentBet !== 0}>
              {optionItems}
            </select>
            <br/>
            {"Player O balance: " + this.state.OuserBalance + " ETH"}
            <br/>
            <button onClick={this.BuyIn}>Both players buy in (3ETH)</button>
            <br/>
            {"Current bet: " + this.state.currentBet + " ETH"}
          </div>
          <br/>
        </div>
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
