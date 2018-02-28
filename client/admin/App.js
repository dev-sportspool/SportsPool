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
	}
  }

  componentWillMount() {
    
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
			  <p> Admin Console:</p>
			  <AddTournament 
				  username = {this.state.username} 
				  password = {this.state.password}/>
			  <AddTeam 
				  username = {this.state.username} 
				  password = {this.state.password}/>
			  <AddMatch 
				  username = {this.state.username} 
				  password = {this.state.password}/>
		  </div>
		  );
	  }else{
		  content = <AddCredentials onLogin = {this.onLogin.bind(this)}/>
	  }
    return (
		<div>{content}</div>
    );
  } 
}

export default App
