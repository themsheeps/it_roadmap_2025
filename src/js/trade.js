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
        return PostTradeInstance.addPreMatchedTrade(_isin, _buyLegId, _saleLegId, _tradeId, _settlementDate, _buyerAddress, _sellerAddress, _buyerCustodianAddress, _sellerCustodianAddress, _amount, _price ,{
          from: account
        });
      }).then(function (result) {
        document.getElementById("reportTrade-label").innerHTML = "SUCCESS!!!";
        setTimeout(App.fade_out, 2000);
        console.log("ABC001 " + result);
      }).catch(function (err) {
        document.getElementById("isin-search-label").innerHTML = "ERROR!!!";
        console.log(err.message);
      });
    });
  },

  fade_out: function () {
      $("#isin-search-label").fadeOut().empty();
  },

  clearStatusses: function () {
    document.getElementById("reportTrade-label").innerHTML = "";
    document.getElementById("reportTrade-label-error").innerHTML = "";
    // document.getElementById("delist-isin-label").innerHTML = "";
    // document.getElementById("check-isin-label").innerHTML = "";
  },

  clearTableRowsIsin: function () {

    document.getElementById("SecuritiesTable").innerHTML = "<thead><tr><th scope='col'>Isin Number</th><th scope='col'>Total Issued Share Cap</th><th scope='col'>Long Name</th><th scope='col'>Ticker</th><th scope='col'>Active</th></tr></thead><tbody></tbody>";
    console.log("Table cleared");
  },

  insertTableRow: function (_ISIN, _totalIssuedShareCap, _longName, _ticker, _active) {
    // Find a <table> element with id="SecuritiesTable":
    var table = document.getElementById("SecuritiesTable");

    // Create an empty <tr> element and add it to the 1st position of the table:
    var row = table.insertRow(1);

    // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    var cell5 = row.insertCell(4);

    // Add some text to the new cells:
    cell1.innerHTML = _ISIN;
    cell2.innerHTML = _totalIssuedShareCap;
    cell3.innerHTML = _longName;
    cell4.innerHTML = _ticker;
    cell5.innerHTML = _active;
  }

};

$(function () {
  $(window).load(function () {
    App.init();
  });
});