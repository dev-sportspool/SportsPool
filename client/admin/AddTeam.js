import React, {
    Component
} from 'react'

import '../css/oswald.css'
import '../css/open-sans.css'
import '../css/pure-min.css'
import '../css/App.css'

import repo from './Repository'

class AddTeam extends Component {
    constructor(props) {
        super(props)

        this.handleCreateTeam = this.handleCreateTeam.bind(this);
        this.state = {
			teams: null
		}
    }

    componentWillMount() {

    }

    componentDidMount() {
        repo.getTeams().observe((resource)=>{
			this.teamIDInput.value = "";
            this.teamNameInput.value = "";
            this.teamCountryInput.value = "";
			this.setState((prevState, props) => ({
				teams: resource.data
			}));
		});
    }

    handleCreateTeam(event) {
        //todo validate?
        //alert("ID:" + this.teamIDInput.value + ",name:" + this.teamNameInput.value + ", descr:" + this.teamCountryInput.value);

        repo.addTeam(this.props.username, this.props.password, this.teamIDInput.value, this.teamNameInput.value, this.teamCountryInput.value, '', '');

        event.preventDefault();
    }

    render() {
        var teams;
        if (this.state.teams != null) {
            teams = this.state.teams.map((team, i) => (
                <div key={team._id}>
				{i}) {team.name} (id:{team._id}),
			   </div>
            ));
        }
        teams = teams == null ? "LOADING..." : teams;
        return (
            <div className="w3-container">
	  
	  <h2>Existing Teams</h2>
	  {teams}
	  <form onSubmit={this.handleCreateTeam}>
	    <label>
			ID:
			<input className="w3-input" 
				type="text" 
				ref={(input) => this.teamIDInput = input}/>
			<br />
			Name:
			<input className="w3-input" 
				type="text" 
				ref={(input) => this.teamNameInput = input}/>
			<br />
			Description:
			<input className="w3-input" 
				type="text" 
				ref={(input) => this.teamCountryInput = input}/>
			<br />
			<input className="w3-btn w3-blue w3-margin-top w3-margin-bottom"
					type="submit" value="Submit" />
		</label>
	  </form>
      </div>
        );
    }
}

export default AddTeam