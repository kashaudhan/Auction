# Decentralized Auction
A smart contract is developed to support the process of decentralized auction. Decentralized auction is a kind of auction in which
the bid raised is transparent to other participants in the contest. The ethereum smart contract developed will support
the auction in raising a bid, withdrawing money from the bid and an option to end the auction. The smart contract is
built using the ```Truffle console``` and ```Ganache``` which are part of Truffle framework. Ganache is the personal block chain
that allows developers to create smart contracts.

Based on the [Simple Open Auction](https://docs.soliditylang.org/en/v0.5.3/solidity-by-example.html#simple-open-auction).

#### Installation

1. Install Truffle globally.
    ```javascript
    npm install -g truffle
    ```
	Also Requires [Ganache](http://truffleframework.com/ganache/) to be preinstalled and running for a personal Truffle development blockchain.
    
    
2. Clone the repo.

3. Run the development console in the repo.
    ```javascript
    truffle develop
    ```

4. Compile and migrate the smart contracts. Note inside the development console we don't preface commands with `truffle`.
    ```javascript
    compile
    migrate
    ```

5. Run the `liteserver` development server (outside the development console) for front-end hot reloading. Smart contract changes must be manually recompiled and migrated.
    ```javascript
    // Serves the front-end on http://localhost:3000
    npm run dev
    ```






## Brief Explanation of Methods

#### function `bid() public payable`

1. This payable method which is used to **collect ethers** is used to raise the bid in the open auction.
2. In order to raise a proper bid two conditions are essentially required to be met.
3. One is the auction should be still alive. Second requirement is that the newly bid value should be greater than
the already existing highest bid value. This is written as part of the `require(condition)` part.
4. Once a proper bid is raised, then the existing highest bidder will be sent to `pendingReturns[]` mapped with
highestBidder and highestBid raised by him.
5. The newly bid user will now become the highest bidder and the newly bid value becomes the highestBid
value.

#### function `withdraw() public returns (bool)`

1. This method is used to **withdraw/send** back that are in the pendingReturns array.
2. To avoid the re-entrancy attack the pendingReturns of the sender is made equal to 0 when there is some
amount greater than 0 associated in returns. Otherwise, the attacker may keep on attacking until he drains
the amount.
3. The function returns true, if the withdrawal is successful. Otherwise it returns false.

#### function `auctionEnd() public`

1. This method is invoked to end the auction and can be triggered only by the beneficiary.
2. To make sure that the beneficiary has only triggered the auctionEnd method we have a require condition
written at the beginning.
3. Once the  `auctionEnd()` method is invoked it cannot be called again. This is checked by the flag auctionAlive
which is set to false, when once invoked.



#### FAQ

* __How do I use this with the EthereumJS TestRPC?__

    It's as easy as modifying the config file! [Check out our documentation on adding network configurations](http://truffleframework.com/docs/advanced/configuration#networks). Depending on the port you're using, you'll also need to update line 16 of `src/js/app.js`.

