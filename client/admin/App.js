import React, { Component } from 'react'
import SportsPoolContract from '../../build/contracts/SportsPool.json'
import getWeb3 from '../utils/getWeb3'
import AddTournament from './AddTournament'
import AddTeam from './AddTeam'
import AddMatch from './AddMatch'
import AddCredentials from './AddCredentials'

import '../css/oswald.css'
import '../css/open-sans.css'
import '../css/pure-min.css' 
import '../css/App.css'

import NavBar from '../utils/NavBar'
import Card from '../utils/Card'

class App extends Component {
  constructor(props) {
    super(props)
	this.state = {
		username:null,
		password:null,
		web3: null,
		accounts: null,
		contract: null
	}
  }
  
  instantiateContract() {
        const contract = require('truffle-contract')

        const sportsPool = contract(SportsPoolContract)
        sportsPool.setProvider(this.state.web3.currentProvider)

        var sportsPoolInstance

        this.state.web3.eth.getAccounts((error, accounts) => {
            this.setState({
                accounts: accounts
            });
            sportsPool.deployed().then((instance) => {
                sportsPoolInstance = instance
                this.setState({
                    contract: sportsPoolInstance
                });
                /*
					The .Watch() works, BUT for latest block and as new block created
                
                sportsPoolInstance.TournamentAdded()
                    .watch((error, result) => {
                        console.log("got alert!");
                        if (!error) {
                            console.log("event success:" + result);
                            alert("Event+"+ JSON.stringify(result));
                        } else {
                            alert("error");
                        }
                    });*/
            })
        })
    }

componentWillMount() {
	getWeb3
		.then(results => {
			this.setState({
				web3: results.web3
			})
			this.instantiateContract()
		})
		.catch(() => {
			console.log('Error finding web3.')
		})
}
  
  componentDidMount() {

  }
  
  onLogin(uname,pword){
	  //todo: validate with api call?
	this.setState((prevState, props) => ({
		username: uname,
		password:pword,
	}));
  }
    
  render() {
	  let content = null;
	  if(this.state.username!=null && this.state.password!=null){
		  content = (	
		  <div>
			  <Card title = {"Add new Tournament"}
					content = {<AddTournament 
									username = {this.state.username} 
									password = {this.state.password}
									account = {this.state.accounts[0]}
									contract = {this.state.contract}/>}/>
			  <Card title = {"Add new Team"}
					content = {<AddTeam 
									username = {this.state.username} 
									password = {this.state.password}
									account = {this.state.accounts[0]}
									contract = {this.state.contract}/>}/>
			  <Card title = {"Add new Match"}
			  content = {<AddMatch 
									username = {this.state.username} 
									password = {this.state.password}
									account = {this.state.accounts[0]}
									contract = {this.state.contract}/>}/>
		  </div>
		  );
	  }else{
		  content = <Card title = {"Login"}
				content ={<AddCredentials onLogin = {this.onLogin.bind(this)}/>}/>
	  }
    return (
		<div>
			<NavBar/>
			{content}
		</div>
    );
  } 
}

export default App
