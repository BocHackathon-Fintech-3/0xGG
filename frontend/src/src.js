// function init() {
var loanFactoryAddress = "0x83a2f2e6b49BcD08a772ba88B0A2C42dba317f75"
var loanFactoryAbi = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"address","name":"instantiation","type":"address"}],"name":"ContractInstantiation","type":"event"},{"constant":false,"inputs":[{"internalType":"uint256","name":"_principal_units","type":"uint256"},{"internalType":"bytes32","name":"_principal_symbol","type":"bytes32"},{"internalType":"uint256","name":"_collateral_units","type":"uint256"},{"internalType":"bytes32","name":"_collateral_symbol","type":"bytes32"},{"internalType":"uint64","name":"_deadline","type":"uint64"}],"name":"createLoan","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract FundHandler","name":"_fundHandler","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"created","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"fundHandler","outputs":[{"internalType":"contract FundHandler","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"getIsLoan","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"isLoan","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"}];

var loanAbi = [{"anonymous":false,"inputs":[],"name":"Failure","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"lender","type":"address"},{"indexed":false,"internalType":"uint256","name":"interest","type":"uint256"}],"name":"NewOffer","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"lender","type":"address"},{"indexed":false,"internalType":"uint256","name":"interest","type":"uint256"}],"name":"OfferAgreed","type":"event"},{"anonymous":false,"inputs":[],"name":"Success","type":"event"},{"constant":false,"inputs":[],"name":"agree","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"collectCollateral","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"_interest","type":"uint256"}],"name":"matchLoan","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"repay","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract FundHandler","name":"_fundHandler","type":"address"},{"internalType":"address","name":"_loaner","type":"address"},{"internalType":"uint256","name":"_principal_units","type":"uint256"},{"internalType":"bytes32","name":"_principal_symbol","type":"bytes32"},{"internalType":"uint256","name":"_collateral_units","type":"uint256"},{"internalType":"bytes32","name":"_collateral_symbol","type":"bytes32"},{"internalType":"uint64","name":"_deadline","type":"uint64"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"constant":true,"inputs":[],"name":"fundHandler","outputs":[{"internalType":"contract FundHandler","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"offer","outputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"interest","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"state","outputs":[{"internalType":"enum Loan.States","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"}];


const promisify = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) { reject(err) }
      resolve(res);
    })
  );

function getTransactionReceiptMined(txHash, interval) {
  const transactionReceiptAsync = function(resolve, reject) {
      web3.eth.getTransactionReceipt(txHash, (error, receipt) => {
          if (error) {
              reject(error);
          } else if (receipt == null) {
              setTimeout(
                  () => transactionReceiptAsync(resolve, reject),
                  interval ? interval : 500);
          } else {
              resolve(receipt);
          }
      });
  };

  if (Array.isArray(txHash)) {
      return Promise.all(txHash.map(
          oneTxHash => web3.eth.getTransactionReceiptMined(oneTxHash, interval)));
  } else if (typeof txHash === "string") {
      return new Promise(transactionReceiptAsync);
  } else {
      throw new Error("Invalid Type: " + txHash);
  }
};

async function getLoanInfo(address, temp) {
  var LoanContract = web3.eth.contract(loanAbi);
  var instance = LoanContract.at(address);
  offerArray           = (await promisify(cb => instance.offer.call(cb)));
  temp['offer'] = {
    owner: offerArray[0],
    interest: offerArray[1].toNumber()
  }
  temp['principal_units'] = (await promisify(cb => instance.principal_units.call(cb))).toNumber()
  temp['principal_symbol'] = (await promisify(cb => instance.principal_symbol.call(cb)))
  temp['collateral_units'] = (await promisify(cb => instance.collateral_units.call(cb))).toNumber()
  temp['collateral_symbol'] = (await promisify(cb => instance.collateral_symbol.call(cb)))
  temp['deadline'] = (await promisify(cb => instance.deadline.call(cb))).toNumber()
  return temp;
}

async function loadLoans() {
  var factoryContract = web3.eth.contract(factoryAbi);
  // instantiate by address
  var factory = factoryContract.at(factoryAddress);
  log = await promisify(cb => factory.ContractInstantiation({}, {fromBlock: 0, toBlock: 'latest'}).get(cb));
  var result = []
  for (var i in log) {
    temp = log[i].args
    temp = await getLoanInfo(log[i].args.instantiation, temp)
    result.push(temp)
  }
  // console.log(result)
  return result
}

