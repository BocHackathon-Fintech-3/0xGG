
pragma solidity ^0.5.12;

import './LoanFactory.sol';

contract FundHandler {
    LoanFactory public loanFactory;

    address public owner;

    mapping(address => mapping(string => uint256)) public balances;

    function wrap(address addr, string memory symbol, uint256 amount) public returns (bool) {
        require(owner == msg.sender, "Not allowed to wrap");
        balances[addr][symbol] += amount;
        return true;
    }

    function getBalance(address addr, string memory symbol) public view returns (uint256) {
        return balances[addr][symbol];
    }

    // constructor () public {}

    constructor () public  {
        owner = msg.sender;
        loanFactory = new LoanFactory(this);
    }

    function transfer(address _loan, address _src, address _dst, uint256 _amount, string memory _symbol) public returns (bool) {
        require(loanFactory.getIsLoan(_loan), "Not allowed to transfer funds");
        require(balances[_src][_symbol] >= _amount, "Insufficient funds");
        balances[_src][_symbol] -= _amount;
        balances[_dst][_symbol] += _amount;
        return true;
    }
}
