var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var SportsPool = artifacts.require("./SportsPool.sol");

module.exports = function(deployer) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(SportsPool);
};
