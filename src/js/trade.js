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
    $.getJSON('PostTrade.json', function (data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var PostTradeArtifact = data;
      // var newIsinEvent;
      App.contracts.PostTrade = TruffleContract(PostTradeArtifact);

      // Set the provider for our contract
      App.contracts.PostTrade.setProvider(App.web3Provider);

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
    $(document).on('click', '.btn-reportTrade', App.reportTrade);
    $(document).on('click', '.btn-refreshTrades', App.refreshTrades);
    // $(document).on('click', '.btn-clearTableIsin', App.clearTableRowsIsin);
    // $(document).on('click', '.btn-delistIsin', App.delistIsin);
    // $(document).on('click', '.btn-checkIsin', App.checkIsin);
  },

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
          }).then(function (fields){
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
            App.insertTableRow(fields[0],fields[1],fields[2],fields[3],_status);
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

  fade_out: function () {
    $("#reportTrade-label").fadeOut().empty();
    $("#reportTrade-label-error").fadeOut().empty();
    $("#refreshTrades-label").fadeOut().empty();
    $("#refreshTrades-label-error").fadeOut().empty();
  },

  clearStatusses: function () {
    document.getElementById("reportTrade-label").innerHTML = "";
    document.getElementById("reportTrade-label-error").innerHTML = "";
    document.getElementById("refreshTrades-label").innerHTML = "";
    document.getElementById("refreshTrades-label-error").innerHTML = "";
    // document.getElementById("delist-isin-label").innerHTML = "";
    // document.getElementById("check-isin-label").innerHTML = "";
  },

  clearTableRowsIsin: function () {

    document.getElementById("SecuritiesTable").innerHTML = "<thead><tr><th scope='col'>Isin Number</th><th scope='col'>Total Issued Share Cap</th><th scope='col'>Long Name</th><th scope='col'>Ticker</th><th scope='col'>Active</th></tr></thead><tbody></tbody>";
    console.log("Table cleared");
  },

  clearTableRowsTrades: function () {
    document.getElementById("TradesTable").innerHTML = "<table class='table table-striped table-responsive table-hover' id='NNATable'><thead><tr><th scope='col'>Trade Id</th><th scope='col'>Buy Leg ID</th><th scope='col'>Sale Leg ID</th><th scope='col'>Trade Date</th><th scope='col'>Status</th></tr></thead><tbody></tbody></table>";
    console.log("Table cleared");
  },

  insertTableRow: function (_tradeId, _buyLegId, _saleLegId, _tradeDate, _status) {
    // Find a <table> element with id="SecuritiesTable":
    var table = document.getElementById("TradesTable");
    var _labelType;

    if (_status == "Matched") {
      _labelType = "label-danger";
    } else if (_status == "Confirmed by seller") {
      _labelType = "label-info";
    } else if (_status == "Confirmed by buyer") {
      _labelType = "label-warning";
    } else {
      _labelType = "label-success";
    }

    // Create an empty <tr> element and add it to the 1st position of the table:
    var row = table.insertRow(1);

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
    cell4.innerHTML = _tradeDate;
    cell5.innerHTML = "<span class='label " + _labelType + "'>" + _status + "</span>";
  }

};

$(function () {
  $(window).load(function () {
    App.init();
  });
});