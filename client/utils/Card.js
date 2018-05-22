import React, {
    Component
} from 'react'

import '../css/oswald.css'
import '../css/open-sans.css'
import '../css/pure-min.css'
import '../css/App.css'



class Card extends Component {
    constructor(props) {
        super(props)
		
        this.state = {
        }
    }

    
	makeCard(heading, content){
	  return (<div style = {{  opacity:"0.85"}}><div className="w3-card-4 w3-margin-top w3-animate-top w3-animate-opacity"
				style={{margin: "auto", width: "50%", minWidth: "500px",backgroundColor:"#fff"}}>
				<div className="w3-container w3-green w3-margin-bottom">
					<h2>{heading}</h2>
				</div>
				{content}
			</div>
			</div>
			);
  }
	
	
	
    render() {

    return (
		<div>
		{this.makeCard(this.props.title, this.props.content)}
		</div>
	);
	}
}

export default Card