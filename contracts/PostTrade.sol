pragma solidity ^0.4.23;

/** @title Post Trade Contract. */
/** @author Johan Pretorius */
/** startDate 2018-06-06 */

contract PostTrade {

    // ==========================================================================
    // Actors: Trade Reporting Party x2, ETME, SAMOS, CSD
    // ==========================================================================
    // Role Management for addresses
    // ==========================================================================
    mapping(address => bool) internal Admins;
    mapping(address => bool) internal CSDs;
    mapping(address => bool) internal Custodians;
    mapping(address => bool) internal ETMEs;
    mapping(address => bool) internal Exchanges;
    mapping(address => bool) internal SAMOSs;
    mapping(address => bool) internal TradeReportingParties;

    // ==========================================================================
    // Modifiers
    // ==========================================================================
    modifier onlyOwner{
        require(msg.sender == owner);
        _;
    }

    modifier onlyOwnerOrAdmin{
        require(msg.sender == owner || Admins[msg.sender] == true);
        _;
    }

    modifier onlyCSD{
        require(CSDs[msg.sender] == true);
        _;
    }

    modifier onlyCustodian{
        require(Custodians[msg.sender] == true);
        _;
    }

    modifier onlyETME{
        require(ETMEs[msg.sender] == true);
        _;
    }

    modifier onlyExchanges{
        require(SAMOSs[msg.sender] == true);
        _;
    }

    modifier onlySAMOS{
        require(SAMOSs[msg.sender] == true);
        _;
    }

    modifier onlyTradeReportingParty{
        require(TradeReportingParties[msg.sender] == true);
        _;
    }

    address owner;

    // ==========================================================================
    // Constructor: Prepper for development, will need to be revised for Prod
    // ==========================================================================
    constructor () public {
        owner = msg.sender;
        Admins[0x51e63a2E221C782Bfc95f42Cd469D3780a479C15] = true;
        CSDs[0x2AaB2c02Fc5415D23e91CE8Dc230D3A31793CFF8] = true;
        Custodians[0x1c6B96De685481c2d9915b606D4AB1277949b4Bc] = true;
        Custodians[0x2d14d5Ae5E54a22043B1eccD420494DAA9513e06] = true;
        ETMEs[0x0ef2F9c8845da4c9c34BEf02C3213e0Da1306Da0] = true;
        Exchanges[0x0ef2F9c8845da4c9c34BEf02C3213e0Da1306Da0] = true;
        SAMOSs[0x3E7Eaa5Bc0ee36b4308B668050535d411a81585D] = true;
        TradeReportingParties[0xED646f6B0cf23C2bfC0dC4117dA42Eb5CCf15ee4] = true;
        TradeReportingParties[0xA1Ff8eE897ED92E62aE9F30061Ba5f012e804721] = true;
    }

    // ==========================================================================
    // Mapping Table: Addresses <=> Roles
    // ==========================================================================
    // 0x51e63a2E221C782Bfc95f42Cd469D3780a479C15 --- Admin / Contract Owner
    // 0xFb91a2395d9E49b89fcA3dca0959b6eB4Ea08a0B --- BUYER
    // 0x8eA823e5951243bFA7f1Daad4703396260071fB9 --- SELLER
    // 0xED646f6B0cf23C2bfC0dC4117dA42Eb5CCf15ee4 --- BUYER TRP
    // 0xA1Ff8eE897ED92E62aE9F30061Ba5f012e804721 --- SELLER TRP
    // 0x1c6B96De685481c2d9915b606D4AB1277949b4Bc --- BUYER CUSTODIAN
    // 0x2d14d5Ae5E54a22043B1eccD420494DAA9513e06 --- SELLER CUSTODIAN
    // 0x0ef2F9c8845da4c9c34BEf02C3213e0Da1306Da0 --- ETME (Or other matching engine)
    // 0x3E7Eaa5Bc0ee36b4308B668050535d411a81585D --- SAMOS
    // 0x2AaB2c02Fc5415D23e91CE8Dc230D3A31793CFF8 --- CSD
    // ==========================================================================
    // Ganache Mnemonic: latin bonus invest museum gate buffalo fever demand neglect entire session rail
    // ==========================================================================

    // ==========================================================================
    // State transitions ( [Pre-State] => [Post-State] --- [Responsible Party] ):
    // ==========================================================================
    // 101 (Accepted) => 201 (Matched) --- N.A.
    // 201 (Matched) => 201 AFFI (Confirmed) --- TRP
    // 201 AFFI => 401 (Cancelled) --- TRP
    // 201 AFFI => 251 (Matched Ready For Settlement) --- N.A.
    // 251 => 301 (Overdue) --- CSD
    // 301 => 601 (Settled) --- SAMOS
    // 301 => 801 (Failed) --- CSD
    // 251 => 512 (Ready for funding) --- N.A.
    // 512 => 601 (Settled) --- SAMOS
    // ==========================================================================
    enum Statuses {
        Acceped,                    // 0
        Matched,                    // 1
        Confirmed,                  // 2
        Cancelled,                  // 3
        MatchedReadyForSettlement,  // 4
        Overdue,                    // 5
        Settled,                    // 6
        Failed,                     // 7
        ReadyForFunding             // 8
    }

    // ==========================================================================
    // Structs
    // ==========================================================================
    struct SecurityOld {
        string isin;
        uint issuedShareCap;
        uint issuedDate;
        address issuerAddress;
        string issuerName;
    }

    struct Security {
        string ISIN;
        uint totalIssuedShareCap;
        string longName;
        string ticker;
        bool active;
    }

    struct Trade {
        uint tradeId;
        uint buyLegId;
        uint sellLegId;
        uint tradeDate;
        uint settlementDeadlineDate;
        uint buyConfirmationDateTime;
        uint saleConfirmationDateTime;
    }

    struct BuyLeg {
        uint buyLegId;
        uint tradeId;
        address investorAddress;
        address tradeReportingPartyAddress;
        address custodianId;
        uint amount;
        uint buyPrice;
        Statuses status;
        uint timestamp;
    }

    struct SaleLeg {
        uint saleLegId;
        uint tradeId;
        address investorAddress;
        address tradeReportingPartyAddress;
        address custodianId;
        uint amount;
        uint salePrice;
        Statuses status;
        uint timestamp;
    }

    // ==========================================================================
    // Variables
    // ==========================================================================

    mapping(bytes32 => mapping (address => uint)) public balances;
    mapping(bytes32 => Security) public securities;
    
    // Mappings for trades and trade legs
    mapping(bytes32 => uint[]) matchedBuysIdListForISIN;
    mapping(bytes32 => mapping(uint => BuyLeg)) buyLegForISINAndId;

    mapping(bytes32 => uint[]) matchedSalesIdListForISIN;
    mapping(bytes32 => mapping(uint => SaleLeg)) saleLegForISINAndId;

    mapping(bytes32 => Trade[]) matchedTradesForISIN;

    string[] securitiesList;

    // ==========================================================================
    // Functions
    // ==========================================================================

    function issueSecurity (string _ISIN, uint _totalIssuedShareCap, string _longName, string _ticker) public onlyOwner {
        require (securities[keccak256(abi.encodePacked(_ISIN))].active == false);
        bytes32 keccakIsin = keccak256(abi.encodePacked(_ISIN));
        securities[keccakIsin].ISIN = _ISIN;
        securities[keccakIsin].totalIssuedShareCap = _totalIssuedShareCap;
        securities[keccakIsin].longName = _longName;
        securities[keccakIsin].ticker = _ticker;
        securities[keccakIsin].active = true;

        securitiesList.push(_ISIN);

        balances[keccak256(abi.encodePacked(_ISIN))][owner] += _totalIssuedShareCap;
    }

    function issueCash (uint _totalIssuedShareCap) public onlySAMOS {
        require (securities[keccak256(abi.encodePacked("eZAR"))].active == false);
        bytes32 keccakIsin = keccak256(abi.encodePacked("eZAR"));
        securities[keccakIsin].ISIN = "eZAR";
        securities[keccakIsin].totalIssuedShareCap = _totalIssuedShareCap;
        securities[keccakIsin].longName = "Sourth African eRand";
        securities[keccakIsin].ticker = "ZAR";
        securities[keccakIsin].active = true;

        securitiesList.push("eZAR");

        balances[keccak256(abi.encodePacked("eZAR"))][owner] += _totalIssuedShareCap;
    }

    function topUp (string _ISIN, uint _amount) public onlyOwner {
        require (securities[keccak256(abi.encodePacked(_ISIN))].active == true);
        securities[keccak256(abi.encodePacked(_ISIN))].totalIssuedShareCap += _amount;
        balances[keccak256(abi.encodePacked(_ISIN))][owner] += _amount;
    }

    function topUpCash (uint _amount) public onlySAMOS {
        require (securities[keccak256(abi.encodePacked("eZAR"))].active == true);
        securities[keccak256(abi.encodePacked("eZAR"))].totalIssuedShareCap += _amount;
        balances[keccak256(abi.encodePacked("eZAR"))][owner] += _amount;
    }

    function getSecurityDetails (string _ISIN) public view returns (string, uint, string, string, bool) {
        return (
            securities[keccak256(abi.encodePacked(_ISIN))].ISIN,
            securities[keccak256(abi.encodePacked(_ISIN))].totalIssuedShareCap,
            securities[keccak256(abi.encodePacked(_ISIN))].longName,
            securities[keccak256(abi.encodePacked(_ISIN))].ticker,
            securities[keccak256(abi.encodePacked(_ISIN))].active
        );
    }

    function getSecuritiesListById (uint _index) public view returns (string, uint) {
        return (securitiesList[_index], securitiesList.length);
    }

    // THIS FUNCTION NEEDS AN EXPERIMENTAL ABI ENCODER
    // -----------------------------------------------
    // function getSecuritiesList () public view returns (string[]) {
    //     return (securitiesList);
    // }

    function getBalanceOfSecAndAccount (string _ISIN, address _accountHolder) public view returns (uint) {
        return balances[keccak256(abi.encodePacked(_ISIN))][_accountHolder];
    }

    function sendSecurity (string _ISIN, uint _amount, address _receiverAddress) public {
        require (balances[keccak256(abi.encodePacked(_ISIN))][msg.sender] >= _amount);
        balances[keccak256(abi.encodePacked(_ISIN))][msg.sender] -= _amount;
        balances[keccak256(abi.encodePacked(_ISIN))][_receiverAddress] += _amount;
    }

    // For On Markets the trade will come in already pre matched
    function addPreMatchedTrade (
        string _ISIN,
        uint _buyLegId,
        uint _saleLegId,
        uint _tradeId,
        address _buyerAddress,
        address _sellerAddress,
        address _buyerTradeReportingPartyAddress,
        address _sellerTradeReportingPartyAddress,
        address _buyerCustodianId,
        address _sellerCustodianId,
        uint _amount,
        uint _salePrice ) public onlyExchanges {
        
        bytes32 _hash = keccak256(abi.encodePacked(_ISIN));

        matchedBuysIdListForISIN[_hash].push(_buyLegId);
        matchedSalesIdListForISIN[_hash].push(_saleLegId);

        buyLegForISINAndId[_hash][_buyLegId] = BuyLeg({
            buyLegId: _buyLegId,
            tradeId: _tradeId,
            investorAddress: _buyerAddress,
            tradeReportingPartyAddress: _buyerTradeReportingPartyAddress,
            custodianId: _buyerCustodianId,
            amount: _amount,
            buyPrice: _salePrice,
            status: Statuses.Matched,
            timestamp: block.timestamp
        });

        saleLegForISINAndId[_hash][_saleLegId] = SaleLeg({
            saleLegId: _saleLegId,
            tradeId: _tradeId,
            investorAddress: _sellerAddress,
            tradeReportingPartyAddress: _sellerTradeReportingPartyAddress,
            custodianId: _sellerCustodianId,
            amount: _amount,
            salePrice: _salePrice,
            status: Statuses.Matched,
            timestamp: block.timestamp
        });

        matchedTradesForISIN[_hash].push(Trade({
            tradeId: _tradeId,
            buyLegId: _buyLegId,
            sellLegId: _saleLegId,
            tradeDate: block.timestamp,
            settlementDeadlineDate: block.timestamp + 3 days,
            buyConfirmationDateTime: 0,
            saleConfirmationDateTime: 0
        }));

    // struct Trade {
    //     uint tradeId;
    //     uint buyLegId;
    //     uint sellLegId;
    //     uint tradeDate;
    //     uint settlementDeadlineDate;
    //     uint buyConfirmationDateTime;
    //     uint saleConfirmationDateTime;
    // }

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