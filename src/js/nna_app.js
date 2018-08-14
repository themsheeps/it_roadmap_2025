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
        console.log(err.message);
      });
    });

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
  }

};

$(function () {
  $(window).load(function () {
    App.init();
  });
});