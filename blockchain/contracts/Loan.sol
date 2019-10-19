pragma solidity ^0.5.12;

import './FundHandler.sol';

contract Loan {

    struct Offer {
        address owner;
        uint256 interest;
    }
    event NewOffer(address lender, uint256 interest);
    event OfferAgreed(address lender, uint256 interest);
    event Success();
    event Failure();

    enum States {Init, Offer, Pending, Success, Failure}

    address public owner;
    FundHandler public fundHandler;

    Offer public offer;
    States public state;

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
        if (offer.owner == address(0x00) || offer.interest > _interest) {
            if (offer.owner != address(0x00)) {
                fundHandler.transfer(address(this), address(this), offer.owner, principal_units, principal_symbol);
            }
            offer.owner = msg.sender;
            offer.interest = _interest;
        }
        fundHandler.transfer(address(this), msg.sender, address(this), principal_units, principal_symbol);
        state = States.Offer;
        emit NewOffer(offer.owner, offer.interest);
        return true;
    }

    function agree() public returns (bool) {
        require(owner == msg.sender, "Only owner can accept an offer");
        require(state == States.Offer, "Invalid state");
        fundHandler.transfer(address(this), address(this), msg.sender, principal_units, principal_symbol);
        state = States.Pending;
        emit OfferAgreed(offer.owner, offer.interest);
        return true;
    }

    function repay() public returns (bool) {
        // anyone can repay for owner
        require(state == States.Pending, "Invalid state");
        require(now <= deadline, "Deadline is over");
        fundHandler.transfer(address(this), msg.sender, offer.owner, principal_units+offer.interest, principal_symbol);
        fundHandler.transfer(address(this), address(this), owner, collateral_units, collateral_symbol);
        state = States.Success;
        emit Success();
        return true;
    }

    function collectCollateral() public returns (bool) {
        require(offer.owner == msg.sender, "Only offer owner can accept an offer");
        require(state == States.Pending, "Invalid state");
        require(now > deadline, "Deadline is not over yet");
        fundHandler.transfer(address(this), address(this), offer.owner, collateral_units, collateral_symbol);
        state = States.Failure;
        emit Failure();
        return true;
    }

}
