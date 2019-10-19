pragma solidity ^0.5.12;

import './FundHandler.sol';

contract Loan {

    struct Offer {
        address owner;
        uint256 interest;
    }
    event NewOffer(address owner);

    enum States {Init, Offer, Pending, Success, Failed}

    address public owner;
    FundHandler public fundHandler;

    Offer offer;
    States state;

    uint256 principal_units;
    string principal_symbol;
    uint256 collateral_units;
    string collateral_symbol;
    uint64 deadline;

    constructor (
            FundHandler _fundHandler,
            address _loaner,
            uint256 _principal_units,
            string memory _principal_symbol,
            uint256 _collateral_units,
            string memory _collateral_symbol,
            uint64 _deadline
        ) public {
            state = States.Init;
            owner = _loaner;
            principal_units = _principal_units;
            principal_symbol = _principal_symbol;
            collateral_units = _collateral_units;
            collateral_symbol = _collateral_symbol;
            deadline = _deadline;
            fundHandler = _fundHandler;
    }

    function matchLoan(uint256 _interest) public returns (bool) {
        require(state == States.Init || state == States.Offer, "Invalid state");
        if (offer.owner == address(0x00) || offer.interest < _interest) {
            offer.owner = msg.sender;
            offer.interest = _interest;
        }
        emit NewOffer(msg.sender);
    }

    function agree() public returns (bool) {

    }

}
