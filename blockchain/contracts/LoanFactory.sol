pragma solidity ^0.5.12;

import './Loan.sol';
import './FundHandler.sol';

contract LoanFactory {

    FundHandler public fundHandler;

    mapping(address => address[]) public created;
    mapping(address => bool) public isLoan;

    event ContractInstantiation(address indexed sender, address indexed instantiation);

    // initialize loan factory
    constructor (FundHandler _fundHandler) public  {
        fundHandler = _fundHandler;
    }

    // create a new loan contract
    function createLoan(
        uint256 _principal_units,
        bytes32 _principal_symbol,
        uint256 _collateral_units,
        bytes32 _collateral_symbol,
        uint64 _deadline
    ) public returns (address) {
        Loan newContract = new Loan(
            fundHandler,
            msg.sender,
            _principal_units,
            _principal_symbol,
            _collateral_units,
            _collateral_symbol,
            _deadline
        );
        created[msg.sender].push(address(newContract));
        emit ContractInstantiation(msg.sender, address(newContract));
        isLoan[address(newContract)] = true;
        fundHandler.transfer(address(newContract), msg.sender, address(newContract), _collateral_units, _collateral_symbol);

        return address(newContract);
    }

    // check if an address is a loan
    function getIsLoan(address addr) public view returns (bool) {
        return isLoan[addr];
    }
}
