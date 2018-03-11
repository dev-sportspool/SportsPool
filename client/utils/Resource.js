var Resource = class Resource{
	constructor (data,error) {
        this.data = data;
        this.error = error;
    }
	isLoading(){
		return this.data==null && this.error ==null;
	}
}
module.exports = Resource;