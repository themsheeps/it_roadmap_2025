pragma solidity ^0.4.23;

/** @title Post Trade Contract. */
/** @author Johan Pretorius */
/** startDate 2018-06-06 */

contract NNA {

    // ==========================================================================
    // Modifiers : Modifiers are only added when used, the rest are commented out
    // ==========================================================================
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    mapping ( bytes32 => uint ) ISINCounter;
    address owner;

    constructor () public {
        owner = msg.sender;
    }

    // function -- ISIN Request

    function issueIsinNumber (string _prefix) public onlyOwner {
        ISINCounter[keccak256(abi.encodePacked(_prefix))] ++;
    }

    function getIsinNumber (string _prefix) public view onlyOwner returns (uint){
        return ISINCounter[keccak256(abi.encodePacked(_prefix))];
    }

    // function -- Deissue ISIN

    // ==========================================================================
    // Helper Console Scripts:
    // ==========================================================================
/* 

NNA.deployed().then(function(instance){return instance.issueIsinNumber("ZAE")});

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