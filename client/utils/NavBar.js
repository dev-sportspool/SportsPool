import React, {
    Component
} from 'react'

import '../css/oswald.css'
import '../css/open-sans.css'
import '../css/pure-min.css'
import '../css/App.css'

class NavBar extends Component {
    constructor(props) {
        super(props)
		
        this.state = {
        }
    }
	
    render() {
	var folder = window.location.pathname;
	var itemCss = "w3-bar-item w3-button";
    return (
		<div className="w3-bar w3-black w3-large">
			<img src={"../dist/"+require("../images/sports_pool_icon.png")} 
				className="w3-bar-item "
				style={{height: "40px" }}/>
			
			<a href="/index" className={folder=="/home/" ||folder=="/"?"w3-green "+itemCss:itemCss}>Home</a>
			<a href="/terms" className={folder=="/terms/"?"w3-green "+itemCss:itemCss}>Terms</a>
			<a href="/about" className={folder=="/about/"?"w3-green "+itemCss:itemCss}>About</a>
		</div>
	);
	}
}

export default NavBar