pragma solidity ^0.4.23;

/** @title Pre Trade Contract. */
/** @author Johan Pretorius */
/** startDate 2018-06-06 */

contract PostTrade {
    function addPreMatchedTrade (
        string,
        uint,
        uint,
        uint,
        uint,
        address,
        address,
        address,
        address,
        uint,
        uint ) public pure {
    }

    function confirmTradeLeg (
        uint, 
        uint, 
        string, 
        address) public pure {
    }
}

contract ConfirmationsAndMandates {

    // ==========================================================================
    // Modifiers : Modifiers are only added when used, the rest are commented out
    // ==========================================================================
    // modifier onlyOwner {
    //     require(msg.sender == owner, "Only Owner");
    //     _;
    // }

    modifier onlyOwnerOrAdmin {
        require(msg.sender == owner || Admins[msg.sender] == true, "Only Owner or Admin");
        _;
    }

    address private owner;
    PostTrade postTradeContract;
    address public postTradeContractAddress;

    // ==========================================================================
    // Constructor: Prepper for development, will need to be revised for Prod
    // ==========================================================================
    constructor (address _postTradeContract) public {
        owner = msg.sender;        
        postTradeContractAddress = _postTradeContract;
        postTradeContract = PostTrade(_postTradeContract);
    }

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

    // struct Trade {
    //     uint tradeId;
    //     uint buyLegId;
    //     uint sellLegId;
    //     uint tradeDate;
    //     uint settlementDeadlineDate;
    //     uint buyConfirmationDateTime;
    //     uint saleConfirmationDateTime;
    // }


    // ==========================================================================
    // Variables
    // ==========================================================================

    // Client Address => Authorised Party Address => authorised bool
    mapping(address => address) ClientToSPMandates;

    // ==========================================================================
    // Functions
    // ==========================================================================

    mapping(address => bool) internal Admins;
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

    function getAutherisedParty(address _party) public view returns (address){
        return ClientToSPMandates[_party];
    }

    // set to 0x0000000000000000000000000000000000000000 to clear
    function addRemoveMandate(address _party) public {
        ClientToSPMandates[msg.sender] = _party;
    }

    // _buyOrSaleIndicator { 0: BUY Leg, 1: SALE Leg }
    function confirmTradeLeg (uint _buyOrSaleIndicator, uint _legId, string _ISIN, address _party) public view {
        require(msg.sender == ClientToSPMandates[_party] || msg.sender == _party);

        postTradeContract.confirmTradeLeg (_buyOrSaleIndicator, _legId, _ISIN, _party);

    }

    // ==========================================================================
    // Helper Console Scripts:
    // ==========================================================================
/* 

ConfirmationsAndMandates.deployed().then(function(instance){return instance.addRemoveMandate("0xED646f6B0cf23C2bfC0dC4117dA42Eb5CCf15ee4", {from: "0xFb91a2395d9E49b89fcA3dca0959b6eB4Ea08a0B"})});
ConfirmationsAndMandates.deployed().then(function(instance){return instance.getAutherisedParty("0xFb91a2395d9E49b89fcA3dca0959b6eB4Ea08a0B")});

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