import React, {
    Component
} from 'react'

import '../css/oswald.css'
import '../css/open-sans.css'
import '../css/pure-min.css'
import '../css/App.css'



class Alert extends Component {
    constructor(props) {
        super(props)

		this.handleClose = this.handleClose.bind(this);
		
        this.state = {
        }
    }

    
	
	handleClose(){
		if(this.props.onClose!=null){
			this.props.onClose();
		}else{
			console.log("please set onLogin listener");
		}
	}
	
    render() {

    return (
		<div className="w3-panel w3-red w3-display-container w3-animate-opacity">
		  <span onClick={this.handleClose}
		  className="w3-button w3-red w3-large w3-display-topright">&times;</span>
		  <h3>{this.props.title}</h3>
		  <p>{this.props.message}</p>
		</div>
	);
	}
}

export default Alert