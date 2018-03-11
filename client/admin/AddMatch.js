import React, { Component } from 'react'
import SportsPoolContract from '../../build/contracts/SportsPool.json'
import getWeb3 from '../utils/getWeb3'

import '../css/oswald.css'
import '../css/open-sans.css'
import '../css/pure-min.css' 
import '../css/App.css'

import repo from './Repository'

class AddMatch extends Component {
  constructor(props) {
    super(props)

	this.handleCreateMatch = this.handleCreateMatch.bind(this);
	this.handleTournamentSelection = this.handleTournamentSelection.bind(this);
    this.handleTeamASelection = this.handleTeamASelection.bind(this);
	this.handleTeamBSelection = this.handleTeamBSelection.bind(this);
	this.state = {
			tournament: null,
			teams: null,
			tournaments: null,
			matches: null,
			team_a_id:null,
			team_b_id:null,
        }
  }
    
  componentDidMount() {
	repo.getTournaments().observe((resource)=>{
		this.setState((prevState, props) => ({
			tournaments: resource.data
		}));
		if(resource.data!=null && resource.data[0]!=null){
			repo.getMatches(resource.data[0]._id);
		}
	});
	repo.getTeams().observe((resource)=>{
		this.setState((prevState, props) => ({
			teams: resource.data
		}));
	});
	repo.matches.observe((resource)=>{
		if(this.matchCostInput!=null)
			this.matchCostInput.value = "";
		if(this.matchDevFeeInput!=null)
			this.matchDevFeeInput.value = "";
		if(this.matchTimeInput!=null)
			this.matchTimeInput.value = "1530000000";
		if(resource!=null && resource.data !=null){
			this.setState((prevState, props) => ({
				matches: resource.data
			}));
		}
	});
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
	  this.props.contract.addMatch(
		  parseInt(this.state.tournament),
		  parseInt(this.state.team_a_id),
		  parseInt(this.state.team_b_id),
		  parseInt(this.matchCostInput.value),
		  parseInt(this.matchDevFeeInput.value),
		  parseInt(this.matchTimeInput.value),{
                from: this.props.account
            })
            .then((result) => {
                console.log("Result:" + JSON.stringify(result));
                for (var i = 0; result.logs.length; i++) {
                    var log = result.logs[i];
                    if (log.event === "MatchAdded") {
						repo.addMatch(
							this.props.username,
							this.props.password,
							log.args.matchId,
							log.args.tournamentId,
							this.matchTimeInput.value,
							60,
							0,
							this.state.team_a_id,
							this.state.team_b_id
						);
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
  		
	handleTournamentSelection(event){
		//alert(event.target.value);
		this.setState({tournament: event.target.value});
		repo.getMatches(event.target.value);
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
					defaultValue="1530000000" 
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