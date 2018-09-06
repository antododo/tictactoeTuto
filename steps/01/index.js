import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

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
    };

    // Binding
    this.BuyIn = this.BuyIn.bind(this);

  }

  componentDidMount(){
    // Setting accounts
    let accounts = ["1","2","3","4","5","6","7","8","9","10"];
    this.setState({
      allAccounts: accounts,
      XuserAccount: accounts[0],
      OuserAccount: accounts[1] 
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


  SendWinner(_winner){
    console.log("Winner is: " + _winner)
    // Shouldn't set State here because it's called from render()
    // But it's temporary before using the real function
    this.setState({currentBet: 0},
      ()=>{
        console.log("Current bet is: " + this.state.currentBet)
      }
    )
  }

  BuyIn(){
    //Reset the game
    this.jumpTo(0);
    // Set the bet
    let bet = "3";
    this.setState({currentBet: bet},
      ()=>{
        console.log("Current bet is: " + this.state.currentBet)
      }
    )
  }

  handleXAddressChange = (event) =>{
    this.setState({XuserAccount: event.target.value},
      () =>{
        console.log("User X is: " + this.state.XuserAccount)
      }
    )   
  }

  handleOAddressChange = (event) =>{
    this.setState({OuserAccount: event.target.value},
      ()=>{
        console.log("User O is: " + this.state.OuserAccount)
      }
    )
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
    // Ugly... but working
    if (winner && this.state.currentBet !== 0) { 
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
            <button onClick={this.BuyIn} disabled={this.state.currentBet !== 0}>Start Game - Both players buy in (3ETH)</button>
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
