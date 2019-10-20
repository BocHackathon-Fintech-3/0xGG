# Smart Contract

## Fund Handler

This smart contract is responsible for handling the transfer of funds between accounts in different symbols. A user can own tokens of more than one symbol. Each token is a wrapped valuable. For example, a user can have 20 units of WXAG which is **Wrapped** XAG and 100 WEUR which is **Wrapped** EUR. The user should be able to use the standard ERC20 interface to interact with the wrapped valuables (not implemented for PoC -- trivial).

When the **Fund Handler** is deployed a **Loan Factory** is also deployed.

## Loan Factory

This smart contract is used to create **Loan** contracts. It will take in the loan a user wishes to execute, a receive the collateral and instantiate the contract.

## Loan

This smart contract is responsible for the execution of the loan. Once the **Loan Factory** has instantiated this contract, it is open for anyone to fulfil the loan request. If a lender wishes to do so, a request is made for the expected interest rate. Other lenders can then submit better interests to take over the loan. When the loaner is satisfied with the lended money (or when some deadline is passed -- not implemented yet but is trivial) the offer is accepted and the loan is executed.
