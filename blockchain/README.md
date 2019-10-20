# Smart Contract

## Fund Handler

This smart contract is responsible for handling the transfer of funds between accounts in different symbols. A user can own tokens of more than one symbol. Each token is a wrapped valuable. For example, a user can have 20 units of WXAG which is **Wrapped** XAG and 100 WEUR which is **Wrapped** EUR. The user should be able to use the standard ERC20 interface to interact with the wrapped valuables (not implemented for PoC -- trivial).

When the **Fund Handler** is deployed a **Loan Factory** is also deployed.

## Loan Factory

This smart contract is used to create **Loan** contracts. It will take in the loan a user wishes to execute, a receive the collateral and instantiate the contract.

The loan is made up of:
* Principal Symbol
* Principal Units
* Collateral Symbol
* Collateral Units
* Deadline

Example: Alice wishes to receive a principal of 100 WEUR and set 10 WXAG as a collateral and pay within 6 months.

## Loan

This smart contract is responsible for the execution of the loan. Once the **Loan Factory** has instantiated this contract, it is open for anyone to fulfil the loan request. If a lender wishes to do so, a request is made for the expected interest rate. Other lenders can then submit better interests to take over the loan. When the loaner is satisfied with the lended money (or when some deadline is passed -- not implemented yet but is trivial) the offer is accepted and the loan is executed. If Alice pays within the agreed deadline the collateral is returned, otherwise, the collateral is collected by the lender.

### Offers Suggestion

A lender offer is made up of:
* Interest Units (in the symbol of the principal)

Example: Carol submits an offer with an interest of 10 WEUR, Alice prefers to wait a bit for a better offer. Then Bob submits a new offer requesting only 5 WEUR for this loan.

### Agreement

The loaner accepts an offer which activates the contract.

Example: Alice was not happy with Carols offer, however Bobs offer seemed good so she agrees to it.

### Success

The loaner repays the money received plus the interest to the lender and receives the collateral back.

Example: Alice managed to collect the 105 WETH required to repay the loan and so she does so. Bob receives the 105 WETH and Alice receives the collateral of 10 WXAG. The loan contract succeeded.

### Failure

The loaner did not manage to repay before the deadline. The lender can then collect the collateral in order to compensate for the losses. In a more complete implementation, the collateral could automatically be auctioned for anyone to buy, the lender would first receive as much as needed to fulfill the interest (or the full amount if not enough to cover the interest) and the rest would go to the loaner.

Example: Allice did not manage to collect the 105 WETH required to repay the loan and so she cannot repay. Bob collects the collateral of 10 WXAG. The loan contract failed.

