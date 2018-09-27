# CONTRACTS

![](https://www.strate.co.za/sites/default/files/state-logo-dark.svg)
powered by: http://www.strate.co.za

# Contract List

# Deployment Sequence

I am sure there are more eloquent ways to do this but this is my deployment sequence:

* Start Ganache 
* Start VS Code
* * In the terminal window (inside of VS Code - Make sure you the project root folder) run the following commands:
```sh
truffle console
truffle migrate --reset

// To hook up the IsinIssuance contract with the PostTrade contract, run the following:
PostTrade.deployed().then(function(instance){return instance.setIsinIssuanceContractAddress(IsinIssuance.address)});
```

* In a terminal window (in the root of the project), run the following command:

```sh
npm run dev
```

* make sure your MetaMask plugin is up and running and connected to your Ganache network (http://localhost:7545/)

You should now be good to go to use the web frontend.

If MetaMask throws nonce errors, reset all your MetaMask accounts.

P.s. I tend to add 3 accounts to my metamask account list and label them as follows:
* Acc 1 - Admin (0x51e63a2e221c782bfc95f42cd469d3780a479c15)
* Acc 2 - Buyer (0xfb91a2395d9e49b89fca3dca0959b6eb4ea08a0b)
* Acc 3 - Seller (0x8ea823e5951243bfa7f1daad4703396260071fb9)
* Acc 4 - Counerpart / Broker (0xed646f6b0cf23c2bfc0dc4117da42eb5ccf15ee4)


# Helper commands (all the main functions through the CLI)

```sh
// ISIN ISSUANCE
IsinIssuance.deployed().then(function(instance){return instance.captureSecurity("ZAE001",1000,"Anglo American PLC","ANG","0xfb91a2395d9e49b89fca3dca0959b6eb4ea08a0b")});
IsinIssuance.deployed().then(function(instance){return instance.captureSecurity("eZAR",1000000,"eZAR","eZAR","0x51e63a2e221c782bfc95f42cd469d3780a479c15")});
IsinIssuance.deployed().then(function(instance){return instance.getSecurityToBeVerified(0, {from:"0xfb91a2395d9e49b89fca3dca0959b6eb4ea08a0b"})});
// IsinIssuance.deployed().then(function(instance){return instance.getSecurityToBeVerified(0, {from:"0x51e63a2e221c782bfc95f42cd469d3780a479c15"})});
IsinIssuance.deployed().then(function(instance){return instance.verifySecurity(0, {from:"0xfb91a2395d9e49b89fca3dca0959b6eb4ea08a0b"})});
// IsinIssuance.deployed().then(function(instance){return instance.verifySecurity(0, {from:"0x51e63a2e221c782bfc95f42cd469d3780a479c15"})});
IsinIssuance.deployed().then(function(instance){return instance.getSecurityToBeVerified(0, {from:"0xfb91a2395d9e49b89fca3dca0959b6eb4ea08a0b"})});
PostTrade.deployed().then(function(instance){return instance.getSecurityDetails("ZAE001")});
PostTrade.deployed().then(function(instance){return instance.getSecurityDetails("eZAR")});

// POST TRADE
*** ISSUER ***
// Check Admin balance
PostTrade.deployed().then(function(instance){return instance.getBalanceOfSecAndAccount("ZAE001","0x51e63a2E221C782Bfc95f42Cd469D3780a479C15")});
// Send ANG to seller
PostTrade.deployed().then(function(instance){return instance.sendSecurity("ZAE001",600,"0x8eA823e5951243bFA7f1Daad4703396260071fB9")});
// Check seller balance
PostTrade.deployed().then(function(instance){return instance.getBalanceOfSecAndAccount("ZAE001","0x8eA823e5951243bFA7f1Daad4703396260071fB9")});

// Optional send security from one account to another
PostTrade.deployed().then(function(instance){return instance.sendSecurity("ZAE001",500,"0x8ea823e5951243bfa7f1daad4703396260071fb9", {from: "0x2AaB2c02Fc5415D23e91CE8Dc230D3A31793CFF8"})});

*** BANK ***
// Check Security details (cash or ISINs)
PostTrade.deployed().then(function(instance){return instance.getSecurityDetails("eZAR")});
//// Issue Cash from and into SAMOS account (OLD - Issue Cash from IsinIssue Contract)
//// PostTrade.deployed().then(function(instance){return instance.issueCash(10000000, {from:"0x3E7Eaa5Bc0ee36b4308B668050535d411a81585D"})});
//// Check new SAMOS cash balance
//// PostTrade.deployed().then(function(instance){return instance.getBalanceOfSecAndAccount("eZAR","0x51e63a2E221C782Bfc95f42Cd469D3780a479C15")});
// Check which assets have been issued: 0 => ANG, 1 => eZAR
PostTrade.deployed().then(function(instance){return instance.getSecuritiesListById(0)});
// send cash to Buyer
PostTrade.deployed().then(function(instance){return instance.sendSecurity("eZAR",10000,"0xFb91a2395d9E49b89fcA3dca0959b6eB4Ea08a0B", {from: "0x51e63a2e221c782bfc95f42cd469d3780a479c15"})});

*** EXCHANGE ***
// Report Pre-matched trade for T+X settlement (_ISIN, _buyLegId, _saleLegId, _tradeId, _settlementDate, _buyerAddress, _sellerAddress, _buyerCustodianId, _sellerCustodianId, _amount, _salePrice)
PostTrade.deployed().then(function(instance){return instance.addPreMatchedTrade("ZAE001",1234,4321,11223344,20180720,"0xFb91a2395d9E49b89fcA3dca0959b6eB4Ea08a0B","0x8eA823e5951243bFA7f1Daad4703396260071fB9","0x1c6B96De685481c2d9915b606D4AB1277949b4Bc","0x2d14d5Ae5E54a22043B1eccD420494DAA9513e06",100,5000,{from:"0x0ef2F9c8845da4c9c34BEf02C3213e0Da1306Da0"})});
// Report Pre-matched trade for T+0 settlement (_ISIN, _buyLegId, _saleLegId, _tradeId, _settlementDate, _buyerAddress, _sellerAddress, _buyerCustodianId, _sellerCustodianId, _amount, _salePrice)
PostTrade.deployed().then(function(instance){return instance.addPreMatchedTrade("ZAE001",12345,54321,1122334455,0,"0xFb91a2395d9E49b89fcA3dca0959b6eB4Ea08a0B","0x8eA823e5951243bFA7f1Daad4703396260071fB9","0x1c6B96De685481c2d9915b606D4AB1277949b4Bc","0x2d14d5Ae5E54a22043B1eccD420494DAA9513e06",100,5000,{from:"0x0ef2F9c8845da4c9c34BEf02C3213e0Da1306Da0"})});

*** CZECH TRADE ***
PostTrade.deployed().then(function(instance){return instance.getMatchedTradesIDs("ZAE001")});
PostTrade.deployed().then(function(instance){return instance.getMatchedTrades("ZAE001",1122334455)});
PostTrade.deployed().then(function(instance){return instance.getBuysPartiesForIsin("ZAE001",12345)});
PostTrade.deployed().then(function(instance){return instance.getBuysForIsin("ZAE001",12345)});

*** INVESTOR or PROXY
// Confirm Buy leg:
PostTrade.deployed().then(function(instance){return instance.confirmTradeLeg(0, 12345, "ZAE001", "0xFb91a2395d9E49b89fcA3dca0959b6eB4Ea08a0B")});
ConfirmationsAndMandates.deployed().then(function(instance){return instance.confirmTradeLeg(0, 12345, "ZAE001", "0xFb91a2395d9E49b89fcA3dca0959b6eB4Ea08a0B")});
// Confirm Sell leg:
PostTrade.deployed().then(function(instance){return instance.confirmTradeLeg(1, 54321, "ZAE001", "0x8eA823e5951243bFA7f1Daad4703396260071fB9")});

// Check Buyer's new ANG balance (100)
PostTrade.deployed().then(function(instance){return instance.getBalanceOfSecAndAccount("ZAE001","0xFb91a2395d9E49b89fcA3dca0959b6eB4Ea08a0B")});
// Check Seller's new ANG balance (500)
PostTrade.deployed().then(function(instance){return instance.getBalanceOfSecAndAccount("ZAE001","0x8eA823e5951243bFA7f1Daad4703396260071fB9")});
// Check Buyer's new cash balance (5000)
PostTrade.deployed().then(function(instance){return instance.getBalanceOfSecAndAccount("eZAR","0xFb91a2395d9E49b89fcA3dca0959b6eB4Ea08a0B")});
*/ 

```