import React, { Component } from 'react'
import getWeb3 from '../utils/getWeb3'
import AddTournament from './AddTournament'
import AddTeam from './AddTeam'
import AddMatch from './AddMatch'
import AddCredentials from './AddCredentials'

import '../css/oswald.css'
import '../css/open-sans.css'
import '../css/pure-min.css' 
import '../css/App.css'

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
  
  makeCard(heading, content){
	  return (<div className="w3-card-4 w3-margin-top"
				style={{margin: "auto", width: "50%"}}>
				<div className="w3-container w3-green">
					<h2>{heading}</h2>
				</div>
				{content}
			</div>
			);
  }
  
  render() {
	  let content = null;
	  if(this.state.username!=null && this.state.password!=null){
		  var addTournamentCard = this.makeCard("Add new Tournament",
												<AddTournament 
														username = {this.state.username} 
														password = {this.state.password}/>);
		  var addTeamCard = this.makeCard("Add new Team",
											<AddTeam 
													username = {this.state.username} 
													password = {this.state.password}/>);
	      var addMatchCard = this.makeCard("Add new Match",
											<AddMatch 
													username = {this.state.username} 
													password = {this.state.password}/>);
		  content = (	
		  <div>
			  {addTournamentCard}
			  {addTeamCard}
			  {addMatchCard}
		  </div>
		  );
	  }else{
		  content = this.makeCard("Login", <AddCredentials onLogin = {this.onLogin.bind(this)}/>);
	  }
    return (
		<div>{content}</div>
    );
  } 
}

export default App
