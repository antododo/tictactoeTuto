# Guide étape par étape pour la création d'un jeu blockchain

## 01 - Faire marcher le jeu sans Solidity 
Référez-vous au document d'installation pour installer les outils nécessaires et avoir le code source de base du jeu Tic Tac Toe.
Pour démarrer et tester le jeu : `npm start`

## 02 - Rajouter le contrat Solidity avec Remix

### 02.01 Écrire le code
Nous allons écrire le code du contrat Ethereum sur [http://remix.ethereum.org](http://remix.ethereum.org)
le code que nous allons écrire se trouve dans le fichier contract.sol
Le code est commenté pour expliquer les étapes.

### 02.02 Lancer Ganache
lancer simplement Ganache et vérifier que le RPC server est bien HTTP://127.0.0.1:7545

### 02.03 Connecter Remix à Ganache
Dans l'onglet Run de Remix, choisir comme environnement : Web3 Provider et changer pour http://localhost:7545 qui correspond au port de Ganache

### 02.04 Déployer le contrat
Dans Remix, Déployer le contrat en appuyant sur [Deploy].

**IMPORTANT** ne pas fermer la page avec Remix

## 03 - Rajouter Web3 et le contrat 

### 03.01 - import web3
installer web3 avec npm :
`npm i  web3@1.0.0-beta.34`
<!-- Changer pour la dernière version de web3 beta.35 ?? -->

Importer web3 et créer une variable web3 à coté des autres imports
`import Web3 from 'web3';`
`var web3 = new Web3("http://localhost:7545");`
Dans le constructor de Game, ajouter web3 et un contract null à this.state
`web3: web3,`
et 
`contract: null,`

### 03.02 - Créer le contrat 
Nous allons retourner dans Remix de notre navigateur internet.
Dans l'onglet Run, dans la section Deployed Contracts, cliquer sur l'icone 'Copy value to clipboard' à droite du nom du contract.
Au début de la fonction componentDidMount(), écrire
`var contractAddress = "PASTE_HERE";`
en remplaçant PASTE_HERE par la valeur copiée dans Remix.

Retournez dans remix, et allez l'onglet Compile, cliquer sur [Details] à coté du nom de notre contrat, trouver la section ABI et cliquer sur le logo 'Copy value to clipboard'. 
À la suite, écrire : 
`var contractABI = PASTE_HERE`
en remplaçant PASTE_HERE par la valeur copiée dans Remix.

Ensuite, nous allons mettre à jour notre State avec ce contrat:
```
this.setState({
  contract: new this.state.web3.eth.Contract(contractABI, contractAddress)
})
```


## 04 - Afficher les comptes et le Bet

### 04.01 - Récupérer les comptes
Modifier la fonction componentDidMount(){} (cette fonction est exécutée une fois que l'application est prête.)
Au lieu d'avoir une liste de compte définie par défaut, nous allons récupérer les comptes ETH avec web3.

remplacer 
`let accounts = ["1","2","3","4","5","6","7","8","9","10"];`
par 
```
web3.eth.getAccounts((error, accounts) => {
   // do something after getting the accounts
   // CUT_PASTE_HERE 
})
```
then, cut and paste 
```
this.setState({
  allAccounts: accounts,
  XuserAccount: accounts[0],
  OuserAccount: accounts[1] 
  })
```
instead of ` // CUT_PASTE_HERE `


### 04.02 - Affichage
Après avoir obtenu les comptes, nous allons vouloir mettre les mettre à jour, pour cela, nous allons créer la fonction: ShowBalances()

Juste après la fonction précédante qui obtient les comptes :
```
.then(()=>{
    this.ShowBalances()
  })
```
ShowBalances() n'hésite pas encore, nous allons la créer en juste après omponentDidMount()
```
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
```
Cette fonction utilise une fonction par défaut de web3 pour obtenir la balance de chaque utilisateur et fait appelle à la fonction GetBet() de notre contrat pour obtenir le montant de Bet.


## 05 - Modifier les fonctions pour communiquer avec la blockchain 

### 05.01 - Mettre à jour les addresse des joueurs X et O
Quand on choisi le compte correspondant pour le joueur X, il faut mettre à jour l'interface avec ShowBalance().
Pour cela, simplement remplacer :
`console.log("User X is: " + this.state.XuserAccount)`
par 
`this.ShowBalances()`
Idem pour le joueur O.

### 05.02 - Mettre à jour la fonction BuyIn()
Les smart contract ETH fonctionnent avec des valeurs en Wei.
<!-- (1 ETH = 1000000000000000000 Wei) -->
Nous allons donc convertir 3 ETH en Wei en remplaçant la précédente définition de bet :
`let bet = this.state.web3.utils.toWei('3', 'ether');`
Ensuite nous allons appeler la fonction du smart contract BuyIn() pour les joueurs X et O.
```
this.state.contract.methods.BuyIn().send({from: this.state.XuserAccount, value: bet})
this.state.contract.methods.BuyIn().send({from: this.state.OuserAccount, value: bet})

```

Et pour finir nous affichons les données reçus avec ShowBalances().
```
.then(()=>{
  this.ShowBalances();
})
```
### 05.03 - Mettre à jour la fonction IfWinner()
S'il y a un vainqueur, nous appelons la fonction IfWinner() de notre smart contract à partir de l'adresse du vainqueur.
Supprimer l'ensemble du corps de la fonction IfWinner() et remplaçer par:
```
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
```
