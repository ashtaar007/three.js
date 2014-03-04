self.console = self.console || {

	info: function () {},
	log: function () {},
	debug: function () {},
	warn: function () {},
	error: function () {}

};
String.prototype.trim = String.prototype.trim || function () {

	return this.replace( /^\s+|\s+$/g, '' );

};



