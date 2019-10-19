pragma solidity ^0.5.12;

import './Loan.sol';
import './FundHandler.sol';

contract LoanFactory {

    FundHandler public fundHandler;

    mapping(address => address[]) public created;
    mapping(address => bool) public isLoan;

    event ContractInstantiation(address indexed sender, address indexed instantiation);

    constructor (FundHandler _fundHandler) public  {
        // constructor
        fundHandler = _fundHandler;
    }

    function createLoan(
        uint256 _principal_units,
        string memory _principal_symbol,
        uint256 _collateral_units,
        string memory _collateral_symbol,
        uint64 _deadline
    ) public returns (address) {
        // require(address(fundHandler) != address(0), "fundHandler is zero!!!");
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
        /* newContract.transferOwnership(msg.sender); */
        isLoan[address(newContract)] = true;
        fundHandler.transfer(address(newContract), msg.sender, address(newContract), _collateral_units, _collateral_symbol);

        return address(newContract);
    }

    function getCreated(address _address) public view returns (address[] memory) {
        return created[_address];
    }

    function getIsLoan(address addr) public view returns (bool) {
        return isLoan[addr];
    }
}
