App = {
  web3Provider: null,
  contracts: {},

  init: function () {
    return App.initWeb3();
  },

  initWeb3: function () {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function () {
    $.getJSON('ConfirmationsAndMandates.json', function (data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var ConfirmationsAndMandatesArtifact = data;
      // var newIsinEvent;
      App.contracts.ConfirmationsAndMandates = TruffleContract(ConfirmationsAndMandatesArtifact);

      // Set the provider for our contract
      App.contracts.ConfirmationsAndMandates.setProvider(App.web3Provider);

      // Watch for events
      // App.contracts.PostTrade.deployed().then(function (instance) {
      // newIsinEvent = instance.IsinIssued();

      // instance.IsinIssued({}, { fromBlock: 0, toBlock: 'latest' }).get((error, eventResult) => {
      //   if (error)
      //     console.log('Error in myEvent event handler: ' + error);
      //   else
      //     console.log('myEvent: ' + JSON.stringify(eventResult.args));
      // });

      // newIsinEvent.watch(function (error, result) {
      //   if (error) {
      //     console.log("ERROR - 928357");
      //     console.log(error);
      //   } else {
      //     console.log("REPLY - 09572");
      //     console.log(result.args);
      //     document.getElementById("isin-issue-prefix").innerHTML = result.args._prefix;
      //     document.getElementById("isin-issue-counter").innerHTML = result.args._counter;
      //     document.getElementById("isin-issue-trf").innerHTML = result.args._transactionReference;

      //     App.insertTableRow(result.args._prefix, result.args._counter, result.args._transactionReference);
      //   }
      // });
      //});

      // Use our contract to retrieve and mark the adopted pets
      // return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on('click', '.btn-createMandate', App.createMandate);
    $(document).on('click', '.btn-removeMandate', App.removeMandate);
    $(document).on('click', '.btn-checkAuthorisedParty', App.checkAuthorisedParty);
    $(document).on('click', '.btn-confirmLeg', App.confirmLeg);
    //return App.initShareCap();
  },

  // initShareCap: function () {
  //   web3.eth.getAccounts(function (error, accounts) {
  //     if (error) {
  //       console.log(error);
  //     }

  //     var account = accounts[0];

  //     App.contracts.PostTrade.deployed().then(function (instance) {
  //       PostTradeInstance = instance;
  //       return PostTradeInstance.getSecurityDetails("eZAR", {
  //         from: account
  //       });
  //     }).then(function (result) {
  //       document.getElementById("cashCap").innerHTML = result[1];
  //       if (result[1] > 0) {
  //         document.getElementById("issueCashContainer").innerHTML = "";
  //       }
  //       console.log("ABC001 " + result);
  //     }).catch(function (err) {
  //       document.getElementById("isin-search-label").innerHTML = "ERROR!!!";
  //       console.log(err.message);
  //     });
  //   });
  // },

  fade_out: function () {
    $("#isin-search-label").fadeOut().empty();
  },

  clearStatusses: function () {
    document.getElementById("createMandate-label").innerHTML = "";
    document.getElementById("createMandate-label-error").innerHTML = "";
    document.getElementById("confirmLeg-label").innerHTML = "";
    document.getElementById("confirmLeg-label-error").innerHTML = "";
  },

  clearTableRowsIsin: function () {

    document.getElementById("SecuritiesTable").innerHTML = "<thead><tr><th scope='col'>Isin Number</th><th scope='col'>Total Issued Share Cap</th><th scope='col'>Long Name</th><th scope='col'>Ticker</th><th scope='col'>Active</th></tr></thead><tbody></tbody>";
    console.log("Table cleared");
  },

  createMandate: function (event) {
    event.preventDefault();
    App.clearStatusses();

    let _mandateAddress1 = document.getElementById('mandateAddress1').value;

    console.log(_mandateAddress1);


    let ConfirmationsAndMandatesInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.ConfirmationsAndMandates.deployed().then(function (instance) {
        ConfirmationsAndMandatesInstance = instance;

        // Execute adopt as a transaction by sending account
        return ConfirmationsAndMandatesInstance.addRemoveMandate(_mandateAddress1, {
          from: account
        });
      }).then(function (result) {
        document.getElementById("createMandate-label").innerHTML = "SUCCESS!!!";
      }).catch(function (err) {
        document.getElementById("createMandate-label-error").innerHTML = "ERROR!!!";
        console.log(err.message);
      });
    });

  },

  removeMandate: function (event) {
    event.preventDefault();
    App.clearStatusses();

    let _mandateAddress1 = document.getElementById('mandateAddress1').value;

    console.log(_mandateAddress1);


    let ConfirmationsAndMandatesInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.ConfirmationsAndMandates.deployed().then(function (instance) {
        ConfirmationsAndMandatesInstance = instance;

        // Execute adopt as a transaction by sending account
        return ConfirmationsAndMandatesInstance.addRemoveMandate(account, {
          from: account
        });
      }).then(function (result) {
        document.getElementById("createMandate-label").innerHTML = "SUCCESS!!!";
      }).catch(function (err) {
        document.getElementById("createMandate-label-error").innerHTML = "ERROR!!!";
        console.log(err.message);
      });
    });

  },

  checkAuthorisedParty: function (event) {
    event.preventDefault();
    App.clearStatusses();

    let ConfirmationsAndMandatesInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.ConfirmationsAndMandates.deployed().then(function (instance) {
        ConfirmationsAndMandatesInstance = instance;

        // Execute adopt as a transaction by sending account
        return ConfirmationsAndMandatesInstance.getAutherisedParty(account, {
          from: account
        });
      }).then(function (result) {
        document.getElementById("checkAuthorisedParty-label").innerHTML = result;
      }).catch(function (err) {
        document.getElementById("checkAuthorisedParty-label-error").innerHTML = "ERROR!!!";
        console.log(err.message);
      });
    });

  },

  confirmLeg: function (event) {
    event.preventDefault();
    App.clearStatusses();

    let _buySaleIndicator = document.getElementById('buySaleIndicator3').value;
    let _legId = document.getElementById('legId3').value;
    let _isin = document.getElementById('isin3').value;
    let _beneficialHolderAddress = document.getElementById('beneficialHolderAddress3').value;

    console.log(_buySaleIndicator, _legId, _isin, _beneficialHolderAddress);


    let ConfirmationsAndMandatesInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      if (_beneficialHolderAddress == "") { _beneficialHolderAddress = account; }

      App.contracts.ConfirmationsAndMandates.deployed().then(function (instance) {
        ConfirmationsAndMandatesInstance = instance;

        // Execute adopt as a transaction by sending account
        return ConfirmationsAndMandatesInstance.confirmTradeLeg(_buySaleIndicator, _legId, _isin, _beneficialHolderAddress, {
          from: account
        });
      }).then(function (result) {
        document.getElementById("confirmLeg-label").innerHTML = "SUCCESS!!!";
      }).catch(function (err) {
        document.getElementById("confirmLeg-label-error").innerHTML = "ERROR!!!";
        console.log(err.message);
      });
    });

  },

  insertTableRow: function (_ISIN, _totalIssuedShareCap, _longName, _ticker, _active) {
    // Find a <table> element with id="SecuritiesTable":
    // var table = document.getElementById("SecuritiesTable");

    // // Create an empty <tr> element and add it to the 1st position of the table:
    // var row = table.insertRow(1);

    // // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
    // var cell1 = row.insertCell(0);
    // var cell2 = row.insertCell(1);
    // var cell3 = row.insertCell(2);
    // var cell4 = row.insertCell(3);
    // var cell5 = row.insertCell(4);

    // // Add some text to the new cells:
    // cell1.innerHTML = _ISIN;
    // cell2.innerHTML = _totalIssuedShareCap;
    // cell3.innerHTML = _longName;
    // cell4.innerHTML = _ticker;
    // cell5.innerHTML = _active;
  }

};

$(function () {
  $(window).load(function () {
    App.init();
  });
});