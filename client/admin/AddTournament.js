import React, {
    Component
} from 'react'
import SportsPoolContract from '../../build/contracts/SportsPool.json'
import getWeb3 from '../utils/getWeb3'

import '../css/oswald.css'
import '../css/open-sans.css'
import '../css/pure-min.css'
import '../css/App.css'

import repo from './Repository'

class AddTournament extends Component {
    constructor(props) {
        super(props)

        this.handleCreateTournament = this.handleCreateTournament.bind(this);
        this.state = {
			tournaments:null
        }
    }



    componentDidMount() {
        repo.getTournaments().observe((resource)=>{
			this.tournamentNameInput.value = "";
            this.tournamentDescriptionInput.value = "";
			this.setState((prevState, props) => ({
				tournaments: resource.data
			}));
		});
    }


    handleCreateTournament(event) {
        //todo validate?
        //alert("name:" + this.tournamentNameInput.value + ", descr:" + this.tournamentDescriptionInput.value);

        this.props.contract.addTournament({
                from: this.props.account
            })
            .then((result) => {
                console.log("Result:" + JSON.stringify(result));
                for (var i = 0; result.logs.length; i++) {
                    var log = result.logs[i];
                    if (log.event === "TournamentAdded") {
						repo.addTournament(this.props.username,
							this.props.password,
							log.args.tournamentId,
							this.tournamentNameInput.value,
							this.tournamentDescriptionInput.value,
							'',
							'');
                        return;
                    }
                }
                alert("Something went wrong!")
            }).catch((ex) => {
                alert("Error:" + ex);
            });

        event.preventDefault();
    }

    render() {
        let tournaments = null;
        if (this.state.tournaments != null) {
            tournaments = this.state.tournaments.map((tournament, i) => ( 
				<div key = {tournament._id} > 
					{i}) {tournament.name }(id:{tournament._id}), 
				</div>
            ));
    }
    tournaments = tournaments == null ? "LOADING..." : tournaments;
    return (<div className="w3-container">
			<h2>Existing Tournaments< /h2> 
				{tournaments}
			
			<form onSubmit = {
				this.handleCreateTournament
			} >
			<label >
			Name:
			<input className="w3-input" 
				type = "text"
					ref = {
						(input) => this.tournamentNameInput = input
					}
			/> 
			<br / >
			Description:
			<input className="w3-input" 
				type = "text"
					ref = {
						(input) => this.tournamentDescriptionInput = input
					}
			/> 
			<br / >
			<input className="w3-btn w3-blue w3-margin-top w3-margin-bottom"
				type = "submit" value = "Submit" / >
			</label> 
			</form >
		</div>
);
}
}

export default AddTournament