async function createLoan(owner, principal_units, principal_symbol, collateral_units, collateral_symbol, deadline) {
  var factoryContract = web3.eth.contract(factoryAbi);
  // instantiate by address
  var factory = factoryContract.at(factoryAddress);
  console.log(principal_units);
  console.log(principal_symbol);
  console.log(collateral_units);
  console.log(collateral_symbol);
  console.log(deadline);
  promisify(cb => {
    return factory.createLoan.call(
      principal_units,
      principal_symbol,
      collateral_units,
      collateral_symbol,
      deadline,
      {
        from: owner,
        // value: 1,
        gasPrice: 22000000000
      }, cb
    )
  })
  .then(function (address) {
    promisify(cb => {return factory.createLoan(
      principal_units,
      principal_symbol,
      collateral_units,
      collateral_symbol,
      deadline,
      {
        from: owner,
        // value: 1,
        gasPrice: 22000000000
      }, cb
    )})
    .then(txHash => {
      return getTransactionReceiptMined(txHash)
    }).
    then(recepient => {
      alert("Tx mined!")
      // window.location = "/insurance.html/?hash=" + address
    })
  })
}

async function makeOffer(owner, interest) {
  var factoryContract = web3.eth.contract(factoryAbi);
  // instantiate by address
  var factory = factoryContract.at(factoryAddress);
  console.log(interest);
  promisify(cb => {
    return factory.matchLoan.call(
      interest,
      {
        from: owner,
        // value: 1,
        gasPrice: 22000000000
      }, cb
    )
  })
  .then(function (address) {
    promisify(cb => {return factory.matchLoan(
      interest,
      {
        from: owner,
        // value: 1,
        gasPrice: 22000000000
      }, cb
    )})
    .then(txHash => {
      return getTransactionReceiptMined(txHash)
    }).
    then(recepient => {
      alert("Tx mined!")
      // window.location = "/insurance.html/?hash=" + address
    })
  })
}

async function agree(owner) {
  var factoryContract = web3.eth.contract(factoryAbi);
  // instantiate by address
  var factory = factoryContract.at(factoryAddress);
  promisify(cb => {
    return factory.agree.call(
      {
        from: owner,
        gasPrice: 22000000000
      }, cb
    )
  })
  .then(function (address) {
    promisify(cb => {return agree.createLoan(
      {
        from: owner,
        // value: 1,
        gasPrice: 22000000000
      }, cb
    )})
    .then(txHash => {
      return getTransactionReceiptMined(txHash)
    }).
    then(recepient => {
      alert("Tx mined!")
      // window.location = "/insurance.html/?hash=" + address
    })
  })
}

async function repay(owner) {
  var factoryContract = web3.eth.contract(factoryAbi);
  // instantiate by address
  var factory = factoryContract.at(factoryAddress);
  promisify(cb => {
    return factory.repay.call(
      {
        from: owner,
        gasPrice: 22000000000
      }, cb
    )
  })
  .then(function (address) {
    promisify(cb => {return agree.repay(
      {
        from: owner,
        // value: 1,
        gasPrice: 22000000000
      }, cb
    )})
    .then(txHash => {
      return getTransactionReceiptMined(txHash)
    }).
    then(recepient => {
      alert("Tx mined!")
      // window.location = "/insurance.html/?hash=" + address
    })
  })
}

async function repay(owner) {
  var factoryContract = web3.eth.contract(factoryAbi);
  // instantiate by address
  var factory = factoryContract.at(factoryAddress);
  promisify(cb => {
    return factory.collectCollateral.call(
      {
        from: owner,
        gasPrice: 22000000000
      }, cb
    )
  })
  .then(function (address) {
    promisify(cb => {return agree.collectCollateral(
      {
        from: owner,
        // value: 1,
        gasPrice: 22000000000
      }, cb
    )})
    .then(txHash => {
      return getTransactionReceiptMined(txHash)
    }).
    then(recepient => {
      alert("Tx mined!")
      // window.location = "/insurance.html/?hash=" + address
    })
  })
}
