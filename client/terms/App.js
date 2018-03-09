import React from 'react'
import getWeb3 from '../utils/getWeb3'
import ethUtil from 'eth-sig-util'
import './terms.css';

class App extends React.Component {
	constructor(props) {
		super(props);
		
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
            })
            .catch(() => {
                console.log('Error finding web3.')
            })
    }

    getAccounts() {
    	var self = this;
    	this.state.web3.eth.getAccounts(function (err, accounts) {
		  if (!accounts) return
		  web3.eth.defaultAccount = accounts[0]
		  self.signMsg(accounts[0])
		})
    }

    signMsg(from) {
     	var self = this;
		this.state.web3.currentProvider.sendAsync({
			method: 'eth_signTypedData',
			params: [this.state.msgParams, from],
			jsonrpc: "2.0",
			id: 1,
		}, function (err, result) {		
			if (err) return console.error(err)
			if (result.error) {
			  return console.error(result.error.message)
			}
			console.log(result)
			const recovered = ethUtil.recoverTypedSignature({
			  data: self.state.msgParams,
			  sig: result.result 
			})
			if (recovered === from ) {
			  alert('Recovered signer: ' + from)
			} else {
			  alert('Failed to verify signer, got: ' + result)
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
		return(
			<div>
				<TermsField onScrollBottom={this.enableCheck} terms={this.termsTemp}/>
				<br/>
				<TermsCheck enabled={this.state.checkEnabled} onChecked={this.enableButton}/>
				<br/>
				<TermsButton enabled={this.state.buttonEnabled} onClicked={this.getAccounts}/>
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
		    console.log("scrollHeight: " + this.scrollHeight);
		    console.log("scrollTop: " + this.scrollTop);
		    
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