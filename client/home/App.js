import React, { Component } from 'react'
import SportsPoolContract from '../../build/contracts/SportsPool.json'
import getWeb3 from '../utils/getWeb3'

import '../css/oswald.css'
import '../css/open-sans.css'
import '../css/pure-min.css' 
import '../css/App.css'

import MetaMaskContainer from '../utils/MetaMaskContainer'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null,
	  tournaments: null
    }
  }
  componentDidMount() {
    this.getTournaments();
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    /* getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    }) */
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    /* const contract = require('truffle-contract')

	
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
	  
	  
    }) */
	
  }
  
  getTournaments(){
	  this.setState((prevState, props) => ({
		  tournaments: null
		}));
	  $.getJSON('/tournaments')
      .then((results) =>{
		this.setState((prevState, props) => ({
		  tournaments: results
		}));
	  });
  }

  render() {
	  var tournaments;
	  if(this.state.tournaments!=null){
		   tournaments= this.state.tournaments.map((tournament, i )=>(
			   <div key={tournament._id}>
				{i}) {tournament.name},
			   </div>
		  ));
	  }
	  tournaments = tournaments==null?"LOADING...":tournaments;
    return (
      <div>
	  <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Home</a>
			<a href="/swag" className="pure-menu-heading pure-menu-link">Swag Page</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
				<MetaMaskContainer>
				  <h1>Available Tournaments!</h1>
				  {tournaments}
				</MetaMaskContainer>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
