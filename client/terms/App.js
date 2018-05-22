import React from 'react'
import getWeb3 from '../utils/getWeb3'
import ethUtil from 'eth-sig-util'
import Cookies from 'cookies-js'
import SHA256 from 'crypto-js/sha256'
import './terms.css';
import '../css/App.css'
import Card from '../utils/Card'


class App extends React.Component {
	constructor(props) {
		super(props);
		
		// Account related
		this.account = null;
		this.accountHash = null;

		// Bindings
		this.getAccounts = this.getAccounts.bind(this);
		this.enableButton = this.enableButton.bind(this);
		this.enableCheck = this.enableCheck.bind(this);
		this.signMsg = this.signMsg.bind(this);

		// Initializations
		this.termsTemp = "Terms & Conditions\nTerms & Conditions\nTerms & Conditions" +
	    "\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions" +
	    "\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions" +
	    "\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions" +
	    "\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions";
		this.state = {
			web3: null,
			checkEnabled: false,
			buttonEnabled: false,
			userAccepted: false,
			msgParams: [{
			    'type': 'string',
			    'name': 'Terms & Conditions',   
			    'value': this.termsTemp
			}]
		}
	}

    componentWillMount() {
        getWeb3
            .then(results => {
                this.setState({
                    web3: results.web3
                })
                this.getAccounts();
            })
            .catch(() => {
                console.log('Error finding web3.')
            });
    }

    getAccounts() {
    	var self = this;
    	this.state.web3.eth.getAccounts(function (err, accounts) {
		  if (!accounts) return
		  web3.eth.defaultAccount = accounts[0];
		  self.account = accounts[0];
		  self.accountHash = SHA256(accounts[0]).toString();
		  if (Cookies.enabled) {
        	try {
        		let signature = Cookies.get(self.accountHash);
        		if (signature !== undefined) {
	        		console.log(signature);
	        		const recovered = ethUtil.recoverTypedSignature({
					  data: self.state.msgParams,
					  sig: signature 
					})
					if (recovered === accounts[0] ) {
					  	self.setState({
							userAccepted: true
						});
					} else {
					  	console.log("User never agreed");
					}
				}
        	} catch(error) {
        		console.log(error)
        		console.log("Cookie doesnt exist. User never agreed");
        	}    		
        }
		})
    }

    signMsg() {
     	var self = this;
		this.state.web3.currentProvider.sendAsync({
			method: 'eth_signTypedData',
			params: [this.state.msgParams, this.account],
			jsonrpc: "2.0",
			id: 1,
		}, function (err, result) {		
			if (err) return console.error(err)
			if (result.error) {
			  return console.error(result.error.message)
			}
			console.log(result)
			if (Cookies.enabled) {
				Cookies.set(self.accountHash, result.result, { expires: 60*60*24*30 }); // 30 days expiration
			}
		})
	}

	enableButton(value) {
		this.setState({
			buttonEnabled: value
		});
	}

	enableCheck() {
		this.setState({
			checkEnabled: true
		});
	}

	render() {
		let output = null;
		if (this.state.userAccepted) {
			output = "User accepter Terms & Conditions. Redirecting ...."
			window.location.replace("/");
		} else {
			output = 			<div>
				<TermsField onScrollBottom={this.enableCheck} terms={this.termsTemp}/>
				<br/>
				<TermsCheck enabled={this.state.checkEnabled} onChecked={this.enableButton}/>
				<br/>
				<TermsButton enabled={this.state.buttonEnabled} onClicked={this.signMsg}/>
			</div>
		}
		return(
			<div>
				<Card title={"Terms"}
					content={output}/>
				
			</div>
		);
	}
}

class TermsField extends React.Component {
	constructor(props) {
	    super(props)
	}	

	componentDidMount() {
		var self = this;
		$("#TermsConditionsArea").on('scroll', function() {
		    // console.log("scrollHeight: " + this.scrollHeight);
		    // console.log("scrollTop: " + this.scrollTop);
		    
		    var offset = 250; // This might have to change
		    
		    if (this.scrollHeight <= (this.scrollTop+offset)) {
		    	// console.log("Bottom reached");
		    	self.props.onScrollBottom();
		    }
		});
	}

	render() {
	    return (
	      <textarea id="TermsConditionsArea" className="terms" value={this.props.terms} readOnly/>
	    );
	}
}

class TermsCheck extends React.Component {
	constructor(props) {
	    super(props)
	    this.handleClick = this.handleClick.bind(this);
	}

	handleClick(checkbox) {
		var chk = document.getElementById("TermsConditionsCheck").checked;
		this.props.onChecked(chk);
	}

	render() {
		return(
			<div>
				<input id="TermsConditionsCheck" type="checkbox" onClick={this.handleClick} disabled={!this.props.enabled}/>
				<label>I agree to Terms & Conditions</label>
			</div>
		);
	}
}

class TermsButton extends React.Component {
	constructor(props) {
	    super(props)
	}

	render() {
		return(
			<button onClick={this.props.onClicked} disabled={!this.props.enabled}>Agree Terms</button>
		);
	}
}

export default App