import React from 'react'
import getWeb3 from '../utils/getWeb3'
import './terms.css';

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			checkEnabled: false,
			buttonEnabled: false
		}
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
				<TermsField onScrollBottom={this.enableCheck.bind(this)}/>
				<br/>
				<TermsCheck enabled={this.state.checkEnabled} onChecked={this.enableButton.bind(this)}/>
				<br/>
				<TermsButton enabled={this.state.buttonEnabled}/>
			</div>
		);
	}
}

class TermsField extends React.Component {
	constructor(props) {
	    super(props)
	    this.termsTemp = "Terms & Conditions\nTerms & Conditions\nTerms & Conditions" +
	    "\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions" +
	    "\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions" +
	    "\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions" +
	    "\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions\nTerms & Conditions";
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
	      <textarea id="TermsConditionsArea" className="terms" value={this.termsTemp} readOnly/>
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
			<button disabled={!this.props.enabled}>Agree Terms</button>
		);
	}
}

export default App