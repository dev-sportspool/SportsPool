import React, {
    Component
} from 'react'

import '../css/oswald.css'
import '../css/open-sans.css'
import '../css/pure-min.css'
import '../css/App.css'

import SportsPoolContract from '../../build/contracts/SportsPool.json'
import getWeb3 from '../utils/getWeb3'



class MetaMaskContainer extends Component {
    constructor(props) {
        super(props)
		
        this.state = {
			web3: null,
			accounts: null,
			contract: null,
			error:null
        }
    }

    
	  instantiateContract() {
        const contract = require('truffle-contract')

        const sportsPool = contract(SportsPoolContract)
        sportsPool.setProvider(this.state.web3.currentProvider)

        var sportsPoolInstance

        this.state.web3.eth.getAccounts((error, accounts) => {
			if(error==null){
				this.setState({
					accounts: accounts
				});
				sportsPool.deployed().then((instance) => {
					sportsPoolInstance = instance
					this.setState({
						contract: sportsPoolInstance
					});
				})
				.catch(() => {
					this.setState({
						error: "Check that you are on correct network"
					});
				})
			}else{
				this.setState({
					error:"Error getting accounts"+error
				});
			}
        })
		
		//todo: continue added more error handling from this https://github.com/MetaMask/faq/blob/master/DEVELOPERS.md
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
			this.setState({
                    error: "No web3 detected"
                });
		})
}
		
	render() {
		console.log('error:'+this.state.error)
		var content = null;
		if(this.state.error==null){
			content = this.props.children;
		}else{
			content = (<p>"Error:"+{this.state.error}</p>);
		}
		return (
			<div className="w3-padding-16">
			  <div >{content}</div>
			</div>
		);
	}
}

export default MetaMaskContainer