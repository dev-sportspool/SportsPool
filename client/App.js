import React, { Component } from 'react'
import SimpleStorageContract from '../build/contracts/SimpleStorage.json'
import SportsPoolContract from '../build/contracts/SportsPool.json'
import getWeb3 from './utils/getWeb3'

/* import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css' 
import './App.css*/

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0,
      web3: null
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract')

	
	const sportsPool = contract(SportsPoolContract)
	sportsPool.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on SimpleStorage.
    var simpleStorageInstance
	var sportsPoolInstance

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
    
    //sports pool contract interactions
    sportsPool.deployed().then((instance) => {
      sportsPoolInstance = instance
      return instance.addTournament({from: accounts[0]});
     }).then((result) => {
        //console.log("Result:"+JSON.stringify(result));
      return this.setState({ poolInfo:  JSON.stringify(result) })
    })
	  
	  
    })
	
  }

  render() {
    return (
      <div>

        <main>
          <div>
            <div>
              <h1>Available Tournaments!</h1>
			  <p>The pool details: {this.state.poolInfo}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
