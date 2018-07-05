# it_roadmap_2025

![](http://strate.co.za/sites/default/files/state-logo-dark.svg)
powered by: http://www.strate.co.za

This POC aims to reimagine what post trade services could look like with all participants on a DLT with much of the functionality baken into Solidity Contracts.

# Features!

* Multi securities issuance
* Issuer top-up
* Tokenised cash to enable pure DvP
* Free of payment sending of securities

# TODOs

* Back to back linking of transactions
* Corporate Action processing
* DvP
* Test cases

# Tech

* [TruffleFramework] - Framework for creating Solidity Contracts and DAPPs!
* [Ethereum] - Ethereum
* [NPM] - NPM
* [Node] - Node
* [HTML5] - HTML5

# Truffle Console Helper Commands

```sh
---
    ==========================================================================
    Helper Console Scripts:
    ==========================================================================
    PostTrade.deployed().then(function(instance){return instance.issueSecurity("ZAE001",1000,"Anglo American PLC","ANG")});
    PostTrade.deployed().then(function(instance){return instance.getBalanceOfSecAndAccount("ZAE001","0x51e63a2E221C782Bfc95f42Cd469D3780a479C15")});
    PostTrade.deployed().then(function(instance){return instance.sendSecurity("ZAE001",600,"0x2AaB2c02Fc5415D23e91CE8Dc230D3A31793CFF8")});
    PostTrade.deployed().then(function(instance){return instance.sendSecurity("ZAE001",500,"0x8ea823e5951243bfa7f1daad4703396260071fb9", {from: "0x2AaB2c02Fc5415D23e91CE8Dc230D3A31793CFF8"})});
    PostTrade.deployed().then(function(instance){return instance.getSecurityDetails("ZAE001")});
    PostTrade.deployed().then(function(instance){return instance.getSecuritiesListById(0)});
    
    ==========================================================================
    TRUFFLE MNEMONIC: latin bonus invest museum gate buffalo fever demand neglect entire session rail
    [ '0x51e63a2e221c782bfc95f42cd469d3780a479c15',      <<< OWNER and default recipient of initial issue
      '0xfb91a2395d9e49b89fca3dca0959b6eb4ea08a0b',      <<< Rudi
      '0x8ea823e5951243bfa7f1daad4703396260071fb9',      <<< Ganesh
      '0xed646f6b0cf23c2bfc0dc4117da42eb5ccf15ee4',      <<< Tanya
      '0xa1ff8ee897ed92e62ae9f30061ba5f012e804721',      <<< Johan
      '0x1c6b96de685481c2d9915b606d4ab1277949b4bc',
      '0x2d14d5ae5e54a22043b1eccd420494daa9513e06',
      '0x0ef2f9c8845da4c9c34bef02c3213e0da1306da0',
      '0x3e7eaa5bc0ee36b4308b668050535d411a81585d',
      '0x2aab2c02fc5415d23e91ce8dc230d3a31793cff8' ]
    ==========================================================================
    *** END TRIAL CODE ***
    ==========================================================================
---
```


[TruffleFramework]: <http://truffleframework.com/>
[Ethereum]: <https://ethereum.org/>
[NPM]: <https://www.npmjs.com/>
[Node]: <https://nodejs.org/en/>
[HTML5]: <https://en.wikipedia.org/wiki/HTML5>
