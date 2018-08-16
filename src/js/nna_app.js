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
    $.getJSON('NNA.json', function (data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var NNAArtifact = data;
      var newIsinEvent;
      App.contracts.NNA = TruffleContract(NNAArtifact);

      // Set the provider for our contract
      App.contracts.NNA.setProvider(App.web3Provider);

      // Watch for events
      App.contracts.NNA.deployed().then(function (instance) {
        newIsinEvent = instance.IsinIssued();

        instance.IsinIssued({}, { fromBlock: 0, toBlock: 'latest' }).get((error, eventResult) => {
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
            
            App.insertTableRow(result.args._prefix, result.args._counter, result.args._transactionReference);
          }
        });
      });

      // Use our contract to retrieve and mark the adopted pets
      // return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on('click', '.btn-newIsin', App.newIsin);
    $(document).on('click', '.btn-currentIsin', App.currentIsin);
    $(document).on('click', '.btn-delistIsin', App.delistIsin);
    $(document).on('click', '.btn-checkIsin', App.checkIsin);
  },

  markAdopted: function (adopters, account) {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function (instance) {
      adoptionInstance = instance;

      return adoptionInstance.getAdopters.call();
    }).then(function (adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function (err) {
      console.log(err.message);
    });
  },

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
        document.getElementById("isin-issue-label").innerHTML = "SUCCESS!!!";
      }).catch(function (err) {
        document.getElementById("isin-issue-label").innerHTML = "ERROR!!!";
        console.log(err.message);
      });
    });

  },

  currentIsin: function (event) {
    event.preventDefault();
    App.clearStatusses();
    document.getElementById("isin-issue-label").innerHTML = "";

    let _isinPrefix = document.getElementById('isinPrefix2').value;
    
    let NNAInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.NNA.deployed().then(function (instance) {
        NNAInstance = instance;

        // Execute adopt as a transaction by sending account
        return NNAInstance.getIsinNumber(_isinPrefix, {
          from: account
        });
      }).then(function (result) {
        document.getElementById("get-isin-label").innerHTML = "Last NNA Number for prefix " + _isinPrefix + " was: " + result;
      }).catch(function (err) {
        document.getElementById("get-issue-label").innerHTML = "ERROR!!!";
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
        document.getElementById("delist-isin-label").innerHTML = "SUCCESS!!!";
      }).catch(function (err) {
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
        document.getElementById("check-isin-label").innerHTML = "ERROR!!!";
        console.log(err.message);
      });
    });
  },

  clearStatusses: function () {
    document.getElementById("isin-issue-label").innerHTML = "";
    document.getElementById("get-isin-label").innerHTML = "";
    document.getElementById("delist-isin-label").innerHTML = "";
    document.getElementById("check-isin-label").innerHTML = "";
  },

  handleAdopt: function (event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function (instance) {
        adoptionInstance = instance;

        // Execute adopt as a transaction by sending account
        return adoptionInstance.adopt(petId, {
          from: account
        });
      }).then(function (result) {
        return App.markAdopted();
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },

  insertTableRow: function (prefixItem, counterItem, transactionRefItem) {
    // Find a <table> element with id="NNATable":
    var table = document.getElementById("NNATable");

    // Create an empty <tr> element and add it to the 1st position of the table:
    var row = table.insertRow(1);

    // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);

    // Add some text to the new cells:
    cell1.innerHTML = prefixItem;
    cell2.innerHTML = counterItem;
    cell3.innerHTML = transactionRefItem;
  }

};

$(function () {
  $(window).load(function () {
    App.init();
  });
});