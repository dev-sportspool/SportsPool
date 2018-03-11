var LiveData = class LiveData{
	constructor () {
        this.data = null;
        this.observers = [];
    }
	set(val){
		this.data = val;
		this.observers.forEach((observer)=>{
			observer(this.data)
		});
	}
	observe(observer){
		this.observers.push(observer);
		observer(this.data)
	}
}
module.exports = LiveData;