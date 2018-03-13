import React, {
    Component
} from 'react'
import SportsPoolContract from '../../build/contracts/SportsPool.json'
import getWeb3 from '../utils/getWeb3'
import Alert from '../utils/Alert'

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
			tournaments:null,
			error:null
        }
    }



    componentDidMount() {
        repo.getTournaments().observe((resource)=>{
			this.tournamentNameInput.value = "";
            this.tournamentDescriptionInput.value = "";
			this.setState((prevState, props) => ({
				tournaments: resource.data,
				error:resource.error
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
                this.setState({error:new Error("Smart contract error.")})
            }).catch((ex) => {
                this.setState({error:ex})
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
    tournaments = tournaments == null ? <div className="loader"></div> : tournaments;
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
			{
				this.state.error
				? <Alert
					title={"Error"}
					message={this.state.error.message}
					onClose={()=>{this.setState({error:null})}}/>
				:null
			}
		</div>
);
}
}

export default AddTournament