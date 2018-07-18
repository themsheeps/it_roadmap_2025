pragma solidity ^0.4.23;

/** @title Post Trade Contract. */
/** @author Johan Pretorius */
/** startDate 2018-06-06 */

contract PostTrade {
    function issueSecurity (string , uint , string , string ) public {}
}

contract IsinIssuance {

    // ==========================================================================
    // Modifiers
    // ==========================================================================
    modifier onlyOwner{
        require(msg.sender == owner);
        _;
    }

    // ==========================================================================
    // Constructor
    // ==========================================================================
    constructor (address _postTradeContract) public {
        postTradeContractAddress = _postTradeContract;
        postTradeContract = PostTrade(_postTradeContract);
        
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

    function captureSecurity (string _ISIN, uint _totalIssuedShareCap, string _longName, string _ticker, address _counterParty) public onlyOwner {
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
    }

    //IsinIssuance.deployed().then(function(instance){return instance.postTradeContractAddress()});

}