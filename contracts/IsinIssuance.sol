pragma solidity ^0.4.23;

/** @title Post Trade Contract. */
/** @author Johan Pretorius */
/** startDate 2018-06-06 */

contract PostTrade {
    function issueSecurity (string , uint , string , string ) public {}
}

contract IsinIssuance {

    constructor (address _postTradeContract) public {
        postTradeContractAddress = _postTradeContract;
        postTradeContract = PostTrade(_postTradeContract);
        
    }

    PostTrade postTradeContract;
    address public postTradeContractAddress;

    //IsinIssuance.deployed().then(function(instance){return instance.postTradeContractAddress()});

}