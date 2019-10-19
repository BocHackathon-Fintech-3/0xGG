const web3 = global.web3

var FundHandler = artifacts.require("./FundHandler.sol")
var LoanFactory = artifacts.require("./LoanFactory.sol")
var Loan = artifacts.require("./Loan.sol")
// var WEur = artifacts.require("./WEur.sol")
// var WXag = artifacts.require("./WXag.sol")

contract('Loan', function(accounts) {

    let robot = accounts[0]
    let alice = accounts[1]
    let bob = accounts[2]
    let carol = accounts[3]
    let david = accounts[4]
    let eve = accounts[5]

    const timeTravel = function (time) {
        return new Promise((resolve, reject) => {
            web3.currentProvider.sendAsync({
                jsonrpc: "2.0",
                method: "evm_increaseTime",
                params: [time], // 86400 is num seconds in day
                id: new Date().getSeconds()
            }, (err, result) => {
                if(err){ return reject(err) }
                return resolve(result)
            });
        })
    }

    const mineBlock = function () {
        web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 0})
    }

    before(async function () {
        //Create contract instances
        //   loan = await Loan.new({from: governor})

        now = (await web3.eth.getBlock('latest')).timestamp

        fundHandler = await FundHandler.new({from: robot});
        loanFactory_address = await fundHandler.loanFactory.call({from: robot})
        loanFactory = LoanFactory.at(loanFactory_address);

        
        success = await fundHandler.wrap(alice, "WEUR", 10, {from: robot});
        weur = await fundHandler.getBalance.call(alice, "WEUR", {from: robot});

        success = await fundHandler.wrap(alice, "WXAG", 20, {from: robot});
        wxag = await fundHandler.getBalance.call(alice, "WXAG", {from: robot});

        loan_address = await loanFactory.createLoan.call(
            100,
            "WEUR",
            10,
            "WXAG",
            now + 30,
            {from: alice}    // value: web3.toWei(200)
        )
        loan_txhash = await loanFactory.createLoan(
            100,
            "WEUR",
            10,
            "WXAG",
            now + 30,
            {from: alice}    // value: web3.toWei(200)
        )

        // blockNumber = web3.eth.getTransaction(loan_txhash);
        // loanFactory.getPastEvents("allEvents", {fromBlock: blockNumber, toBlock: blockNumber});
        // loan_address = await loanFactory.ContractInstantiation({}, {
        //     fromBlock: blockNumber,
        //     toBlock: blockNumber
        //   }).get((error, result) => {
        //     // do awesome stuff 
        //   })

        loan = Loan.at(loan_address);

    })

    // it("Governor is the owner of Tender", async function() {
    //     const ownerAddress = await tender.owner.call({from: governor});
    //     assert.equal(ownerAddress, governor);
    // })

    it("Funds properly wrapped", async function() {
        assert.equal(weur.toNumber(), 10);
        assert.equal(wxag.toNumber(), 20);
    })

    it("Alice is the owner of Loan", async function() {
        // assert.equal(Loan, "azxgkjhidwhfr")
        const ownerAddress = await loan.owner.call({from: alice});
        assert.equal(ownerAddress, alice);
        // assert.equal(ownerAddress, loanFactory_address);
        // assert.equal(loanFactory, true);
        // assert.equal(loan_address, true);
    })

    // it("Alice approves WEUR to Bob", async function () {
    //     wad = 100;
    //     const success = await loan.approve.call(bob, wad, {from: alice});
    //     assert.equal(success, true);
    // })

    // it("Bob transfers WEUR to Carol", async function () {
    //     wad = 100;
    //     initial_balance = await loan.balanceOf.call(carol, {from: bob});
    //     const success = await loan.transferFrom.call(alice, carol, wad, {from: bob});
    //     assert.equal(success, true);
    //     new_balance = await loan.balanceOf.call(carol, {from: bob});
    //     assert.equal(new_balance, initial_balance+wad);
    // })

});
