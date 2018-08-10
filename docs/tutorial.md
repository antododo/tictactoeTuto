# Guide étape par étape pour la création d'un jeu blockchain

## 01 - Faire marcher le jeu sans Solidity 
Pour obtenir la version de base du jeu Tic Tac Toe
-clone repo: git clone ***
-npm install
-npm start


## 02 - Rajouter le contrat Solidity avec Remix

### 02.01 Écrire le code
Aller sur http://remix.ethereum.org et écrire le code qui se trouve dans le fichier contract.sol
### 02.02 Lancer Ganache
lancer simplement Ganache et vérifier que le RPC server est bien HTTP://127.0.0.1:7545

### 02.03 Connecter Remix à Ganache
Dans l'onglet Run de Remix, choisir comme environnement : Web3 Provider et changer pour http://localhost:7545 qui correspond au port de Ganache

### 02.04 Déployer le contrat
Dans Remix, Déployer le contrat en appuyant sur [Deploy].

**IMPORTANT** ne pas fermer la page avec Remix

## 03 - Rajouter Web3

### 03.01 - import web3
installer web3 avec npm :
`npm i  web3@1.0.0-beta.34`
**TODO** Changer pour la dernière version de web3 beta.35 ??

Importer web3 et créer une variable web3.
```
import Web3 from 'web3';
var web3 = new Web3("http://localhost:7545");
```
Ajouter web3 à this.state
`web3: web3,`
Ne pas oublier de rajouter "," à la fin de la ligne précédente

### 03.02 - Get accounts
Ajouter à this.state 
```
XuserAccount: null,
XuserBalance: 0,
OuserAccount: null,
OuserBalance: 0,
```

Créer une fonction componentDidMount(){}, cette fonction est exécutée une fois que l'application est prête.

```
  componentDidMount(){
    // Get accounts
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
```


### 04 Créer le contrat 
		- Récupérer l’adresse du contrat et l'ABI

		ABI
		adresse 
	This.state

GetBet

##Rajouter les fonctions web3 au jeu 
	Ecrire la fonction send winner + rajouter if winner 
	Ecrire la fonction Bet on + rajouter le bouton 


