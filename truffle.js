var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = "opinion destroy betray ... TODO CONFIGURE ONCE READY FOR ROPSTEN TESTING";

module.exports = {
	networks: {
		ropsten: {
			provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/"),
			network_id: '3'
		},
		development: {
			host: "localhost",
			port: 8545,
			network_id: "*" // Match any network id
		}
	}
};
