
pragma solidity ^0.5.12;

import './LoanFactory.sol';

contract FundHandler {
    LoanFactory public loanFactory;

    address public owner;

    mapping(address => mapping(string => uint256)) public balances;

    // wrap a valuable into a ERC20 token
    function wrap(address addr, string memory symbol, uint256 amount) public returns (bool) {
        require(owner == msg.sender, "Not allowed to wrap");
        balances[addr][symbol] += amount;
        return true;
    }

    // get balance of address for given symbol
    function getBalance(address addr, string memory symbol) public view returns (uint256) {
        return balances[addr][symbol];
    }

    // initialize fund handler and create loan factory
    constructor () public  {
        owner = msg.sender;
        loanFactory = new LoanFactory(this);
    }

    // transfer funds of given symbol from one address to an other
    function transfer(address _loan, address _src, address _dst, uint256 _amount, string memory _symbol) public returns (bool) {
        require(loanFactory.getIsLoan(_loan), "Not allowed to transfer funds");
        require(balances[_src][_symbol] >= _amount, "Insufficient funds");
        balances[_src][_symbol] -= _amount;
        balances[_dst][_symbol] += _amount;
        return true;
    }
}
