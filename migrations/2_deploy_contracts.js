const Auction = artifacts.require("Auction");

module.exports = function (deployer) {
  deployer.deploy(Auction, Auction.address, 3000);
};
