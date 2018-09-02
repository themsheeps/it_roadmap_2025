pragma solidity ^0.4.23;

/** @title Post Trade Contract. */
/** @author Johan Pretorius */
/** startDate 2018-06-06 */

contract PostTrade {
    function issueSecurity (string , uint , string , string ) public pure {}
    // function setIsinIssuanceContractAddress (address) public pure {}
}

contract IsinIssuance {

    // ==========================================================================
    // Modifiers
    // ==========================================================================
    modifier onlyOwner{
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    // ==========================================================================
    // Constructor
    // ==========================================================================
    constructor (address _postTradeContract) public {
        postTradeContractAddress = _postTradeContract;
        postTradeContract = PostTrade(_postTradeContract);

        // postTradeContract.setIsinIssuanceContractAddress(this);

        owner = msg.sender;
    }

    PostTrade postTradeContract;
    address public postTradeContractAddress;
    address owner;

    // ==========================================================================
    // Structs
    // ==========================================================================
    struct Security {
        string ISIN;
        uint totalIssuedShareCap;
        string longName;
        string ticker;
        bool active;
        address issuer;
        address verifier;
    }

    // ==========================================================================
    // Variables
    // ==========================================================================
    mapping (address => Security[]) public securitiesToBeVerifiedByParty;
    Security private tempSecurity;

    function captureSecurity (
        string _ISIN, 
        uint _totalIssuedShareCap, 
        string _longName, 
        string _ticker, 
        address _counterParty) public onlyOwner {
        securitiesToBeVerifiedByParty[_counterParty].push(
            Security({
                ISIN: _ISIN,
                totalIssuedShareCap: _totalIssuedShareCap,
                longName: _longName,
                ticker: _ticker,
                active: false,
                issuer: msg.sender,
                verifier: _counterParty
            })
        );

        // tempSecurity = Security({
        //     ISIN: _ISIN,
        //     totalIssuedShareCap: _totalIssuedShareCap,
        //     longName: _longName,
        //     ticker: _ticker,
        //     active: false,
        //     issuer: msg.sender,
        //     verifier: _counterParty
        // });
    }

    function getSecurityToBeVerified (uint _index) public view returns (
        string _ISIN,
        uint _totalIssuedShareCap,
        string _longName,
        string _ticker,
        bool _active,
        address _issuer,
        address _verifier
    ){
        require(securitiesToBeVerifiedByParty[msg.sender].length > _index, "index out of bounds");
        return (
            securitiesToBeVerifiedByParty[msg.sender][_index].ISIN,
            securitiesToBeVerifiedByParty[msg.sender][_index].totalIssuedShareCap,
            securitiesToBeVerifiedByParty[msg.sender][_index].longName,
            securitiesToBeVerifiedByParty[msg.sender][_index].ticker,
            securitiesToBeVerifiedByParty[msg.sender][_index].active,
            securitiesToBeVerifiedByParty[msg.sender][_index].issuer,
            securitiesToBeVerifiedByParty[msg.sender][_index].verifier
        );
    }

    function verifySecurity (uint _index) public {
        require (securitiesToBeVerifiedByParty[msg.sender][_index].active == false, "Security must be inactive");
        securitiesToBeVerifiedByParty[msg.sender][_index].active = true;

        postTradeContract.issueSecurity(
            securitiesToBeVerifiedByParty[msg.sender][_index].ISIN,
            securitiesToBeVerifiedByParty[msg.sender][_index].totalIssuedShareCap,
            securitiesToBeVerifiedByParty[msg.sender][_index].longName,
            securitiesToBeVerifiedByParty[msg.sender][_index].ticker
        );
    }

/*
// Always do this right after deploying contract
PostTrade.deployed().then(function(instance){return instance.setIsinIssuanceContractAddress(IsinIssuance.address)});

IsinIssuance.deployed().then(function(instance){return instance.postTradeContractAddress()});

IsinIssuance.deployed().then(function(instance){return instance.captureSecurity("ZAE001",1000,"Anglo American PLC","ANG","0xfb91a2395d9e49b89fca3dca0959b6eb4ea08a0b")});
IsinIssuance.deployed().then(function(instance){return instance.captureSecurity("eZAR",1000000,"eZAR","eZAR","0x51e63a2e221c782bfc95f42cd469d3780a479c15")});
IsinIssuance.deployed().then(function(instance){return instance.getSecurityToBeVerified(0, {from:"0xfb91a2395d9e49b89fca3dca0959b6eb4ea08a0b"})});
IsinIssuance.deployed().then(function(instance){return instance.getSecurityToBeVerified(0, {from:"0x51e63a2e221c782bfc95f42cd469d3780a479c15"})});
IsinIssuance.deployed().then(function(instance){return instance.verifySecurity(0, {from:"0xfb91a2395d9e49b89fca3dca0959b6eb4ea08a0b"})});
IsinIssuance.deployed().then(function(instance){return instance.verifySecurity(0, {from:"0x51e63a2e221c782bfc95f42cd469d3780a479c15"})});
IsinIssuance.deployed().then(function(instance){return instance.getSecurityToBeVerified(0, {from:"0xfb91a2395d9e49b89fca3dca0959b6eb4ea08a0b"})});
PostTrade.deployed().then(function(instance){return instance.getSecurityDetails("ZAE001")});
PostTrade.deployed().then(function(instance){return instance.getSecurityDetails("eZAR")});
    
*/

    // ==========================================================================
    // TRUFFLE MNEMONIC: latin bonus invest museum gate buffalo fever demand neglect entire session rail
    // [ '0x51e63a2e221c782bfc95f42cd469d3780a479c15',
    //   '0xfb91a2395d9e49b89fca3dca0959b6eb4ea08a0b',
    //   '0x8ea823e5951243bfa7f1daad4703396260071fb9',
    //   '0xed646f6b0cf23c2bfc0dc4117da42eb5ccf15ee4',
    //   '0xa1ff8ee897ed92e62ae9f30061ba5f012e804721',
    //   '0x1c6b96de685481c2d9915b606d4ab1277949b4bc',
    //   '0x2d14d5ae5e54a22043b1eccd420494daa9513e06',
    //   '0x0ef2f9c8845da4c9c34bef02c3213e0da1306da0',
    //   '0x3e7eaa5bc0ee36b4308b668050535d411a81585d',
    //   '0x2aab2c02fc5415d23e91ce8dc230d3a31793cff8' ]
    // ==========================================================================
    // *** END TRIAL CODE ***
    // ==========================================================================

}