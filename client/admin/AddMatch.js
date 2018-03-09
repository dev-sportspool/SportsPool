import React, { Component } from 'react'
import SportsPoolContract from '../../build/contracts/SportsPool.json'
import getWeb3 from '../utils/getWeb3'

import '../css/oswald.css'
import '../css/open-sans.css'
import '../css/pure-min.css' 
import '../css/App.css'

class AddMatch extends Component {
  constructor(props) {
    super(props)

	this.handleCreateMatch = this.handleCreateMatch.bind(this);
	this.handleTournamentSelection = this.handleTournamentSelection.bind(this);
    this.handleTeamASelection = this.handleTeamASelection.bind(this);
	this.handleTeamBSelection = this.handleTeamBSelection.bind(this);
	this.state = {
            web3: null,
            accounts: null,
            contract: null,
			tournament: null,
			teams: null,
			tournaments: null,
			matches: null,
			team_a_id:null,
			team_b_id:null,
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
	this.getTeams();
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
            })
        })
    }
  
  handleCreateMatch(event){
	  console.log(
	  parseInt(this.state.tournament)+","+
		  parseInt(this.state.team_a_id)+","+
		  parseInt(this.state.team_b_id)+","+
		  parseInt(this.matchCostInput.value)+","+
		  parseInt(this.matchDevFeeInput.value)+","+
		  parseInt(this.matchTimeInput.value)
	  );
	  this.state.contract.addMatch(
		  parseInt(this.state.tournament),
		  parseInt(this.state.team_a_id),
		  parseInt(this.state.team_b_id),
		  parseInt(this.matchCostInput.value),
		  parseInt(this.matchDevFeeInput.value),
		  parseInt(this.matchTimeInput.value),{
                from: this.state.accounts[0]
            })
            .then((result) => {
                console.log("Result:" + JSON.stringify(result));
                for (var i = 0; result.logs.length; i++) {
                    var log = result.logs[i];
                    if (log.event === "MatchAdded") {
                        this.addMatchToDB(log.args.tournamentId, log.args.matchId)
                        return;
                    }
                }
                alert("Something went wrong!")
            }).catch((ex) => {
				console.log("Error:\n"+ex);
                alert("Error:" + ex);
            });
	event.preventDefault();
  }
  
  addMatchToDB(tournamentId,matchId) {
        fetch('/match', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: this.props.username,
                password: this.props.password,
                match_number: matchId,
				tournament_id:tournamentId,
				date_time_stamp:this.matchTimeInput.value ,
                bet_cutoff_minutes: 60,
                state: 0,
				team_a_id:this.state.team_a_id,
				team_b_id:this.state.team_b_id
            })
        }).then((resp) => {
			console.log(resp);
            this.matchCostInput.value = "";
            this.matchDevFeeInput.value = "";
			this.matchTimeInput.value = "";
            this.getMatches(tournamentId);
        }).catch((ex) => {
            alert("Error:" + ex);
        })
    }
	
	getTournaments() {
        this.setState((prevState, props) => ({
            tournaments: null
        }));
        fetch('/tournaments')
            .then((response) => {
                if (response.status >= 400) {
                    throw new Error("Bad response from server");
                }
                return response.json();
            })
            .then((results) => {
                this.setState((prevState, props) => ({
                    tournaments: results
                }));
				if(results!=null && results[0]!=null){
					this.getMatches(results[0]._id);
				}
            });
    }
	
	getMatches(tournamentId) {
        this.setState((prevState, props) => ({
            matches: null
        }));
        fetch('/matches?tournament_id='+tournamentId)
            .then((response) => {
                if (response.status >= 400) {
                    throw new Error("Bad response from server");
                }
                return response.json();
            })
            .then((results) => {
                this.setState((prevState, props) => ({
                    matches: results
                }));
            });
    }
	
	getTeams() {
        this.setState((prevState, props) => ({
            teams: null
        }));
        fetch('/teams')
            .then(function(response) {
                if (response.status >= 400) {
                    throw new Error("Bad response from server");
                }
                return response.json();
            })
            .then((results) => {
                this.setState((prevState, props) => ({
                    teams: results
                }));
            });
    }
	
	handleTournamentSelection(event){
		//alert(event.target.value);
		this.setState({tournament: event.target.value});
		this.getMatches(event.target.value);
	}
	handleTeamASelection(event){
		this.setState({team_a_id: event.target.value});
	}
	handleTeamBSelection(event){
		this.setState({team_b_id: event.target.value});
	}
	
	createTournamentOptions(){
		return this.state.tournaments.map((tournament, i) => ( 
				<option 
					key = {tournament._id}
					value={tournament._id}>{tournament.name}</option>
            ));
	}
	
	createMatchesList(){
		return this.state.matches.map((match, i) => ( 
					<text key={match.match_number}>{match.match_number},</text>
				));
	}
	
	createTeamOptions(){
		return this.state.teams.map((team, i) => ( 
				<option 
					key = {team._id}
					value={team._id}>{team.name}</option>
            ));
	}
  
  render(){
	  let form = null;
	  if(this.state.tournaments!=null){
		  let tournamentOptions = null;
		  tournamentOptions = this.createTournamentOptions();
			let matchesString = null;
			if(this.state.matches!=null){
				let matchesList  = this.createMatchesList();
				matchesString = <p>Existing match ids:{matchesList}</p>;
			}else{
				matchesString = (<p>Loading...</p>);
			}
			let teamOptions = null;
			if(this.state.teams!=null){
				teamOptions = this.createTeamOptions();
			}else{
				teamOptions = (<p>Loading...</p>);
			}
		  form = (
			<form onSubmit = {this.handleCreateMatch}>
				<label >
				Select Tournament:
					<select onChange={this.handleTournamentSelection}>
						{tournamentOptions}
					</select>
					{matchesString}
				Select Team A:
				<select onChange={this.handleTeamASelection}>
						{teamOptions}
					</select>
					<br />
				Select Team B:
				<select onChange={this.handleTeamBSelection}>
						{teamOptions}
					</select>
				<br / >
				Cost:
				<input className="w3-input" 
					type="text" 
					ref={(input) => this.matchCostInput = input}/>
				<br />
				Dev Fee (%):
				<input className="w3-input" 
					type="text" 
					ref={(input) => this.matchDevFeeInput = input}/>
				<br />
				Time Stamp:
				<input className="w3-input" 
					value="1530000000" 
					type="text" 
					ref={(input) => this.matchTimeInput = input}/>
				<br />
				<input className="w3-btn w3-blue w3-margin-top w3-margin-bottom"
					type = "submit" value = "Submit" / >
				</label> 
			</form> 
			);
	  }else{
		  form = (<p>Loading...</p>);
	  }
	  
	  return(
		<div className="w3-container">
			{form}
		</div>
	  );
  }
}

export default AddMatch