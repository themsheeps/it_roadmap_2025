App = {
  web3Provider: null,
  contracts: {},

  init: function () {
    document.getElementById("isinDispDiv").style.display = "none";
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

    $.getJSON('IsinIssuance.json', function (data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var IsinIssuanceArtifact = data;
      //var newIsinEvent;
      App.contracts.IsinIssuance = TruffleContract(IsinIssuanceArtifact);

      // Set the provider for our contract
      App.contracts.IsinIssuance.setProvider(App.web3Provider);
    });

    $.getJSON('PostTrade.json', function (data2) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var PostTradeArtifact = data2;
      //var newIsinEvent;
      App.contracts.PostTrade = TruffleContract(PostTradeArtifact);

      // Set the provider for our contract
      App.contracts.PostTrade.setProvider(App.web3Provider);
    });

    $.getJSON('NNA.json', function (data3) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var NNAArtifact = data3;
      var newIsinEvent;
      App.contracts.NNA = TruffleContract(NNAArtifact);

      // Set the provider for our contract
      App.contracts.NNA.setProvider(App.web3Provider);

      // Watch for events
      App.contracts.NNA.deployed().then(function (instance) {
        newIsinEvent = instance.IsinIssued();

        instance.IsinIssued({}, {
          fromBlock: 0,
          toBlock: 'latest'
        }).get((error, eventResult) => {
          if (error)
            console.log('Error in myEvent event handler: ' + error);
          else
            console.log('myEvent: ' + JSON.stringify(eventResult.args));
        });

        newIsinEvent.watch(function (error, result) {
          if (error) {
            console.log("ERROR - 928357");
            console.log(error);
          } else {
            console.log("REPLY - 09572");
            console.log(result.args);
            document.getElementById("isin-issue-prefix").innerHTML = result.args._prefix;
            document.getElementById("isin-issue-counter").innerHTML = result.args._counter;
            document.getElementById("isin-issue-trf").innerHTML = result.args._transactionReference;

            App.insertTableRowNNA(result.args._prefix, result.args._counter, result.args._transactionReference);
          }
        });
      });
    });

    $.getJSON('ConfirmationsAndMandates.json', function (data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var ConfirmationsAndMandatesArtifact = data;
      // var newIsinEvent;
      App.contracts.ConfirmationsAndMandates = TruffleContract(ConfirmationsAndMandatesArtifact);

      // Set the provider for our contract
      App.contracts.ConfirmationsAndMandates.setProvider(App.web3Provider);
    });

    return App.bindEvents();
  },

  bindEvents: function () {
    // NNA
    $(document).on('click', '.btn-newIsin', App.newIsin);
    $(document).on('click', '.btn-currentIsin', App.currentIsin);
    $(document).on('click', '.btn-delistIsin', App.delistIsin);
    $(document).on('click', '.btn-checkIsin', App.checkIsin);
    // Isin Issue
    $(document).on('click', '.btn-captureIsin', App.captureIsin);
    $(document).on('click', '.btn-displayIsin', App.displayIsin);
    $(document).on('click', '.btn-verifyIsin', App.verifyIsin);
    $(document).on('click', '.btn-displayBalance', App.displayBalance);
    $(document).on('click', '.btn-sendIsin', App.sendIsin);
    $(document).on('click', '.btn-getIsinFromNNA', App.getIsinFromNNA);
    // Trade Reporting
    $(document).on('click', '.btn-reportTrade', App.reportTrade);
    $(document).on('click', '.btn-refreshTrades', App.refreshTrades);
    // Confirmations And Mandates
    $(document).on('click', '.btn-createMandate', App.createMandate);
    $(document).on('click', '.btn-removeMandate', App.removeMandate);
    $(document).on('click', '.btn-checkAuthorisedParty', App.checkAuthorisedParty);
    $(document).on('click', '.btn-confirmLeg', App.confirmLeg);
  },

  // *************
  // NNA FUNCTIONS
  // *************

  newIsin: function (event) {
    event.preventDefault();
    App.clearStatusses();

    let _isinPrefix = document.getElementById('isinPrefix1').value;
    let _transactionReference = document.getElementById('transactionReference1').value;

    let NNAInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.NNA.deployed().then(function (instance) {
        NNAInstance = instance;

        // Execute adopt as a transaction by sending account
        return NNAInstance.issueIsinNumber(_isinPrefix, _transactionReference, {
          from: account
        });
      }).then(function (result) {
        setTimeout(App.fade_out, 2000);
        document.getElementById("isin-issue-label").innerHTML = "SUCCESS!!!";
      }).catch(function (err) {
        setTimeout(App.fade_out, 2000);
        document.getElementById("isin-issue-label").innerHTML = "ERROR!!!";
        console.log(err.message);
      });
    });

  },

  currentIsin: function (event) {
    event.preventDefault();
    // App.clearStatusses();
    document.getElementById("isin-issue-label").innerHTML = "";

    let _isinPrefix = document.getElementById('isinPrefix2').value;

    let NNAInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      console.log("currentIsin FIRED for " + account);

      App.contracts.NNA.deployed().then(function (instance) {
        NNAInstance = instance;

        // Execute adopt as a transaction by sending account
        return NNAInstance.getIsinNumber(_isinPrefix, {
          from: account
        });
      }).then(function (result) {
        document.getElementById("get-isin-label").innerHTML = "Last NNA Number for prefix " + _isinPrefix + " was: " + result;
      }).catch(function (err) {
        setTimeout(App.fade_out, 2000);
        document.getElementById("get-isin-label").innerHTML = "ERROR!!!";
        console.log(err.message);
      });
    });
  },

  delistIsin: function (event) {
    event.preventDefault();
    App.clearStatusses();

    let _isinPrefix = document.getElementById('isinPrefix3').value;
    let _isinInteger = document.getElementById('isinInteger3').value;

    let NNAInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.NNA.deployed().then(function (instance) {
        NNAInstance = instance;

        // Execute adopt as a transaction by sending account
        return NNAInstance.delistIsin(_isinPrefix, _isinInteger, {
          from: account
        });
      }).then(function (result) {
        setTimeout(App.fade_out, 2000);
        document.getElementById("delist-isin-label").innerHTML = "SUCCESS!!!";
      }).catch(function (err) {
        setTimeout(App.fade_out, 2000);
        document.getElementById("delist-isin-label").innerHTML = "ERROR!!!";
        console.log(err.message);
      });
    });
  },

  checkIsin: function (event) {
    event.preventDefault();
    App.clearStatusses();

    let _isinPrefix = document.getElementById('isinPrefix4').value;
    let _isinInteger = document.getElementById('isinInteger4').value;
    //console.log("Isin Prefix: " + _isinPrefix);
    //console.log("Isin Prefix: " + _isinInteger);

    let responseMessage;

    let NNAInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.NNA.deployed().then(function (instance) {
        NNAInstance = instance;

        // Execute adopt as a transaction by sending account
        return NNAInstance.getIsinStatus(_isinPrefix, _isinInteger, {
          from: account
        });
      }).then(function (result) {
        console.log("Result: " + result)
        if (result == 0) {
          //alert ("Not Issued");
          responseMessage = "Not Issued";
        } else if (result == 1) {
          responseMessage = "Active";
          //alert ("Active");
        } else {
          //alert ("Delisted");
          responseMessage = "Delisted";
        };
        document.getElementById("check-isin-label").innerHTML = responseMessage;
      }).catch(function (err) {
        setTimeout(App.fade_out, 2000);
        document.getElementById("check-isin-label").innerHTML = "ERROR!!!";
        console.log(err.message);
      });
    });
  },

  displayBalance: function (event) {
    event.preventDefault();
    // App.clearStatusses();

    let _isinNumber = document.getElementById('isinNumber4').value;
    let _address = document.getElementById('address4').value;

    console.log(_isinNumber, _address);

    let PostTradeInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      if (_address == "") {
        _address = account;
      }

      App.contracts.PostTrade.deployed().then(function (instance) {
        PostTradeInstance = instance;

        // Execute adopt as a transaction by sending account
        return PostTradeInstance.getBalanceOfSecAndAccount(_isinNumber, _address, {
          from: account
        });
      }).then(function (result) {
        document.getElementById("balanceDispDiv4").style.display = "block";
        document.getElementById("balance4").innerHTML = result;
        setTimeout(App.fade_out, 2000);
        document.getElementById("displayBalance-label").innerHTML = "Success";
        console.log(result);

      }).catch(function (err) {
        setTimeout(App.fade_out, 2000);
        document.getElementById("displayBalance-label-error").innerHTML = "Index out of bounds error";
        console.log(err.message);
      });
    });
  },

  clearStatusses: function () {
    // document.getElementById("isin-issue-label").innerHTML = "";
    // document.getElementById("get-isin-label").innerHTML = "";
    // document.getElementById("delist-isin-label").innerHTML = "";
    // document.getElementById("check-isin-label").innerHTML = "";
  },

  captureIsin: function (event) {
    event.preventDefault();
    App.clearStatusses();

    let _isinNumber1 = document.getElementById('isinNumber1').value;
    let _totalIssuedShareCap1 = document.getElementById('totalIssuedShareCap1').value;
    let _longName1 = document.getElementById('longName1').value;
    let _ticker1 = document.getElementById('ticker1').value;
    let _counterParty1 = document.getElementById('counterParty1').value;

    console.log(_isinNumber1, _totalIssuedShareCap1, _longName1, _ticker1, _counterParty1);


    let IsinIssuanceInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.IsinIssuance.deployed().then(function (instance) {
        IsinIssuanceInstance = instance;

        if (_counterParty1 == "") {
          _counterParty1 = account;
        }

        // Execute adopt as a transaction by sending account
        return IsinIssuanceInstance.captureSecurity(_isinNumber1, _totalIssuedShareCap1, _longName1, _ticker1, _counterParty1, {
          from: account
        });
      }).then(function (result) {
        setTimeout(App.fade_out, 2000);
        document.getElementById("isin-capture-label").innerHTML = "SUCCESS!!!";
      }).catch(function (err) {
        setTimeout(App.fade_out, 2000);
        document.getElementById("isin-capture-label").innerHTML = "ERROR!!!";
        console.log(err.message);
      });
    });

  },

  insertTableRowNNA: function (prefixItem, counterItem, transactionRefItem) {
    // Find a <table> element with id="NNATable":
    var table = document.getElementById("NNATable").getElementsByTagName('tbody')[0];

    // Create an empty <tr> element and add it to the 1st position of the table:
    var row = table.insertRow(0);

    // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);

    // Add some text to the new cells:
    cell1.innerHTML = prefixItem;
    cell2.innerHTML = counterItem;
    cell3.innerHTML = transactionRefItem;
  },

  // ********************
  // ISIN ISSUE FUNCTIONS
  // ********************

  captureIsin: function (event) {
    event.preventDefault();
    App.clearStatusses();

    let _isinNumber1 = document.getElementById('isinNumber1').value;
    let _totalIssuedShareCap1 = document.getElementById('totalIssuedShareCap1').value;
    let _longName1 = document.getElementById('longName1').value;
    let _ticker1 = document.getElementById('ticker1').value;
    let _counterParty1 = document.getElementById('counterParty1').value;

    console.log(_isinNumber1, _totalIssuedShareCap1, _longName1, _ticker1, _counterParty1);


    let IsinIssuanceInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.IsinIssuance.deployed().then(function (instance) {
        IsinIssuanceInstance = instance;

        if (_counterParty1 == "") {
          _counterParty1 = account;
        }

        // Execute adopt as a transaction by sending account
        return IsinIssuanceInstance.captureSecurity(_isinNumber1, _totalIssuedShareCap1, _longName1, _ticker1, _counterParty1, {
          from: account
        });
      }).then(function (result) {
        setTimeout(App.fade_out, 2000);
        document.getElementById("isin-capture-label").innerHTML = "SUCCESS!!!";
      }).catch(function (err) {
        setTimeout(App.fade_out, 2000);
        document.getElementById("isin-capture-label").innerHTML = "ERROR!!!";
        console.log(err.message);
      });
    });

  },

  getIsinFromNNA: function () {
    event.preventDefault();
    let _randomIsin = Math.floor(Math.random() * (999999 - 100000) + 10000);
    let _additionalPrefix = "";
    if (document.getElementById("isinNumber1").value == 0) {
      _additionalPrefix = "ZAE";
    }
    document.getElementById("isinNumber1").value += _additionalPrefix + "000" + _randomIsin;
  },

  displayIsin: function (event) {
    event.preventDefault();
    App.clearStatusses();

    let _isinNumber = document.getElementById('isinNumber2').value;

    console.log(_isinNumber);

    let IsinIssuanceInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.IsinIssuance.deployed().then(function (instance) {
        IsinIssuanceInstance = instance;

        // Execute adopt as a transaction by sending account
        return IsinIssuanceInstance.getSecurityToBeVerified(_isinNumber, {
          from: account
        });
      }).then(function (result) {
        document.getElementById("isinDispDiv").style.display = "block";
        document.getElementById("isinDisp").innerHTML = result[0];
        document.getElementById("sharecapDisp").innerHTML = result[1];
        document.getElementById("longnameDisp").innerHTML = result[2];
        document.getElementById("tickerDisp").innerHTML = result[3];
        document.getElementById("counterpartyDisp").innerHTML = result[5];
        document.getElementById("statusDisp").innerHTML = result[4];
        console.log(result);

      }).catch(function (err) {
        setTimeout(App.fade_out, 2000);
        document.getElementById("isin-display-label-error").innerHTML = "Index out of bounds error";
        console.log(err.message);
      });
    });

  },

  verifyIsin: function (event) {
    event.preventDefault();
    App.clearStatusses();

    let _isinNumber = document.getElementById('isinNumber2').value;

    console.log(_isinNumber);

    let IsinIssuanceInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.IsinIssuance.deployed().then(function (instance) {
        IsinIssuanceInstance = instance;

        // Execute adopt as a transaction by sending account
        return IsinIssuanceInstance.verifySecurity(_isinNumber, {
          from: account
        });
      }).then(function (result) {
        setTimeout(App.fade_out, 2000);
        document.getElementById("isin-verify-label").innerHTML = "success";
        console.log(result);

      }).catch(function (err) {
        setTimeout(App.fade_out, 2000);
        document.getElementById("isin-display-label-error").innerHTML = "Index out of bounds error";
        console.log(err.message);
      });
    });

  },

  sendIsin: function (event) {
    event.preventDefault();
    App.clearStatusses();

    let _isinNumber = document.getElementById('isinNumber5').value;
    let _amount = document.getElementById('amount5').value;
    let _address = document.getElementById('address5').value;

    console.log(_isinNumber, _amount, _address);

    let PostTradeInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.PostTrade.deployed().then(function (instance) {
        PostTradeInstance = instance;

        // Execute adopt as a transaction by sending account
        return PostTradeInstance.sendSecurity(_isinNumber, _amount, _address, {
          from: account
        });
      }).then(function (result) {
        setTimeout(App.fade_out, 2000);
        document.getElementById("sendIsin-label").innerHTML = "Success";
        console.log(result);

      }).catch(function (err) {
        setTimeout(App.fade_out, 2000);
        document.getElementById("sendIsin-label-error").innerHTML = "ERROR";
        console.log(err.message);
      });
    });
  },

  // ********************
  // TRADE REPORTING FUNCTIONS
  // ********************

  reportTrade: function (event) {
    event.preventDefault();
    App.clearStatusses();
    var _index;
    let PostTradeInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      var _isin = document.getElementById("isin1").value;
      var _buyLegId = document.getElementById("buyLegId1").value;
      var _saleLegId = document.getElementById("saleLegId1").value;
      var _tradeId = document.getElementById("tradeId1").value;
      var _settlementDate = document.getElementById("settlementDate1").value;
      var _buyerAddress = document.getElementById("buyerAddress1").value;
      var _sellerAddress = document.getElementById("sellerAddress1").value;
      var _buyerCustodianAddress = document.getElementById("buyerCustodianAddress1").value;
      var _sellerCustodianAddress = document.getElementById("sellerCustodianAddress1").value;
      var _amount = document.getElementById("amount1").value;
      var _price = document.getElementById("price1").value;

      App.contracts.PostTrade.deployed().then(function (instance) {
        PostTradeInstance = instance;
        return PostTradeInstance.addPreMatchedTrade(_isin, _buyLegId, _saleLegId, _tradeId, _settlementDate, _buyerAddress, _sellerAddress, _buyerCustodianAddress, _sellerCustodianAddress, _amount, _price, {
          from: account
        });
      }).then(function (result) {
        document.getElementById("reportTrade-label").innerHTML = "SUCCESS!!!";
        setTimeout(App.fade_out, 2000);
        console.log("ABC001 " + result);
      }).catch(function (err) {
        document.getElementById("reportTrade-label-error").innerHTML = "ERROR!!!";
        console.log(err.message);
      });
    });
  },

  refreshTrades: function (event) {
    event.preventDefault();
    App.clearStatusses();
    var _index;
    let PostTradeInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      var _isin = document.getElementById("isin2").value;

      if (_isin == "") {
        _isin = "ZAE001";
      }

      App.clearTableRowsTrades();

      App.contracts.PostTrade.deployed().then(function (instance) {
        PostTradeInstance = instance;
        return PostTradeInstance.getMatchedTradesIDs(_isin, {
          from: account
        });
      }).then(function (result) {
        var _status;
        console.log("BOB", result);

        for (i = 0; i < result.length; i++) {
          console.log("BOB1", i);
          var _results = PostTradeInstance.getMatchedTrades(_isin, result[i], {
            from: account
          }).then(function (fields) {
            console.log("BOB2 - tradeId", fields[0]);
            console.log("BOB2 - buyLegId", fields[1]);
            console.log("BOB2 - sellLegId", fields[2]);
            console.log("BOB2 - tradeDate", fields[3]);
            console.log("BOB2 - buyConfirmationDateTime", fields[4]);
            console.log("BOB2 - saleConfirmationDateTime", fields[5]);
            if (fields[4] == 0 && fields[5] == 0) {
              _status = "Matched";
            } else if (fields[4] > 0 && fields[5] == 0) {
              _status = "Confirmed by buyer";
            } else if (fields[4] == 0 && fields[5] > 0) {
              _status = "Confirmed by seller";
            } else {
              _status = "Settled";
            }
            App.insertTableRow(fields[0], fields[1], fields[2], fields[3], _status);
          });
        }

        document.getElementById("refreshTrades-label").innerHTML = "SUCCESS!!!";
        setTimeout(App.fade_out, 2000);
        console.log("ABC002 " + result);

      }).catch(function (err) {
        document.getElementById("refreshTrades-label-error").innerHTML = "ERROR!!!";
        console.log(err.message);
      });
    });
  },

  clearTableRowsTrades: function () {
    document.getElementById("TradesTable").innerHTML = "<table class='table table-striped table-responsive table-hover' id='NNATable'><thead><tr><th scope='col'>Trade Id</th><th scope='col'>Buy Leg ID</th><th scope='col'>Sale Leg ID</th><th scope='col'>Trade Date</th><th scope='col'>Status</th></tr></thead><tbody></tbody></table>";
    console.log("Table cleared");
  },

  insertTableRow: function (_tradeId, _buyLegId, _saleLegId, _tradeDate, _status) {
    // Find a <table> element with id="SecuritiesTable":
    var table = document.getElementById("TradesTable").getElementsByTagName('tbody')[0];
    var _labelType;

    if (_status == "Matched") {
      _labelType = "label-danger";
    } else if (_status == "Confirmed by seller") {
      _labelType = "label-buyer";
    } else if (_status == "Confirmed by buyer") {
      _labelType = "label-seller";
    } else {
      _labelType = "label-settled";
    }

    var _date = new Date(0); // The 0 there is the key, which sets the date to the epoch
    _date.setUTCSeconds(_tradeDate);

    // Create an empty <tr> element and add it to the 1st position of the table:
    var row = table.insertRow(0);

    // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    var cell5 = row.insertCell(4);



    // Add some text to the new cells:
    cell1.innerHTML = _tradeId;
    cell2.innerHTML = _buyLegId;
    cell3.innerHTML = _saleLegId;
    cell4.innerHTML = _date.toLocaleDateString();
    cell5.innerHTML = "<span class='label " + _labelType + "'>" + _status + "</span>";
  },

  // ************************************
  // CONFIRMATIONS AND MANDATES FUNCTIONS
  // ************************************

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
        setTimeout(App.fade_out, 2000);
      }).catch(function (err) {
        document.getElementById("createMandate-label-error").innerHTML = "ERROR!!!";
        setTimeout(App.fade_out, 2000);
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
        var _message = result;
        if (result == account || result == "0x0000000000000000000000000000000000000000") {
          _message = "No party has been autherised."
        } else {
          _message = "You have autherised " + result + " to act on your behalf.";
        }
        document.getElementById("checkAuthorisedParty-label").innerHTML = _message;
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
    // let _buySaleIndicator_1 = document.getElementById('buySaleIndicator3_1').value;
    let _legId = document.getElementById('legId3').value;
    let _isin = document.getElementById('isin3').value;
    let _beneficialHolderAddress = document.getElementById('beneficialHolderAddress3').value;

    if (_buySaleIndicator == "BUY LEG") {
      _buySaleIndicator = 0;
    } else if (_buySaleIndicator == "SALE LEG") {
      _buySaleIndicator = 1;
    }

    let ConfirmationsAndMandatesInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      if (_beneficialHolderAddress == "") { _beneficialHolderAddress = account; }

      console.log(_buySaleIndicator, _legId, _isin, _beneficialHolderAddress);

      App.contracts.PostTrade.deployed().then(function (instance) {
        ConfirmationsAndMandatesInstance = instance;

        console.log("ASJDHNNCB");

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

  // confirmLeg: function (event) {
  //   event.preventDefault();
  //   App.clearStatusses();

  //   let _buySaleIndicator = document.getElementById('buySaleIndicator3').value;
  //   // let _buySaleIndicator_1 = document.getElementById('buySaleIndicator3_1').value;
  //   let _legId = document.getElementById('legId3').value;
  //   let _isin = document.getElementById('isin3').value;
  //   let _beneficialHolderAddress = document.getElementById('beneficialHolderAddress3').value;

  //   if (_buySaleIndicator == "BUY LEG") {
  //     _buySaleIndicator = 0;
  //   } else if (_buySaleIndicator == "SALE LEG") {
  //     _buySaleIndicator = 1;
  //   }

  //   let ConfirmationsAndMandatesInstance;

  //   web3.eth.getAccounts(function (error, accounts) {
  //     if (error) {
  //       console.log(error);
  //     }

  //     var account = accounts[0];

  //     if (_beneficialHolderAddress == "") { _beneficialHolderAddress = account; }

  //     console.log(_buySaleIndicator, _legId, _isin, _beneficialHolderAddress);

  //     App.contracts.ConfirmationsAndMandates.deployed().then(function (instance) {
  //       ConfirmationsAndMandatesInstance = instance;

  //       console.log("ASJDHNNCB");

  //       // Execute adopt as a transaction by sending account
  //       return ConfirmationsAndMandatesInstance.confirmTradeLeg(_buySaleIndicator, _legId, _isin, _beneficialHolderAddress, {
  //         from: account
  //       });
  //     }).then(function (result) {
  //       document.getElementById("confirmLeg-label").innerHTML = "SUCCESS!!!";
  //     }).catch(function (err) {
  //       document.getElementById("confirmLeg-label-error").innerHTML = "ERROR!!!";
  //       console.log(err.message);
  //     });
  //   });

  // },

  // ********************
  // GENERAL FUNCTIONS
  // ********************

  fade_out: function () {
    // NNA
    $("#isin-issue-label").fadeOut().empty();
    $("#get-isin-label").fadeOut().empty();
    $("#delist-isin-label").fadeOut().empty();
    //$("#check-isin-label").fadeOut().empty();

    // ISIN ISSUE
    $("#isin-capture-label").fadeOut().empty();
    $("#isin-display-label").fadeOut().empty();
    $("#isin-display-label-error").fadeOut().empty();
    $("#isin-verify-label").fadeOut().empty();
    $("#isin-verify-label-error").fadeOut().empty();
    $("#displayBalance-label").fadeOut().empty();
    $("#displayBalance-label-error").fadeOut().empty();
    $("#sendIsin-label").fadeOut().empty();
    $("#sendIsin-label-error").fadeOut().empty();

    // TRADE REPORTING
    $("#reportTrade-label").fadeOut().empty();
    $("#reportTrade-label-error").fadeOut().empty();
    $("#refreshTrades-label").fadeOut().empty();
    $("#refreshTrades-label-error").fadeOut().empty();

    // CONFIRMATIONS AND MANDATES
    $("#isin-search-label").fadeOut().empty();
    $("#createMandate-label").fadeOut().empty();
    $("#createMandate-label-error").fadeOut().empty();
    $("#confirmLeg-label").fadeOut().empty();
    $("#confirmLeg-label-error").fadeOut().empty();
  }

};

$(function () {
  $(window).load(function () {
    App.init();
  });
});