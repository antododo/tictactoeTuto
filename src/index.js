import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
//  **** 03 ****
import Web3 from 'web3';
//Ganache's port is 7545 by default
var web3 = new Web3("http://localhost:7545"); 

function Square (props) {
  return (
    <button className='square' onClick={props.onClick} disabled={props.disabled} >
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
        disabled={this.props.disabled}
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
      currentBet: 0,
      allAccounts: [],
      XuserAccount: null,
      XuserBalance: 0,
      OuserAccount: null,
      OuserBalance: 0,
      // **** 03.01 ****
      web3: web3,
      contract: null,
    };

    // Binding
    this.BuyIn = this.BuyIn.bind(this);
  }

  componentDidMount(){

    // **** 03.02 ****
    // Get contract
    var contractAddress = "0x8cdaf0cd259887258bc13a92c0a6da92698644c0";
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
        "inputs": [],
        "name": "IfWinner",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
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
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "winner",
            "type": "address"
          }
        ],
        "name": "Winner",
        "type": "event"
      }
    ]

    var contract = new this.state.web3.eth.Contract(contractABI, contractAddress)

    // **** 03.02 ****
    this.setState({contract: contract})

    // **** 04.01 ****
    // Setting accounts
    web3.eth.getAccounts((error, accounts) => {
      // do something after getting the accounts
      this.setState({
        allAccounts: accounts,
        XuserAccount: accounts[0],
        OuserAccount: accounts[1] 
       })
    })
    // **** 04.02 ****
    // Afer getting accounts, update balances
    .then(()=>{
      this.ShowBalances()
    })

    contract.events.Winner((err, result) =>{
      if (err) {
        console.log(err);
      }
      if(result)
      {
        console.log("Solidity event - Winner is: " + result.args.winner);
      }
    });
  }

  // **** 04.02 ****
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

  // **** 05.01 ****
  handleXAddressChange = (event) =>{
    this.setState({XuserAccount: event.target.value},
      () => {
        this.ShowBalances()
      }
    )
  }

  // **** 05.01 ****
  handleOAddressChange = (event) =>{
    this.setState({OuserAccount: event.target.value},
      () => {
        this.ShowBalances()
      }
    )
  }

  // **** 05.02 ****
  BuyIn(){
    //Reset the game
    this.jumpTo(0);
    // Set the bet
    let bet = this.state.web3.utils.toWei('3', 'ether');
    this.state.contract.methods.BuyIn().send({from: this.state.XuserAccount, value: bet})
    this.state.contract.methods.BuyIn().send({from: this.state.OuserAccount, value: bet})
    .then(()=>{
      this.ShowBalances();
    })
  }

  // **** 05.03 *****
  IfWinner(_winner){
    console.log("Winner is: " + _winner)
    if(_winner === 'X') {
      this.state.contract.methods.IfWinner().send({from: this.state.XuserAccount})
      .then(()=>{
        this.ShowBalances()
      })
    }
    else{
      this.state.contract.methods.IfWinner().send({from: this.state.OuserAccount})
      .then(()=>{
        this.ShowBalances()
      })
    } 
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
    // Workaround to prevent loop with IfWinner: && this.state.currentBet !== 0
    // Ugly... but working
    if (winner && this.state.currentBet !== 0) {    
      this.IfWinner(winner)
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
            <button onClick={this.BuyIn} disabled={this.state.currentBet !== 0}>Both players buy in (3ETH)</button>
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
          disabled={this.state.currentBet === 0}
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
