import React, {
    Component
} from 'react'

import '../css/oswald.css'
import '../css/open-sans.css'
import '../css/pure-min.css'
import '../css/App.css'

class AddCredentials extends Component {
    constructor(props) {
        super(props)

        this.handleLogin = this.handleLogin.bind(this);
        this.state = {
		}
    }

    componentWillMount() {

    }

    componentDidMount() {

    }

    handleLogin(event) {
		if(this.props.onLogin!=null){
			this.props.onLogin(this.usernameInput.value,this.passwordInput.value);
		}else{
			console.log("please set onLogin listener");
		}
        event.preventDefault();
    }

    render() {

        return (
      <div>
	  <p>Login:</p>
	  <form onSubmit={this.handleLogin}>
	    <label>
			Username:
			<input value="admin" type="text" ref={(input) => this.usernameInput = input}/>
			<br />
			Password:
			<input value="p4553o7d" type="text" ref={(input) => this.passwordInput = input}/>
			<br />
			<input type="submit" value="Submit" />
		</label>
	  </form>
      </div>
        );
    }
}

export default AddCredentials