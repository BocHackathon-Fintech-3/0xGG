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

    let States = {
        Init: 0,
        Offer: 1,
        Pending: 2,
        Success: 3,
        Failure: 4
    }

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
        loanFactory_address = await fundHandler.loanFactory.call({from: robot});
        loanFactory = LoanFactory.at(loanFactory_address);

        
        txhash = await fundHandler.wrap(alice, "WEUR", 10, {from: robot});
        txhash = await fundHandler.wrap(alice, "WXAG", 20, {from: robot});
        txhash = await fundHandler.wrap(bob, "WEUR", 500, {from: robot});
        txhash = await fundHandler.wrap(carol, "WEUR", 300, {from: robot});
        txhash = await fundHandler.wrap(david, "WEUR", 100, {from: robot});
        txhash = await fundHandler.wrap(eve, "WEUR", 150, {from: robot});

        loan_address = await loanFactory.createLoan.call(
            100,
            "WEUR",
            10,
            "WXAG",
            now + 30,
            {from: alice}    // value: web3.toWei(200)
        );
        loan_txhash = await loanFactory.createLoan(
            100,
            "WEUR",
            10,
            "WXAG",
            now + 30,
            {from: alice}    // value: web3.toWei(200)
        );

        loan = Loan.at(loan_address);

        accounts = [
            {
                name: "Contract",
                account: loan_address,
                weur: 0,
                wxag: 10
            },
            {
                name: "Alice",
                account: alice,
                weur: 10,
                wxag: 20-10
            },
            {
                name: "Bob",
                account: bob,
                weur: 500,
                wxag: 0
            },
            {
                name: "Carol",
                account: carol,
                weur: 300,
                wxag: 0
            },
            {
                name: "David",
                account: david,
                weur: 100,
                wxag: 0
            },
            {
                name: "Eve",
                account: eve,
                weur: 150,
                wxag: 0
            }
        ]

    })

    // it("Governor is the owner of Tender", async function() {
    //     const ownerAddress = await tender.owner.call({from: governor});
    //     assert.equal(ownerAddress, governor);
    // })

    async function checkAssets(users) {
        for (var i = 0; i < users.length; i++) {
            user = users[i];
            weur = await fundHandler.getBalance.call(user.account, "WEUR", {from: robot});
            assert.equal(weur.toNumber(), user.weur, user.name + " WEUR ");
            wxag = await fundHandler.getBalance.call(user.account, "WXAG", {from: robot});
            assert.equal(wxag.toNumber(), user.wxag, user.name + " WEUR ");
        }
    }

    it("Funds properly wrapped", async function() {
        await checkAssets(accounts);
    })

    it("Alice is the owner of Loan", async function() {
        const ownerAddress = await loan.owner.call({from: alice});
        assert.equal(ownerAddress, alice);
        
        const state = await loan.state.call({from: alice});
        assert.equal(state, States.Init);
    })

    it("Carol places an offer for Alice loan", async function() {
        offer_array = await loan.offer.call({from: alice});
        offer = {
            owner: offer_array[0],
            interest: offer_array[1].toNumber()
        }
        assert.equal(offer.owner, 0x00);
        assert.equal(offer.interest, 0);
        const loan_address = await loan.matchLoan(
            10,
            {from: carol}
        )
        offer_array = await loan.offer.call({from: alice});
        offer = {
            owner: offer_array[0],
            interest: offer_array[1].toNumber()
        }
        assert.equal(offer.owner, carol);
        assert.equal(offer.interest, 10);
        
        // carols and robots balance should change
        accounts[3].weur -= 100;    // Carol
        accounts[0].weur += 100;    // Contract
        // checkAssets(accounts);

        weur = await fundHandler.getBalance.call(carol, "WEUR", {from: robot});
        assert.equal(weur.toNumber(), accounts[3].weur,  "Carol WEUR");

        weur = await fundHandler.getBalance.call(accounts[0].account, "WEUR", {from: robot});
        assert.equal(weur.toNumber(), 100, "Contract WEUR");

        // state should be offer
        const state = await loan.state.call({from: alice});
        assert.equal(state, States.Offer);
    })

    it("Bob places a better offer than Carol for Alice loan", async function() {
        const success = await loan.matchLoan.call(5, {from: bob})
        const txhash = await loan.matchLoan(5, {from: bob})
        assert.equal(success, true);
        const offer_array = await loan.offer.call({from: alice});
        offer = {
            owner: offer_array[0],
            interest: offer_array[1]
        }
        assert.equal(offer.owner, bob);
        assert.equal(offer.interest, 5);
        
        // no changes to accounts
        // assert(accounts[2].weur, 500)
        accounts[2].weur -= 100;    // Bob
        // assert(accounts[2].weur, 400)
        accounts[3].weur += 100;    // Carol
        // checkAssets(accounts)

        // state should be offer
        const state = await loan.state.call({from: alice});
        assert.equal(state, States.Offer);
    })

    it("Eve agrees to Bobs offer on Alice smart contract", async function() {
        let error = "";
        try {
            const success = await loan.agree(
                {from: eve}
            )
        } catch (err) {
            error = err;
        }
        assert.notEqual(error, undefined, "Error must be thrown");
        
        const state = await loan.state.call({from: alice});
        assert.equal(state, States.Offer);
    })

    it("Alice agrees to Bobs offer", async function() {
        const success = await loan.agree.call({from: alice})
        const txhash = await loan.agree({from: alice})
        assert.equal(success, true);
        const offer_array = await loan.offer.call({from: alice});
        offer = {
            owner: offer_array[0],
            interest: offer_array[1]
        }
        assert.equal(offer.owner, bob);
        assert.equal(offer.interest, 5);
        
        const state = await loan.state.call({from: alice});
        assert.equal(state, States.Pending);
    })

    it("Alice pays back on time", async function() {
        txhash = await fundHandler.wrap(alice, "WEUR", 100, {from: robot});
        success = await loan.repay.call({from: alice})
        txhash = await loan.repay({from: alice})
        assert.equal(success, true);
        const offer_array = await loan.offer.call({from: alice});
        offer = {
            owner: offer_array[0],
            interest: offer_array[1]
        }
        assert.equal(offer.owner, bob);
        assert.equal(offer.interest, 5);
        
        const state = await loan.state.call({from: alice});
        assert.equal(state, States.Success);
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
