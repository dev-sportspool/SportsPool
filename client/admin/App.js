import React, { Component } from 'react'
import getWeb3 from '../utils/getWeb3'
import AddTournament from './AddTournament'
import AddTeam from './AddTeam'

import '../css/oswald.css'
import '../css/open-sans.css'
import '../css/pure-min.css' 
import '../css/App.css'

class App extends Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    
  }
  
  componentDidMount() {
  }
  
  render() {
    return (
      <div>
	  <p> Oh hai there!</p>
	  <AddTournament />
	  <AddTeam />
      </div>
    );
  }
}

export default App
