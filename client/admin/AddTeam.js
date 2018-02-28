import React, {
    Component
} from 'react'

import '../css/oswald.css'
import '../css/open-sans.css'
import '../css/pure-min.css'
import '../css/App.css'

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
        this.getTeams();
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

    handleCreateTeam(event) {
        //todo validate?
        alert("ID:" + this.teamIDInput.value + ",name:" + this.teamNameInput.value + ", descr:" + this.teamCountryInput.value);

        this.addTeamToDB(this.teamIDInput.value);

        event.preventDefault();
    }

    addTeamToDB(id) {
        fetch('/team', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: this.props.username,
                password: this.props.password,
                id: this.teamIDInput.value,
                name: this.teamNameInput.value,
                country: this.teamCountryInput.value,
                icon: '',
                banner: ''
            })
        }).then((resp) => {
            this.teamIDInput.value = "";
            this.teamNameInput.value = "";
            this.teamCountryInput.value = "";
            this.getTeams();
        }).catch((ex) => {
            alert("Error:" + ex);
        })
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
            <div>
	  <p>Existing Teams</p>
	  {teams}
	  <p>Add new Team</p>
	  <form onSubmit={this.handleCreateTeam}>
	    <label>
			ID:
			<input type="text" ref={(input) => this.teamIDInput = input}/>
			<br />
			Name:
			<input type="text" ref={(input) => this.teamNameInput = input}/>
			<br />
			Description:
			<input type="text" ref={(input) => this.teamCountryInput = input}/>
			<br />
			<input type="submit" value="Submit" />
		</label>
	  </form>
      </div>
        );
    }
}

export default AddTeam