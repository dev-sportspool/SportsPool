import LiveData from '../utils/LiveData'
import Resource from '../utils/Resource'
class Repository{
	constructor () {
        this.tournaments = new LiveData();
		this.teams = new LiveData();
		this.matches = new LiveData();
    }
	
	getTournaments() {
		this.tournaments.set(new Resource(null, null));
		fetch('/tournaments')
		.then((response) => {
			if (response.status >= 400) {
				this.tournaments.set(new Resource(null, new Error("Bad response from server")));
			}else{
				return response.json();
			}
		})
		.then((results) => {
			this.tournaments.set(new Resource(results,null));
		})
		.catch(() => {
			this.tournaments.set(new Resource(null, new Error("Something went wrong")));
		});
		return this.tournaments;
    }
	
	addTournament(username, password, id, name, description, icon, banner) {
		this.tournaments.set(new Resource(null, null));
        fetch('/tournament', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
                id: id,
                name: name,
                description: description,
                icon: icon,
                banner: banner
            })
        }).then((response) => {
			if (response.status >= 400) {
				this.tournaments.set(new Resource(null, new Error("Bad response from server")));
			}else{
				this.getTournaments();
			}
        }).catch((ex) => {
            this.tournaments.set(new Resource(null, new Error("Error adding tournament:"+ex)));
        })
    }
	
	getTeams(){
		this.teams.set(new Resource(null, null));
		fetch('/teams')
		.then(function(response) {
			if (response.status >= 400) {
				this.teams.set(new Resource(null, new Error("Bad response from server")));
			}else{
				return response.json();
			}
		})
        .then((results) => {
			this.teams.set(new Resource(results,null));
		})
		.catch(() => {
			this.teams.set(new Resource(null, new Error("Something went wrong")));
		});
		return this.teams;
	}
	
	addTeam(username, password, id, name, country, icon, banner) {
		this.teams.set(new Resource(null, null));
        fetch('/team', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
                id: id,
                name: name,
                country: country,
                icon: icon,
                banner: banner
            })
        }).then((response) => {
			if (response.status >= 400) {
				this.teams.set(new Resource(null, new Error("Bad response from server")));
			}else{
				this.getTeams();
			}
        }).catch((ex) => {
            this.teams.set(new Resource(null, new Error("Error adding team:"+ex)));
        })
    }
	
	getMatches(tournamentId) {
        fetch('/matches?tournament_id='+tournamentId)
		.then((response) => {
			if (response.status >= 400) {
				this.matches.set(new Resource(null, new Error("Bad response from server")));
			}else{
				return response.json();
			}
		})
		.then((results) => {
			this.matches.set(new Resource(results,null));
		})
		.catch(() => {
			this.matches.set(new Resource(null, new Error("Something went wrong")));
		});
		return this.matches;
    }
	
	addMatch(username, password,matchId,tournamentId,matchTime,betCutOff,state,team_a_id,team_b_id) {
        fetch('/match', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
                match_number: matchId,
				tournament_id:tournamentId,
				date_time_stamp:matchTime,
                bet_cutoff_minutes: betCutOff,
                state: state,
				team_a_id:team_a_id,
				team_b_id:team_b_id
            })
        }).then((response) => {
			if (response.status >= 400) {
				this.matches.set(new Resource(null, new Error("Bad response from server")));
			}else{
				this.getMatches(tournamentId);
			}
        }).catch((ex) => {
            this.matches.set(new Resource(null, new Error("Error adding match:"+ex)));
        })
		return this.teams;
    }
}
let repo = new Repository();
module.exports = repo;