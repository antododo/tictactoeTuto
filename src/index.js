import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// TUTO
import Web3 from 'web3';
import { isNull } from 'util';
//var web3 = new Web3(Web3.givenProvider); //To use at deployement: Metamask and Ropsten
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
      currentBet: 0,
      contract: null,
      allAccounts: [],
      XuserAccount: null,
      XuserBalance: 0,
      OuserAccount: null,
      OuserBalance: 0,
      isGameStarted: false,
      web3: web3,
    };

    //TUTO
    // Binding
    this.BuyIn = this.BuyIn.bind(this);

  }

  //TUTO
  initState(){
    // Get contract
    var contractAddress = "0xc6f05f5418a3e0fec2e63509c208b608f032b6a4";
    var contractABI = [
      {
        "constant": false,
        "inputs": [],
        "name": "BettingResult",
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
            "name": "_by",
            "type": "address"
          }
        ],
        "name": "BoardChange",
        "type": "event"
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
            "name": "_boardState",
            "type": "string"
          }
        ],
        "name": "SetBoardState",
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
        "name": "GetBoardState",
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
    .then(() =>  this.setState({
      contract: new this.state.web3.eth.Contract(contractABI, contractAddress)
    }))
    .then(() => this.GetBoardState())
    .then(() => this.GetBet())
  };

  componentDidMount(){
    this.initState()
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
}

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.SendBoardState(squares) 
    this.setState({ xIsNext: !this.state.xIsNext})    
  }

  jumpTo(step){
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }



  //TUTO
  SendBoardState(boardState){
    console.log("I'm in SendBoardState")
    let boardStateStr = "";
    for(var i = 0; i < boardState.length; i++ ){
      if(isNull(boardState[i])){
        boardStateStr += '-';
      }
      else{
        boardStateStr += boardState[i];
      }

    };
    if(this.state.xIsNext) {
      this.state.contract.methods.SetBoardState(boardStateStr).send({from: this.state.XuserAccount})
      .then(() => {this.state.contract.events.BoardChange({ filter: {_by: this.state.OuserAccount}}, () => this.GetBoardState())})
    }
    else{
      this.state.contract.methods.SetBoardState(boardStateStr).send( {from: this.state.OuserAccount})
      .then(() => {this.state.contract.events.BoardChange({ filter: {_by: this.state.XuserAccount}}, () => this.GetBoardState())})
    }
  };

  GetBoardState(){  
    const history = this.state.history;
    let newSquares = Array(9).fill(null);
    this.state.contract.methods.GetBoardState().call()
    .then((result)=>{
      //Parse the result into an array
      for(let i = 0; i < result.length; i++){
        if(result[i] !== "-"){
          newSquares[i] = result[i];
        }
      }
    })
    //Write the received board state to the history
    .then(() =>{    this.setState({
      history: history.concat([{
        squares: newSquares
      }]),
      stepNumber: history.length,
    })})
    .then(() => this.forceUpdate())
  }

  SendWinner(_winner){
    if(this.state.isGameStarted === true){
      this.setState({isGameStarted: false});
    };
    console.log("Winner is: " + _winner + ", SENDING WINNER")
    //Update new Winner
    if(_winner === 'X') {
      this.state.contract.methods.BettingResult().send({from: this.state.XuserAccount})
      .then(()=>{
        this.ShowBalances()
      })
    }
    else{
      this.state.contract.methods.BettingResult().send({from: this.state.OuserAccount})
      .then(()=>{
        this.ShowBalances()
      })
    }
    // Show current bet
    this.state.contract.methods.GetBet().call()
    .then((result)=>{
      // 1 ETH = 1000000000000000000 WEI
      this.setState({currentBet: result/1000000000000000000});
    }) 
  }

  BuyIn(){
    this.setState({isGameStarted: true, xIsNext: true});
    let bet = this.state.web3.utils.toWei('3', 'ether');
    this.state.contract.methods.BuyIn().send({from: this.state.XuserAccount, value: bet});
    this.state.contract.methods.BuyIn().send({from: this.state.OuserAccount, value: bet})
    .then(()=>{
      //Show users balances
      this.ShowBalances();
    })
    .then(() => {
      this.GetBet();
    })
    .then(() => this.SendBoardState(Array(9).fill(null)))
  }

  GetBet(){
    // Show current bet
    this.state.contract.methods.GetBet().call()
    .then((result)=>{
      // 1 ETH = 1000000000000000000 WEI
      this.setState({currentBet: result/1000000000000000000});
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
    console.log("step number is:" + this.state.stepNumber)
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

    console.log(current.squares)

    let status;
    // Workaround to prevent loop with SendWinner: && this.state.currentBet !== 0
    if (winner && this.state.currentBet !== 0) {
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
      <div>
        <div>
          <div>
            Player X address:
            <select id="XaddressSelect" value={selectedXaddress || ''} onChange={this.handleXAddressChange} disabled={this.state.isGameStarted}>
              {optionItems}
            </select>
            <br/>
            {"Player X balance: " + this.state.XuserBalance + " ETH"}
            <br/>
            Player O address:
            <select id="OaddressSelect" value={selectedOaddress || ''} onChange={this.handleOAddressChange} disabled={this.state.isGameStarted}>
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
