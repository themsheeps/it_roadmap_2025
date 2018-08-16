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

    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on('click', '.btn-captureIsin', App.captureIsin);
    $(document).on('click', '.btn-displayIsin', App.displayIsin);
    $(document).on('click', '.btn-verifyIsin', App.verifyIsin);
    // $(document).on('click', '.btn-checkIsin', App.checkIsin);
  },

  captureIsin: function (event) {
    // event.preventDefault();
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

        // Execute adopt as a transaction by sending account
        return IsinIssuanceInstance.captureSecurity(_isinNumber1, _totalIssuedShareCap1, _longName1, _ticker1, _counterParty1, {
          from: account
        });
      }).then(function (result) {
        document.getElementById("isin-capture-label").innerHTML = "SUCCESS!!!";
      }).catch(function (err) {
        document.getElementById("isin-capture-label").innerHTML = "ERROR!!!";
        console.log(err.message);
      });
    });

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

        // Execute adopt as a transaction by sending account
        return IsinIssuanceInstance.captureSecurity(_isinNumber1, _totalIssuedShareCap1, _longName1, _ticker1, _counterParty1, {
          from: account
        });
      }).then(function (result) {
        document.getElementById("isin-capture-label").innerHTML = "SUCCESS!!!";
      }).catch(function (err) {
        document.getElementById("isin-capture-label").innerHTML = "ERROR!!!";
        console.log(err.message);
      });
    });

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
        
        document.getElementById("isin-verify-label").innerHTML = "success";
        console.log(result);

      }).catch(function (err) {
        document.getElementById("isin-display-label-error").innerHTML = "Index out of bounds error";
        console.log(err.message);
      });
    });

  },

  clearStatusses: function () {
    document.getElementById("isin-capture-label").innerHTML = "";
    document.getElementById("isin-display-label").innerHTML = "";
    document.getElementById("isin-display-label-error").innerHTML = "";
    document.getElementById("isin-verify-label").innerHTML = "";
    document.getElementById("isin-verify-label-error").innerHTML = "";
    document.getElementById("isinDispDiv").style.display = "none";
  },

  insertTableRow: function (prefixItem, counterItem, transactionRefItem) {
    // Find a <table> element with id="NNATable":
    // var table = document.getElementById("NNATable");

    // // Create an empty <tr> element and add it to the 1st position of the table:
    // var row = table.insertRow(1);

    // // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
    // var cell1 = row.insertCell(0);
    // var cell2 = row.insertCell(1);
    // var cell3 = row.insertCell(2);

    // // Add some text to the new cells:
    // cell1.innerHTML = prefixItem;
    // cell2.innerHTML = counterItem;
    // cell3.innerHTML = transactionRefItem;
  }

};

$(function () {
  $(window).load(function () {
    App.init();
  });
});