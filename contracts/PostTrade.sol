pragma solidity ^0.4.23;

// @@Author: Johan Pretorius
// @@Date: 2018-06-06

contract PostTrade {

    modifier onlyOwner{
        require(msg.sender == owner);
        _;
    }

    address owner;

    struct Security {
        string ISIN;
        uint totalIssuedShareCap;
        string longName;
        string ticker;
        bool active;
    }

    constructor () public {
        owner = msg.sender;
    }

    mapping(bytes32 => mapping (address => uint)) public balances;
    mapping(bytes32 => Security) public securities;
    
    string[] securitiesList;

    function issueSecurity (string _ISIN, uint _totalIssuedShareCap, string _longName, string _ticker) public onlyOwner {
        require (securities[keccak256(_ISIN)].active == false);
        bytes32 keccakIsin = keccak256(_ISIN);
        securities[keccakIsin].ISIN = _ISIN;
        securities[keccakIsin].totalIssuedShareCap = _totalIssuedShareCap;
        securities[keccakIsin].longName = _longName;
        securities[keccakIsin].ticker = _ticker;
        securities[keccakIsin].active = true;

        securitiesList.push(_ISIN);

        balances[keccak256(_ISIN)][owner] += _totalIssuedShareCap;
    }

    function topUp (string _ISIN, uint _amount) public onlyOwner {
        require (securities[keccak256(_ISIN)].active == true);
        securities[keccak256(_ISIN)].totalIssuedShareCap += _amount;
        balances[keccak256(_ISIN)][owner] += _amount;
    }

    function getSecurityDetails (string _ISIN) public view returns (string, uint, string, string, bool) {
        return (
            securities[keccak256(_ISIN)].ISIN,
            securities[keccak256(_ISIN)].totalIssuedShareCap,
            securities[keccak256(_ISIN)].longName,
            securities[keccak256(_ISIN)].ticker,
            securities[keccak256(_ISIN)].active
        );
    }

    function getSecuritiesListById (uint _index) public view returns (string, uint) {
        return (securitiesList[_index], securitiesList.length);
    }

    function getBalanceOfSecAndAccount (string _ISIN, address _accountHolder) public view returns (uint) {
        return balances[keccak256(_ISIN)][_accountHolder];
    }

    function sendSecurity (string _ISIN, uint _amount, address _receiverAddress) public {
        require (balances[keccak256(_ISIN)][msg.sender] >= _amount);
        balances[keccak256(_ISIN)][msg.sender] -= _amount;
        balances[keccak256(_ISIN)][_receiverAddress] += _amount;
    }

    // ==========================================================================
    // Helper Console Scripts:
    // ==========================================================================
    //
    // PostTrade.deployed().then(function(instance){return instance.issueSecurity("ZAE001",1000,"Anglo American PLC","ANG")});
    // PostTrade.deployed().then(function(instance){return instance.getBalanceOfSecAndAccount("ZAE001","0x51e63a2E221C782Bfc95f42Cd469D3780a479C15")});
    // PostTrade.deployed().then(function(instance){return instance.sendSecurity("ZAE001",600,"0x2AaB2c02Fc5415D23e91CE8Dc230D3A31793CFF8")});
    // PostTrade.deployed().then(function(instance){return instance.sendSecurity("ZAE001",500,"0x8ea823e5951243bfa7f1daad4703396260071fb9", {from: "0x2AaB2c02Fc5415D23e91CE8Dc230D3A31793CFF8"})});
    // PostTrade.deployed().then(function(instance){return instance.getSecurityDetails("ZAE001")});
    // PostTrade.deployed().then(function(instance){return instance.getSecuritiesListById(0)});
    // 
    // ==========================================================================
    // TRUFFLE MNEMONIC: latin bonus invest museum gate buffalo fever demand neglect entire session rail
    // [ '0x51e63a2e221c782bfc95f42cd469d3780a479c15',      <<< OWNER and default recipient of initial issue
    //   '0xfb91a2395d9e49b89fca3dca0959b6eb4ea08a0b',      <<< Rudi
    //   '0x8ea823e5951243bfa7f1daad4703396260071fb9',      <<< Ganesh
    //   '0xed646f6b0cf23c2bfc0dc4117da42eb5ccf15ee4',      <<< Tanya
    //   '0xa1ff8ee897ed92e62ae9f30061ba5f012e804721',      <<< Johan
    //   '0x1c6b96de685481c2d9915b606d4ab1277949b4bc',
    //   '0x2d14d5ae5e54a22043b1eccd420494daa9513e06',
    //   '0x0ef2f9c8845da4c9c34bef02c3213e0da1306da0',
    //   '0x3e7eaa5bc0ee36b4308b668050535d411a81585d',
    //   '0x2aab2c02fc5415d23e91ce8dc230d3a31793cff8' ]
    // ==========================================================================
    // *** END TRIAL CODE ***
    // ==========================================================================
}