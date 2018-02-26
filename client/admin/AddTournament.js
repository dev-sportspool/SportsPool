import React, { Component } from 'react'
import SportsPoolContract from '../../build/contracts/SportsPool.json'
import getWeb3 from '../utils/getWeb3'

import '../css/oswald.css'
import '../css/open-sans.css'
import '../css/pure-min.css' 
import '../css/App.css'

class AddTournament extends Component {
  constructor(props) {
    super(props)

	this.handleCreateTournament = this.handleCreateTournament.bind(this);
    this.state = {
		web3: null,
		accounts:null,
		contract: null,
		tournament:{
		  name:"",
		  description:""
		}
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
    this.getTournaments();
  }
  
  instantiateContract() {

    const contract = require('truffle-contract')

	const sportsPool = contract(SportsPoolContract)
	sportsPool.setProvider(this.state.web3.currentProvider)

	var sportsPoolInstance

    this.state.web3.eth.getAccounts((error, accounts) => {
    		this.setState({accounts:accounts});
		sportsPool.deployed().then((instance) => {
		  sportsPoolInstance = instance
		  this.setState({contract:sportsPoolInstance});
		  /*
		  Could not get the .Watch() to work. :(
		  */
		  sportsPoolInstance.TournamentAdded()
		  .watch((error,result)=>{
			  console.log("got alert!");
			if(!error){
				console.log("event success:"+result);
				alert("Event":result);
			}else{
				alert("error");
			}
		});
		 })
    })
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
    
  handleCreateTournament(event) {
	  //todo validate?
	  alert("name:"+this.tournamentNameInput.value +", descr:"+this.tournamentDescriptionInput.value);
	  
	  this.state.contract.addTournament({from: this.state.accounts[0]})
	  .then((result) => {
			console.log("Result:"+JSON.stringify(result));
		  //this.setState({ poolInfo:  JSON.stringify(result) })
		  for(var i=0; result.logs.length;i++){
			  var log = result.logs[i];
			  if(log.event==="TournamentAdded"){
				  this.addTournamentToDB(log.args.tournamentId)
				  return;
			  }
		  }
		  alert("Something went wrong!")
		}).catch((ex) =>{
			alert("Error:"+ex);
		})
	  
	  event.preventDefault();
  }
  
  addTournamentToDB(id){
	  fetch('/tournament', {
		  method: 'POST',
		  headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		  },
		  body: JSON.stringify({
			username: 'admin',
			password: 'p4553o7d',
			id: id,
			name: this.tournamentNameInput.value,
			description : this.tournamentDescriptionInput.value,
			icon:'',
			banner:''
		  })
		}).then((resp) =>{
			this.tournamentNameInput.value = "";
			this.tournamentDescriptionInput.value = "" ;
			this.getTournaments();
		}).catch((ex) =>{
			alert("Error:"+ex);
		})
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
	  <p>Existing Tournaments</p>
	  {tournaments}
	  <p>Add new Tournament</p>
	  <form onSubmit={this.handleCreateTournament}>
	    <label>
			Name:
			<input type="text" ref={(input) => this.tournamentNameInput = input}/>
			<br />
			Description:
			<input type="text" ref={(input) => this.tournamentDescriptionInput = input}/>
			<br />
			<input type="submit" value="Submit" />
		</label>
	  </form>
      </div>
    );
  }
}

export default AddTournament
