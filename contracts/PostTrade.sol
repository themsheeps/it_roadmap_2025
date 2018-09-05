pragma solidity ^0.4.23;

/** @title Post Trade Contract. */
/** @author Johan Pretorius */
/** startDate 2018-06-06 */

contract PostTrade {

    // ==========================================================================
    // Modifiers : Modifiers are only added when used, the rest are commented out
    // ==========================================================================
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    modifier onlyOwnerOrAdmin {
        require(msg.sender == owner || Admins[msg.sender] == true);
        _;
    }

    // modifier onlyCSD{
    //     require(CSDs[msg.sender] == true);
    //     _;
    // }

    // modifier onlyCustodian{
    //     require(Custodians[msg.sender] == true);
    //     _;
    // }

    // modifier onlyCustodianOrTradeReportingParty {
    //     require(Custodians[msg.sender] == true || TradeReportingParties[msg.sender] == true, "OC");
    //     _;
    // }

    // modifier onlyETME{
    //     require(ETMEs[msg.sender] == true);
    //     _;
    // }

    // modifier onlyExchanges{
    //     require(Exchanges[msg.sender] == true, "OE");
    //     _;
    // }

    modifier onlyIsinIssuanceContact {
        require(msg.sender == isinIssuanceContractAddress);
        _;
    }

    // modifier onlySAMOS{
    //     require(SAMOSs[msg.sender] == true);
    //     _;
    // }

    // modifier onlyTradeReportingParty{
    //     require(TradeReportingParties[msg.sender] == true);
    //     _;
    // }

    address private owner;
    address private isinIssuanceContractAddress;

    // ==========================================================================
    // Constructor: Prepper for development, will need to be revised for Prod
    // ==========================================================================
    constructor () public {
        owner = msg.sender;
        Admins[0x51e63a2E221C782Bfc95f42Cd469D3780a479C15] = true;
        // CSDs[0x2AaB2c02Fc5415D23e91CE8Dc230D3A31793CFF8] = true;
        // Custodians[0x1c6B96De685481c2d9915b606D4AB1277949b4Bc] = true;
        // Custodians[0x2d14d5Ae5E54a22043B1eccD420494DAA9513e06] = true;
        // ETMEs[0x0ef2F9c8845da4c9c34BEf02C3213e0Da1306Da0] = true;
        // Exchanges[0x0ef2F9c8845da4c9c34BEf02C3213e0Da1306Da0] = true;
        // SAMOSs[0x3E7Eaa5Bc0ee36b4308B668050535d411a81585D] = true;
        // TradeReportingParties[0xED646f6B0cf23C2bfC0dC4117dA42Eb5CCf15ee4] = true;
        // TradeReportingParties[0xA1Ff8eE897ED92E62aE9F30061Ba5f012e804721] = true;
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
    // struct SecurityOld {
    //     string isin;
    //     uint issuedShareCap;
    //     uint issuedDate;
    //     address issuerAddress;
    //     string issuerName;
    // }

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
        // address tradeReportingPartyAddress;
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
        // address tradeReportingPartyAddress;
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
    mapping(bytes32 => uint[]) public matchedBuysIdListForISIN;
    mapping(bytes32 => mapping(uint => BuyLeg)) public buyLegForISINAndId;

    mapping(bytes32 => uint[]) public matchedSalesIdListForISIN;
    mapping(bytes32 => mapping(uint => SaleLeg)) public saleLegForISINAndId;

    mapping(bytes32 => uint[]) public matchedTradesIdListForISIN;
    mapping(bytes32 => mapping(uint => Trade)) public matchedTradesForISINandId;
    //mapping(bytes32 => mapping(uint => Trade[])) public confirmedTradesForISINandSettlementDate;

    string[] public securitiesList;

    // ==========================================================================
    // Actors: Trade Reporting Party x2, ETME, SAMOS, CSD
    // ==========================================================================
    // Role Management for addresses
    // ==========================================================================
    mapping(address => bool) internal Admins;
    // mapping(address => bool) internal CSDs;
    // mapping(address => bool) internal Custodians;
    // mapping(address => bool) internal ETMEs;
    // mapping(address => bool) internal Exchanges;
    // mapping(address => bool) internal SAMOSs;
    // mapping(address => bool) internal TradeReportingParties;

    // ==========================================================================
    // Date stuff: Taken from Piper's library - https://github.com/pipermerriam/ethereum-datetime
    // ==========================================================================
    uint constant DAY_IN_SECONDS = 86400;
    // uint constant YEAR_IN_SECONDS = 31536000;
    // uint constant LEAP_YEAR_IN_SECONDS = 31622400;

    // uint constant HOUR_IN_SECONDS = 3600;
    // uint constant MINUTE_IN_SECONDS = 60;

    // uint16 constant ORIGIN_YEAR = 1970;

    // ==========================================================================
    // Functions
    // ==========================================================================

    // TODO: Expand on ISIN issuance as per scrum board: https://trello.com/b/45EzfvGG/scrum-board
    function issueSecurity (string _ISIN, uint _totalIssuedShareCap, string _longName, string _ticker) public onlyIsinIssuanceContact {
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

    // function issueCash (uint _totalIssuedShareCap) public onlySAMOS {
    //     require (securities[keccak256(abi.encodePacked("eZAR"))].active == false);
    //     bytes32 keccakIsin = keccak256(abi.encodePacked("eZAR"));
    //     securities[keccakIsin].ISIN = "eZAR";
    //     securities[keccakIsin].totalIssuedShareCap = _totalIssuedShareCap;
    //     securities[keccakIsin].longName = "Sourth African eRand";
    //     securities[keccakIsin].ticker = "ZAR";
    //     securities[keccakIsin].active = true;

    //     securitiesList.push("eZAR");

    //     balances[keccak256(abi.encodePacked("eZAR"))][msg.sender] += _totalIssuedShareCap;
    // }

    function topUp (string _ISIN, uint _amount) public onlyOwner {
        require (securities[keccak256(abi.encodePacked(_ISIN))].active == true);
        securities[keccak256(abi.encodePacked(_ISIN))].totalIssuedShareCap += _amount;
        balances[keccak256(abi.encodePacked(_ISIN))][owner] += _amount;
    }

    // to save gas cost, rather send securities to 0x0 to burn them.
    function reduceSecurities (string _ISIN, uint _amount) public onlyOwner {
        require (securities[keccak256(abi.encodePacked(_ISIN))].active == true, "SMA");
        require (securities[keccak256(abi.encodePacked(_ISIN))].totalIssuedShareCap >= _amount, "TB");
        securities[keccak256(abi.encodePacked(_ISIN))].totalIssuedShareCap -= _amount;
        balances[keccak256(abi.encodePacked(_ISIN))][owner] -= _amount;
    }

    // function topUpCash (uint _amount) public onlySAMOS {
    //     require (securities[keccak256(abi.encodePacked("eZAR"))].active == true);
    //     securities[keccak256(abi.encodePacked("eZAR"))].totalIssuedShareCap += _amount;
    //     balances[keccak256(abi.encodePacked("eZAR"))][owner] += _amount;
    // }

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

    function getSecuritiesListLength() public view returns (uint) {
        return (securitiesList.length);
    }

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
        uint _settlementDate, // Format YYYYMMDD or 0 for instant (T+0) settlement
        address _buyerAddress,
        address _sellerAddress,
        address _buyerCustodianId,
        address _sellerCustodianId,
        uint _amount,
        // uint _salePrice ) public onlyExchanges {
        uint _salePrice ) public {

        bytes32 _hash = keccak256(abi.encodePacked(_ISIN));
        uint lastMidnightTime;

        // Require that the ISIN is valid on the system
        require(securities[_hash].active);

        // Find midnigth time from block.timestamp
        lastMidnightTime = block.timestamp;
        lastMidnightTime -= (lastMidnightTime % DAY_IN_SECONDS);

        matchedBuysIdListForISIN[_hash].push(_buyLegId);
        matchedSalesIdListForISIN[_hash].push(_saleLegId);
        matchedTradesIdListForISIN[_hash].push(_tradeId);

        buyLegForISINAndId[_hash][_buyLegId] = BuyLeg({
            buyLegId: _buyLegId,
            tradeId: _tradeId,
            investorAddress: _buyerAddress,
            // tradeReportingPartyAddress: _buyerTradeReportingPartyAddress,
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
            // tradeReportingPartyAddress: _sellerTradeReportingPartyAddress,
            custodianId: _sellerCustodianId,
            amount: _amount,
            salePrice: _salePrice,
            status: Statuses.Matched,
            timestamp: block.timestamp
        });

        matchedTradesForISINandId[_hash][_tradeId] = Trade({
            tradeId: _tradeId,
            buyLegId: _buyLegId,
            sellLegId: _saleLegId,
            tradeDate: lastMidnightTime,
            settlementDeadlineDate: _settlementDate,
            buyConfirmationDateTime: 0,
            saleConfirmationDateTime: 0
        });

    }

    // Due to stack overflow errors the returns for buys and sales must be split into seperate functions as there are too many fields to return
    function getBuysPartiesForIsin(string _ISIN, uint _legId) public view returns (uint, address, address) {  
        bytes32 _hash = keccak256(abi.encodePacked(_ISIN));
        return (
            buyLegForISINAndId[_hash][_legId].buyLegId,
            buyLegForISINAndId[_hash][_legId].investorAddress,
            // buyLegForISINAndId[_hash][_legId].tradeReportingPartyAddress,
            buyLegForISINAndId[_hash][_legId].custodianId
        );
    }

    function getBuysForIsin(string _ISIN, uint _legId) public view returns (uint, uint, uint, Statuses, uint) {  
        bytes32 _hash = keccak256(abi.encodePacked(_ISIN));
        return (
            buyLegForISINAndId[_hash][_legId].amount,
            buyLegForISINAndId[_hash][_legId].buyPrice,
            buyLegForISINAndId[_hash][_legId].timestamp,
            buyLegForISINAndId[_hash][_legId].status,
            buyLegForISINAndId[_hash][_legId].buyLegId
        );
    }

    function getSalesPartiesForIsin(string _ISIN, uint _legId) public view returns (uint, address, address) {  
        bytes32 _hash = keccak256(abi.encodePacked(_ISIN));
        return (
            saleLegForISINAndId[_hash][_legId].saleLegId,
            saleLegForISINAndId[_hash][_legId].investorAddress,
            // saleLegForISINAndId[_hash][_legId].tradeReportingPartyAddress,
            saleLegForISINAndId[_hash][_legId].custodianId
        );
    }

    function getSalesForIsin(string _ISIN, uint _index) public view returns (uint, uint, uint, Statuses, uint) {  
        bytes32 _hash = keccak256(abi.encodePacked(_ISIN));
        return (
            saleLegForISINAndId[_hash][_index].amount,
            saleLegForISINAndId[_hash][_index].salePrice,
            saleLegForISINAndId[_hash][_index].timestamp,
            saleLegForISINAndId[_hash][_index].status,
            saleLegForISINAndId[_hash][_index].saleLegId
        );
    }

    // _buyOrSaleIndicator { 0: BUY Leg, 1: SALE Leg }
    // function confirmTradeLeg (uint _buyOrSaleIndicator, uint _legId, string _ISIN) public onlyCustodianOrTradeReportingParty {
    function confirmTradeLeg (uint _buyOrSaleIndicator, uint _legId, string _ISIN, address _party) public {
        
        bytes32 _hash = keccak256(abi.encodePacked(_ISIN));
        uint _tradeId;
        // Require that the ISIN is valid on the system
        // require(securities[_hash].active);

        if (_buyOrSaleIndicator == 0) {
            // check that sender is authorised  

            // require(
            //     msg.sender == buyLegForISINAndId[_hash][_legId].custodianId ||
            //     msg.sender == buyLegForISINAndId[_hash][_legId].investorAddress);
            require(_party == buyLegForISINAndId[_hash][_legId].investorAddress);
                
                // msg.sender == buyLegForISINAndId[_hash][_legId].tradeReportingPartyAddress,
                // "Sender not authorised");

            _tradeId = buyLegForISINAndId[_hash][_legId].tradeId;
            matchedTradesForISINandId[_hash][_tradeId].buyConfirmationDateTime = block.timestamp;
        } else if (_buyOrSaleIndicator == 1) {
            // check that sender is authorised       
            // require(
            //     msg.sender == saleLegForISINAndId[_hash][_legId].custodianId ||
            //     msg.sender == saleLegForISINAndId[_hash][_legId].investorAddress);
            require(_party == saleLegForISINAndId[_hash][_legId].investorAddress);

                // msg.sender == saleLegForISINAndId[_hash][_legId].tradeReportingPartyAddress,
                // "Sender must be autherised");

            _tradeId = saleLegForISINAndId[_hash][_legId].tradeId;
            matchedTradesForISINandId[_hash][_tradeId].saleConfirmationDateTime = block.timestamp;
        } else {
            revert("ERR");
        }

        if (matchedTradesForISINandId[_hash][_tradeId].saleConfirmationDateTime > 0) {
            if (matchedTradesForISINandId[_hash][_tradeId].saleConfirmationDateTime > 0) {

                if (matchedTradesForISINandId[_hash][_tradeId].settlementDeadlineDate == 0) {
                    balances[keccak256(abi.encodePacked("eZAR"))][buyLegForISINAndId[_hash][matchedTradesForISINandId[_hash][_tradeId].buyLegId].investorAddress] -= buyLegForISINAndId[_hash][matchedTradesForISINandId[_hash][_tradeId].buyLegId].buyPrice;
                    balances[keccak256(abi.encodePacked("eZAR"))][saleLegForISINAndId[_hash][matchedTradesForISINandId[_hash][_tradeId].sellLegId].investorAddress] += saleLegForISINAndId[_hash][matchedTradesForISINandId[_hash][_tradeId].sellLegId].salePrice;
                    balances[keccak256(abi.encodePacked(_ISIN))][saleLegForISINAndId[_hash][matchedTradesForISINandId[_hash][_tradeId].sellLegId].investorAddress] -= saleLegForISINAndId[_hash][matchedTradesForISINandId[_hash][_tradeId].sellLegId].amount;
                    balances[keccak256(abi.encodePacked(_ISIN))][buyLegForISINAndId[_hash][matchedTradesForISINandId[_hash][_tradeId].buyLegId].investorAddress] += buyLegForISINAndId[_hash][matchedTradesForISINandId[_hash][_tradeId].buyLegId].amount;
                } else {
                    // Once a perfect match has been made, add the fully confirmed trade to a list of trades to be settled on settlement date.
                    // confirmedTradesForISINandSettlementDate[_hash][matchedTradesForISINandId[_hash][_tradeId].settlementDeadlineDate].push(matchedTradesForISINandId[_hash][_tradeId]);
                    //TODO: Add securities netting
                    //  Do reservation for securities 
                    //    Decuct securities from seller
                    //    Add securities from buyer
                    //  Check if buyer has enough cash to do real-time settlement ??? <<<< Confirm with Ganesh / Rudi
                    //  Do cash calculation from 
                    //    Decuct cash from seller CSDP
                    //    Add cash to buyer CSDP
                }
            }
        }
    }

    function setIsinIssuanceContractAddress (address _isinIssuanceContractAddress) public onlyOwner {
        isinIssuanceContractAddress = _isinIssuanceContractAddress;
    }

    // ==========================================================================
    // Add/Remove Authorised Roles:
    // ==========================================================================    
    // Administrators will have elevated contract permissions, at present this 
    // will be crude, but in productionising the contract this will become
    // a vital role.
    // ==========================================================================
    function addRemoveAdmin(address _adminAddress, bool _activeFlag) public onlyOwnerOrAdmin {
        Admins[_adminAddress] = _activeFlag;
    }

    // function addRemoveCSD(address _CSDAddress, bool _activeFlag) public onlyOwnerOrAdmin {
    //     CSDs[_CSDAddress] = _activeFlag;
    // }

    // function addRemoveCustodian(address _CustodianAddress, bool _activeFlag) public onlyOwnerOrAdmin {
    //     Custodians[_CustodianAddress] = _activeFlag;
    // }

    // function addRemoveETME(address _ETMEAddress, bool _activeFlag) public onlyOwnerOrAdmin {
    //     ETMEs[_ETMEAddress] = _activeFlag;
    // }

    // function addRemoveExchange(address _ExchangeAddress, bool _activeFlag) public onlyOwnerOrAdmin {
    //     Exchanges[_ExchangeAddress] = _activeFlag;
    // }

    // function addRemoveSAMOS(address _SAMOSAddress, bool _activeFlag) public onlyOwnerOrAdmin {
    //     SAMOSs[_SAMOSAddress] = _activeFlag;
    // }

    // function addRemoveTradeReportingParty(address _TradeReportingPartyAddress, bool _activeFlag) public onlyOwnerOrAdmin {
    //     TradeReportingParties[_TradeReportingPartyAddress] = _activeFlag;
    // }

    // ==========================================================================
    // Helper Console Scripts:
    // ==========================================================================
/* 
// Must issue Securities from the IsinIssuance Contract - this will not work
PostTrade.deployed().then(function(instance){return instance.issueSecurity("ZAE001",1000,"Anglo American PLC","ANG")});
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

*** INVESTOR or PROXY
// Confirm Buy leg:
PostTrade.deployed().then(function(instance){return instance.confirmTradeLeg(0, 12345, "ZAE001", "0xFb91a2395d9E49b89fcA3dca0959b6eB4Ea08a0B")});
// Confirm Sell leg:
PostTrade.deployed().then(function(instance){return instance.confirmTradeLeg(1, 54321, "ZAE001", "0x8eA823e5951243bFA7f1Daad4703396260071fB9")});



// Check Buyer's new ANG balance (100)
PostTrade.deployed().then(function(instance){return instance.getBalanceOfSecAndAccount("ZAE001","0xFb91a2395d9E49b89fcA3dca0959b6eB4Ea08a0B")});
// Check Seller's new ANG balance (500)
PostTrade.deployed().then(function(instance){return instance.getBalanceOfSecAndAccount("ZAE001","0x8eA823e5951243bFA7f1Daad4703396260071fB9")});
// Check Buyer's new cash balance (5000)
PostTrade.deployed().then(function(instance){return instance.getBalanceOfSecAndAccount("eZAR","0xFb91a2395d9E49b89fcA3dca0959b6eB4Ea08a0B")});
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