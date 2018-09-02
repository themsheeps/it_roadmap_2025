var PostTrade = artifacts.require("./PostTrade.sol");
var IsinIssuance = artifacts.require("./IsinIssuance.sol");
var ConfirmationsAndMandates = artifacts.require("./ConfirmationsAndMandates.sol");

module.exports = function(deployer) {
  deployer.deploy(PostTrade).then(function(){
    deployer.deploy(ConfirmationsAndMandates, PostTrade.address);
    return deployer.deploy(IsinIssuance, PostTrade.address);
  });
};


// Original:
// =========
// module.exports = function(deployer) {
//   deployer.deploy(PostTrade);
// };

// Deploy A, then deploy B, passing in A's newly deployed address
// deployer.deploy(A).then(function() {
//   return deployer.deploy(B, A.address);
// });