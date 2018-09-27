# CONTRACTS

![](https://www.strate.co.za/sites/default/files/state-logo-dark.svg)
powered by: http://www.strate.co.za

# Contract List

# Deployment Sequence

I am sure there are more eloquent ways to do this but this is my deployment sequence:

* Start Ganache 
* Start VS Code
* * In the terminal window (inside of VS Code - Make sure you the project root folder) run the following commands:
```sh
truffle console
truffle migrate --reset

// To hook up the IsinIssuance contract with the PostTrade ontract, run the following:
PostTrade.deployed().then(function(instance){return instance.setIsinIssuanceContractAddress(IsinIssuance.address)});
```

* In a terminal window (in the root of the project), run the following command:

```sh
npm run dev
```

* make sure your MetaMask plugin is up and running and connected to your Ganache network (http://localhost:7545/)

You should now be good to go to use the web frontend.

If MetaMask throws nonce errors, reset all your MetaMask accounts.

P.s. I tend to add 3 accounts to my metamask account list and label them as follows:
* Acc 1 - Admin
* Acc 2 - Buyer
* Acc 3 - Seller
* Acc 4 - Counerpart / Broker


# Helper commands (all the main functions through the CLI)