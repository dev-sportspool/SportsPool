import React, { Component } from 'react'
import SportsPoolContract from '../build/contracts/SportsPool.json'
import getWeb3 from './utils/getWeb3'
import AddTournament from './AddTournament'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css' 
import './App.css'

class AdminApp extends Component {
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
      </div>
    );
  }
}

export default AdminApp
